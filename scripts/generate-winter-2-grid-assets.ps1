# Требуется ffmpeg в PATH. Создаёт `*.grid.webp` в `public/tours/winter-2/`.
$ErrorActionPreference = "Stop"
$dir = Join-Path $PSScriptRoot "..\public\tours\winter-2" | Resolve-Path
Set-Location $dir
. (Join-Path $PSScriptRoot "media\Invoke-Ffmpeg.ps1")

$images = @(
  "les.webp", "podnimaem.webp", "les2.webp", "les3.webp", "les4.webp",
  "peak.webp", "kushat.webp", "kushat2.webp"
)

foreach ($f in $images) {
  if (-not (Test-Path $f)) { Write-Warning "Skip missing: $f"; continue }
  $base = [System.IO.Path]::GetFileNameWithoutExtension($f)
  $out = "${base}.grid.webp"
  Invoke-Ffmpeg @('-y', '-i', $f, '-vf', "scale='min(900,iw)':-1", '-q:v', '82', $out)
}

Write-Host "Done winter-2 grid assets in $dir"
