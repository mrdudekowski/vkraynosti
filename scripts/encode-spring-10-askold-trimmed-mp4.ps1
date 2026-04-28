# Первые 6 с `VID_20250928_173937_00_500.MP4` → `ask.intro` (.webm, .grid.webm, .poster.webp). Шесть MOV — `encode-spring-10-askold-movs.ps1` → `ask.clip1..6`.
# Исходник: `content/Аскольд/original/`. Оригинальный MP4 не изменяется.
# Копирует `content/Аскольд/webp/*.webp` в `public/tours/spring-10/` (перезапись).
#
# Usage:
#   .\scripts\encode-spring-10-askold-trimmed-mp4.ps1
param(
  [string] $SourceFile = ''
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\Invoke-Ffmpeg.ps1')
. (Join-Path $PSScriptRoot 'media\WebmTourEncoding.ps1')

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
if ([string]::IsNullOrWhiteSpace($SourceFile)) {
  $name = 'VID_20250928_173937_00_500.MP4'
  $marker = Get-ChildItem -Path (Join-Path $repoRoot 'content') -Recurse -File -Filter $name -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $marker) {
    throw "Could not find $name under content/. Pass -SourceFile full path."
  }
  $SourceFile = $marker.FullName
}

if (-not (Test-Path -LiteralPath $SourceFile)) {
  throw "SourceFile not found: $SourceFile"
}

$tourDir = Join-Path $repoRoot 'public\tours\spring-10'
New-Item -ItemType Directory -Path $tourDir -Force | Out-Null
$tourDir = Resolve-Path $tourDir

$base = 'ask.intro'
$viewer = Join-Path $tourDir.Path "$base.webm"
$gridWebm = Join-Path $tourDir.Path "$base.grid.webm"
$poster = Join-Path $tourDir.Path "$base.poster.webp"

Write-Host "Encoding first 6s of $SourceFile -> $($tourDir.Path)\$base.*"

Invoke-Ffmpeg (@(
    '-y', '-i', $SourceFile, '-t', '6',
    '-vf', (Get-WebmScaleFilter 'full')
  ) + (Get-WebmVp9CodecArgs 'full') + @($viewer))

Invoke-Ffmpeg (@(
    '-y', '-i', $SourceFile, '-t', '6',
    '-vf', (Get-WebmScaleFilter 'grid')
  ) + (Get-WebmVp9CodecArgs 'grid') + @($gridWebm))

Invoke-Ffmpeg @('-y', '-i', $gridWebm, '-vframes', '1', '-q:v', '80', $poster)

$webpSrc = Join-Path $repoRoot 'content\Аскольд\webp'
if (Test-Path -LiteralPath $webpSrc) {
  Get-ChildItem -LiteralPath $webpSrc -Filter '*.webp' | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $tourDir.Path $_.Name) -Force
  }
  Write-Host "Copied webp from $webpSrc"
}

Write-Host "Done: $viewer"
