# Обрезка `sev.clip1.grid.webm` до 6 с в `public/tours/summer-7/` (перекод VP9, постер заново).
# Используйте, если исходный MOV недоступен; из MOV — `encode-summer-7-sever-media.ps1 -OnlyClips 1`.
#
# Usage:
#   .\scripts\trim-summer-7-clip1-to-6sec.ps1
param(
  [double]$DurationSec = 6
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\Invoke-Ffmpeg.ps1')
. (Join-Path $PSScriptRoot 'media\WebmTourEncoding.ps1')

if ($DurationSec -le 0) {
  throw 'DurationSec must be > 0'
}

$tourDir = Join-Path $PSScriptRoot '..\public\tours\summer-7' | Resolve-Path
$base = 'sev.clip1'
$grid = Join-Path $tourDir.Path "$base.grid.webm"
$poster = Join-Path $tourDir.Path "$base.poster.webp"
$gridTmp = Join-Path $tourDir.Path "$base.grid.tmp.webm"
$t = ([string]$DurationSec).Replace(',', '.')

if (-not (Test-Path -LiteralPath $grid)) {
  throw "Missing file: $grid"
}

Write-Host "Trim to ${t}s + re-encode: $grid"
Invoke-Ffmpeg (@('-y', '-i', $grid, '-t', $t, '-vf', (Get-WebmScaleFilter 'grid')) + (Get-WebmVp9CodecArgs 'grid') + @($gridTmp))

Move-Item -LiteralPath $gridTmp -Destination $grid -Force

Write-Host "Poster from grid: $poster"
Invoke-Ffmpeg @('-y', '-i', $grid, '-vframes', '1', '-q:v', '80', $poster)

Write-Host "Done: $base (${t}s): $grid, $poster"
