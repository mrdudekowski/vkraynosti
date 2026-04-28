# Шесть MOV с Аскольда → `public/tours/spring-10/ask.clip1..6` (.webm, .grid.webm, .poster.webp).
# Порядок по времени съёмки (хронология файлов). VP9: `media/WebmTourEncoding.ps1`.
# Клип из MP4 (6 с) → `ask.intro`: после этого скрипта выполните `encode-spring-10-askold-trimmed-mp4.ps1`.
# Копирует `content/Аскольд/webp/*.webp` в `public/tours/spring-10/`.
#
# Usage:
#   .\scripts\encode-spring-10-askold-movs.ps1
#   .\scripts\encode-spring-10-askold-movs.ps1 -SourceDir "D:\path\to\Аскольд\original"
param(
  [string] $SourceDir = ''
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\Invoke-Ffmpeg.ps1')
. (Join-Path $PSScriptRoot 'media\WebmTourEncoding.ps1')

$orderedMovNames = @(
  '2022-08-31 10-51-47.MOV',
  '2022-08-31 11-01-39.MOV',
  '2022-08-31 11-05-42.MOV',
  '2022-08-31 11-11-09.MOV',
  '2022-08-31 11-24-32.MOV',
  '2022-08-31 12-18-48.MOV'
)

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
if ([string]::IsNullOrWhiteSpace($SourceDir)) {
  $markerName = $orderedMovNames[0]
  $marker = Get-ChildItem -Path (Join-Path $repoRoot 'content') -Recurse -File -Filter $markerName -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $marker) {
    throw "Could not find $markerName under content/. Pass -SourceDir to `content\Аскольд\original`."
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

$tourDir = Join-Path $repoRoot 'public\tours\spring-10'
New-Item -ItemType Directory -Path $tourDir -Force | Out-Null
$tourDir = Resolve-Path $tourDir

Write-Host "Encoding 6 MOV from $SourceDir -> $($tourDir.Path)\ask.clip1..6"

$i = 0
foreach ($name in $orderedMovNames) {
  $i++
  $in = Join-Path $SourceDir $name
  $base = "ask.clip$i"
  $viewer = Join-Path $tourDir.Path "$base.webm"
  $gridWebm = Join-Path $tourDir.Path "$base.grid.webm"
  $poster = Join-Path $tourDir.Path "$base.poster.webp"
  Write-Host "[$i/6] $base <- $name"
  Invoke-Ffmpeg (@('-y', '-i', $in, '-vf', (Get-WebmScaleFilter 'full')) + (Get-WebmVp9CodecArgs 'full') + @($viewer))
  Invoke-Ffmpeg (@('-y', '-i', $in, '-vf', (Get-WebmScaleFilter 'grid')) + (Get-WebmVp9CodecArgs 'grid') + @($gridWebm))
  Invoke-Ffmpeg @('-y', '-i', $gridWebm, '-vframes', '1', '-q:v', '80', $poster)
}

$webpSrc = Join-Path $repoRoot 'content\Аскольд\webp'
if (Test-Path -LiteralPath $webpSrc) {
  Get-ChildItem -LiteralPath $webpSrc -Filter '*.webp' | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $tourDir.Path $_.Name) -Force
  }
  Write-Host "Copied webp from $webpSrc"
}

Write-Host "Done: $($tourDir.Path) ask.clip1..ask.clip6"
