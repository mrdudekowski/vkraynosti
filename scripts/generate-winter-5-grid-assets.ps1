# `Invoke-Ffmpeg`: PATH или bundled на Windows.
# Создаёт `*.grid.webp`, `*.webm`, `*.grid.webm`, `*.poster.webp` в `public/tours/winter-5/`.
$ErrorActionPreference = "Stop"
$dir = Join-Path $PSScriptRoot "..\public\tours\winter-5" | Resolve-Path
Set-Location $dir
. (Join-Path $PSScriptRoot "media\Invoke-Ffmpeg.ps1")
. (Join-Path $PSScriptRoot "media\WebmTourEncoding.ps1")

$images = @(
  "ars.main.webp", "ars.preface.webp", "ars.lift.webp", "ars.doggie.webp",
  "ars.trans-tail.webp", "ars.team.png"
)

foreach ($f in $images) {
  if (-not (Test-Path $f)) { Write-Warning "Skip missing: $f"; continue }
  $base = [System.IO.Path]::GetFileNameWithoutExtension($f)
  $out = "${base}.grid.webp"
  Invoke-Ffmpeg @('-y', '-i', $f, '-vf', "scale='min(900,iw)':-1", '-q:v', '82', $out)
}

$videos = @(
  @{ In = "ars.clip1.mov"; Base = "ars.clip1" },
  @{ In = "ars.clip2.mov"; Base = "ars.clip2" }
)

foreach ($v in $videos) {
  if (-not (Test-Path $v.In)) { Write-Warning "Skip missing: $($v.In)"; continue }
  $viewer = "$($v.Base).webm"
  $grid = "$($v.Base).grid.webm"
  Invoke-Ffmpeg (@('-y', '-i', $v.In, '-vf', (Get-WebmScaleFilter 'full')) + (Get-WebmVp9CodecArgs 'full') + @($viewer))
  Invoke-Ffmpeg (@('-y', '-i', $v.In, '-vf', (Get-WebmScaleFilter 'grid')) + (Get-WebmVp9CodecArgs 'grid') + @($grid))
}

foreach ($p in @("ars.clip1", "ars.clip2")) {
  $webm = "${p}.grid.webm"
  if (-not (Test-Path $webm)) { continue }
  $webp = "${p}.poster.webp"
  Invoke-Ffmpeg @('-y', '-i', $webm, '-vframes', '1', '-q:v', '80', $webp)
}

Write-Host "Done winter-5 grid assets in $dir"
