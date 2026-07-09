//! Output configuration and strongly-typed report types.
//!
//! Commands build a `*Report` value, then render it as plaintext or JSON and
//! emit it to stdout or a file. The JSON shape mirrors these structs exactly, so
//! downstream consumers can deserialize into the same types.

use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};

use crate::gematria::{join_values, to_visual_rtl};

/// How Hebrew text and reports are rendered.
#[derive(Clone, Copy, Debug, clap::ValueEnum)]
pub enum OutputFormat {
    /// Human-readable lines (the default).
    Plaintext,
    /// A JSON object matching the report structs in this module.
    Json,
}

/// Shared output flags, flattened into every subcommand.
#[derive(clap::Args, Debug)]
pub struct OutputArgs {
    /// Render Hebrew text right-to-left for display. Defaults to `true`; pass
    /// `--rtl false` to keep the raw logical (reading) order.
    #[arg(long, default_value_t = true, action = clap::ArgAction::Set)]
    pub rtl: bool,

    /// Write output to this file instead of stdout.
    #[arg(long)]
    pub output_file: Option<PathBuf>,

    /// Output format.
    #[arg(long, value_enum, default_value_t = OutputFormat::Plaintext)]
    pub output_format: OutputFormat,
}

impl OutputArgs {
    /// Apply the `--rtl` flag to a logical-order Hebrew string.
    pub fn hebrew(&self, logical: &str) -> String {
        if self.rtl {
            to_visual_rtl(logical)
        } else {
            logical.to_string()
        }
    }

    /// Render a report and write it to the configured destination.
    pub fn emit<R: Report>(&self, report: &R) -> Result<()> {
        let content = match self.output_format {
            OutputFormat::Plaintext => report.to_plaintext(),
            OutputFormat::Json => {
                serde_json::to_string_pretty(report).context("serializing report to JSON")?
            }
        };
        match &self.output_file {
            Some(path) => {
                fs::write(path, format!("{content}\n"))
                    .with_context(|| format!("writing output to {}", path.display()))?;
            }
            None => println!("{content}"),
        }
        Ok(())
    }
}

/// A serializable report that also knows its plaintext form.
pub trait Report: Serialize {
    fn to_plaintext(&self) -> String;
}

/// `" (reverse)"` when reading reverse, else empty — appended to a plaintext
/// header line to flag the direction.
fn direction_suffix(reverse: bool) -> &'static str {
    if reverse {
        " (reverse)"
    } else {
        ""
    }
}

/// One word within a verse.
#[derive(Serialize, Deserialize, Debug)]
pub struct WordReport {
    /// Hebrew glyphs for the word (subject to the `--rtl` flag).
    pub hebrew: String,
    /// Per-letter gematria values, in logical (reading) order.
    pub letters: Vec<u32>,
    /// Sum of the word's letter values.
    pub total: u32,
}

/// A single resolved verse and its gematria.
#[derive(Serialize, Deserialize, Debug)]
pub struct VerseReport {
    pub book: usize,
    pub book_name: String,
    pub chapter: u32,
    pub verse: u32,
    /// Whether the verse is read in reverse (last word first, letters reversed).
    pub reverse: bool,
    /// Full verse text (subject to the `--rtl` flag).
    pub hebrew: String,
    /// Words in reading order (reversed when `reverse`).
    pub words: Vec<WordReport>,
    /// Sum of every letter value in the verse.
    pub total: u32,
}

impl Report for VerseReport {
    fn to_plaintext(&self) -> String {
        let per_word_letters: Vec<String> =
            self.words.iter().map(|w| join_values(&w.letters)).collect();
        let per_word_totals: Vec<u32> = self.words.iter().map(|w| w.total).collect();
        [
            format!(
                "{} (book {}) {}:{}{}",
                self.book_name,
                self.book,
                self.chapter,
                self.verse,
                direction_suffix(self.reverse)
            ),
            self.hebrew.clone(),
            format!("gematria (per letter): {}", per_word_letters.join(" | ")),
            format!("gematria (per word): {}", join_values(&per_word_totals)),
            format!("total: {}", self.total),
        ]
        .join("\n")
    }
}

