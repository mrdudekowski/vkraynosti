# Создаёт gr.board/elya/bbq `*.grid.mp4` и `*.poster.webp` в `public/tours/winter-3/`.
# ffmpeg: `node_modules\@ffmpeg-installer\win32-x64\ffmpeg.exe` после `npm i`, иначе — из PATH.
# Параметры кодирования — как в `generate-winter-3-grid-assets.ps1`.
param(
  [string] $BoardIn = "$env:USERPROFILE\Downloads\IMG_2035.MOV",
  [string] $ElyaIn = "$env:USERPROFILE\Downloads\-4424874489062906118.MP4",
  [string] $BbqIn = "$env:USERPROFILE\Downloads\IMG_1946.MOV",
  [double] $BoardStartSec = 5,
  [double] $ElyaStartSec = 6,
  [double] $BbqStartSec = 14,
  [double] $SegmentDurationSec = 15,
  [string] $FfmpegExe = ""
)

$ErrorActionPreference = "Stop"
$repoRoot = Join-Path $PSScriptRoot ".." | Resolve-Path
$outDir = Join-Path $repoRoot "public\tours\winter-3" | Resolve-Path

if (-not $FfmpegExe) {
  $bundled = Join-Path $repoRoot "node_modules\@ffmpeg-installer\win32-x64\ffmpeg.exe"
  if (Test-Path -LiteralPath $bundled) { $FfmpegExe = $bundled }
  else { $FfmpegExe = "ffmpeg" }
}

function Invoke-FfmpegLocal {
  param([Parameter(Mandatory)][string[]]$Arguments)
  & $FfmpegExe @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "ffmpeg exit ${LASTEXITCODE}: $FfmpegExe $($Arguments -join ' ')"
  }
}

$jobs = @(
  @{ In = $BoardIn; Ss = [string]$BoardStartSec; Out = "gr.board.grid.mp4" }
  @{ In = $ElyaIn; Ss = [string]$ElyaStartSec; Out = "gr.elya.grid.mp4" }
  @{ In = $BbqIn; Ss = [string]$BbqStartSec; Out = "gr.bbq.grid.mp4" }
)

foreach ($j in $jobs) {
  if (-not (Test-Path -LiteralPath $j.In)) {
    throw "Missing input: $($j.In)"
  }
  $outPath = Join-Path $outDir $j.Out
  Invoke-FfmpegLocal @(
    '-y', '-ss', $j.Ss, '-i', $j.In,
    '-t', ([string]$SegmentDurationSec),
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '28',
    '-vf', "scale='min(854,iw)':-2",
    '-an', '-movflags', '+faststart',
    $outPath
  )
}

foreach ($base in @("gr.board", "gr.elya", "gr.bbq")) {
  $mp4 = Join-Path $outDir "${base}.grid.mp4"
  $webp = Join-Path $outDir "${base}.poster.webp"
  Invoke-FfmpegLocal @('-y', '-i', $mp4, '-vframes', '1', '-q:v', '80', $webp)
}

Write-Host "Done winter-3 banner stub videos in $outDir"
