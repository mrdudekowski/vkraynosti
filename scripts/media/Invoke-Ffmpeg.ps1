# Общий вызов ffmpeg через Start-Process: при $ErrorActionPreference Stop PowerShell иначе трактует stderr как ошибку.
function Invoke-Ffmpeg {
  param([Parameter(Mandatory)][string[]]$Arguments)
  $p = Start-Process -FilePath "ffmpeg" -ArgumentList $Arguments -Wait -PassThru -NoNewWindow
  if ($p.ExitCode -ne 0) {
    throw "ffmpeg exit $($p.ExitCode): ffmpeg $($Arguments -join ' ')"
  }
}