/// A flat run of letters from `letters.json`.
#[derive(Serialize, Deserialize, Debug)]
pub struct SequenceReport {
    /// 1-based position of the run's start (its anchor letter).
    pub start_position: usize,
    /// 1-based position of the run's last letter in reading order. When
    /// `reverse` this is less than `start_position`.
    pub end_position: usize,
    pub length: usize,
    /// Whether the run is read in reverse from `start_position`.
    pub reverse: bool,
    /// Total number of letters available in `letters.json`.
    pub total_letters: usize,
    /// Hebrew glyphs for the run, in reading order (subject to the `--rtl` flag).
    pub hebrew: String,
    /// Per-letter gematria values, in reading order.
    pub gematria_sequence: Vec<u32>,
    /// Sum of every letter value in the run.
    pub total: u32,
}

impl Report for SequenceReport {
    fn to_plaintext(&self) -> String {
        [
            format!(
                "letters {}..{} (length {}, of {} total){}",
                self.start_position,
                self.end_position,
                self.length,
                self.total_letters,
                direction_suffix(self.reverse)
            ),
            self.hebrew.clone(),
            format!(
                "gematria sequence: {}",
                join_values(&self.gematria_sequence)
            ),
            format!("total: {}", self.total),
        ]
        .join("\n")
    }
}

/// Which stream a gematria-sequence search scans.
#[derive(Clone, Copy, Debug, clap::ValueEnum, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SearchMode {
    /// Match within each verse, starting at a word boundary.
    Verse,
    /// Match anywhere in the flat letter stream, starting at any letter.
    Letters,
}

impl SearchMode {
    fn as_str(self) -> &'static str {
        match self {
            SearchMode::Verse => "verse",
            SearchMode::Letters => "letters",
        }
    }
}

/// One location where the searched sequence was found.
#[derive(Serialize, Deserialize, Debug)]
pub struct SearchHit {
    pub book: usize,
    pub book_name: String,
    pub chapter: u32,
    pub verse: u32,
    /// 1-based word index within the verse where the match starts.
    pub word: usize,
    /// 1-based letter index within the word (set only in `letters` mode).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub letter: Option<usize>,
    /// 1-based absolute position of the match start in the flat letter stream.
    pub flat_position: usize,
    /// Number of letters spanned by the match (accumulation mode only; exact
    /// mode omits it since it always equals the query length).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub length: Option<usize>,
    /// 1-based flat position of the match's last letter in reading order
    /// (accumulation mode only). For reverse searches this is less than
    /// `flat_position`.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub end_position: Option<usize>,
}

impl SearchHit {
    fn location_line(&self) -> String {
        let base = format!(
            "{} (book {}) {}:{} word {}",
            self.book_name, self.book, self.chapter, self.verse, self.word
        );
        let mut line = match self.letter {
            Some(l) => format!("{base} letter {l} [pos {}]", self.flat_position),
            None => format!("{base} [pos {}]", self.flat_position),
        };
        if let (Some(length), Some(end)) = (self.length, self.end_position) {
            line.push_str(&format!(" (len {length}, ends at pos {end})"));
        }
        line
    }
}

/// Number of matches found in a single book.
#[derive(Serialize, Deserialize, Debug)]
pub struct BookCount {
    pub book: usize,
    pub book_name: String,
    pub count: usize,
}

/// A request to return only a slice of the hit list.
#[derive(Clone, Copy, Debug)]
pub struct PageRequest {
    /// 1-based index of the first hit to return.
    pub start: usize,
    /// Maximum hits to return; `None` returns everything from `start` onward.
    pub limit: Option<usize>,
}

/// Describes which slice of the hit list a paginated report contains. Present
/// only when the caller requested pagination.
#[derive(Serialize, Deserialize, Debug)]
pub struct Pagination {
    /// Requested 1-based index of the first hit to return.
    pub start: usize,
    /// Requested per-page cap (`null` = unbounded from `start` onward).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<usize>,
    /// Total matches across the whole Tanach (same as the report's `count`).
    pub total_hits: usize,
    /// Number of hits actually included on this page.
    pub returned: usize,
    /// 1-based index of the first returned hit within the full list (`null` when
    /// the page is empty).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub from: Option<usize>,
    /// 1-based index of the last returned hit within the full list.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub to: Option<usize>,
    pub has_prev: bool,
    pub has_next: bool,
}

