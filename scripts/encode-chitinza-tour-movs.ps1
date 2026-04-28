# Encodes four Chitinza (spring-5) MOV sources to public/tours/spring-5/ctz.clip1..4
# (.webm, .grid.webm, .poster.webp). VP9 = media/WebmTourEncoding.ps1 (same as spring-4 clips).
#
# Canonical order (chronological filenames):
#   2023-10-07 15-45-00, 15-56-46, 16-34-03, 17-19-10
#
# Usage:
#   .\scripts\encode-chitinza-tour-movs.ps1
#   .\scripts\encode-chitinza-tour-movs.ps1 -SourceDir "D:\path\to\content\Chitinza\webp"
param(
  [string] $SourceDir = ''
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\Invoke-Ffmpeg.ps1')
. (Join-Path $PSScriptRoot 'media\WebmTourEncoding.ps1')

$orderedMovNames = @(
  '2023-10-07 15-45-00.MOV',
  '2023-10-07 15-56-46.MOV',
  '2023-10-07 16-34-03.MOV',
  '2023-10-07 17-19-10.MOV'
)

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
if ([string]::IsNullOrWhiteSpace($SourceDir)) {
  $markerName = '2023-10-07 15-45-00.MOV'
  $marker = Get-ChildItem -Path (Join-Path $repoRoot 'content') -Recurse -File -Filter $markerName -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $marker) {
    throw "Could not find $markerName under content/. Pass -SourceDir to the folder with Chitinza MOV files."
  }
  $SourceDir = $marker.DirectoryName
}

if (-not (Test-Path -LiteralPath $SourceDir)) {
  throw "SourceDir not found: $SourceDir"
}

$tourDir = Join-Path $repoRoot 'public\tours\spring-5' | Resolve-Path

foreach ($name in $orderedMovNames) {
  $p = Join-Path $SourceDir $name
  if (-not (Test-Path -LiteralPath $p)) {
    throw "Missing required file: $p"
  }
}

Write-Host "Encoding 4 MOV from $SourceDir -> $($tourDir.Path)"

$i = 0
foreach ($name in $orderedMovNames) {
  $i++
  $in = Join-Path $SourceDir $name
  $base = "ctz.clip$i"
  $viewer = Join-Path $tourDir.Path "$base.webm"
  $gridWebm = Join-Path $tourDir.Path "$base.grid.webm"
  $poster = Join-Path $tourDir.Path "$base.poster.webp"
  Write-Host "[$i/4] $base <- $name"
  Invoke-Ffmpeg (@("-y", "-i", $in, "-vf", (Get-WebmScaleFilter "full")) + (Get-WebmVp9CodecArgs "full") + @($viewer))
  Invoke-Ffmpeg (@("-y", "-i", $in, "-vf", (Get-WebmScaleFilter "grid")) + (Get-WebmVp9CodecArgs "grid") + @($gridWebm))
  Invoke-Ffmpeg @("-y", "-i", $gridWebm, "-vframes", "1", "-q:v", "80", $poster)
}

Write-Host "Done: $($tourDir.Path) ctz.clip1..ctz.clip4"
