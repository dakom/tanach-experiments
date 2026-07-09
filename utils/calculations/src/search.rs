//! Gematria-sequence search over the whole Tanach.
//!
//! [`TanachIndex`] holds the flat gematria stream (every letter of the Tanach in
//! canonical order, as its gematria value) alongside a compact per-verse span
//! table. The span table maps any flat position back to its exact
//! `(book, chapter, verse, word, letter)` location by binary search, so we never
//! store per-letter location data.
//!
//! Both search modes run in `O(total letters + matches)` using KMP:
//! - [`TanachIndex::search_letters`] scans the entire flat stream once, so a
//!   match may begin at any letter and cross word/verse/book boundaries.
//! - [`TanachIndex::search_verses`] scans each verse independently and keeps only
//!   matches that begin on a word boundary, so a match starts at some word and
//!   runs toward the end of that verse (crossing words but not the verse end).

use anyhow::Result;

use crate::data::DataSource;
use crate::gematria::letter_value;
use crate::output::SearchHit;
use crate::tanach::{book_name, Tanach};

/// One verse's placement in the flat stream.
struct VerseSpan {
    book: usize,
    chapter: u32,
    verse: u32,
    /// Absolute offset in the flat stream where this verse's first letter sits.
    flat_start: usize,
    /// Offset of each word's first letter, relative to `flat_start` (ascending).
    word_starts: Vec<u32>,
    /// Number of letters in the verse.
    len: usize,
}

/// The flat gematria stream plus the span table needed to locate any position.
pub struct TanachIndex {
    /// Gematria value of every letter in the Tanach, in canonical order.
    flat: Vec<u32>,
    /// Verse spans in flat order (`flat_start` strictly increasing).
    spans: Vec<VerseSpan>,
}

impl TanachIndex {
    /// Build the index by loading all books and walking their verses in order.
    pub fn build<S: DataSource>(tanach: &Tanach<S>) -> Result<Self> {
        let books = tanach.load_all_books()?;
        let mut flat: Vec<u32> = Vec::new();
        let mut spans: Vec<VerseSpan> = Vec::new();

        for (book, loaded) in &books {
            for (words, cv) in loaded.data.iter().zip(loaded.chapters.iter()) {
                let flat_start = flat.len();
                let mut word_starts = Vec::with_capacity(words.len());
                for word in words {
                    word_starts.push((flat.len() - flat_start) as u32);
                    flat.extend(word.iter().map(|&code| letter_value(code)));
                }
                spans.push(VerseSpan {
                    book: *book,
                    chapter: cv[0],
                    verse: cv[1],
                    flat_start,
                    word_starts,
                    len: flat.len() - flat_start,
                });
            }
        }

        Ok(Self { flat, spans })
    }

    /// Mode 2: every occurrence of `query` anywhere in the flat stream. A match
    /// may start at any letter and span word/verse/book boundaries; the hit
    /// records the exact starting `(book, chapter, verse, word, letter)`.
    ///
    /// When `reverse`, matching reads from the last letter toward the first: we
    /// find the reversed query in the forward stream and anchor each hit at the
    /// match's highest-position letter (its start in reading order). Hits are then
    /// listed from the end of the Tanach backward.
    pub fn search_letters(&self, query: &[u32], reverse: bool) -> Vec<SearchHit> {
        let m = query.len();
        let needle = oriented(query, reverse);
        let mut hits: Vec<SearchHit> = find_all(&self.flat, &needle)
            .into_iter()
            // Forward: the match's start is its first (lowest) position. Backward:
            // its start in reading order is the last (highest) position.
            .map(|s| self.hit_at(if reverse { s + m - 1 } else { s }, true))
            .collect();
        if reverse {
            hits.reverse();
        }
        hits
    }

