# Encodes spring-13 Gamova media to public/tours/spring-13.
# Photos -> webp; MOV / MP4 -> .webm, .grid.webm, .poster.webp.
#
# Usage:
#   .\scripts\encode-spring-13-gamova-media.ps1
#   .\scripts\encode-spring-13-gamova-media.ps1 -SourceDir D:\path\to\source
# Только обновить gam.clip5 + gam.clip6 (пути к двум файлам):
#   .\scripts\encode-spring-13-gamova-two-clips.ps1 -Clip5Path '...' -Clip6Path '...'
param(
  [string] $SourceDir = ''
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\WebmTourEncoding.ps1')

function Resolve-FfmpegPath {
  $repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
  $ffmpegStaticPackage = Join-Path $repoRoot 'node_modules\ffmpeg-static\ffmpeg.exe'
  if (Test-Path -LiteralPath $ffmpegStaticPackage) {
    return $ffmpegStaticPackage
  }

  $ffmpegInstallerPackage = Join-Path $repoRoot 'node_modules\@ffmpeg-installer\win32-x64\ffmpeg.exe'
  if (Test-Path -LiteralPath $ffmpegInstallerPackage) {
    return $ffmpegInstallerPackage
  }

  return 'ffmpeg'
}

function Invoke-LocalFfmpeg {
  param([Parameter(Mandatory)][string[]]$Arguments)
  & $script:FfmpegPath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw ('ffmpeg exit {0}: {1} {2}' -f $LASTEXITCODE, $script:FfmpegPath, ($Arguments -join ' '))
  }
}

function Convert-GamovaPhoto {
  param(
    [Parameter(Mandatory)][string] $InputPath,
    [Parameter(Mandatory)][string] $OutputPath,
    [Parameter(Mandatory)][int] $MaxLongSide
  )

  $scaleFilter = 'scale=w=if(gt(ih\,iw)\,-2\,min({0}\,iw)):h=if(gt(ih\,iw)\,min({0}\,ih)\,-2)' -f $MaxLongSide
  Invoke-LocalFfmpeg @(
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
  $markerName = '2022-07-19 11-22-44.MOV'
  $marker = Get-ChildItem -Path (Join-Path $repoRoot 'content') -Recurse -File -Filter $markerName -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $marker) {
    throw ('Could not find {0} under content/. Pass -SourceDir to the Gamova source folder.' -f $markerName)
  }
  $SourceDir = $marker.DirectoryName
}

if (-not (Test-Path -LiteralPath $SourceDir)) {
  throw ('SourceDir not found: {0}' -f $SourceDir)
}

$coverSourceName = 'Gamova.webp'
$coverSource = Get-ChildItem -Path (Join-Path $repoRoot 'content\HERO') -Recurse -File -Filter $coverSourceName -ErrorAction SilentlyContinue |
  Select-Object -First 1
if (-not $coverSource) {
  throw ('Could not find {0} under content/HERO/.' -f $coverSourceName)
}

$photoMap = @(
  @{ SourcePath = $coverSource.FullName; Source = 'Gamova.webp'; Output = 'cover.webp'; MaxLongSide = 1600 },
  @{ Source = 'view.webp'; Output = 'gamov-view.webp'; MaxLongSide = 1400 },
  @{ Source = 'View3.webp'; Output = 'preface.webp'; MaxLongSide = 1600 },
  @{ Source = 'SOSNA.webp'; Output = 'sosna.webp'; MaxLongSide = 1400 },
  @{ Source = 'sosna2.webp'; Output = 'sosna2.webp'; MaxLongSide = 1400 },
  @{ Source = 'dve_sosna.webp'; Output = 'dve-sosna.webp'; MaxLongSide = 1400 },
  @{ Source = 'view6.webp'; Output = 'vityaz-bay.webp'; MaxLongSide = 1400 },
  @{ Source = 'view5.webp'; Output = 'gamov-panorama.webp'; MaxLongSide = 1400 },
  @{ Source = 'view4.webp'; Output = 'telyakovsky-bay.webp'; MaxLongSide = 1400 },
  @{ Source = 'View2.webp'; Output = 'summit-view.webp'; MaxLongSide = 1400 },
  @{ Source = 'Coast.webp'; Output = 'astafiev-bay.webp'; MaxLongSide = 1400 }
)

$orderedMovNames = @(
  '2022-07-19 11-22-44.MOV',
  '2022-07-19 12-54-50.MOV',
  '2022-07-19 13-55-09.MOV',
  '2022-07-19 17-00-52.MOV',
  '2022-07-20 13-29-54.MOV',
  'GX012405.MP4'
)

$orderedMovCount = $orderedMovNames.Count

foreach ($entry in $photoMap) {
  $p = if ($entry.SourcePath) { $entry.SourcePath } else { Join-Path $SourceDir $entry.Source }
  if (-not (Test-Path -LiteralPath $p)) {
    throw ('Missing required photo: {0}' -f $p)
  }
}

foreach ($name in $orderedMovNames) {
  $p = Join-Path $SourceDir $name
  if (-not (Test-Path -LiteralPath $p)) {
    throw ('Missing required video: {0}' -f $p)
  }
}

$tourDir = Join-Path $repoRoot 'public\tours\spring-13'
New-Item -ItemType Directory -Path $tourDir -Force | Out-Null
$tourDir = Resolve-Path $tourDir
$script:FfmpegPath = Resolve-FfmpegPath

Write-Host ('Encoding Gamova media from {0} to {1}' -f $SourceDir, $tourDir.Path)

foreach ($entry in $photoMap) {
  $in = if ($entry.SourcePath) { $entry.SourcePath } else { Join-Path $SourceDir $entry.Source }
  $out = Join-Path $tourDir.Path $entry.Output
  Write-Host ('photo {0} from {1}' -f $entry.Output, $entry.Source)
  Convert-GamovaPhoto -InputPath $in -OutputPath $out -MaxLongSide $entry.MaxLongSide
}

$i = 0
foreach ($name in $orderedMovNames) {
  $i++
  $in = Join-Path $SourceDir $name
  $base = 'gam.clip{0}' -f $i
  $viewer = Join-Path $tourDir.Path ('{0}.webm' -f $base)
  $gridWebm = Join-Path $tourDir.Path ('{0}.grid.webm' -f $base)
  $poster = Join-Path $tourDir.Path ('{0}.poster.webp' -f $base)
  Write-Host ('video [{0}/{1}] {2} from {3}' -f $i, $orderedMovCount, $base, $name)
  Invoke-LocalFfmpeg (@('-y', '-i', $in, '-vf', (Get-WebmScaleFilter 'full')) + (Get-WebmVp9CodecArgs 'full') + @($viewer))
  Invoke-LocalFfmpeg (@('-y', '-i', $in, '-vf', (Get-WebmScaleFilter 'grid')) + (Get-WebmVp9CodecArgs 'grid') + @($gridWebm))
  Invoke-LocalFfmpeg @('-y', '-ss', '1', '-i', $gridWebm, '-vframes', '1', '-q:v', '80', $poster)
}

Write-Host ('Done: {0}' -f $tourDir.Path)
