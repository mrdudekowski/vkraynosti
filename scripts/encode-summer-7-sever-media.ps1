# «Северное Приморье» (summer-7): webp + MOV → public/tours/summer-7/.
# Исходники: content/Лето/Север/webp/, content/Лето/Север/vid/.
#
# Usage:
#   .\scripts\encode-summer-7-sever-media.ps1
#   .\scripts\encode-summer-7-sever-media.ps1 -WebpDir "..." -VidDir "..."
param(
  [string] $WebpDir = '',
  [string] $VidDir = '',
  [switch] $SkipPhotos,
  # Индексы клипов 1..4 (sev.clipN). Пусто — все четыре MOV.
  [int[]] $OnlyClips = @()
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\Invoke-Ffmpeg.ps1')
. (Join-Path $PSScriptRoot 'media\WebmTourEncoding.ps1')

function Convert-SeverPhoto {
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

# clip1 (dub): первые 6 с — нативный loop в `GalleryGridVideoLoopCrossfade` без seek в React.
$clip1GridDurationSec = 6

$orderedMovs = @(
  'dub (2).MOV',
  'bazil.MOV',
  '4skal.MOV',
  'rud.MOV'
)

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')

if ([string]::IsNullOrWhiteSpace($WebpDir)) {
  $webpMarker = Get-ChildItem -Path (Join-Path $repoRoot 'content') -Recurse -File -Filter '1dub.webp' -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $webpMarker) {
    throw 'Could not find 1dub.webp under content/. Pass -WebpDir.'
  }
  $WebpDir = $webpMarker.DirectoryName
}

if ([string]::IsNullOrWhiteSpace($VidDir)) {
  $vidMarker = Get-ChildItem -Path (Join-Path $repoRoot 'content') -Recurse -File -Filter '4skal.MOV' -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $vidMarker) {
    throw 'Could not find 4skal.MOV under content/. Pass -VidDir.'
  }
  $VidDir = $vidMarker.DirectoryName
}

if (-not $SkipPhotos -and -not (Test-Path -LiteralPath $WebpDir)) {
  throw "WebpDir not found: $WebpDir"
}
if (-not (Test-Path -LiteralPath $VidDir)) {
  throw "VidDir not found: $VidDir"
}

foreach ($name in $orderedMovs) {
  $p = Join-Path $VidDir $name
  if (-not (Test-Path -LiteralPath $p)) {
    throw "Missing required file: $p"
  }
}

$photoMap = @(
  @{ Source = '1dub.webp'; Output = 'dub.webp'; MaxLongSide = 1600 },
  @{ Source = '5.1.webp'; Output = 'preface.webp'; MaxLongSide = 1600 },
  @{ Source = '2bazi.webp'; Output = 'bazi.webp'; MaxLongSide = 1400 },
  @{ Source = '4.3.webp'; Output = 'skal-point3.webp'; MaxLongSide = 1400 },
  @{ Source = '3.4skal.webp'; Output = 'skal-34.webp'; MaxLongSide = 1400 },
  @{ Source = '4.4skal.webp'; Output = 'skal-44.webp'; MaxLongSide = 1400 },
  @{ Source = '4.5skal.webp'; Output = 'skal-45.webp'; MaxLongSide = 1400 },
  @{ Source = '4.6.webp'; Output = 'skal-46.webp'; MaxLongSide = 1400 },
  @{ Source = '4.webp'; Output = 'fin.webp'; MaxLongSide = 1400 }
)

foreach ($entry in $photoMap) {
  $p = Join-Path $WebpDir $entry.Source
  if (-not (Test-Path -LiteralPath $p)) {
    throw "Missing required photo: $p"
  }
}

$tourDir = Join-Path $repoRoot 'public\tours\summer-7'
New-Item -ItemType Directory -Path $tourDir -Force | Out-Null
$tourDir = Resolve-Path $tourDir

Write-Host "Encoding summer-7 from webp=$WebpDir vid=$VidDir -> $($tourDir.Path)"

if (-not $SkipPhotos) {
  foreach ($entry in $photoMap) {
    $in = Join-Path $WebpDir $entry.Source
    $out = Join-Path $tourDir.Path $entry.Output
    Write-Host "photo $($entry.Output) <- $($entry.Source)"
    Convert-SeverPhoto -InputPath $in -OutputPath $out -MaxLongSide $entry.MaxLongSide
  }
}

$clipCount = $orderedMovs.Count
$i = 0
foreach ($name in $orderedMovs) {
  $i++
  if ($OnlyClips.Count -gt 0 -and ($OnlyClips -notcontains $i)) {
    continue
  }
  $in = Join-Path $VidDir $name
  $base = "sev.clip$i"
  $gridWebm = Join-Path $tourDir.Path "$base.grid.webm"
  $poster = Join-Path $tourDir.Path "$base.poster.webp"
  $durationArgs = @()
  if ($i -eq 1) {
    $durationArgs = @('-t', ([string]$clip1GridDurationSec))
  }
  Write-Host "[$i/$clipCount] $base <- $name$(if ($durationArgs.Count) { " (${clip1GridDurationSec}s)" } else { '' })"
  Invoke-Ffmpeg (@('-y', '-i', $in) + $durationArgs + @('-vf', (Get-WebmScaleFilter 'grid')) + (Get-WebmVp9CodecArgs 'grid') + @($gridWebm))
  Invoke-Ffmpeg @('-y', '-i', $gridWebm, '-vframes', '1', '-q:v', '80', $poster)
}

Write-Host "Done: $($tourDir.Path) dub/preface + 7 webp + sev.clip1..$clipCount"
