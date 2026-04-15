# Полноразмерные `*.webm` и `*.grid.webm` для клипов весенних туров (источники — `*.mp4` в папке тура).
# Постеры `*.poster.webp` — с первого кадра grid-webm. Требует `Invoke-Ffmpeg` (PATH или bundled на Windows).
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "media\Invoke-Ffmpeg.ps1")
. (Join-Path $PSScriptRoot "media\WebmTourEncoding.ps1")

function Encode-ClipPair {
  param(
    [Parameter(Mandatory)][string]$TourDir,
    [Parameter(Mandatory)][string]$BaseName
  )
  $inMp4 = Join-Path $TourDir "${BaseName}.mp4"
  if (-not (Test-Path -LiteralPath $inMp4)) {
    Write-Warning "Skip missing: $inMp4"
    return
  }
  $viewer = Join-Path $TourDir "${BaseName}.webm"
  $grid = Join-Path $TourDir "${BaseName}.grid.webm"
  Invoke-Ffmpeg (@('-y', '-i', $inMp4, '-vf', (Get-WebmScaleFilter 'full')) + (Get-WebmVp9CodecArgs 'full') + @($viewer))
  Invoke-Ffmpeg (@('-y', '-i', $inMp4, '-vf', (Get-WebmScaleFilter 'grid')) + (Get-WebmVp9CodecArgs 'grid') + @($grid))
  $poster = Join-Path $TourDir "${BaseName}.poster.webp"
  Invoke-Ffmpeg @('-y', '-i', $grid, '-vframes', '1', '-q:v', '80', $poster)
}

$spring2 = Join-Path $PSScriptRoot "..\public\tours\spring-2" | Resolve-Path
Encode-ClipPair -TourDir $spring2.Path -BaseName "olv.clip1"

$spring3 = Join-Path $PSScriptRoot "..\public\tours\spring-3" | Resolve-Path
foreach ($n in 1..7) {
  Encode-ClipPair -TourDir $spring3.Path -BaseName "pd.clip$n"
}

Write-Host "Done spring-2/3 tour clip WebM assets."
