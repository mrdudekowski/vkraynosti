# Только gam.clip5 + gam.clip6 для «Полуостров Гамова» (spring-13): viewer + grid + poster.
# Полный тур — `encode-spring-13-gamova-media.ps1` (все MOV/фото). Этот скрипт — если нужно обновить два клипа по путям к файлам.
#
# Пример:
#   .\scripts\encode-spring-13-gamova-two-clips.ps1 `
#     -Clip5Path 'content\Весна\Гамова 1 д\2022-07-20 13-29-54.MOV' `
#     -Clip6Path 'content\Весна\Гамова 1 д\GX012405.MP4'

param(
  [Parameter(Mandatory)][string] $Clip5Path,
  [Parameter(Mandatory)][string] $Clip6Path
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

function Encode-OneGamovaClip {
  param(
    [Parameter(Mandatory)][string] $InputPath,
    [Parameter(Mandatory)][string] $BaseName,
    [Parameter(Mandatory)][string] $TourDir
  )
  $viewer = Join-Path $TourDir ('{0}.webm' -f $BaseName)
  $gridWebm = Join-Path $TourDir ('{0}.grid.webm' -f $BaseName)
  $poster = Join-Path $TourDir ('{0}.poster.webp' -f $BaseName)
  Write-Host ('Encoding {0} from {1}' -f $BaseName, $InputPath)
  Invoke-LocalFfmpeg (@('-y', '-i', $InputPath, '-vf', (Get-WebmScaleFilter 'full')) + (Get-WebmVp9CodecArgs 'full') + @($viewer))
  Invoke-LocalFfmpeg (@('-y', '-i', $InputPath, '-vf', (Get-WebmScaleFilter 'grid')) + (Get-WebmVp9CodecArgs 'grid') + @($gridWebm))
  Invoke-LocalFfmpeg @('-y', '-ss', '1', '-i', $gridWebm, '-vframes', '1', '-q:v', '80', $poster)
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$clip5 = if ([System.IO.Path]::IsPathRooted($Clip5Path)) { $Clip5Path } else { (Join-Path $repoRoot.Path $Clip5Path) }
$clip6 = if ([System.IO.Path]::IsPathRooted($Clip6Path)) { $Clip6Path } else { (Join-Path $repoRoot.Path $Clip6Path) }
if (-not (Test-Path -LiteralPath $clip5)) { throw "Clip5 source not found: $clip5" }
if (-not (Test-Path -LiteralPath $clip6)) { throw "Clip6 source not found: $clip6" }

$tourDir = Join-Path $repoRoot.Path 'public\tours\spring-13'
New-Item -ItemType Directory -Path $tourDir -Force | Out-Null
$tourDir = (Resolve-Path $tourDir).Path
$script:FfmpegPath = Resolve-FfmpegPath

Write-Host ('Output directory: {0}' -f $tourDir)
Encode-OneGamovaClip -InputPath $clip5 -BaseName 'gam.clip5' -TourDir $tourDir
Encode-OneGamovaClip -InputPath $clip6 -BaseName 'gam.clip6' -TourDir $tourDir
Write-Host 'Done gam.clip5 + gam.clip6.'
