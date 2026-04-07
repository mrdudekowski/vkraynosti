# Требуется ffmpeg в PATH. Создаёт `*.grid.webp` в `public/tours/winter-1/`.
$ErrorActionPreference = "Stop"
$dir = Join-Path $PSScriptRoot "..\public\tours\winter-1" | Resolve-Path
Set-Location $dir
. (Join-Path $PSScriptRoot "media\Invoke-Ffmpeg.ps1")

$images = @(
  "iz.ava.webp", "iz.close.webp", "iz.peoplewalk.webp", "trees2.webp", "trees.webp",
  "iz.top.webp", "iz.rest2.webp", "iz.pan2.webp", "iz.rest4.webp"
)

foreach ($f in $images) {
  if (-not (Test-Path $f)) { Write-Warning "Skip missing: $f"; continue }
  $base = [System.IO.Path]::GetFileNameWithoutExtension($f)
  $out = "${base}.grid.webp"
  Invoke-Ffmpeg @('-y', '-i', $f, '-vf', "scale='min(900,iw)':-1", '-q:v', '82', $out)
}

Write-Host "Done winter-1 grid assets in $dir"