    /// Mode 1: every occurrence of `query` within a single verse that starts on a
    /// word boundary. The hit records `(book, chapter, verse, word)`.
    ///
    /// Forward, the match begins at a word's first letter and reads toward the end
    /// of the verse. When `reverse`, it begins at a word's last letter and reads
    /// toward the start of the verse (the mirror image), and hits are listed from
    /// the end of the Tanach backward.
    pub fn search_verses(&self, query: &[u32], reverse: bool) -> Vec<SearchHit> {
        let m = query.len();
        let needle = oriented(query, reverse);
        let mut hits = Vec::new();
        for span in &self.spans {
            if span.len < m {
                continue;
            }
            let verse = &self.flat[span.flat_start..span.flat_start + span.len];
            for s in find_all(verse, &needle) {
                let anchor = if reverse { s + m - 1 } else { s };
                // Forward: anchor must be a word's first letter. Backward: anchor
                // (the reading-order start) must be a word's last letter.
                let word_idx = if reverse {
                    let is_word_end = anchor + 1 == span.len
                        || span
                            .word_starts
                            .binary_search(&((anchor + 1) as u32))
                            .is_ok();
                    if !is_word_end {
                        continue;
                    }
                    span.word_starts
                        .partition_point(|&ws| ws as usize <= anchor)
                        - 1
                } else {
                    match span.word_starts.binary_search(&(anchor as u32)) {
                        Ok(w) => w,
                        Err(_) => continue,
                    }
                };
                hits.push(SearchHit {
                    book: span.book,
                    book_name: book_name(span.book).unwrap_or("?").to_string(),
                    chapter: span.chapter,
                    verse: span.verse,
                    word: word_idx + 1,
                    letter: None,
                    flat_position: span.flat_start + anchor + 1,
                    length: None,
                    end_position: None,
                });
            }
        }
        if reverse {
            hits.reverse();
        }
        hits
    }

    /// Accumulation, letters mode: from every starting letter, add letters along
    /// the flat stream (crossing word/verse/book boundaries) and match when the
    /// running sum equals each `targets` value in turn. Consecutive targets match
    /// adjacent runs. When `reverse`, letters are added from high position to low.
    pub fn search_letters_accumulate(&self, targets: &[u32], reverse: bool) -> Vec<SearchHit> {
        let n = self.flat.len();
        let cum = cumulative(targets);
        // Prefix sums over letter values in reading order for this direction.
        let mut prefix = vec![0u64; n + 1];
        for i in 0..n {
            let v = if reverse {
                self.flat[n - 1 - i]
            } else {
                self.flat[i]
            } as u64;
            prefix[i + 1] = prefix[i] + v;
        }

        let mut hits = Vec::new();
        for start in 0..n {
            let Some(end) = match_chain(&prefix, start, &cum) else {
                continue;
            };
            // The run covers reading indices `start..end`.
            let length = end - start;
            let (start_pos, end_pos) = if reverse {
                // reading index i maps to flat position n-1-i.
                (n - 1 - start, n - end)
            } else {
                (start, end - 1)
            };
            let mut hit = self.hit_at(start_pos, true);
            hit.length = Some(length);
            hit.end_position = Some(end_pos + 1);
            hits.push(hit);
        }
        sort_reading(&mut hits, reverse);
        hits
    }

    /// Accumulation, verse mode: from the beginning of every word, add whole
    /// words within the verse and match when the running sum equals each `targets`
    /// value in turn (so a match spans a whole number of words and ends on a word
    /// boundary). When `reverse`, words are added from the last word toward the
    /// first.
    pub fn search_verses_accumulate(&self, targets: &[u32], reverse: bool) -> Vec<SearchHit> {
        let cum = cumulative(targets);
        let mut hits = Vec::new();
        for span in &self.spans {
            let nwords = span.word_starts.len();
            if nwords == 0 {
                continue;
            }
            let verse = &self.flat[span.flat_start..span.flat_start + span.len];
            let word_end = |j: usize| -> usize {
                if j + 1 < nwords {
                    span.word_starts[j + 1] as usize
                } else {
                    span.len
                }
            };
            // Gematria sum of each (forward) word.
            let wsum: Vec<u64> = (0..nwords)
                .map(|j| {
                    verse[span.word_starts[j] as usize..word_end(j)]
                        .iter()
                        .map(|&x| x as u64)
                        .sum()
                })
                .collect();
            // Prefix sums over word totals in reading order.
            let mut prefix = vec![0u64; nwords + 1];
            for r in 0..nwords {
                let fw = if reverse { nwords - 1 - r } else { r };
                prefix[r + 1] = prefix[r] + wsum[fw];
            }

            for ws in 0..nwords {
                let Some(be) = match_chain(&prefix, ws, &cum) else {
                    continue;
                };
                // Reading words `ws..be` map to the forward word range [wlo, whi].
                let (wlo, whi) = if reverse {
                    (nwords - be, nwords - 1 - ws)
                } else {
                    (ws, be - 1)
                };
                let letters_start = span.word_starts[wlo] as usize;
                let letters_end = word_end(whi); // exclusive
                let length = letters_end - letters_start;
                // Reading-order start/end letters within the verse.
                let (start_local, end_local) = if reverse {
                    (word_end(whi) - 1, letters_start)
                } else {
                    (letters_start, letters_end - 1)
                };
                let report_word = (if reverse { whi } else { wlo }) + 1;
                hits.push(SearchHit {
                    book: span.book,
                    book_name: book_name(span.book).unwrap_or("?").to_string(),
                    chapter: span.chapter,
                    verse: span.verse,
                    word: report_word,
                    letter: None,
                    flat_position: span.flat_start + start_local + 1,
                    length: Some(length),
                    end_position: Some(span.flat_start + end_local + 1),
                });
            }
        }
        sort_reading(&mut hits, reverse);
        hits
    }

