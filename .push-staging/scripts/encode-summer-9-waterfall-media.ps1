# summer-9 waterfall tour: webp -> public/tours/summer-9/
param(
  [string] $WebpDir = ''
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\Invoke-Ffmpeg.ps1')

function Convert-WaterfallPhoto {
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
  $marker = Get-ChildItem -Path (Join-Path $repoRoot 'content') -Recurse -File -Filter 'w-1.webp' -ErrorAction SilentlyContinue |
    Where-Object { Test-Path (Join-Path $_.DirectoryName 'd-1.webp') } |
    Select-Object -First 1
  if (-not $marker) { throw 'Could not find waterfall webp folder. Pass -WebpDir.' }
  $WebpDir = $marker.DirectoryName
}

$gridFiles = @('w-1.webp', 'w-2.webp', 'w-3.webp', 'd-2.webp', 'd-1.webp', 'd-3.webp', 'd-4.webp')
foreach ($name in $gridFiles) {
  $p = Join-Path $WebpDir $name
  if (-not (Test-Path -LiteralPath $p)) { throw "Missing: $p" }
}

$tourDir = Join-Path $repoRoot 'public\tours\summer-9'
New-Item -ItemType Directory -Path $tourDir -Force | Out-Null
$tourDir = Resolve-Path $tourDir

Write-Host "Encoding summer-9 from $WebpDir -> $($tourDir.Path)"

foreach ($name in $gridFiles) {
  $in = Join-Path $WebpDir $name
  $out = Join-Path $tourDir.Path $name
  Write-Host "photo $name"
  Convert-WaterfallPhoto -InputPath $in -OutputPath $out -MaxLongSide 1400
}

# Preface for block About (w-2, also in bento grid)
$prefaceIn = Join-Path $WebpDir 'w-2.webp'
$prefaceOut = Join-Path $tourDir.Path 'preface.webp'
Write-Host 'photo preface.webp <- w-2.webp'
Convert-WaterfallPhoto -InputPath $prefaceIn -OutputPath $prefaceOut -MaxLongSide 1600

$legacy = @('waterfall.webp', 'picnic.webp', 'forest.webp', 'winery.webp', 'trail.webp', 'view.webp')
foreach ($legacy in $legacy) {
  $legacyPath = Join-Path $tourDir.Path $legacy
  if (Test-Path -LiteralPath $legacyPath) {
    Remove-Item -LiteralPath $legacyPath -Force
    Write-Host "removed legacy $legacy"
  }
}

Write-Host "Done: cover (keep) + preface + 7 grid webp"
