# Перекодировка только видео: все `public/**/*.webm` (без .webp / .png / шрифтов).
# Цель — новый файл не больше ~50% исходного размера (VP9, двухпроходный режим по целевому битрейту).
#
# Требования: ffmpeg в PATH или `node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe`.
#
# Примеры:
#   .\scripts\batch-shrink-public-webm.ps1 -DryRun
#   .\scripts\batch-shrink-public-webm.ps1 -MinSizeMb 5
#   .\scripts\batch-shrink-public-webm.ps1

param(
  # Только список файлов, без ffmpeg.
  [switch] $DryRun,
  # Не трогать файлы меньше этого размера (экономия времени).
  [decimal] $MinSizeMb = 0,
  # Успех, если новый файл <= этой доли от исходного (0.52 ≈ «не больше половины» с запасом).
  [decimal] $MaxSizeRatio = 0.52,
  # Стартовая цель битрейта как доля от среднего битрейта по длительности.
  [decimal] $InitialBitrateFactor = 0.45,
  [int] $MaxBitrateTries = 8
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'media\Invoke-Ffmpeg.ps1')
. (Join-Path $PSScriptRoot 'media\WebmTourEncoding.ps1')

function Get-WebmPresetFromPath {
  param([Parameter(Mandatory)][string] $RelativePath)
  $leaf = Split-Path -Leaf $RelativePath
  if ($leaf -match '\.grid\.webm$') { return 'grid' }
  if ($RelativePath -match '(?i)[\\/]banners_') { return 'banner' }
  return 'full'
}

function Get-VideoDurationSeconds {
  param([Parameter(Mandatory)][string] $MediaPath)
  $d = ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $MediaPath 2>$null
  if (-not $d) { return 0 }
  $s = $d.Trim() -replace ',', '.'
  $parsed = 0.0
  if (-not [double]::TryParse($s, [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$parsed)) {
    return 0
  }
  return $parsed
}

function Get-MinVideoBitrate {
  param(
    [Parameter(Mandatory)]
    [ValidateSet('full', 'grid', 'banner')]
    [string] $Preset
  )
  switch ($Preset) {
    'full'   { return 350000 }
    'grid'   { return 120000 }
    'banner' { return 100000 }
  }
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$publicDir = Join-Path $repoRoot 'public'
if (-not (Test-Path -LiteralPath $publicDir)) {
  throw "public/ not found: $publicDir"
}

$minBytes = [int64]([double]$MinSizeMb * 1MB)
$all = Get-ChildItem -Path $publicDir -Recurse -File -Filter '*.webm' | Sort-Object FullName
$targets = if ($minBytes -gt 0) { $all | Where-Object { $_.Length -ge $minBytes } } else { $all }

Write-Host "Found $($targets.Count) .webm under public/ (MinSizeMb=$MinSizeMb). DryRun=$DryRun"

$passLogRoot = Join-Path ([System.IO.Path]::GetTempPath()) "vkraynosti-webm-shrink-$([Guid]::NewGuid().ToString('N'))"
New-Item -ItemType Directory -Path $passLogRoot -Force | Out-Null

try {
  $i = 0
  foreach ($file in $targets) {
    $i++
    $rel = $file.FullName.Substring($repoRoot.Path.Length).TrimStart('\', '/')
    $preset = Get-WebmPresetFromPath -RelativePath $rel
    $vf = Get-WebmScaleFilter $preset
    $orig = $file.Length
    $dur = Get-VideoDurationSeconds $file.FullName
    if ($dur -lt 0.05) {
      Write-Warning "[$i/$($targets.Count)] skip (no duration): $rel"
      continue
    }

    $avgBps = [math]::Max(([double]$orig * 8.0) / $dur, (Get-MinVideoBitrate $preset))
    $targetBps = [math]::Max($avgBps * [double]$InitialBitrateFactor, (Get-MinVideoBitrate $preset))

    $tmpOut = "$($file.FullName).shrink-tmp.webm"
    $passBase = Join-Path $passLogRoot ($file.BaseName + '-' + [Guid]::NewGuid().ToString('N').Substring(0, 8))

    if ($DryRun) {
      Write-Host "[$i/$($targets.Count)] DRY-RUN $([math]::Round($orig/1MB, 2)) MB preset=$preset -> $rel"
      continue
    }

    $ok = $false
    $lastNew = 0L
    for ($t = 0; $t -lt $MaxBitrateTries; $t++) {
      $k = [math]::Max(1, [int]($targetBps / 1000))
      $bvk = "${k}k"
      Remove-Item -LiteralPath "$passBase-0.log" -ErrorAction SilentlyContinue
      Remove-Item -LiteralPath "$passBase-0.log.mbtree" -ErrorAction SilentlyContinue
      if (Test-Path -LiteralPath $tmpOut) { Remove-Item -LiteralPath $tmpOut -Force }

      Invoke-Ffmpeg @(
        '-y', '-i', $file.FullName,
        '-vf', $vf,
        '-c:v', 'libvpx-vp9', '-b:v', $bvk,
        '-row-mt', '1', '-cpu-used', '2', '-deadline', 'good',
        '-passlogfile', $passBase,
        '-pass', '1',
        '-pix_fmt', 'yuv420p', '-an',
        '-f', 'webm', 'NUL'
      )
      Invoke-Ffmpeg @(
        '-y', '-i', $file.FullName,
        '-vf', $vf,
        '-c:v', 'libvpx-vp9', '-b:v', $bvk,
        '-row-mt', '1', '-cpu-used', '2', '-deadline', 'good',
        '-passlogfile', $passBase,
        '-pass', '2',
        '-pix_fmt', 'yuv420p', '-an',
        $tmpOut
      )
      Remove-Item -LiteralPath "$passBase-0.log" -ErrorAction SilentlyContinue
      Remove-Item -LiteralPath "$passBase-0.log.mbtree" -ErrorAction SilentlyContinue

      $lastNew = (Get-Item -LiteralPath $tmpOut).Length
      $maxAllowed = [int64]([double]$orig * [double]$MaxSizeRatio)
      if ($lastNew -le $maxAllowed) {
        $ok = $true
        break
      }
      $targetBps = [math]::Max($targetBps * 0.82, (Get-MinVideoBitrate $preset))
    }

    if (-not $ok) {
      Write-Warning "[$i/$($targets.Count)] could not reach <= $MaxSizeRatio of original after $MaxBitrateTries tries; leaving file unchanged: $rel (last $([math]::Round($lastNew/1MB, 2)) MB vs orig $([math]::Round($orig/1MB, 2)) MB)"
      if (Test-Path -LiteralPath $tmpOut) { Remove-Item -LiteralPath $tmpOut -Force }
      continue
    }

    Move-Item -LiteralPath $tmpOut -Destination $file.FullName -Force
    Write-Host "[$i/$($targets.Count)] OK $([math]::Round($orig/1MB,2)) MB -> $([math]::Round($lastNew/1MB,2)) MB preset=$preset : $rel"
  }
}
finally {
  Remove-Item -LiteralPath $passLogRoot -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host 'Done.'