    /// Build a hit for an absolute (0-based) flat position, resolving its
    /// verse/word/letter. All reported indices are 1-based.
    fn hit_at(&self, pos: usize, with_letter: bool) -> SearchHit {
        // Largest span whose flat_start <= pos.
        let span_idx = self.spans.partition_point(|s| s.flat_start <= pos) - 1;
        let span = &self.spans[span_idx];
        let local = pos - span.flat_start;
        // Largest word whose start <= local.
        let word_idx = span.word_starts.partition_point(|&ws| ws as usize <= local) - 1;
        let letter = local - span.word_starts[word_idx] as usize;
        SearchHit {
            book: span.book,
            book_name: book_name(span.book).unwrap_or("?").to_string(),
            chapter: span.chapter,
            verse: span.verse,
            word: word_idx + 1,
            letter: with_letter.then_some(letter + 1),
            flat_position: pos + 1,
            length: None,
            end_position: None,
        }
    }
}

/// Cumulative sums of the targets: `[t0, t0+t1, t0+t1+t2, …]` (in `u64` to avoid
/// overflow across long runs).
fn cumulative(targets: &[u32]) -> Vec<u64> {
    let mut acc = 0u64;
    targets
        .iter()
        .map(|&t| {
            acc += t as u64;
            acc
        })
        .collect()
}

/// Greedily match the cumulative targets against a strictly-increasing `prefix`
/// sum array, starting at boundary index `start`. Returns the prefix index just
/// past the final matched run (so the run covers indices `start..result`), or
/// `None` if any target's boundary doesn't land exactly on a prefix value.
fn match_chain(prefix: &[u64], start: usize, cum: &[u64]) -> Option<usize> {
    let n = prefix.len() - 1;
    let base = prefix[start];
    let mut boundary = start;
    for &c in cum {
        if boundary >= n {
            return None;
        }
        // Each boundary value is unique (prefix strictly increasing), so a hit is
        // the exact split point for this run.
        let rel = prefix[boundary + 1..=n].binary_search(&(base + c)).ok()?;
        boundary += 1 + rel;
    }
    Some(boundary)
}

/// Order hits by their start position: ascending forward, descending in reverse
/// (so reverse results read from the end of the Tanach backward).
fn sort_reading(hits: &mut [SearchHit], reverse: bool) {
    if reverse {
        hits.sort_by_key(|h| std::cmp::Reverse(h.flat_position));
    } else {
        hits.sort_by_key(|h| h.flat_position);
    }
}

/// The query as searched: reversed when reading reverse, so a forward scan for
/// the result finds runs that equal `query` when read from high position to low.
fn oriented(query: &[u32], reverse: bool) -> Vec<u32> {
    if reverse {
        query.iter().rev().copied().collect()
    } else {
        query.to_vec()
    }
}

/// All start indices where `needle` occurs in `haystack` (KMP, `O(n + m)`).
fn find_all(haystack: &[u32], needle: &[u32]) -> Vec<usize> {
    let m = needle.len();
    if m == 0 || haystack.len() < m {
        return Vec::new();
    }

    // Failure function: fail[i] = length of the longest proper prefix of
    // needle[..=i] that is also a suffix of it.
    let mut fail = vec![0usize; m];
    let mut k = 0;
    for i in 1..m {
        while k > 0 && needle[i] != needle[k] {
            k = fail[k - 1];
        }
        if needle[i] == needle[k] {
            k += 1;
        }
        fail[i] = k;
    }

    let mut matches = Vec::new();
    let mut q = 0;
    for (i, &c) in haystack.iter().enumerate() {
        while q > 0 && c != needle[q] {
            q = fail[q - 1];
        }
        if c == needle[q] {
            q += 1;
        }
        if q == m {
            matches.push(i + 1 - m);
            q = fail[q - 1];
        }
    }
    matches
}
