use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Book {
    pub data: Vec<Pasuk>,
    pub chapters: Vec<ChapterInfo>
}

pub type Pasuk = Vec<Word>;
pub type Word = Vec<u8>;
pub type ChapterInfo = (u32, u32);

#[derive(Serialize)]
pub struct CsvRow<'a> {
    hebrew: &'a str,
    gematria: u64 
}

impl <'a> CsvRow <'a> {
    pub fn new(hebrew:&'a str, gematria:u64) -> Self {
        Self { hebrew, gematria }
    }
}
    
