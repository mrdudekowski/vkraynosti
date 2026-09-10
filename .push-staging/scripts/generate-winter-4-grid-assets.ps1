# `Invoke-Ffmpeg`: PATH или bundled на Windows.
# Создаёт `*.grid.webm`, `*.poster.webp` в `public/tours/winter-4/`.
$ErrorActionPreference = "Stop"
$dir = Join-Path $PSScriptRoot "..\public\tours\winter-4" | Resolve-Path
Set-Location $dir
. (Join-Path $PSScriptRoot "media\Invoke-Ffmpeg.ps1")
. (Join-Path $PSScriptRoot "media\WebmTourEncoding.ps1")

$videos = @(
  @{ In = "hs.clip1.mp4"; Base = "hs.clip1" },
  @{ In = "hs.clip2.mp4"; Base = "hs.clip2" }
)

foreach ($v in $videos) {
  if (-not (Test-Path $v.In)) { Write-Warning "Skip missing: $($v.In)"; continue }
  $grid = "$($v.Base).grid.webm"
  Invoke-Ffmpeg (@('-y', '-i', $v.In, '-vf', (Get-WebmScaleFilter 'grid')) + (Get-WebmVp9CodecArgs 'grid') + @($grid))
}

foreach ($p in @("hs.clip1", "hs.clip2")) {
  $webm = "${p}.grid.webm"
  if (-not (Test-Path $webm)) { continue }
  $webp = "${p}.poster.webp"
  Invoke-Ffmpeg @('-y', '-i', $webm, '-vframes', '1', '-q:v', '80', $webp)
}

Write-Host "Done winter-4 video assets in $dir"
