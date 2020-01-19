mod constants;
mod types;

use constants::*;
use types::*;
use std::fs;
use csv::{WriterBuilder, StringRecord, QuoteStyle};

fn main() {
    for bookname in BOOK_NAMES {
        convert_book(bookname);
    }
}

fn convert_book(bookname:&str) {
    println!("writing {}...", bookname);
    let file = fs::File::open(format!("../../src/media/tanach/books/separate-books/{}.json", bookname)).unwrap();
    let book: Book = serde_json::from_reader(file).unwrap();

    let mut writer = WriterBuilder::new()
        .has_headers(true)
        .quote_style(QuoteStyle::NonNumeric)
        .from_path(format!("../../src/media/tanach/books/csv-output/{}.csv", bookname))
        .unwrap();

    for pasuk in book.data {
        for word in pasuk {
            let hebrew = get_hebrew(&word);
            let gematria = get_gematria(&word);
            writer.serialize(CsvRow::new(&hebrew, gematria)).unwrap();
        }
    }
    writer.flush().unwrap();

    println!("done writing {}", bookname);
}


fn get_hebrew(word:&Word) -> String {
    word
        .iter()
        .map(|index| TEXT_HEBREW[*index as usize])
        .collect()
}


fn get_gematria(word:&Word) -> u64 {
    word
        .iter()
        .map(|index| GEMATRIA_ABSOLUTE[*index as usize] as u64)
        .fold(0, |acc, x| acc + x)
}