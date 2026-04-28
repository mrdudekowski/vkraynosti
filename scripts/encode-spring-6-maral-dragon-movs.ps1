# Encodes five spring-6 (Maral farm + Dragon park) MOV sources to public/tours/spring-6/mnd.clip1..5
# (.webm, .grid.webm, .poster.webp). VP9 = media/WebmTourEncoding.ps1.
#
# Canonical order (IMG number ascending):
#   IMG_3775, IMG_3782, IMG_3788, IMG_4095, IMG_4135
#
# Usage:
#   .\scripts\encode-spring-6-maral-dragon-movs.ps1
#   .\scripts\encode-spring-6-maral-dragon-movs.ps1 -SourceDir "D:\path\to\webp"
param(
  [string] $SourceDir = ''
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\Invoke-Ffmpeg.ps1')
. (Join-Path $PSScriptRoot 'media\WebmTourEncoding.ps1')

$orderedMovNames = @(
  'IMG_3775.MOV',
  'IMG_3782.MOV',
  'IMG_3788.MOV',
  'IMG_4095.MOV',
  'IMG_4135.MOV'
)

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
if ([string]::IsNullOrWhiteSpace($SourceDir)) {
  $markerName = 'IMG_3775.MOV'
  $marker = Get-ChildItem -Path (Join-Path $repoRoot 'content') -Recurse -File -Filter $markerName -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $marker) {
    throw "Could not find $markerName under content/. Pass -SourceDir to the folder with MOV files."
  }
  $SourceDir = $marker.DirectoryName
}

if (-not (Test-Path -LiteralPath $SourceDir)) {
  throw "SourceDir not found: $SourceDir"
}

$tourDir = Join-Path $repoRoot 'public\tours\spring-6'
New-Item -ItemType Directory -Path $tourDir -Force | Out-Null
$tourDir = Resolve-Path $tourDir

foreach ($name in $orderedMovNames) {
  $p = Join-Path $SourceDir $name
  if (-not (Test-Path -LiteralPath $p)) {
    throw "Missing required file: $p"
  }
}

Write-Host "Encoding 5 MOV from $SourceDir -> $($tourDir.Path)"

$i = 0
foreach ($name in $orderedMovNames) {
  $i++
  $in = Join-Path $SourceDir $name
  $base = "mnd.clip$i"
  $viewer = Join-Path $tourDir.Path "$base.webm"
  $gridWebm = Join-Path $tourDir.Path "$base.grid.webm"
  $poster = Join-Path $tourDir.Path "$base.poster.webp"
  Write-Host "[$i/5] $base <- $name"
  Invoke-Ffmpeg (@("-y", "-i", $in, "-vf", (Get-WebmScaleFilter "full")) + (Get-WebmVp9CodecArgs "full") + @($viewer))
  Invoke-Ffmpeg (@("-y", "-i", $in, "-vf", (Get-WebmScaleFilter "grid")) + (Get-WebmVp9CodecArgs "grid") + @($gridWebm))
  Invoke-Ffmpeg @("-y", "-i", $gridWebm, "-vframes", "1", "-q:v", "80", $poster)
}

Write-Host "Done: $($tourDir.Path) mnd.clip1..mnd.clip5"
