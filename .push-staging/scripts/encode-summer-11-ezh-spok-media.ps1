# summer-11 «Релакс-тур в бухту Ежовую / Спокойную»
# Photos -> public/tours/summer-11/*.webp
# EJG.MOV (first 13s), view.MOV, vodichka.mp4 -> relax.clip*.grid.webm + .poster.webp
#
# Usage:
#   .\scripts\encode-summer-11-ezh-spok-media.ps1
#   .\scripts\encode-summer-11-ezh-spok-media.ps1 -SourceDir 'content\Лето\Ёж+спок'
param(
  [string] $SourceDir = ''
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\Invoke-Ffmpeg.ps1')
. (Join-Path $PSScriptRoot 'media\WebmTourEncoding.ps1')

function Convert-RelaxPhoto {
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

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')

if ([string]::IsNullOrWhiteSpace($SourceDir)) {
  $marker = Get-ChildItem -Path (Join-Path $repoRoot 'content') -Recurse -File -Filter 'EJG.MOV' -ErrorAction SilentlyContinue |
    Where-Object { Test-Path (Join-Path $_.DirectoryName 'Yoj.webp') } |
    Select-Object -First 1
  if (-not $marker) {
    throw 'Could not find EJG.MOV + Yoj.webp under content/. Pass -SourceDir.'
  }
  $SourceDir = $marker.DirectoryName
}

if (-not (Test-Path -LiteralPath $SourceDir)) {
  throw "SourceDir not found: $SourceDir"
}

$photoMap = @(
  @{ Source = 'Yoj.webp'; Output = 'cover.webp'; MaxLongSide = 1600 },
  @{ Source = 'spok2.webp'; Output = 'preface.webp'; MaxLongSide = 1600 },
  @{ Source = 'spok.webp'; Output = 'coastal-rocks.webp'; MaxLongSide = 1400 },
  @{ Source = 'Yo-uj.webp'; Output = 'bay-wide.webp'; MaxLongSide = 1400 },
  @{ Source = 'Yoj2.webp'; Output = 'beach-walk.webp'; MaxLongSide = 1400 },
  @{ Source = 'spok3.webp'; Output = 'yoga-kekur.webp'; MaxLongSide = 1400 }
)

$videoMap = @(
  @{ Source = 'vodichka.mp4'; Base = 'relax.clip3'; DurationSec = $null },
  @{ Source = 'EJG.MOV'; Base = 'relax.clip1'; DurationSec = 13 },
  @{ Source = 'view.MOV'; Base = 'relax.clip2'; DurationSec = $null }
)

foreach ($entry in $photoMap) {
  $p = Join-Path $SourceDir $entry.Source
  if (-not (Test-Path -LiteralPath $p)) {
    throw "Missing required photo: $p"
  }
}

foreach ($entry in $videoMap) {
  $p = Join-Path $SourceDir $entry.Source
  if (-not (Test-Path -LiteralPath $p)) {
    throw "Missing required video: $p"
  }
}

$legacyAssets = @('coast.webp', 'beach.webp', 'sup.webp', 'picnic.webp')

$tourDir = Join-Path $repoRoot 'public\tours\summer-11'
New-Item -ItemType Directory -Path $tourDir -Force | Out-Null
$tourDir = Resolve-Path $tourDir

Write-Host "Encoding summer-11 from $SourceDir -> $($tourDir.Path)"

foreach ($entry in $photoMap) {
  $in = Join-Path $SourceDir $entry.Source
  $out = Join-Path $tourDir.Path $entry.Output
  Write-Host "photo $($entry.Output) <- $($entry.Source)"
  Convert-RelaxPhoto -InputPath $in -OutputPath $out -MaxLongSide $entry.MaxLongSide
}

foreach ($entry in $videoMap) {
  $in = Join-Path $SourceDir $entry.Source
  $base = $entry.Base
  $gridWebm = Join-Path $tourDir.Path "$base.grid.webm"
  $poster = Join-Path $tourDir.Path "$base.poster.webp"
  $durationArgs = @()
  if ($null -ne $entry.DurationSec) {
    $durationArgs = @('-t', ([string]$entry.DurationSec))
  }
  $label = if ($durationArgs.Count) { " (${($entry.DurationSec)}s)" } else { '' }
  Write-Host "video $base <- $($entry.Source)$label"
  Invoke-Ffmpeg (@('-y', '-i', $in) + $durationArgs + @('-vf', (Get-WebmScaleFilter 'grid')) + (Get-WebmVp9CodecArgs 'grid') + @($gridWebm))
  Invoke-Ffmpeg @('-y', '-i', $gridWebm, '-vframes', '1', '-q:v', '80', $poster)
}

foreach ($legacy in $legacyAssets) {
  $legacyPath = Join-Path $tourDir.Path $legacy
  if (Test-Path -LiteralPath $legacyPath) {
    Remove-Item -LiteralPath $legacyPath -Force
    Write-Host "removed legacy $legacy"
  }
}

Write-Host "Done: cover + preface + 4 grid webp + relax.clip1..3 (grid webm + posters)"
