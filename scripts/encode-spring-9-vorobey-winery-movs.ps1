# Encodes three spring-9 (Vorobey + winery) MOV sources to public/tours/spring-9/vrb.clip1..3
# (.webm, .grid.webm, .poster.webp). VP9 = media/WebmTourEncoding.ps1.
#
# Canonical order:
#   2024-09-22 07-53-26, 2024-09-22 09-16-13, IMG_4051
#
# Usage:
#   .\scripts\encode-spring-9-vorobey-winery-movs.ps1
#   .\scripts\encode-spring-9-vorobey-winery-movs.ps1 -SourceDir "D:\path\to\folder"
param(
  [string] $SourceDir = ''
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\Invoke-Ffmpeg.ps1')
. (Join-Path $PSScriptRoot 'media\WebmTourEncoding.ps1')

$orderedMovNames = @(
  '2024-09-22 07-53-26.MOV',
  '2024-09-22 09-16-13.MOV',
  'IMG_4051.MOV'
)

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
if ([string]::IsNullOrWhiteSpace($SourceDir)) {
  $markerName = '2024-09-22 07-53-26.MOV'
  $marker = Get-ChildItem -Path (Join-Path $repoRoot 'content') -Recurse -File -Filter $markerName -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $marker) {
    throw "Could not find $markerName under content/. Pass -SourceDir to the folder with Vorobey MOV files."
  }
  $SourceDir = $marker.DirectoryName
}

if (-not (Test-Path -LiteralPath $SourceDir)) {
  throw "SourceDir not found: $SourceDir"
}

$tourDir = Join-Path $repoRoot 'public\tours\spring-9'
New-Item -ItemType Directory -Path $tourDir -Force | Out-Null
$tourDir = Resolve-Path $tourDir

foreach ($name in $orderedMovNames) {
  $p = Join-Path $SourceDir $name
  if (-not (Test-Path -LiteralPath $p)) {
    throw "Missing required file: $p"
  }
}

Write-Host "Encoding 3 MOV from $SourceDir -> $($tourDir.Path)"

$i = 0
foreach ($name in $orderedMovNames) {
  $i++
  $in = Join-Path $SourceDir $name
  $base = "vrb.clip$i"
  $viewer = Join-Path $tourDir.Path "$base.webm"
  $gridWebm = Join-Path $tourDir.Path "$base.grid.webm"
  $poster = Join-Path $tourDir.Path "$base.poster.webp"
  Write-Host "[$i/3] $base <- $name"
  Invoke-Ffmpeg (@("-y", "-i", $in, "-vf", (Get-WebmScaleFilter "full")) + (Get-WebmVp9CodecArgs "full") + @($viewer))
  Invoke-Ffmpeg (@("-y", "-i", $in, "-vf", (Get-WebmScaleFilter "grid")) + (Get-WebmVp9CodecArgs "grid") + @($gridWebm))
  Invoke-Ffmpeg @("-y", "-i", $gridWebm, "-vframes", "1", "-q:v", "80", $poster)
}

Write-Host "Done: $($tourDir.Path) vrb.clip1..vrb.clip3"
