# summer-10 «Робинзонада в районе Трёхи»
# Photos -> public/tours/summer-10/*.webp
# ezs.clip1..3 — копия готовых relax.clip* из summer-11 (без перекодировки)
# top.MOV -> ezs.top.grid.webm + poster (слот bento-left вместо ses1.webp)
#
# Usage:
#   .\scripts\encode-summer-10-ezh-sestra-media.ps1
#   .\scripts\encode-summer-10-ezh-sestra-media.ps1 -SourceDir 'content\Лето\Еж-Сестра-Спок-Окун'
param(
  [string] $SourceDir = ''
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\Invoke-Ffmpeg.ps1')
. (Join-Path $PSScriptRoot 'media\WebmTourEncoding.ps1')

function Convert-EzhSestraPhoto {
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

function Copy-PreencodedClip {
  param(
    [Parameter(Mandatory)][string] $FromTourDir,
    [Parameter(Mandatory)][string] $ToTourDir,
    [Parameter(Mandatory)][string] $FromBase,
    [Parameter(Mandatory)][string] $ToBase
  )
  foreach ($suffix in @('.grid.webm', '.poster.webp')) {
    $from = Join-Path $FromTourDir ($FromBase + $suffix)
    $to = Join-Path $ToTourDir ($ToBase + $suffix)
    if (-not (Test-Path -LiteralPath $from)) {
      throw "Missing pre-encoded clip: $from (run encode-summer-11 first)"
    }
    Copy-Item -LiteralPath $from -Destination $to -Force
    Write-Host "copy $ToBase$suffix <- summer-11/$FromBase$suffix"
  }
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')

if ([string]::IsNullOrWhiteSpace($SourceDir)) {
  $marker = Get-ChildItem -Path (Join-Path $repoRoot 'content') -Recurse -File -Filter 'ses4.webp' -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $marker) {
    throw 'Could not find ses4.webp under content/. Pass -SourceDir.'
  }
  $SourceDir = $marker.DirectoryName
}

if (-not (Test-Path -LiteralPath $SourceDir)) {
  throw "SourceDir not found: $SourceDir"
}

$photoMap = @(
  @{ Source = 'spok6.webp'; Output = 'cover.webp'; MaxLongSide = 1600 },
  @{ Source = 'ses.webp'; Output = 'preface.webp'; MaxLongSide = 1600 },
  @{ Source = 'ses4.webp'; Output = 'ses4.webp'; MaxLongSide = 1400 },
  @{ Source = 'ses3.webp'; Output = 'ses3.webp'; MaxLongSide = 1400 },
  @{ Source = 'ses2.webp'; Output = 'ses2.webp'; MaxLongSide = 1400 },
  @{ Source = 'ses.webp'; Output = 'ses-wide.webp'; MaxLongSide = 1400 },
  @{ Source = 'spok5.webp'; Output = 'spok5.webp'; MaxLongSide = 1400 },
  @{ Source = 'pavel.webp'; Output = 'pavel.webp'; MaxLongSide = 1400 },
  @{ Source = 'spok4.webp'; Output = 'spok4.webp'; MaxLongSide = 1400 },
  @{ Source = 'spok3.webp'; Output = 'spok3.webp'; MaxLongSide = 1400 },
  @{ Source = 'tent.jpg'; Output = 'tent.webp'; MaxLongSide = 1400 },
  @{ Source = 'spok2.webp'; Output = 'spok2.webp'; MaxLongSide = 1400 },
  @{ Source = 'Yo-uj.webp'; Output = 'bay-wide.webp'; MaxLongSide = 1400 },
  @{ Source = 'Yoj.webp'; Output = 'yoj.webp'; MaxLongSide = 1400 },
  @{ Source = 'spok6.webp'; Output = 'spok6.webp'; MaxLongSide = 1400 },
  @{ Source = 'spok7.webp'; Output = 'spok7.webp'; MaxLongSide = 1400 },
  @{ Source = 'Yoj2.webp'; Output = 'beach-walk.webp'; MaxLongSide = 1400 }
)

foreach ($entry in $photoMap) {
  $p = Join-Path $SourceDir $entry.Source
  if (-not (Test-Path -LiteralPath $p)) {
    throw "Missing required photo: $p"
  }
}

$topSource = Join-Path $SourceDir 'top.MOV'
if (-not (Test-Path -LiteralPath $topSource)) {
  throw "Missing required video: $topSource"
}

$legacyAssets = @(
  'sestra.webp', 'ezhovaya.webp', 'coast.webp', 'bay-day2.webp', 'sup.webp',
  'ezs.night.grid.webm', 'ezs.night.poster.webp', 'ses1.webp'
)

$tourDir = Join-Path $repoRoot 'public\tours\summer-10'
$summer11Dir = Join-Path $repoRoot 'public\tours\summer-11'
New-Item -ItemType Directory -Path $tourDir -Force | Out-Null
$tourDir = Resolve-Path $tourDir
$summer11Dir = Resolve-Path $summer11Dir

Write-Host "Encoding summer-10 from $SourceDir -> $($tourDir.Path)"

foreach ($entry in $photoMap) {
  $in = Join-Path $SourceDir $entry.Source
  $out = Join-Path $tourDir.Path $entry.Output
  Write-Host "photo $($entry.Output) <- $($entry.Source)"
  Convert-EzhSestraPhoto -InputPath $in -OutputPath $out -MaxLongSide $entry.MaxLongSide
}

Copy-PreencodedClip -FromTourDir $summer11Dir.Path -ToTourDir $tourDir.Path `
  -FromBase 'relax.clip1' -ToBase 'ezs.clip1'
Copy-PreencodedClip -FromTourDir $summer11Dir.Path -ToTourDir $tourDir.Path `
  -FromBase 'relax.clip2' -ToBase 'ezs.clip2'
Copy-PreencodedClip -FromTourDir $summer11Dir.Path -ToTourDir $tourDir.Path `
  -FromBase 'relax.clip3' -ToBase 'ezs.clip3'

$topGrid = Join-Path $tourDir.Path 'ezs.top.grid.webm'
$topPoster = Join-Path $tourDir.Path 'ezs.top.poster.webp'
Write-Host 'video ezs.top <- top.MOV'
Invoke-Ffmpeg (@('-y', '-i', $topSource, '-vf', (Get-WebmScaleFilter 'grid')) + (Get-WebmVp9CodecArgs 'grid') + @($topGrid))
Invoke-Ffmpeg @('-y', '-i', $topGrid, '-vframes', '1', '-q:v', '80', $topPoster)

foreach ($legacy in $legacyAssets) {
  $legacyPath = Join-Path $tourDir.Path $legacy
  if (Test-Path -LiteralPath $legacyPath) {
    Remove-Item -LiteralPath $legacyPath -Force
    Write-Host "removed legacy $legacy"
  }
}

Write-Host "Done: cover + preface + 16 grid webp + ezs.top + ezs.clip1..3 (copied)"
