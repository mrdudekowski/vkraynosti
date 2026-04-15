# Требуется ffmpeg (`Invoke-Ffmpeg`: PATH или bundled на Windows).
# Нарезает короткие лупы для баннера «В другой сезон» из существующих `*.grid.webm`.
#
# Синхронизировать таблицу $Cuts с `src/data/homeSeasonBannerClips.ts` (WINTER_CLIPS: startSec, источник).
# Выход: `public/banners_winter/` — пути в `HOME_SEASON_BANNER_WINTER_LOOP_*` (`src/constants/images.ts`).
#
# Seek: по умолчанию -ss ПОСЛЕ -i (точная отсечка по времени; медленнее на длинных файлах).
param(
  [switch]$DryRun,
  [switch]$Posters
)

$ErrorActionPreference = "Stop"
$repoRoot = Join-Path $PSScriptRoot ".." | Resolve-Path
$publicTours = Join-Path $repoRoot "public\tours" | Resolve-Path
$bannerWinterOut = Join-Path $repoRoot "public\banners_winter"
New-Item -ItemType Directory -Force -Path $bannerWinterOut | Out-Null
. (Join-Path $PSScriptRoot "media\Invoke-Ffmpeg.ps1")
. (Join-Path $PSScriptRoot "media\WebmTourEncoding.ps1")

$DurationSec = 5

$Cuts = @(
  @{ Subdir = "winter-3"; In = "gr.clip1.grid.webm"; StartSec = 3;  Out = "gr.clip1.banner-loop.webm" },
  @{ Subdir = "winter-3"; In = "gr.clip3.grid.webm"; StartSec = 0;  Out = "gr.clip3.banner-loop.webm" },
  @{ Subdir = "winter-3"; In = "gr.clip4.grid.webm"; StartSec = 16; Out = "gr.clip4.banner-loop.webm" },
  @{ Subdir = "winter-3"; In = "gr.clip5.grid.webm"; StartSec = 1;  Out = "gr.clip5.banner-loop.webm" },
  @{ Subdir = "winter-4"; In = "hs.clip1.grid.webm"; StartSec = 5; Out = "hs.clip1.banner-loop.webm" },
  @{ Subdir = "winter-5"; In = "ars.clip1.grid.webm"; StartSec = 2; Out = "ars.clip1.banner-loop.webm" },
  @{ Subdir = "winter-5"; In = "ars.clip2.grid.webm"; StartSec = 7; Out = "ars.clip2.banner-loop.webm" },
  @{ Subdir = "winter-3"; In = "gr.board.grid.webm"; StartSec = 0; Out = "gr.board.banner-loop.webm" },
  @{ Subdir = "winter-3"; In = "gr.elya.grid.webm"; StartSec = 0; Out = "gr.elya.banner-loop.webm" },
  @{ Subdir = "winter-3"; In = "gr.bbq.grid.webm"; StartSec = 0; Out = "gr.bbq.banner-loop.webm" }
)

foreach ($row in $Cuts) {
  $sourceDir = Join-Path $publicTours $row.Subdir
  $inPath = Join-Path $sourceDir $row.In
  $outPath = Join-Path $bannerWinterOut $row.Out
  if (-not (Test-Path $inPath)) {
    Write-Warning "Skip missing input: $inPath"
    continue
  }

  $vf = Get-WebmScaleFilter 'banner'
  $enc = Get-WebmVp9CodecArgs 'banner'
  $ffArgs = @(
    '-y', '-i', $inPath,
    '-ss', ([string]$row.StartSec).Replace(',', '.'),
    '-t', ([string]$DurationSec).Replace(',', '.'),
    '-vf', $vf
  ) + $enc + @($outPath)

  if ($DryRun) {
    Write-Host "ffmpeg $($ffArgs -join ' ')"
    continue
  }

  Write-Host "-> $outPath"
  Invoke-Ffmpeg $ffArgs

  if ($Posters) {
    $base = [System.IO.Path]::GetFileNameWithoutExtension($row.Out)
    $posterPath = Join-Path $bannerWinterOut "${base}.poster.webp"
    Invoke-Ffmpeg @('-y', '-i', $outPath, '-vframes', '1', '-q:v', '80', $posterPath)
  }
}

Write-Host "Done. Выход: public\banners_winter\. При смене нарезок — таблица в скрипте и `HOME_SEASON_BANNER_WINTER_LOOP_*` в `src/constants/images.ts`."
