# VP9 WebM — параметры синхронизированы с `scripts/generate-home-season-banner-loop-videos.cjs`.
# full: просмотрщик (макс. ширина 1920); grid: сетка туров (854); banner: лупы баннера (800).

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
  $w = switch ($Preset) {
    'full' { '1920' }
    'grid' { '854' }
    'banner' { '800' }
  }
  return "scale='min($w,iw)':-2"
}
