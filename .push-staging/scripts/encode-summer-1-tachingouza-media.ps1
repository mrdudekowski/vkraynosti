# «Заповедная Та-Чингоуза» (summer-1): MP4 → tch.clip1..7 + webp в public/tours/summer-1/.
# Исходники: content/Лето/Тачингоуза/HERO, webp/; видео — DaVinci site или -SourceDir.
#
# Usage:
#   .\scripts\encode-summer-1-tachingouza-media.ps1
#   .\scripts\encode-summer-1-tachingouza-media.ps1 -SourceDir "D:\Soft\DaVinci\DaVinci_Projects\Chitingouza\site"
param(
  [string] $SourceDir = '',
  [string] $WebpDir = '',
  [string] $HeroPath = ''
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\Invoke-Ffmpeg.ps1')
. (Join-Path $PSScriptRoot 'media\WebmTourEncoding.ps1')

function Convert-TachingouzaPhoto {
  param(
    [Parameter(Mandatory)][string] $InputPath,
    [Parameter(Mandatory)][string] $OutputPath,
    [Parameter(Mandatory)][int] $MaxLongSide
  )

  $scaleFilter = 'scale=w=if(gt(ih\,iw)\,-2\,min({0}\,iw)):h=if(gt(ih\,iw)\,min({0}\,ih)\,-2)' -f $MaxLongSide
  Invoke-Ffmpeg @(
    '-y', '-i', $InputPath,
    '-vf', $scaleFilter,
    '-c:v', 'libwebp',
    '-quality', '78',
    '-compression_level', '5',
    $OutputPath
  )
}

$orderedMp4Names = @(
  'volna.mp4',
  'volna2.mp4',
  'wai-wai.mp4',
  'drive.mp4',
  'pesochek.mp4',
  'polezla.mp4',
  'skali.mp4'
)

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')

if ([string]::IsNullOrWhiteSpace($SourceDir)) {
  $marker = Get-ChildItem -Path (Join-Path $repoRoot 'content') -Recurse -File -Filter $orderedMp4Names[0] -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $marker) {
    $defaultDaVinci = 'D:\Soft\DaVinci\DaVinci_Projects\Chitingouza\site'
    if (Test-Path -LiteralPath $defaultDaVinci) {
      $SourceDir = $defaultDaVinci
    } else {
      throw "Could not find $($orderedMp4Names[0]) under content/. Pass -SourceDir to the folder with summer-1 MP4 files."
    }
  } else {
    $SourceDir = $marker.DirectoryName
  }
}

if ([string]::IsNullOrWhiteSpace($WebpDir)) {
  $webpMarker = Get-ChildItem -Path (Join-Path $repoRoot 'content') -Recurse -File -Filter 'pesocheg.webp' -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $webpMarker) {
    throw 'Could not find pesocheg.webp under content/. Pass -WebpDir.'
  }
  $WebpDir = $webpMarker.DirectoryName
}

if ([string]::IsNullOrWhiteSpace($HeroPath)) {
  $heroFile = Get-ChildItem -Path (Join-Path $repoRoot 'content') -Recurse -File -Filter 'tachingouza.webp' -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $heroFile) {
    throw 'Could not find tachingouza.webp under content/. Pass -HeroPath.'
  }
  $HeroPath = $heroFile.FullName
}

if (-not (Test-Path -LiteralPath $SourceDir)) {
  throw "SourceDir not found: $SourceDir"
}
if (-not (Test-Path -LiteralPath $WebpDir)) {
  throw "WebpDir not found: $WebpDir"
}
if (-not (Test-Path -LiteralPath $HeroPath)) {
  throw "HeroPath not found: $HeroPath"
}

foreach ($name in $orderedMp4Names) {
  $p = Join-Path $SourceDir $name
  if (-not (Test-Path -LiteralPath $p)) {
    throw "Missing required file: $p"
  }
}

$photoMap = @(
  @{ SourcePath = $HeroPath; Output = 'hero.webp'; MaxLongSide = 1600 },
  @{ Source = 'look.webp'; Output = 'preface.webp'; MaxLongSide = 1600 },
  @{ Source = 'voda.webp'; Output = 'voda.webp'; MaxLongSide = 1400 },
  @{ Source = 'pesocheg.webp'; Output = 'pesochek.webp'; MaxLongSide = 1400 },
  @{ Source = 'first.webp'; Output = 'first.webp'; MaxLongSide = 1400 },
  @{ Source = 'skala.webp'; Output = 'skala.webp'; MaxLongSide = 1400 },
  @{ Source = 'cave.webp'; Output = 'cave.webp'; MaxLongSide = 1400 },
  @{ Source = 'dlinni.webp'; Output = 'dlinni.webp'; MaxLongSide = 1400 },
  @{ Source = 'most.webp'; Output = 'most.webp'; MaxLongSide = 1400 },
  @{ Source = 'saponi.webp'; Output = 'saponi.webp'; MaxLongSide = 1400 },
  @{ Source = 'shiroki2.webp'; Output = 'shiroki2.webp'; MaxLongSide = 1400 },
  @{ Source = 'stoit.webp'; Output = 'stoit.webp'; MaxLongSide = 1400 },
  @{ Source = 'stone.webp'; Output = 'stone.webp'; MaxLongSide = 1400 }
)

foreach ($entry in $photoMap) {
  $p = if ($entry.SourcePath) { $entry.SourcePath } else { Join-Path $WebpDir $entry.Source }
  if (-not (Test-Path -LiteralPath $p)) {
    throw "Missing required photo: $p"
  }
}

$tourDir = Join-Path $repoRoot 'public\tours\summer-1'
New-Item -ItemType Directory -Path $tourDir -Force | Out-Null
$tourDir = Resolve-Path $tourDir

Write-Host "Encoding summer-1 from $SourceDir -> $($tourDir.Path)"

foreach ($entry in $photoMap) {
  $in = if ($entry.SourcePath) { $entry.SourcePath } else { Join-Path $WebpDir $entry.Source }
  $out = Join-Path $tourDir.Path $entry.Output
  $label = if ($entry.Source) { $entry.Source } else { 'tachingouza.webp' }
  Write-Host "photo $($entry.Output) <- $label"
  Convert-TachingouzaPhoto -InputPath $in -OutputPath $out -MaxLongSide $entry.MaxLongSide
}

$clipCount = $orderedMp4Names.Count
$i = 0
foreach ($name in $orderedMp4Names) {
  $i++
  $in = Join-Path $SourceDir $name
  $base = "tch.clip$i"
  $gridWebm = Join-Path $tourDir.Path "$base.grid.webm"
  $poster = Join-Path $tourDir.Path "$base.poster.webp"
  Write-Host "[$i/$clipCount] $base <- $name"
  Invoke-Ffmpeg (@('-y', '-i', $in, '-vf', (Get-WebmScaleFilter 'grid')) + (Get-WebmVp9CodecArgs 'grid') + @($gridWebm))
  Invoke-Ffmpeg @('-y', '-ss', '1', '-i', $gridWebm, '-vframes', '1', '-q:v', '80', $poster)
}

Write-Host "Done: $($tourDir.Path) hero + preface + 11 webp + tch.clip1..$clipCount"
