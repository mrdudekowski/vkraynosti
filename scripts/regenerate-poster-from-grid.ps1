# Перегенерация одного *.poster.webp из соответствующего *.grid.webm (точечно, фаза 1).
# Пример: .\scripts\regenerate-poster-from-grid.ps1 -TourRelativePath winter-3 -ClipBase gr.clip1
param(
  [Parameter(Mandatory)][string] $TourRelativePath,
  [Parameter(Mandatory)][string] $ClipBase,
  [int] $Quality = 78,
  [double] $SeekSeconds = 0.5
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\Invoke-Ffmpeg.ps1')
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$tourDir = Join-Path $repoRoot (Join-Path 'public\tours' $TourRelativePath) | Resolve-Path
$grid = Join-Path $tourDir.Path ("{0}.grid.webm" -f $ClipBase)
$poster = Join-Path $tourDir.Path ("{0}.poster.webp" -f $ClipBase)
if (-not (Test-Path -LiteralPath $grid)) {
  throw "Grid webm not found: $grid"
}
Invoke-Ffmpeg @(
  '-y', '-ss', ([string]$SeekSeconds).Replace(',', '.'), '-i', $grid,
  '-vframes', '1', '-c:v', 'libwebp', '-quality', "$Quality",
  $poster
)
$bytes = (Get-Item -LiteralPath $poster).Length
Write-Host ("Poster written: {0} ({1:N0} bytes)" -f $poster, $bytes)
