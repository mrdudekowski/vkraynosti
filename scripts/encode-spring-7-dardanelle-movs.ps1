# Encodes two spring-7 (Dardanelles gorge) MOV sources to public/tours/spring-7/ddn.clip1..2
# (.webm, .grid.webm, .poster.webp). VP9 = media/WebmTourEncoding.ps1.
#
# Canonical order (chronological filenames):
#   2023-10-15 15-48-35, 2025-06-08 08-39-01
#
# Usage:
#   .\scripts\encode-spring-7-dardanelle-movs.ps1
#   .\scripts\encode-spring-7-dardanelle-movs.ps1 -SourceDir "D:\path\to\folder"
param(
  [string] $SourceDir = ''
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\Invoke-Ffmpeg.ps1')
. (Join-Path $PSScriptRoot 'media\WebmTourEncoding.ps1')

$orderedMovNames = @(
  '2023-10-15 15-48-35.MOV',
  '2025-06-08 08-39-01.MOV'
)

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
if ([string]::IsNullOrWhiteSpace($SourceDir)) {
  $markerName = '2023-10-15 15-48-35.MOV'
  $marker = Get-ChildItem -Path (Join-Path $repoRoot 'content') -Recurse -File -Filter $markerName -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $marker) {
    throw "Could not find $markerName under content/. Pass -SourceDir to the folder with Dardanelle MOV files."
  }
  $SourceDir = $marker.DirectoryName
}

if (-not (Test-Path -LiteralPath $SourceDir)) {
  throw "SourceDir not found: $SourceDir"
}

$tourDir = Join-Path $repoRoot 'public\tours\spring-7'
New-Item -ItemType Directory -Path $tourDir -Force | Out-Null
$tourDir = Resolve-Path $tourDir

foreach ($name in $orderedMovNames) {
  $p = Join-Path $SourceDir $name
  if (-not (Test-Path -LiteralPath $p)) {
    throw "Missing required file: $p"
  }
}

Write-Host "Encoding 2 MOV from $SourceDir -> $($tourDir.Path)"

$i = 0
foreach ($name in $orderedMovNames) {
  $i++
  $in = Join-Path $SourceDir $name
  $base = "ddn.clip$i"
  $viewer = Join-Path $tourDir.Path "$base.webm"
  $gridWebm = Join-Path $tourDir.Path "$base.grid.webm"
  $poster = Join-Path $tourDir.Path "$base.poster.webp"
  Write-Host "[$i/2] $base <- $name"
  Invoke-Ffmpeg (@("-y", "-i", $in, "-vf", (Get-WebmScaleFilter "full")) + (Get-WebmVp9CodecArgs "full") + @($viewer))
  Invoke-Ffmpeg (@("-y", "-i", $in, "-vf", (Get-WebmScaleFilter "grid")) + (Get-WebmVp9CodecArgs "grid") + @($gridWebm))
  Invoke-Ffmpeg @("-y", "-i", $gridWebm, "-vframes", "1", "-q:v", "80", $poster)
}

Write-Host "Done: $($tourDir.Path) ddn.clip1..ddn.clip2"
