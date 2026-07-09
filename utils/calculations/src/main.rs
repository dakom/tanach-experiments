mod commands;
mod data;
mod gematria;
mod output;
mod search;
mod tanach;

use std::path::PathBuf;

use anyhow::Result;
use clap::{Parser, Subcommand};

use data::{DataSource, FileDataSource};
use output::{OutputArgs, SearchMode};
use tanach::Tanach;

/// Fallback data directory used by non-embedded (dev) builds when `--data-dir`
/// is not given: the repo's `src/media/` folder (this crate lives under
/// `utils/calculations/`), resolved at compile time.
#[cfg(not(feature = "embed-data"))]
const DEFAULT_DATA_DIR: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/../../src/media");

#[derive(Parser)]
#[command(name = "tanach-calc", about = "Gematria calculations over the Tanach")]
struct Cli {
    /// Load the dataset from this directory (expects a `tanach/` subdirectory)
    /// instead of the copy embedded in the binary.
    #[arg(long, global = true)]
    data_dir: Option<PathBuf>,

    #[command(subcommand)]
    command: Command,
}

/// Resolve the data source: an explicit `--data-dir` always wins; otherwise use
/// the embedded dataset (default builds) or the compile-time `media/` path (dev
/// builds without the `embed-data` feature).
fn data_source(data_dir: Option<PathBuf>) -> Box<dyn DataSource> {
    if let Some(dir) = data_dir {
        return Box::new(FileDataSource::new(dir));
    }
    #[cfg(feature = "embed-data")]
    {
        Box::new(data::EmbeddedDataSource)
    }
    #[cfg(not(feature = "embed-data"))]
    {
        Box::new(FileDataSource::new(DEFAULT_DATA_DIR))
    }
}

#[derive(Subcommand)]
enum Command {
    /// Print the gematria sequence of a single verse.
    PrintGematriaVerse {
        #[arg(long)]
        book: usize,
        #[arg(long)]
        chapter: u32,
        #[arg(long)]
        verse: u32,
        /// Read the verse in reverse (last word first, letters reversed).
        #[arg(long)]
        reverse: bool,
        #[command(flatten)]
        output: OutputArgs,
    },
    /// Print the gematria of a flat letter run from letters.json (1-based start).
    PrintGematriaSequence {
        #[arg(long)]
        start_position: usize,
        #[arg(long)]
        length: usize,
        /// Read in reverse from the start position (P, P-1, P-2, …).
        #[arg(long)]
        reverse: bool,
        #[command(flatten)]
        output: OutputArgs,
    },
    /// Count and locate a gematria sequence across the whole Tanach.
    SearchGematria {
        /// Comma-delimited gematria values, e.g. "2, 30,5,10, 12".
        #[arg(long)]
        sequence: String,
        /// `verse`: match within each verse starting at a word boundary.
        /// `letters`: match anywhere in the flat letter stream.
        #[arg(long, value_enum)]
        mode: SearchMode,
        /// Turn off accumulation. By default the search accumulates: each
        /// --sequence value is a running-sum target rather than a single letter.
        /// A span (letters mode) or run of whole words (verse mode) that sums to
        /// the value is a match; multiple values match consecutive adjacent runs.
        /// E.g. "913" finds spans summing to 913 (like the word bereishit);
        /// "913,203" finds a span summing to 913 immediately followed by one
        /// summing to 203. Pass --no-accumulate to instead match each value
        /// against a single letter exactly.
        #[arg(long)]
        no_accumulate: bool,
        /// Search reading in reverse from the last letter of the Tanach.
        #[arg(long)]
        reverse: bool,
        /// Paginate: return at most this many hits (from --start onward).
        #[arg(long)]
        limit: Option<usize>,
        /// Paginate: 1-based index of the first hit to return (default 1). For
        /// example, `--start 51` begins at the 51st match; pair with `--limit 50`
        /// to get hits 51-100.
        #[arg(long)]
        start: Option<usize>,
        #[command(flatten)]
        output: OutputArgs,
    },
}

fn main() -> Result<()> {
    let cli = Cli::parse();

    // The data source is the swap point: embedded bytes, a filesystem directory,
    // or (later) a URL-backed source — commands never change.
    let tanach = Tanach::new(data_source(cli.data_dir));

    match cli.command {
        Command::PrintGematriaVerse {
            book,
            chapter,
            verse,
            reverse,
            output,
        } => commands::print_gematria_verse(&tanach, book, chapter, verse, reverse, &output)?,
        Command::PrintGematriaSequence {
            start_position,
            length,
            reverse,
            output,
        } => commands::print_gematria_sequence(&tanach, start_position, length, reverse, &output)?,
        Command::SearchGematria {
            sequence,
            mode,
            no_accumulate,
            reverse,
            limit,
            start,
            output,
        } => commands::search_gematria(
            &tanach,
            &sequence,
            mode,
            !no_accumulate,
            reverse,
            limit,
            start,
            &output,
        )?,
    }

    Ok(())
}
