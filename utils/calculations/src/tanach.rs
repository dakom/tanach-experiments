//! Serde model of the Tanach dataset and a repository that loads it through a
//! [`DataSource`].

use anyhow::{anyhow, Result};
use serde::Deserialize;

use crate::data::DataSource;

/// The 39 books of the Tanach in canonical order (index 0 => book number 1).
/// Matches the loader order in the site's `gematria.js` and the
/// tanach-experiments `write2csv` utility.
pub const BOOK_NAMES: [&str; 39] = [
    "bereishit",
    "shmot",
    "vayikra",
    "bamidbar",
    "devarim",
    "yehoshua",
    "shoftim",
    "shmueli",
    "shmuelii",
    "melachimi",
    "melachimii",
    "yishayahu",
    "yirmiyahu",
    "yechezkiel",
    "hosea",
    "yoel",
    "amos",
    "ovadiah",
    "yonah",
    "micha",
    "nachum",
    "chabakuk",
    "zephaniah",
    "chaggai",
    "zechariah",
    "malachai",
    "tehillim",
    "mishlei",
    "iyov",
    "shirhashirim",
    "ruth",
    "eicha",
    "kohelet",
    "esther",
    "daniel",
    "ezra",
    "nechemia",
    "divreihayamimi",
    "divreihayamimii",
];

/// A letter code is a value `1..=27` (see [`crate::gematria`]).
pub type LetterCode = u8;

/// Book name for a 1-based book number (1..=39), if in range.
pub fn book_name(book_number: usize) -> Option<&'static str> {
    BOOK_NAMES.get(book_number.checked_sub(1)?).copied()
}

/// A single book, matching `tanach/books/separate-books/<name>.json`.
///
/// `data` and `chapters` are parallel arrays: `data[i]` is verse `i`'s text
/// (words -> letter codes) and `chapters[i]` is its `[chapter, verse]` location.
#[derive(Debug, Deserialize)]
pub struct Book {
    pub data: Vec<Vec<Vec<LetterCode>>>,
    pub chapters: Vec<[u32; 2]>,
}

impl Book {
    /// The verse at `chapter:verse` as its list of words (each a list of letter
    /// codes), or `None` if that reference does not exist in this book.
    pub fn find_verse(&self, chapter: u32, verse: u32) -> Option<&Vec<Vec<LetterCode>>> {
        let idx = self
            .chapters
            .iter()
            .position(|cv| cv == &[chapter, verse])?;
        self.data.get(idx)
    }
}

/// Loads Tanach data through a [`DataSource`]. The `print-gematria-verse`
/// command uses the per-book files (they carry the `chapters` mapping needed to
/// resolve a chapter:verse reference); `print-gematria-sequence` uses the flat
/// `letters.json` stream.
pub struct Tanach<S: DataSource> {
    source: S,
}

impl<S: DataSource> Tanach<S> {
    pub fn new(source: S) -> Self {
        Self { source }
    }

    /// Load one book by its 1-based book number (1..=39).
    pub fn load_book(&self, book_number: usize) -> Result<Book> {
        let name = book_name(book_number)
            .ok_or_else(|| anyhow!("book number {book_number} out of range (expected 1..=39)"))?;
        let bytes = self
            .source
            .load(&format!("tanach/books/separate-books/{name}.json"))?;
        let book = serde_json::from_slice(&bytes)
            .map_err(|e| anyhow!("failed to parse {name}.json: {e}"))?;
        Ok(book)
    }

    /// Load the full flat letter stream (`tanach/letters/letters.json`).
    pub fn load_letters(&self) -> Result<Vec<LetterCode>> {
        let bytes = self.source.load("tanach/letters/letters.json")?;
        let letters = serde_json::from_slice(&bytes)
            .map_err(|e| anyhow!("failed to parse letters.json: {e}"))?;
        Ok(letters)
    }

    /// Load all 39 books in canonical order, paired with their 1-based book
    /// number. Iterating verses in file order reproduces the flat `letters.json`
    /// stream, so this is the single source used to build a position index.
    pub fn load_all_books(&self) -> Result<Vec<(usize, Book)>> {
        (1..=BOOK_NAMES.len())
            .map(|n| Ok((n, self.load_book(n)?)))
            .collect()
    }
}
