#!/bin/sh
# Installer for the `calculations` gematria CLI.
# Downloads the latest prebuilt binary for this platform from GitHub Releases
# and drops it in your Cargo bin dir (override with CALCULATIONS_INSTALL_DIR).
set -eu

REPO="dakom/tanach-experiments"
BIN="calculations"

os="$(uname -s)"
arch="$(uname -m)"
case "$os" in
  Darwin)
    case "$arch" in
      arm64 | aarch64) target="aarch64-apple-darwin" ;;
      x86_64)
        echo "no prebuilt binary for Intel macs; build from source:" >&2
        echo "  cargo install --git https://github.com/$REPO $BIN" >&2
        exit 1 ;;
      *) echo "unsupported macOS arch: $arch" >&2; exit 1 ;;
    esac ;;
  Linux)
    case "$arch" in
      x86_64) target="x86_64-unknown-linux-gnu" ;;
      *) echo "unsupported Linux arch: $arch" >&2; exit 1 ;;
    esac ;;
  *)
    echo "unsupported OS: $os" >&2
    echo "try: cargo install --git https://github.com/$REPO $BIN" >&2
    exit 1 ;;
esac

asset="${BIN}-${target}.tar.gz"
url="https://github.com/${REPO}/releases/latest/download/${asset}"
dest="${CALCULATIONS_INSTALL_DIR:-${CARGO_HOME:-$HOME/.cargo}/bin}"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

echo "downloading ${url}"
curl -fsSL "$url" -o "$tmp/$asset"
tar -xzf "$tmp/$asset" -C "$tmp"
mkdir -p "$dest"
mv "$tmp/${BIN}-${target}/${BIN}" "$dest/${BIN}"
chmod +x "$dest/${BIN}"

echo "installed ${BIN} -> ${dest}/${BIN}"
case ":$PATH:" in
  *":$dest:"*) ;;
  *) echo "note: add ${dest} to your PATH" ;;
esac