impl Pagination {
    fn summary_line(&self) -> String {
        let limit = self
            .limit
            .map(|l| format!(", limit {l}"))
            .unwrap_or_default();
        match (self.from, self.to) {
            (Some(from), Some(to)) => format!(
                "showing hits {from}-{to} of {} (start {}{limit})",
                self.total_hits, self.start
            ),
            _ => format!(
                "showing 0 hits of {} (start {}{limit})",
                self.total_hits, self.start
            ),
        }
    }
}

/// Result of a gematria-sequence search.
#[derive(Serialize, Deserialize, Debug)]
pub struct SearchReport {
    pub mode: SearchMode,
    /// Whether values are running-sum targets (accumulation) rather than single
    /// letters (exact).
    pub accumulate: bool,
    /// Whether the search read reverse (from the last letter of the Tanach).
    pub reverse: bool,
    /// The gematria values searched for (single-letter values in exact mode,
    /// running-sum targets in accumulation mode).
    pub sequence: Vec<u32>,
    /// Total number of matches across the whole Tanach. Always the full count,
    /// even when `hits` holds only one page.
    pub count: usize,
    /// Match counts per book, in canonical order (books with no match omitted).
    /// Always covers the whole search, independent of pagination.
    pub by_book: Vec<BookCount>,
    /// The slice of the hit list on this page (or all hits when unpaginated).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pagination: Option<Pagination>,
    pub hits: Vec<SearchHit>,
}

impl SearchReport {
    /// Assemble a report from hits (in reading order), deriving the total and the
    /// per-book counts. `count` and `by_book` always describe the full result;
    /// `page` (when set) slices only the stored `hits` list. `by_book` is always
    /// in canonical book order, independent of the direction hits are listed in.
    pub fn new(
        mode: SearchMode,
        accumulate: bool,
        reverse: bool,
        sequence: Vec<u32>,
        hits: Vec<SearchHit>,
        page: Option<PageRequest>,
    ) -> Self {
        let count = hits.len();
        let mut counts: BTreeMap<usize, (String, usize)> = BTreeMap::new();
        for hit in &hits {
            let entry = counts
                .entry(hit.book)
                .or_insert_with(|| (hit.book_name.clone(), 0));
            entry.1 += 1;
        }
        let by_book = counts
            .into_iter()
            .map(|(book, (book_name, count))| BookCount {
                book,
                book_name,
                count,
            })
            .collect();

        let (hits, pagination) = match page {
            None => (hits, None),
            Some(req) => {
                // `start` is 1-based; convert to a 0-based skip into the list.
                let skip = req.start.saturating_sub(1).min(count);
                let end = match req.limit {
                    Some(l) => skip.saturating_add(l).min(count),
                    None => count,
                };
                let returned = end - skip;
                let pagination = Pagination {
                    start: req.start,
                    limit: req.limit,
                    total_hits: count,
                    returned,
                    from: (returned > 0).then_some(skip + 1),
                    to: (returned > 0).then_some(end),
                    has_prev: skip > 0,
                    has_next: end < count,
                };
                let page_hits = hits.into_iter().skip(skip).take(returned).collect();
                (page_hits, Some(pagination))
            }
        };

        Self {
            mode,
            accumulate,
            reverse,
            sequence,
            count,
            by_book,
            pagination,
            hits,
        }
    }
}

impl Report for SearchReport {
    fn to_plaintext(&self) -> String {
        let mut descriptor = vec![self.mode.as_str().to_string()];
        if self.accumulate {
            descriptor.push("accumulate".to_string());
        }
        if self.reverse {
            descriptor.push("reverse".to_string());
        }
        let label = if self.accumulate {
            "targets"
        } else {
            "sequence"
        };
        let mut lines = vec![
            format!(
                "search (mode: {}) {label}: {}",
                descriptor.join(", "),
                join_values(&self.sequence)
            ),
            format!("matches: {}", self.count),
        ];
        if !self.by_book.is_empty() {
            lines.push("matches per book:".to_string());
            lines.extend(
                self.by_book
                    .iter()
                    .map(|bc| format!("  {} (book {}): {}", bc.book_name, bc.book, bc.count)),
            );
        }
        if let Some(pagination) = &self.pagination {
            lines.push(pagination.summary_line());
        }
        if !self.hits.is_empty() {
            lines.push("hits:".to_string());
            lines.extend(self.hits.iter().map(|h| format!("  {}", h.location_line())));
        }
        lines.join("\n")
    }
}
