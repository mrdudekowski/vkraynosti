# Encodes spring-11 MOV sources to public/tours/spring-11/shk.clip1..3
# (.grid.webm, .poster.webp). VP9 settings are shared in media/WebmTourEncoding.ps1.
#
# Usage:
#   .\scripts\encode-spring-11-shkota-movs.ps1
#   .\scripts\encode-spring-11-shkota-movs.ps1 -SourceDir "D:\path\to\source"
param(
  [string] $SourceDir = ''
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\Invoke-Ffmpeg.ps1')
. (Join-Path $PSScriptRoot 'media\WebmTourEncoding.ps1')

$orderedMovNames = @(
  'IMG_1389.MOV',
  'IMG_1408.MOV',
  'IMG_1411.MOV'
)

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
if ([string]::IsNullOrWhiteSpace($SourceDir)) {
  $marker = Get-ChildItem -Path (Join-Path $repoRoot 'content') -Recurse -File -Filter $orderedMovNames[0] -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $marker) {
    throw "Could not find $($orderedMovNames[0]) under content/. Pass -SourceDir to the folder with spring-11 MOV files."
  }
  $SourceDir = $marker.DirectoryName
}

if (-not (Test-Path -LiteralPath $SourceDir)) {
  throw "SourceDir not found: $SourceDir"
}

foreach ($name in $orderedMovNames) {
  $p = Join-Path $SourceDir $name
  if (-not (Test-Path -LiteralPath $p)) {
    throw "Missing required file: $p"
  }
}

$tourDir = Join-Path $repoRoot 'public\tours\spring-11'
New-Item -ItemType Directory -Path $tourDir -Force | Out-Null
$tourDir = Resolve-Path $tourDir

Write-Host "Encoding 3 MOV from $SourceDir -> $($tourDir.Path)\shk.clip1..3"

$i = 0
foreach ($name in $orderedMovNames) {
  $i++
  $in = Join-Path $SourceDir $name
  $base = "shk.clip$i"
  $gridWebm = Join-Path $tourDir.Path "$base.grid.webm"
  $poster = Join-Path $tourDir.Path "$base.poster.webp"
  Write-Host "[$i/3] $base <- $name"
  Invoke-Ffmpeg (@('-y', '-i', $in, '-vf', (Get-WebmScaleFilter 'grid')) + (Get-WebmVp9CodecArgs 'grid') + @($gridWebm))
  Invoke-Ffmpeg @('-y', '-ss', '1', '-i', $gridWebm, '-vframes', '1', '-q:v', '80', $poster)
}

Write-Host "Done: $($tourDir.Path) shk.clip1..shk.clip3"
