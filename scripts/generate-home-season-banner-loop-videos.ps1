# Требуется ffmpeg в PATH (или запуск без PATH: `npm run generate:banner-loops` — node + ffmpeg-static).
# Нарезает короткие лупы для баннера «В другой сезон» из существующих *.grid.mp4.
#
# Синхронизировать таблицу $Cuts с `src/data/homeSeasonBannerClips.ts` (WINTER_CLIPS: startSec, источник).
# Выход: `public/banners_winter/` — пути в `HOME_SEASON_BANNER_WINTER_LOOP_*` (`src/constants/images.ts`).
#
# Seek: по умолчанию -ss ПОСЛЕ -i (точная отсечка по времени; медленнее на длинных файлах).
# Для ускорения можно перенести первый -ss перед -i (привязка к ключевым кадрам).
param(
  [switch]$DryRun,
  # Сгенерировать *.banner-loop.poster.webp из первого кадра каждого лупа
  [switch]$Posters
)

$ErrorActionPreference = "Stop"
$repoRoot = Join-Path $PSScriptRoot ".." | Resolve-Path
$publicTours = Join-Path $repoRoot "public\tours" | Resolve-Path
$bannerWinterOut = Join-Path $repoRoot "public\banners_winter"
New-Item -ItemType Directory -Force -Path $bannerWinterOut | Out-Null
. (Join-Path $PSScriptRoot "media\Invoke-Ffmpeg.ps1")

# Синхронно с HOME_SEASON_BANNER_COLUMN_VIDEO_PLAY_SEC в src/constants/homeSeasonBannerAnimation.ts
$DurationSec = 5

# Колонка баннера 0..9: подпапка tours, входной grid mp4, секунда старта в исходнике, имя выхода
$Cuts = @(
  @{ Subdir = "winter-3"; In = "gr.clip1.grid.mp4"; StartSec = 3;  Out = "gr.clip1.banner-loop.mp4" },
  @{ Subdir = "winter-3"; In = "gr.clip3.grid.mp4"; StartSec = 0;  Out = "gr.clip3.banner-loop.mp4" },
  @{ Subdir = "winter-3"; In = "gr.clip4.grid.mp4"; StartSec = 16; Out = "gr.clip4.banner-loop.mp4" },
  @{ Subdir = "winter-3"; In = "gr.clip5.grid.mp4"; StartSec = 1;  Out = "gr.clip5.banner-loop.mp4" },
  @{ Subdir = "winter-4"; In = "hs.clip1.grid.mp4"; StartSec = 5; Out = "hs.clip1.banner-loop.mp4" },
  @{ Subdir = "winter-5"; In = "ars.clip1.grid.mp4"; StartSec = 2; Out = "ars.clip1.banner-loop.mp4" },
  @{ Subdir = "winter-5"; In = "ars.clip2.grid.mp4"; StartSec = 7; Out = "ars.clip2.banner-loop.mp4" },
  @{ Subdir = "winter-3"; In = "gr.board.grid.mp4"; StartSec = 0; Out = "gr.board.banner-loop.mp4" },
  @{ Subdir = "winter-3"; In = "gr.elya.grid.mp4"; StartSec = 0; Out = "gr.elya.banner-loop.mp4" },
  @{ Subdir = "winter-3"; In = "gr.bbq.grid.mp4"; StartSec = 0; Out = "gr.bbq.banner-loop.mp4" }
)

foreach ($row in $Cuts) {
  $sourceDir = Join-Path $publicTours $row.Subdir
  $inPath = Join-Path $sourceDir $row.In
  $outPath = Join-Path $bannerWinterOut $row.Out
  if (-not (Test-Path $inPath)) {
    Write-Warning "Skip missing input: $inPath"
    continue
  }

  $ffArgs = @(
    '-y', '-i', $inPath,
    '-ss', ([string]$row.StartSec).Replace(',', '.'),
    '-t', ([string]$DurationSec).Replace(',', '.'),
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '28',
    '-vf', "scale='min(854,iw)':-2",
    '-an', '-movflags', '+faststart',
    $outPath
  )

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
