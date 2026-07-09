# Installer for the `calculations` gematria CLI (Windows).
# Downloads the latest prebuilt binary from GitHub Releases and drops it in your
# Cargo bin dir (override with $env:CALCULATIONS_INSTALL_DIR).
$ErrorActionPreference = "Stop"

$repo   = "dakom/tanach-experiments"
$bin    = "calculations"
$target = "x86_64-pc-windows-msvc"
$asset  = "$bin-$target.tar.gz"
$url    = "https://github.com/$repo/releases/latest/download/$asset"

$dest =
  if     ($env:CALCULATIONS_INSTALL_DIR) { $env:CALCULATIONS_INSTALL_DIR }
  elseif ($env:CARGO_HOME)               { Join-Path $env:CARGO_HOME "bin" }
  else                                   { Join-Path $env:USERPROFILE ".cargo\bin" }

New-Item -ItemType Directory -Force -Path $dest | Out-Null
$tmp = New-Item -ItemType Directory -Path ([System.IO.Path]::GetTempPath()) -Name ([System.Guid]::NewGuid())

Write-Host "downloading $url"
Invoke-WebRequest -Uri $url -OutFile (Join-Path $tmp $asset)
tar -xzf (Join-Path $tmp $asset) -C $tmp
Move-Item -Force (Join-Path $tmp "$bin-$target\$bin.exe") (Join-Path $dest "$bin.exe")
Remove-Item -Recurse -Force $tmp

Write-Host "installed $bin -> $dest\$bin.exe"
