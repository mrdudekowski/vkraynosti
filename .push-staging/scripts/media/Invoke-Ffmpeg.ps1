# Общий вызов ffmpeg через Start-Process: при $ErrorActionPreference Stop PowerShell иначе трактует stderr как ошибку.
# На Windows после `npm i` подхватывается `node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe`, иначе — `ffmpeg` из PATH.
$script:MediaScriptsRoot = $PSScriptRoot
function Invoke-Ffmpeg {
  param([Parameter(Mandatory)][string[]]$Arguments)
  if (-not $script:ResolvedFfmpegPath) {
    $repoRoot = Resolve-Path (Join-Path $script:MediaScriptsRoot '..')
    $bundled = Join-Path $repoRoot 'node_modules\@ffmpeg-installer\win32-x64\ffmpeg.exe'
    $script:ResolvedFfmpegPath = if (Test-Path -LiteralPath $bundled) { $bundled } else { 'ffmpeg' }
  }
  # `Start-Process -ArgumentList` ломает пути с пробелами; вызов через `&` — как в `generate-winter-3-banner-stub-videos.ps1`.
  & $script:ResolvedFfmpegPath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "ffmpeg exit ${LASTEXITCODE}: $($script:ResolvedFfmpegPath) $($Arguments -join ' ')"
  }
}
