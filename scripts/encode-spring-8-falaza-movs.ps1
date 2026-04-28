# Encodes spring-8 (Falaza) MOV source to public/tours/spring-8/flz.clip1
# (.webm, .grid.webm, .poster.webp). VP9 = media/WebmTourEncoding.ps1.
#
# Usage:
#   .\scripts\encode-spring-8-falaza-movs.ps1
#   .\scripts\encode-spring-8-falaza-movs.ps1 -SourceDir "D:\path\to\folder"
param(
  [string] $SourceDir = ''
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\Invoke-Ffmpeg.ps1')
. (Join-Path $PSScriptRoot 'media\WebmTourEncoding.ps1')

$movName = 'falazavid.MOV'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
if ([string]::IsNullOrWhiteSpace($SourceDir)) {
  $marker = Get-ChildItem -Path (Join-Path $repoRoot 'content') -Recurse -File -Filter $movName -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $marker) {
    throw "Could not find $movName under content/. Pass -SourceDir to the folder with Falaza MOV file."
  }
  $SourceDir = $marker.DirectoryName
}

if (-not (Test-Path -LiteralPath $SourceDir)) {
  throw "SourceDir not found: $SourceDir"
}

$in = Join-Path $SourceDir $movName
if (-not (Test-Path -LiteralPath $in)) {
  throw "Missing required file: $in"
}

$tourDir = Join-Path $repoRoot 'public\tours\spring-8'
New-Item -ItemType Directory -Path $tourDir -Force | Out-Null
$tourDir = Resolve-Path $tourDir

$base = 'flz.clip1'
$viewer = Join-Path $tourDir.Path "$base.webm"
$gridWebm = Join-Path $tourDir.Path "$base.grid.webm"
$poster = Join-Path $tourDir.Path "$base.poster.webp"

Write-Host "Encoding Falaza MOV from $SourceDir -> $($tourDir.Path)"
Invoke-Ffmpeg (@('-y', '-i', $in, '-vf', (Get-WebmScaleFilter 'full')) + (Get-WebmVp9CodecArgs 'full') + @($viewer))
Invoke-Ffmpeg (@('-y', '-i', $in, '-vf', (Get-WebmScaleFilter 'grid')) + (Get-WebmVp9CodecArgs 'grid') + @($gridWebm))
Invoke-Ffmpeg @('-y', '-i', $gridWebm, '-vframes', '1', '-q:v', '80', $poster)

Write-Host "Done: $($tourDir.Path) $base"
