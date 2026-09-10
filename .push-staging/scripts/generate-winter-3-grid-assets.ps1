# `Invoke-Ffmpeg`: ffmpeg из PATH или bundled (`node_modules/@ffmpeg-installer/...` на Windows).
# Создаёт `*.grid.webm` и `*.poster.webp` в `public/tours/winter-3/` (VP9 preset grid).
$ErrorActionPreference = "Stop"
$dir = Join-Path $PSScriptRoot "..\public\tours\winter-3" | Resolve-Path
Set-Location $dir
. (Join-Path $PSScriptRoot "media\Invoke-Ffmpeg.ps1")
. (Join-Path $PSScriptRoot "media\WebmTourEncoding.ps1")

$videos = @(
  @{ In = "gr.clip1.mov"; Base = "gr.clip1" },
  @{ In = "gr.clip2.mov"; Base = "gr.clip2" },
  @{ In = "gr.clip3.mov"; Base = "gr.clip3" },
  @{ In = "gr.clip4.mov"; Base = "gr.clip4" },
  @{ In = "gr.clip5.mp4"; Base = "gr.clip5" }
)

foreach ($v in $videos) {
  if (-not (Test-Path $v.In)) { Write-Warning "Skip missing: $($v.In)"; continue }
  $grid = "$($v.Base).grid.webm"
  Invoke-Ffmpeg (@('-y', '-i', $v.In, '-vf', (Get-WebmScaleFilter 'grid')) + (Get-WebmVp9CodecArgs 'grid') + @($grid))
}

$posters = @("gr.clip1", "gr.clip2", "gr.clip3", "gr.clip4", "gr.clip5")
foreach ($p in $posters) {
  $webm = "${p}.grid.webm"
  if (-not (Test-Path $webm)) { continue }
  $webp = "${p}.poster.webp"
  Invoke-Ffmpeg @('-y', '-i', $webm, '-vframes', '1', '-q:v', '80', $webp)
}

Write-Host "Done winter-3 video assets in $dir"
