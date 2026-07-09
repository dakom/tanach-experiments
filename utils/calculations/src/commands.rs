//! Subcommand implementations.

use anyhow::{anyhow, Result};

use crate::data::DataSource;
use crate::gematria::{gematria_sequence, gematria_total, hebrew};
use crate::output::{
    OutputArgs, PageRequest, SearchMode, SearchReport, SequenceReport, VerseReport, WordReport,
};
use crate::search::TanachIndex;
use crate::tanach::{book_name, Tanach};

/// Parse a comma-delimited gematria sequence, ignoring surrounding whitespace,
/// e.g. `"2, 30,5,10, 12"` -> `[2, 30, 5, 10, 12]`.
fn parse_sequence(input: &str) -> Result<Vec<u32>> {
    let values = input
        .split(',')
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .map(|s| {
            s.parse::<u32>().map_err(|_| {
                anyhow!("invalid gematria value {s:?} (expected a non-negative integer)")
            })
        })
        .collect::<Result<Vec<_>>>()?;
    if values.is_empty() {
        return Err(anyhow!("empty search sequence"));
    }
    Ok(values)
}

/// `print-gematria-verse --book N --chapter C --verse V [--reverse]`
///
/// Resolves the verse from the per-book file and prints its gematria: the
/// Hebrew text, the per-letter sequence (grouped by word), the per-word totals,
/// and the verse total. With `reverse`, the verse is read in reverse — last
/// word first, each word's letters reversed. Rendering is controlled by `output`.
pub fn print_gematria_verse<S: DataSource>(
    tanach: &Tanach<S>,
    book: usize,
    chapter: u32,
    verse: u32,
    reverse: bool,
    output: &OutputArgs,
) -> Result<()> {
    let name = book_name(book)
        .ok_or_else(|| anyhow!("book number {book} out of range (expected 1..=39)"))?;
    let loaded = tanach.load_book(book)?;
    let words = loaded
        .find_verse(chapter, verse)
        .ok_or_else(|| anyhow!("{name} {chapter}:{verse} not found in book {book}"))?;

    // Reading order: forward as stored, or the whole verse reversed (which is the
    // word order reversed with each word's letters reversed).
    let words: Vec<Vec<u8>> = if reverse {
        words
            .iter()
            .rev()
            .map(|w| w.iter().rev().copied().collect())
            .collect()
    } else {
        words.clone()
    };

    let flat: Vec<u8> = words.iter().flatten().copied().collect();
    let logical_line = words
        .iter()
        .map(|w| hebrew(w))
        .collect::<Vec<_>>()
        .join(" ");

    let word_reports: Vec<WordReport> = words
        .iter()
        .map(|w| WordReport {
            hebrew: output.hebrew(&hebrew(w)),
            letters: gematria_sequence(w),
            total: gematria_total(w),
        })
        .collect();

    let report = VerseReport {
        book,
        book_name: name.to_string(),
        chapter,
        verse,
        reverse,
        hebrew: output.hebrew(&logical_line),
        words: word_reports,
        total: gematria_total(&flat),
    };

    output.emit(&report)
}

/// `print-gematria-sequence --start-position P --length L [--reverse]`
///
/// Prints the gematria of a flat run of `L` letters at 1-based position `P` in
/// `letters.json`. Forward, the run is `P, P+1, …`; with `reverse` it is
/// `P, P-1, …` (presented in that backward reading order). Rendering is
/// controlled by `output`.
pub fn print_gematria_sequence<S: DataSource>(
    tanach: &Tanach<S>,
    start_position: usize,
    length: usize,
    reverse: bool,
    output: &OutputArgs,
) -> Result<()> {
    if start_position < 1 {
        return Err(anyhow!("start-position is 1-based (expected >= 1)"));
    }
    let letters = tanach.load_letters()?;
    let total = letters.len();
    if start_position > total {
        return Err(anyhow!(
            "start-position {start_position} exceeds letters.json length {total}"
        ));
    }
    // Anchor as a 0-based index; `codes` holds the run already in reading order.
    let anchor = start_position - 1;
    let (codes, end_position): (Vec<u8>, usize) = if reverse {
        if length > anchor + 1 {
            return Err(anyhow!(
                "cannot read {length} letters backward from position {start_position} \
                 (only {} available)",
                anchor + 1
            ));
        }
        let low = anchor + 1 - length;
        let mut run = letters[low..anchor + 1].to_vec();
        run.reverse();
        let end_position = if length == 0 {
            start_position
        } else {
            start_position - length + 1
        };
        (run, end_position)
    } else {
        let end = anchor
            .checked_add(length)
            .ok_or_else(|| anyhow!("start-position + length overflows"))?;
        if end > total {
            return Err(anyhow!(
                "requested range {start_position}..{} exceeds letters.json length {total}",
                start_position + length - 1
            ));
        }
        let end_position = if length == 0 {
            start_position
        } else {
            start_position + length - 1
        };
        (letters[anchor..end].to_vec(), end_position)
    };
    let slice = &codes[..];

    let report = SequenceReport {
        start_position,
        end_position,
        length,
        reverse,
        total_letters: total,
        hebrew: output.hebrew(&hebrew(slice)),
        gematria_sequence: gematria_sequence(slice),
        total: gematria_total(slice),
    };

    output.emit(&report)
}

/// `search-gematria --sequence "2,30,5,10,12" --mode verse|letters [--accumulate]`
/// `[--reverse] [--limit N] [--start P]`
///
/// Counts and locates every occurrence of a gematria sequence across the whole
/// Tanach. In exact mode each value must match a single letter; with
/// `accumulate`, each value is a running-sum target matched by a span of letters
/// (letters mode) or whole words (verse mode). With `reverse`, matching reads
/// from the last letter of the Tanach toward the first. `limit`/`start` page the
/// detailed hit list (the total `count` and per-book breakdown always stay
/// complete). `start` is the 1-based index of the first hit to return. See
/// [`crate::search`] for the two modes and their reporting.
#[allow(clippy::too_many_arguments)]
pub fn search_gematria<S: DataSource>(
    tanach: &Tanach<S>,
    sequence: &str,
    mode: SearchMode,
    accumulate: bool,
    reverse: bool,
    limit: Option<usize>,
    start: Option<usize>,
    output: &OutputArgs,
) -> Result<()> {
    if let Some(0) = start {
        return Err(anyhow!("--start is 1-based (expected >= 1)"));
    }
    let query = parse_sequence(sequence)?;
    let index = TanachIndex::build(tanach)?;

    let hits = match (accumulate, mode) {
        (false, SearchMode::Verse) => index.search_verses(&query, reverse),
        (false, SearchMode::Letters) => index.search_letters(&query, reverse),
        (true, SearchMode::Verse) => index.search_verses_accumulate(&query, reverse),
        (true, SearchMode::Letters) => index.search_letters_accumulate(&query, reverse),
    };

    // Paginate only when the user asked for it (either flag present).
    let page = (limit.is_some() || start.is_some()).then_some(PageRequest {
        start: start.unwrap_or(1),
        limit,
    });

    let report = SearchReport::new(mode, accumulate, reverse, query, hits, page);
    output.emit(&report)
}
