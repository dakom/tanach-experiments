//! Build script: when the `embed-data` feature is on, gzip-compress the dataset
//! files the CLI needs and generate a Rust table mapping each resource path to
//! its compressed bytes. `src/data.rs` includes the generated table and
//! decompresses on demand. This keeps a single source of truth (the JSON under
//! `media/`) while shipping a small, self-contained binary.

use std::env;
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};

use flate2::write::GzEncoder;
use flate2::Compression;

fn main() {
    println!("cargo:rerun-if-changed=build.rs");

    // Only embed when the feature is enabled; otherwise data loads from disk.
    if env::var_os("CARGO_FEATURE_EMBED_DATA").is_none() {
        return;
    }

    let manifest = env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR");
    let out_dir = env::var("OUT_DIR").expect("OUT_DIR");
    // The dataset lives at the repo root (this crate is under utils/calculations).
    let tanach = Path::new(&manifest)
        .join("../../src/media/tanach")
        .canonicalize()
        .expect("locate src/media/tanach at the repo root");
    let books_dir = tanach.join("books").join("separate-books");

    // Resources the CLI loads, addressed by their path under `src/media/`, exactly
    // as `DataSource::load` expects. `letters.json` feeds print-gematria-sequence;
    // the per-book files feed everything else (they carry the chapter/verse map).
    let mut resources: Vec<(String, PathBuf)> = vec![(
        "tanach/letters/letters.json".to_string(),
        tanach.join("letters").join("letters.json"),
    )];
    let mut books: Vec<PathBuf> = fs::read_dir(&books_dir)
        .expect("read separate-books dir")
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.extension().map(|x| x == "json").unwrap_or(false))
        .collect();
    books.sort();
    for path in books {
        let name = path.file_name().unwrap().to_string_lossy().into_owned();
        resources.push((format!("tanach/books/separate-books/{name}"), path));
    }

    // Re-run if any embedded file (or the book set) changes.
    println!("cargo:rerun-if-changed={}", books_dir.display());
    for (_, path) in &resources {
        println!("cargo:rerun-if-changed={}", path.display());
    }

    let embed_dir = Path::new(&out_dir).join("embed");
    fs::create_dir_all(&embed_dir).expect("create embed dir");

    let mut table = String::from("pub static EMBEDDED: &[(&str, &[u8])] = &[\n");
    for (index, (resource, path)) in resources.iter().enumerate() {
        let raw = fs::read(path).unwrap_or_else(|e| panic!("read {}: {e}", path.display()));
        let mut encoder = GzEncoder::new(Vec::new(), Compression::best());
        encoder.write_all(&raw).expect("gzip write");
        let gz = encoder.finish().expect("gzip finish");

        let gz_path = embed_dir.join(format!("{index}.gz"));
        fs::write(&gz_path, &gz).expect("write gz");
        table.push_str(&format!(
            "    ({resource:?}, include_bytes!({:?})),\n",
            gz_path
        ));
    }
    table.push_str("];\n");

    fs::write(Path::new(&out_dir).join("embedded.rs"), table).expect("write embedded.rs");
}
