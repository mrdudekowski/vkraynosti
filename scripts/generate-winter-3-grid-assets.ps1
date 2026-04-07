# Требуется ffmpeg в PATH. Создаёт `*.grid.webp`, `*.grid.mp4`, `*.poster.webp` в `public/tours/winter-3/`.
$ErrorActionPreference = "Stop"
$dir = Join-Path $PSScriptRoot "..\public\tours\winter-3" | Resolve-Path
Set-Location $dir
. (Join-Path $PSScriptRoot "media\Invoke-Ffmpeg.ps1")

# gr.board / gr.elya / gr.bbq — в сетке `*.grid.mp4` из `generate-winter-3-banner-stub-videos.ps1`, не из webp.
$images = @(
  "gr.falaza.webp", "gr.griba.webp", "gr.lift.webp", "gr.board2.webp",
  "gr.instr.webp"
)

foreach ($f in $images) {
  if (-not (Test-Path $f)) { Write-Warning "Skip missing: $f"; continue }
  $base = [System.IO.Path]::GetFileNameWithoutExtension($f)
  $out = "${base}.grid.webp"
  Invoke-Ffmpeg @('-y', '-i', $f, '-vf', "scale='min(900,iw)':-1", '-q:v', '82', $out)
}

$videos = @(
  @{ In = "gr.clip1.mov"; Out = "gr.clip1.grid.mp4" },
  @{ In = "gr.clip2.mov"; Out = "gr.clip2.grid.mp4" },
  @{ In = "gr.clip3.mov"; Out = "gr.clip3.grid.mp4" },
  @{ In = "gr.clip4.mov"; Out = "gr.clip4.grid.mp4" },
  @{ In = "gr.clip5.mp4"; Out = "gr.clip5.grid.mp4" }
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

$posters = @("gr.clip1", "gr.clip2", "gr.clip3", "gr.clip4", "gr.clip5")
foreach ($p in $posters) {
  $mp4 = "${p}.grid.mp4"
  if (-not (Test-Path $mp4)) { continue }
  $webp = "${p}.poster.webp"
  Invoke-Ffmpeg @('-y', '-i', $mp4, '-vframes', '1', '-q:v', '80', $webp)
}

Write-Host "Done winter-3 grid assets in $dir"
