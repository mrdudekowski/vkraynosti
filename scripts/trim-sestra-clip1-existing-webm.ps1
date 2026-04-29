# Обрезать первые N секунд у уже собранных ss.clip1 (.webm + .grid.webm) в public/tours/spring-4
# (перекод VP9 — те же пресеты, что `WebmTourEncoding.ps1`; постер заново с первого кадра grid).
#
# Usage:
#   .\scripts\trim-sestra-clip1-existing-webm.ps1
#   .\scripts\trim-sestra-clip1-existing-webm.ps1 -TrimStartSec 2.5
param(
  [double]$TrimStartSec = 2
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\Invoke-Ffmpeg.ps1')
. (Join-Path $PSScriptRoot 'media\WebmTourEncoding.ps1')

if ($TrimStartSec -lt 0) {
  throw 'TrimStartSec must be >= 0'
}

$tourDir = Join-Path $PSScriptRoot '..\public\tours\spring-4' | Resolve-Path
$base = 'ss.clip1'
$grid = Join-Path $tourDir.Path "$base.grid.webm"
$viewer = Join-Path $tourDir.Path "$base.webm"
$poster = Join-Path $tourDir.Path "$base.poster.webp"

foreach ($p in @($grid, $viewer)) {
  if (-not (Test-Path -LiteralPath $p)) {
    throw "Missing file: $p"
  }
}

$ss = ([string]$TrimStartSec).Replace(',', '.')
# Расширение должно быть .webm — иначе muxer не выбирается.
$gridTmp = Join-Path $tourDir.Path "$base.grid.tmp.webm"
$viewerTmp = Join-Path $tourDir.Path "$base.tmp.webm"

Write-Host "Trim + re-encode from t=${ss}s: $grid -> $gridTmp"
Invoke-Ffmpeg (@('-y', '-i', $grid, '-ss', $ss, '-vf', (Get-WebmScaleFilter 'grid')) + (Get-WebmVp9CodecArgs 'grid') + @($gridTmp))

Write-Host "Trim + re-encode from t=${ss}s: $viewer -> $viewerTmp"
Invoke-Ffmpeg (@('-y', '-i', $viewer, '-ss', $ss, '-vf', (Get-WebmScaleFilter 'full')) + (Get-WebmVp9CodecArgs 'full') + @($viewerTmp))

Move-Item -LiteralPath $gridTmp -Destination $grid -Force
Move-Item -LiteralPath $viewerTmp -Destination $viewer -Force

Write-Host "Poster from new grid: $poster"
Invoke-Ffmpeg @('-y', '-i', $grid, '-vframes', '1', '-q:v', '80', $poster)

Write-Host "Done: trimmed ${ss}s from start: $grid, $viewer, $poster"
