# `Invoke-Ffmpeg`: PATH или bundled на Windows.
# Создаёт `*.grid.webm`, `*.poster.webp` в `public/tours/winter-5/`.
$ErrorActionPreference = "Stop"
$dir = Join-Path $PSScriptRoot "..\public\tours\winter-5" | Resolve-Path
Set-Location $dir
. (Join-Path $PSScriptRoot "media\Invoke-Ffmpeg.ps1")
. (Join-Path $PSScriptRoot "media\WebmTourEncoding.ps1")

$videos = @(
  @{ In = "ars.clip1.mov"; Base = "ars.clip1" },
  @{ In = "ars.clip2.mov"; Base = "ars.clip2" }
)

foreach ($v in $videos) {
  if (-not (Test-Path $v.In)) { Write-Warning "Skip missing: $($v.In)"; continue }
  $grid = "$($v.Base).grid.webm"
  Invoke-Ffmpeg (@('-y', '-i', $v.In, '-vf', (Get-WebmScaleFilter 'grid')) + (Get-WebmVp9CodecArgs 'grid') + @($grid))
}

foreach ($p in @("ars.clip1", "ars.clip2")) {
  $webm = "${p}.grid.webm"
  if (-not (Test-Path $webm)) { continue }
  $webp = "${p}.poster.webp"
  Invoke-Ffmpeg @('-y', '-i', $webm, '-vframes', '1', '-q:v', '80', $webp)
}

Write-Host "Done winter-5 video assets in $dir"
