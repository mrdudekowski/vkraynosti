# Требуется ffmpeg в PATH. Создаёт `*.grid.webp` рядом с полноразмерными `*.webp` в `public/tours/spring-1|2|3/`.
# Полноразмерные файлы вы кладёте сами (или копируете из исходников), затем запускаете этот скрипт.
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "media\Invoke-Ffmpeg.ps1")

$springDirs = @(
  @{
    Relative = "spring-1"
    Images = @(
      "ld.hero.webp", "ld.preface.webp", "ld.approach.webp", "ld.ridge.webp",
      "ld.summit.webp", "ld.descent.webp"
    )
  },
  @{
    Relative = "spring-2"
    Images = @(
      "olv.hero.webp", "olv.preface.webp", "olv.lake1.webp",
      "olv.ridge.webp", "olv.summit.webp"
    )
  },
  @{
    Relative = "spring-3"
    Images = @(
      "pd.hero.webp", "pd.preface.webp", "pd.group.webp", "pd.taiga.webp",
      "pd.ridge.webp", "pd.summit.webp", "pd.sea.webp"
    )
  }
)

foreach ($block in $springDirs) {
  $dir = Join-Path $PSScriptRoot "..\public\tours\$($block.Relative)" | Resolve-Path
  Set-Location $dir
  foreach ($f in $block.Images) {
    if (-not (Test-Path $f)) { Write-Warning "Skip missing: $($block.Relative)/$f"; continue }
    $base = [System.IO.Path]::GetFileNameWithoutExtension($f)
    $out = "${base}.grid.webp"
    Invoke-Ffmpeg @('-y', '-i', $f, '-vf', "scale='min(900,iw)':-1", '-q:v', '82', $out)
  }
}

Write-Host "Done spring-1/2/3 grid assets."
