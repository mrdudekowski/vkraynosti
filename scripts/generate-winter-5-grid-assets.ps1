# Требуется ffmpeg в PATH. Создаёт `*.grid.webp`, `*.grid.mp4`, `*.poster.webp` в `public/tours/winter-5/`.
$ErrorActionPreference = "Stop"
$dir = Join-Path $PSScriptRoot "..\public\tours\winter-5" | Resolve-Path
Set-Location $dir
. (Join-Path $PSScriptRoot "media\Invoke-Ffmpeg.ps1")

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
  @{ In = "ars.clip1.mov"; Out = "ars.clip1.grid.mp4" },
  @{ In = "ars.clip2.mov"; Out = "ars.clip2.grid.mp4" }
)

foreach ($v in $videos) {
  if (-not (Test-Path $v.In)) { Write-Warning "Skip missing: $($v.In)"; continue }
  Invoke-Ffmpeg @(
    '-y', '-i', $v.In,
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '28',
    '-vf', "scale='min(854,iw)':-2",
    '-an', '-movflags', '+faststart',
    $v.Out
  )
}

foreach ($p in @("ars.clip1", "ars.clip2")) {
  $mp4 = "${p}.grid.mp4"
  if (-not (Test-Path $mp4)) { continue }
  $webp = "${p}.poster.webp"
  Invoke-Ffmpeg @('-y', '-i', $mp4, '-vframes', '1', '-q:v', '80', $webp)
}

Write-Host "Done winter-5 grid assets in $dir"
