# summer-8 Crabbe peninsula: webp -> public/tours/summer-8/
# Sources: content/HERO/.../krabbe1d.png, content/.../Crabbe/*.webp
#
# Usage:
#   .\scripts\encode-summer-8-crabbe-media.ps1
#   .\scripts\encode-summer-8-crabbe-media.ps1 -WebpDir D:\path\to\source
param(
  [string] $WebpDir = '',
  [string] $CoverPath = ''
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\Invoke-Ffmpeg.ps1')

function Convert-CrabbePhoto {
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

if ([string]::IsNullOrWhiteSpace($WebpDir)) {
  $marker = Get-ChildItem -Path (Join-Path $repoRoot 'content') -Recurse -File -Filter 'wide2.webp' -ErrorAction SilentlyContinue |
    Where-Object { Test-Path (Join-Path $_.DirectoryName 'left1.webp') } |
    Select-Object -First 1
  if (-not $marker) {
    $marker = Get-ChildItem -Path (Join-Path $repoRoot 'content') -Recurse -File -Filter 'left1.webp' -ErrorAction SilentlyContinue |
      Select-Object -First 1
  }
  if (-not $marker) {
    throw 'Could not find Crabbe webp folder under content/. Pass -WebpDir.'
  }
  $WebpDir = $marker.DirectoryName
}

if ([string]::IsNullOrWhiteSpace($CoverPath)) {
  $coverFile = Get-ChildItem -Path (Join-Path $repoRoot 'content\HERO') -Recurse -File -Filter 'krabbe1d.png' -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $coverFile) {
    throw 'Could not find krabbe1d.png under content/HERO/. Pass -CoverPath.'
  }
  $CoverPath = $coverFile.FullName
}

if (-not (Test-Path -LiteralPath $WebpDir)) {
  throw "WebpDir not found: $WebpDir"
}
if (-not (Test-Path -LiteralPath $CoverPath)) {
  throw "CoverPath not found: $CoverPath"
}

$photoMap = @(
  @{ SourcePath = $CoverPath; Output = 'cover.webp'; MaxLongSide = 1600 },
  @{ Source = 'wide.webp'; Output = 'preface.webp'; MaxLongSide = 1600 },
  @{ Source = 'wide2.webp'; Output = 'wide2.webp'; MaxLongSide = 1400 },
  @{ Source = 'center2.webp'; Output = 'center2.webp'; MaxLongSide = 1400 },
  @{ Source = 'center1.webp'; Output = 'center1.webp'; MaxLongSide = 1400 },
  @{ Source = 'left2.webp'; Output = 'left2.webp'; MaxLongSide = 1400 },
  @{ Source = 'right2.webp'; Output = 'right2.webp'; MaxLongSide = 1400 },
  @{ Source = '1.webp'; Output = '1.webp'; MaxLongSide = 1400 },
  @{ Source = 'left1.webp'; Output = 'left1.webp'; MaxLongSide = 1400 }
)

foreach ($entry in $photoMap) {
  $p = if ($entry.SourcePath) { $entry.SourcePath } else { Join-Path $WebpDir $entry.Source }
  if (-not (Test-Path -LiteralPath $p)) {
    throw "Missing required photo: $p"
  }
}

$legacyAssets = @(
  'view.webp', 'coast.webp', 'rocks.webp', 'ridge.webp',
  'forest.webp', 'picnic.webp', 'trail.webp'
)

$tourDir = Join-Path $repoRoot 'public\tours\summer-8'
New-Item -ItemType Directory -Path $tourDir -Force | Out-Null
$tourDir = Resolve-Path $tourDir

Write-Host "Encoding summer-8 Crabbe from $WebpDir -> $($tourDir.Path)"

foreach ($entry in $photoMap) {
  $in = if ($entry.SourcePath) { $entry.SourcePath } else { Join-Path $WebpDir $entry.Source }
  $out = Join-Path $tourDir.Path $entry.Output
  $label = if ($entry.Source) { $entry.Source } else { 'krabbe1d.png' }
  Write-Host "photo $($entry.Output) <- $label"
  Convert-CrabbePhoto -InputPath $in -OutputPath $out -MaxLongSide $entry.MaxLongSide
}

foreach ($legacy in $legacyAssets) {
  $legacyPath = Join-Path $tourDir.Path $legacy
  if (Test-Path -LiteralPath $legacyPath) {
    Remove-Item -LiteralPath $legacyPath -Force
    Write-Host "removed legacy $legacy"
  }
}

Write-Host "Done: $($tourDir.Path) cover + preface + 7 bento grid webp"
