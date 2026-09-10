# VP9 WebM — параметры синхронизированы с `scripts/generate-home-season-banner-loop-videos.cjs`.
# full / grid / banner: макс. длинная сторона 1920 / 854 / 800 px (см. Get-WebmScaleFilter).

function Get-WebmVp9CodecArgs {
  param(
    [Parameter(Mandatory)]
    [ValidateSet('full', 'grid', 'banner')]
    [string]$Preset
  )
  $crf = switch ($Preset) {
    'full' { '30' }
    'grid' { '32' }
    'banner' { '33' }
  }
  return @(
    '-c:v', 'libvpx-vp9', '-crf', $crf, '-b:v', '0',
    '-row-mt', '1', '-cpu-used', '2', '-deadline', 'good',
    '-pix_fmt', 'yuv420p', '-an'
  )
}

function Get-WebmScaleFilter {
  param(
    [Parameter(Mandatory)]
    [ValidateSet('full', 'grid', 'banner')]
    [string]$Preset
  )
  # Ограничиваем длинную сторону (не только ширину): иначе портретное видео
  # после `min(1920,iw):-2` остаётся 1920×3000+ и раздувает WebM выше лимита GitHub (100 MiB).
  $L = switch ($Preset) {
    'full'   { '1920' }
    'grid'   { '854' }
    'banner' { '800' }
  }
  return "scale=w=if(gt(ih\,iw)\,-2\,min($L\,iw)):h=if(gt(ih\,iw)\,min($L\,ih)\,-2)"
}
