# Перекодировать «Сестра» ss.clip3 и ss.clip5 из исходных MOV (как `encode-sestra-tour-movs.ps1`).
# - Full: полная длина (восстановить «оригинал» в public после экспериментов с обрезкой в плеере).
# - Trim: обрезка вступления на диске (clip3 с 4 с, clip5 с 4.2 с), те же имена файлов — нативный loop без seek в React.
#
# Usage:
#   .\scripts\trim-sestra-clip3-clip5-from-mov.ps1 -Mode Full
#   .\scripts\trim-sestra-clip3-clip5-from-mov.ps1 -Mode Trim
#   .\scripts\trim-sestra-clip3-clip5-from-mov.ps1 -Mode Trim -SourceDir "D:\raw\sestra"
param(
  [Parameter(Mandatory)]
  [ValidateSet('Full', 'Trim')]
  [string]$Mode,
  [string]$SourceDir = ''
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\Invoke-Ffmpeg.ps1')
. (Join-Path $PSScriptRoot 'media\WebmTourEncoding.ps1')

$orderedMovNames = @(
  '2024-09-28 11-16-53.MOV',
  '2024-09-28 11-17-28.MOV',
  '2024-09-28 11-18-05.MOV',
  '2024-09-28 11-34-59.MOV',
  '2024-09-28 13-58-57.MOV',
  '2024-09-28 14-50-45.MOV',
  '2024-09-28 15-29-42.MOV',
  '2024-09-28 20-41-21.MOV'
)

if ([string]::IsNullOrWhiteSpace($SourceDir)) {
  $markerName = '2024-09-28 14-50-45.MOV'
  $marker = Get-ChildItem -Path (Join-Path $env:USERPROFILE 'Pictures\Spring') -Recurse -File -Filter $markerName -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $marker) {
    throw "Could not find $markerName under Pictures\Spring. Pass -SourceDir to the Sestra folder."
  }
  $SourceDir = $marker.DirectoryName
}

if (-not (Test-Path -LiteralPath $SourceDir)) {
  throw "SourceDir not found: $SourceDir"
}

$tourDir = Join-Path $PSScriptRoot '..\public\tours\spring-4' | Resolve-Path

function Encode-OneClip {
  param(
    [int]$ClipNumber,
    [string]$MovPath,
    [Nullable[double]]$SeekSeconds
  )
  $base = "ss.clip$ClipNumber"
  $viewer = Join-Path $tourDir.Path "$base.webm"
  $grid = Join-Path $tourDir.Path "$base.grid.webm"
  $poster = Join-Path $tourDir.Path "$base.poster.webp"

  $seekArgs = @()
  if ($null -ne $SeekSeconds) {
    $seekArgs = @('-ss', ([string]$SeekSeconds).Replace(',', '.'))
  }

  Write-Host "[$base] <- $(Split-Path $MovPath -Leaf) Mode=$Mode seek=$SeekSeconds"
  Invoke-Ffmpeg (@('-y') + $seekArgs + @('-i', $MovPath, '-vf', (Get-WebmScaleFilter 'full')) + (Get-WebmVp9CodecArgs 'full') + @($viewer))
  Invoke-Ffmpeg (@('-y') + $seekArgs + @('-i', $MovPath, '-vf', (Get-WebmScaleFilter 'grid')) + (Get-WebmVp9CodecArgs 'grid') + @($grid))
  Invoke-Ffmpeg @('-y', '-i', $grid, '-vframes', '1', '-q:v', '80', $poster)
}

# clip3 = MOV [2], clip5 = MOV [4]
$p3 = Join-Path $SourceDir $orderedMovNames[2]
$p5 = Join-Path $SourceDir $orderedMovNames[4]
foreach ($p in @($p3, $p5)) {
  if (-not (Test-Path -LiteralPath $p)) { throw "Missing: $p" }
}

if ($Mode -eq 'Full') {
  Encode-OneClip -ClipNumber 3 -MovPath $p3 -SeekSeconds $null
  Encode-OneClip -ClipNumber 5 -MovPath $p5 -SeekSeconds $null
}
else {
  Encode-OneClip -ClipNumber 3 -MovPath $p3 -SeekSeconds 4
  Encode-OneClip -ClipNumber 5 -MovPath $p5 -SeekSeconds 4.2
}

Write-Host "Done ($Mode): $($tourDir.Path) — ss.clip3, ss.clip5 (viewer + grid + poster)"
