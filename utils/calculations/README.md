# calculations

A Rust CLI for gematria calculations over the Tanach. Part of
[tanach-experiments](https://github.com/dakom/tanach-experiments); it reads the
repo's dataset under [`src/media/tanach/`](../../src/media/tanach).

The data is encoded as letter codes: a letter is an integer `1..=27`, verses nest
as `verse → word → letter`, and absolute gematria sums per-letter values with
sofit forms counting as their base letter.

## Install

The dataset is embedded in the binary (gzip-compressed), so the released
executable is fully self-contained — no data files to place, runs from anywhere.

Prebuilt binaries — no Rust toolchain needed.

macOS / Linux:

```sh
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/dakom/tanach-experiments/releases/latest/download/calculations-installer.sh | sh
```

Windows (PowerShell):

```powershell
powershell -ExecutionPolicy Bypass -c "irm https://github.com/dakom/tanach-experiments/releases/latest/download/calculations-installer.ps1 | iex"
```

Then run `calculations <command> [options]` from any directory.

> Every merge to `master` rebuilds the per-OS binaries and replaces the assets on
> the rolling [`latest` release](https://github.com/dakom/tanach-experiments/releases/latest),
> so the installer/download URLs above always point at the newest build (see
> [`.github/workflows/release.yml`](../../.github/workflows/release.yml)).

## Build & run (from a clone)

Run from this directory (`utils/calculations/`):

```sh
cargo build                       # embeds the dataset (default features)
cargo run -- <command> [options]

# Dev builds can skip embedding and read ../../src/media/ from disk instead
# (faster rebuilds, smaller binary):
cargo run --no-default-features -- <command> [options]
```

## Commands

### `print-gematria-verse`

Resolve a verse by book/chapter/verse (uses the per-book files, which carry the
chapter/verse mapping) and print its gematria.

```sh
cargo run -- print-gematria-verse --book 19 --chapter 1 --verse 1
```

```
yonah (book 19) 1:1
רמאל יתמא ןב הנוי לא הוהי רבד יהיו
gematria (per letter): 6 10 5 10 | 4 2 200 | 10 5 6 5 | 1 30 | 10 6 50 5 | 2 50 | 1 40 400 10 | 30 1 40 200
gematria (per word): 31 206 26 31 71 52 451 271
total: 1139
```

- `--book` is the 1-based book number (1 = Bereishit … 39 = Divrei HaYamim II).
- `--chapter` / `--verse` are 1-based.
- `--reverse` reads the verse in reverse: last word first, and each word's
  letters reversed (i.e. the verse's flat letter run reversed). Per-word totals
  and the verse total are unchanged.

See [Output options](#output-options) for `--rtl`, `--output-format`,
`--output-file`, and `--reverse` (available on every command).

### `print-gematria-sequence`

Print the gematria of a flat run of letters taken from `letters.json`.

```sh
cargo run -- print-gematria-sequence --start-position 1 --length 12
```

```
letters 1..12 (length 12, of 1196838 total)
הלאארבתישארב
gematria sequence: 2 200 1 300 10 400 2 200 1 1 30 5
total: 1152
```

- `--start-position` is a **1-based** index into the flat letter stream (position
  `1` is the first letter). The reported range `start..end` is inclusive.
- `--length` is the number of letters.
- `--reverse` reads down from the start position (`P, P-1, P-2, …`) instead of
  up, presenting the run in that backward order. The reported range then counts
  down (e.g. `letters 12..10`). Errors if there aren't `--length` letters at or
  before the start position.

### `search-gematria`

Count and locate every occurrence of a gematria sequence across the whole
Tanach. The sequence is comma-delimited and whitespace is ignored, so
`"2, 30,5,10, 12"` searches for `[2, 30, 5, 10, 12]`.

Two modes:

- `--mode verse` — matches within a single verse, and each match must **start on
  a word boundary** (i.e. the search begins at each word and runs toward the end
  of that verse, crossing words but not the verse end). Hits report
  `(book, chapter, verse, word)`.
- `--mode letters` — matches anywhere in the flat letter stream, starting at any
  letter; a match may cross word, verse, and book boundaries. Hits report the
  exact start `(book, chapter, verse, word, letter)`.

Add `--reverse` to match while reading from the **last letter of the Tanach
toward the first**. The searched run then equals the sequence when read from a
high position down to a low one; each hit's reported location is its start *in
reading order* (the highest-position letter). In `verse` mode this anchors on
each word's **last** letter (the mirror of forward's first-letter anchor).
Backward hits are listed from the end of the Tanach backward; `matches per book`
stays in canonical order either way.

```sh
cargo run -- search-gematria --sequence "2,200,1,300,10,400" --mode verse
```

```
search (mode: verse) sequence: 2 200 1 300 10 400
matches: 6
matches per book:
  bereishit (book 1): 1
  yirmiyahu (book 13): 4
  hosea (book 15): 1
hits:
  bereishit (book 1) 1:1 word 1 [pos 1]
  yirmiyahu (book 13) 26:1 word 1 [pos 679211]
  yirmiyahu (book 13) 27:1 word 1 [pos 680933]
  yirmiyahu (book 13) 28:1 word 4 [pos 682560]
  yirmiyahu (book 13) 49:34 word 10 [pos 718568]
  hosea (book 15) 9:10 word 7 [pos 807715]
```

The report has three parts: the total `matches`, a `matches per book` breakdown
(canonical order, books with no match omitted), and the per-hit `hits` list. In
JSON these are the `count`, `by_book`, and `hits` fields.

- All indices are **1-based**: `word`, `letter`, and `pos` (the absolute offset
  in the flat letter stream, the same index space as `print-gematria-sequence`).
- Both modes run in `O(total letters + matches)` via KMP. The command builds an
  in-memory index from the per-book files (which supply the chapter/verse
  mapping) in one pass — see [`src/search.rs`](src/search.rs) — so no extra
  precomputed data file is needed.

#### Accumulation (`--accumulate`)

By default each `--sequence` value must match one letter exactly. With
`--accumulate`, each value is instead a **running-sum target**: a contiguous run
that *sums* to the value is a match. This is the usual gematria question — e.g.
the word *bereishit* is 913 — so `--accumulate --sequence 913` finds every place
whose letters add up to 913.

- `--mode letters` — accumulates **letter by letter** from every starting letter,
  crossing word/verse/book boundaries. A match may end mid-word.
- `--mode verse` — accumulates **whole words** from the start of each word within
  a verse, so a match spans a whole number of words and ends on a word boundary.

Multiple values match **consecutive adjacent runs**: `--sequence 913,203` finds a
run summing to 913 immediately followed by a run summing to 203. Since letter
values are positive, each starting point yields at most one match; both modes run
in one pass. `--reverse` accumulates from the last letter/word backward.

```sh
cargo run -- search-gematria --sequence 913 --mode verse --accumulate
```

```
search (mode: verse, accumulate) targets: 913
matches: 935
matches per book:
  ... (complete, all 39 books)
hits:
  bereishit (book 1) 1:1 word 1 [pos 1] (len 6, ends at pos 6)
  bereishit (book 1) 1:29 word 5 [pos 1487] (len 10, ends at pos 1496)
  ...
```

Word 1 of Genesis 1:1 is *bereishit* (913); Genesis 1:29 from word 5 is
*lachem et kol esev* (90 + 401 + 50 + 372 = 913). Each accumulation hit adds
`length` (letters spanned) and `end_position` (1-based flat position of the run's
last letter) to the JSON, shown in plaintext as `(len N, ends at pos M)`.

#### Pagination

For sequences that match thousands of times, page through the hit list with
`--start` and `--limit` (both optional):

- `--start P` — **1-based** index of the first hit to return (default `1`), so
  `--start 51` begins at the 51st match.
- `--limit N` — return at most `N` hits (from `--start` onward).

Crucially, `matches` (total) and `matches per book` **always describe the whole
Tanach** — pagination only slices the detailed `hits` list, so the headline count
is correct on every page. With `--reverse`, paging follows the backward listing
order (`--start 1` = the last matches in the Tanach).

```sh
cargo run -- search-gematria --sequence 5 --mode letters --start 51 --limit 50
```

```
search (mode: letters) sequence: 5
matches: 101932
matches per book:
  ... (complete, all 39 books)
showing hits 51-100 of 101932 (start 51, limit 50)
hits:
  ... (50 hits)
```

In JSON this adds a `pagination` object (omitted entirely when neither flag is
given):

```json
"pagination": { "start": 51, "limit": 50, "total_hits": 101932,
                "returned": 50, "from": 51, "to": 100,
                "has_prev": true, "has_next": true }
```

## Output options

Every command accepts the same output flags:

- `--rtl <true|false>` — render the Hebrew text right-to-left (default `true`).
  Reversing the glyphs makes the line display correctly on terminals that don't
  implement the Unicode bidi algorithm (e.g. macOS Terminal.app). Pass
  `--rtl false` to keep the raw logical (reading) order — useful when the
  consuming tool does its own bidi handling. (No effect on `search-gematria`,
  which reports locations rather than Hebrew text.) `--rtl` (display) and
  `--reverse` (letter order) are independent, so `--reverse --rtl true`
  double-reverses back to the forward reading.
- `--output-format <plaintext|json>` — `plaintext` (default) prints the
  human-readable lines shown above; `json` emits a structured object.
- `--output-file <path>` — write to a file instead of stdout.
- `--reverse` — read/search backwards; see each command above for its exact
  meaning. Reports carry a `reverse` boolean, and plaintext headers are
  suffixed with `(reverse)`.

The JSON shape mirrors the `VerseReport` / `SequenceReport` / `SearchReport`
types in [`src/output.rs`](src/output.rs), so consumers can deserialize into the
same structs. The `--rtl` flag applies to the `hebrew` fields in JSON too; the
`words` array and per-letter values stay in reading order.

```sh
cargo run -- print-gematria-verse --book 19 --chapter 1 --verse 1 \
  --output-format json --output-file verse.json
```

```json
{
  "book": 19,
  "book_name": "yonah",
  "chapter": 1,
  "verse": 1,
  "hebrew": "רמאל יתמא ןב הנוי לא הוהי רבד יהיו",
  "words": [
    { "hebrew": "יהיו", "letters": [6, 10, 5, 10], "total": 31 }
  ],
  "total": 1139
}
```

## Data loading

All loading goes through the [`DataSource`](src/data.rs) trait, so the source of
the bytes is a single swap point (a URL-backed source later would be a one-line
change in `main.rs`, no command changes). Two implementations exist:

- `EmbeddedDataSource` (default) — reads the dataset from bytes baked into the
  binary at build time. [`build.rs`](build.rs) gzip-compresses the needed files
  from the repo's `src/media/tanach/` (`books/separate-books/*.json` +
  `letters/letters.json`, ~1.5 MB) and generates a lookup table; the source
  decompresses on demand. This is what makes the binary self-contained. The
  `embed-data` feature (on by default) controls it.
- `FileDataSource` — reads from a `media`-style directory on disk (one holding a
  `tanach/` subtree). Used when you pass `--data-dir <path>` (an override that
  always wins), or for dev builds compiled with `--no-default-features` (which
  default to the repo's `../../src/media`).

So: released/installed binaries need no data files; pass `--data-dir <dir>` to
point at a different dataset copy.

## Layout

This crate lives at `utils/calculations/` in the repo; the dataset it reads is
the repo's own `src/media/tanach/` (nothing is copied).

```
utils/calculations/
├── src/
│   ├── main.rs     # CLI (clap) + wiring + data-source selection
│   ├── data.rs     # DataSource trait + FileDataSource + EmbeddedDataSource
│   ├── tanach.rs   # serde model (Book) + Tanach repository
│   ├── gematria.rs # letter tables + gematria helpers
│   ├── output.rs   # output flags + serializable report types
│   ├── search.rs   # Tanach position index + KMP / accumulation search
│   └── commands.rs # the subcommands
├── build.rs        # gzip-embeds the dataset (embed-data feature)
├── install.sh      # curl|sh installer (fetches the latest release binary)
└── install.ps1     # PowerShell installer

src/media/tanach/   # dataset (letters/, books/separate-books/), embedded at build
.github/workflows/
├── ci.yml          # fmt + clippy (both feature configs) + release build
└── release.yml     # per-OS binaries + installers → rolling `latest` release
```
