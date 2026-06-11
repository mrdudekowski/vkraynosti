# Encodes spring-12 Tobizina media to public/tours/spring-12.
# Photos -> webp; MOV -> .grid.webm + .poster.webp.
# Cover: content/HERO/Весна/tobizina.webp (unchanged hero/cover source).
#
# Usage:
#   .\scripts\encode-spring-12-tobizina-media.ps1
#   .\scripts\encode-spring-12-tobizina-media.ps1 -SourceDir D:\path\to\content\Весна\Тобизина
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

function Convert-TobizinaPhoto {
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
  $marker = Get-ChildItem -Path (Join-Path $repoRoot 'content') -Recurse -File -Filter '2023-04-08 17-23-05.MOV' -ErrorAction SilentlyContinue |
    Where-Object { Test-Path (Join-Path $_.DirectoryName '1.webp') } |
    Select-Object -First 1
  if (-not $marker) {
    throw 'Could not find Tobizina source folder under content/. Pass -SourceDir.'
  }
  $SourceDir = $marker.DirectoryName
}

if (-not (Test-Path -LiteralPath $SourceDir)) {
  throw ('SourceDir not found: {0}' -f $SourceDir)
}

$coverSource = Get-ChildItem -Path (Join-Path $repoRoot 'content\HERO') -Recurse -File -Filter 'tobizina.webp' -ErrorAction SilentlyContinue |
  Select-Object -First 1
if (-not $coverSource) {
  throw 'Could not find tobizina.webp under content/HERO/.'
}

$photoMap = @(
  @{ Source = '1.webp'; Output = 'preface.webp'; MaxLongSide = 1600 },
  @{ Source = '1.webp'; Output = '1.webp'; MaxLongSide = 1400 },
  @{ Source = '2.webp'; Output = '2.webp'; MaxLongSide = 1400 },
  @{ Source = '3.webp'; Output = '3.webp'; MaxLongSide = 1400 },
  @{ Source = '4.webp'; Output = '4.webp'; MaxLongSide = 1400 }
)

$orderedMovNames = @(
  '2023-04-08 17-23-05.MOV',
  '2023-04-08 17-23-12.MOV',
  '2023-04-08 17-29-54.MOV',
  '2024-09-07 10-53-23.MOV',
  '2024-09-08 12-29-55.MOV'
)

foreach ($entry in $photoMap) {
  $p = Join-Path $SourceDir $entry.Source
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

$tourDir = Join-Path $repoRoot 'public\tours\spring-12'
New-Item -ItemType Directory -Path $tourDir -Force | Out-Null
$tourDir = Resolve-Path $tourDir
$script:FfmpegPath = Resolve-FfmpegPath

Write-Host ('Encoding Tobizina media from {0} to {1}' -f $SourceDir, $tourDir.Path)

$coverOut = Join-Path $tourDir.Path 'cover.webp'
Write-Host ('photo cover.webp <- {0}' -f $coverSource.FullName)
Copy-Item -LiteralPath $coverSource.FullName -Destination $coverOut -Force

foreach ($entry in $photoMap) {
  $in = Join-Path $SourceDir $entry.Source
  $out = Join-Path $tourDir.Path $entry.Output
  Write-Host ('photo {0} from {1}' -f $entry.Output, $entry.Source)
  Convert-TobizinaPhoto -InputPath $in -OutputPath $out -MaxLongSide $entry.MaxLongSide
}

$i = 0
foreach ($name in $orderedMovNames) {
  $i++
  $in = Join-Path $SourceDir $name
  $base = 'tob.clip{0}' -f $i
  $gridWebm = Join-Path $tourDir.Path ('{0}.grid.webm' -f $base)
  $poster = Join-Path $tourDir.Path ('{0}.poster.webp' -f $base)
  Write-Host ('video [{0}/{1}] {2} from {3}' -f $i, $orderedMovNames.Count, $base, $name)
  Invoke-LocalFfmpeg (@('-y', '-i', $in, '-vf', (Get-WebmScaleFilter 'grid')) + (Get-WebmVp9CodecArgs 'grid') + @($gridWebm))
  Invoke-LocalFfmpeg @('-y', '-ss', '1', '-i', $gridWebm, '-vframes', '1', '-q:v', '80', $poster)
}

Write-Host ('Done: {0}' -f $tourDir.Path)
