# Encodes the eight Sestra tour MOV sources to public/tours/spring-4/ss.clip1..ss.clip8
# (.webm, .grid.webm, .poster.webp). VP9 = media/WebmTourEncoding.ps1 (same as spring-2/3 clips).
#
# Canonical order (chronological filenames from Pictures\Spring\Сестра):
#   11-16-53, 11-17-28, 11-18-05, 11-34-59, 13-58-57, 14-50-45, 15-29-42, 20-41-21
#
# Usage:
#   .\scripts\encode-sestra-tour-movs.ps1
#   .\scripts\encode-sestra-tour-movs.ps1 -SourceDir "D:\raw\sestra"
param(
  [string] $SourceDir = ''
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\Invoke-Ffmpeg.ps1')
. (Join-Path $PSScriptRoot 'media\WebmTourEncoding.ps1')

$orderedMovNames = @(
  '2024-09-28 11-16-53.MOV',
  '2024-09-28 11-17-28.MOV',
  '2024-09-28 11-18-05.MOV',
  '2024-09-28 11-34-59.MOV',
  '2024-09-28 13-58-57.MOV',
  '2024-09-28 14-50-45.MOV',
  '2024-09-28 15-29-42.MOV',
  '2024-09-28 20-41-21.MOV'
)

if ([string]::IsNullOrWhiteSpace($SourceDir)) {
  $markerName = '2024-09-28 14-50-45.MOV'
  $marker = Get-ChildItem -Path (Join-Path $env:USERPROFILE 'Pictures\Spring') -Recurse -File -Filter $markerName -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $marker) {
    throw "Could not find $markerName under Pictures\Spring. Pass -SourceDir to the Sestra folder."
  }
  $SourceDir = $marker.DirectoryName
}

if (-not (Test-Path -LiteralPath $SourceDir)) {
  throw "SourceDir not found: $SourceDir"
}

$tourDir = Join-Path $PSScriptRoot '..\public\tours\spring-4' | Resolve-Path

foreach ($name in $orderedMovNames) {
  $p = Join-Path $SourceDir $name
  if (-not (Test-Path -LiteralPath $p)) {
    throw "Missing required file: $p"
  }
}

Write-Host "Encoding 8 MOV from $SourceDir -> $($tourDir.Path)"

$i = 0
foreach ($name in $orderedMovNames) {
  $i++
  $in = Join-Path $SourceDir $name
  $base = "ss.clip$i"
  $viewer = Join-Path $tourDir.Path "$base.webm"
  $grid = Join-Path $tourDir.Path "$base.grid.webm"
  $poster = Join-Path $tourDir.Path "$base.poster.webp"
  Write-Host "[$i/8] $base <- $name"
  Invoke-Ffmpeg (@('-y', '-i', $in, '-vf', (Get-WebmScaleFilter 'full')) + (Get-WebmVp9CodecArgs 'full') + @($viewer))
  Invoke-Ffmpeg (@('-y', '-i', $in, '-vf', (Get-WebmScaleFilter 'grid')) + (Get-WebmVp9CodecArgs 'grid') + @($grid))
  Invoke-Ffmpeg @('-y', '-i', $grid, '-vframes', '1', '-q:v', '80', $poster)
}

Write-Host "Done: $($tourDir.Path) ss.clip1..ss.clip8"
