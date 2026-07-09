//! Hebrew letter tables and gematria helpers.
//!
//! A "letter code" is an integer `1..=27` used throughout the dataset. Index 0
//! is a space placeholder (never appears inside verse data). Codes `23..=27` are
//! the five final / *sofit* letter forms.

/// Hebrew glyph per letter code. Index 0 = space placeholder.
pub const TEXT_HEBREW: [&str; 28] = [
    " ", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ",
    "ק", "ר", "ש", "ת", "ך", "ם", "ן", "ף", "ץ",
];

/// Absolute gematria (mispar hechrachi) per letter code. Sofit forms (23..=27)
/// take the same value as their base letter.
pub const GEMATRIA_ABSOLUTE: [u32; 28] = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 20, 40,
    50, 80, 90,
];

/// Gematria value of a single letter code.
pub fn letter_value(code: u8) -> u32 {
    GEMATRIA_ABSOLUTE.get(code as usize).copied().unwrap_or(0)
}

/// Hebrew glyph for a single letter code (`?` if out of range).
pub fn letter_glyph(code: u8) -> &'static str {
    TEXT_HEBREW.get(code as usize).copied().unwrap_or("?")
}

/// Per-letter gematria values for a run of letter codes.
pub fn gematria_sequence(codes: &[u8]) -> Vec<u32> {
    codes.iter().map(|&c| letter_value(c)).collect()
}

/// Sum of gematria values for a run of letter codes.
pub fn gematria_total(codes: &[u8]) -> u32 {
    codes.iter().map(|&c| letter_value(c)).sum()
}

/// Hebrew text for a run of letter codes (glyphs joined with no separator).
pub fn hebrew(codes: &[u8]) -> String {
    codes.iter().map(|&c| letter_glyph(c)).collect()
}

/// Reorder a Hebrew string into visual right-to-left order for display.
///
/// The dataset stores letters in logical (reading) order, but terminals that
/// don't implement the Unicode bidi algorithm render that left-to-right, which
/// reads backwards. Reversing the glyphs makes the line display right-to-left on
/// any terminal. The Tanach glyphs are bare consonants (single code points, no
/// combining niqqud), so a plain char reversal is safe.
pub fn to_visual_rtl(text: &str) -> String {
    text.chars().rev().collect()
}

/// Format a slice of values as a space-separated string, e.g. `6 10 5 10`.
pub fn join_values(values: &[u32]) -> String {
    values
        .iter()
        .map(u32::to_string)
        .collect::<Vec<_>>()
        .join(" ")
}
