param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputPath
)

Add-Type -AssemblyName System.Drawing
$original = [System.Drawing.Bitmap]::new($InputPath)
$maxSide = 700
if ([math]::Max($original.Width, $original.Height) -gt $maxSide) {
  $ratio = $maxSide / [math]::Max($original.Width, $original.Height)
  $source = [System.Drawing.Bitmap]::new([int]($original.Width * $ratio), [int]($original.Height * $ratio))
  $graphics = [System.Drawing.Graphics]::FromImage($source)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.DrawImage($original, 0, 0, $source.Width, $source.Height)
  $graphics.Dispose(); $original.Dispose()
} else { $source = $original }
$width = $source.Width; $height = $source.Height; $count = $width * $height
$water = [bool[]]::new($count)
$queue = [System.Collections.Generic.Queue[int]]::new()

function Is-Water([int]$x, [int]$y) {
  $color = $source.GetPixel($x, $y)
  return $color.B -gt 175 -and $color.B -gt ($color.R + 28) -and $color.G -gt ($color.R + 28)
}
function Enqueue-Water([int]$x, [int]$y) {
  if ($x -lt 0 -or $y -lt 0 -or $x -ge $width -or $y -ge $height) { return }
  $index = $y * $width + $x
  if ($water[$index] -or -not (Is-Water $x $y)) { return }
  $water[$index] = $true; $queue.Enqueue($index)
}

for ($x = 0; $x -lt $width; $x++) { Enqueue-Water $x 0; Enqueue-Water $x ($height - 1) }
for ($y = 0; $y -lt $height; $y++) { Enqueue-Water 0 $y; Enqueue-Water ($width - 1) $y }
while ($queue.Count) {
  $index = $queue.Dequeue(); $x = $index % $width; $y = [math]::Floor($index / $width)
  Enqueue-Water ($x + 1) $y; Enqueue-Water ($x - 1) $y; Enqueue-Water $x ($y + 1); Enqueue-Water $x ($y - 1)
}

$visited = [bool[]]::new($count); $largest = [System.Collections.Generic.List[int]]::new()
for ($start = 0; $start -lt $count; $start++) {
  if ($water[$start] -or $visited[$start]) { continue }
  $component = [System.Collections.Generic.List[int]]::new(); $pending = [System.Collections.Generic.Queue[int]]::new()
  $visited[$start] = $true; $pending.Enqueue($start)
  while ($pending.Count) {
    $index = $pending.Dequeue(); $component.Add($index); $x = $index % $width; $y = [math]::Floor($index / $width)
    foreach ($pair in @(@(1,0), @(-1,0), @(0,1), @(0,-1))) {
      $nx = $x + $pair[0]; $ny = $y + $pair[1]
      if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $width -or $ny -ge $height) { continue }
      $next = $ny * $width + $nx
      if (-not $water[$next] -and -not $visited[$next]) { $visited[$next] = $true; $pending.Enqueue($next) }
    }
  }
  if ($component.Count -gt $largest.Count) { $largest = $component }
}

$minX = $width; $minY = $height; $maxX = 0; $maxY = 0
foreach ($index in $largest) { $x = $index % $width; $y = [math]::Floor($index / $width); $minX = [math]::Min($minX, $x); $minY = [math]::Min($minY, $y); $maxX = [math]::Max($maxX, $x); $maxY = [math]::Max($maxY, $y) }
$padding = 8; $minX = [math]::Max(0, $minX - $padding); $minY = [math]::Max(0, $minY - $padding); $maxX = [math]::Min($width - 1, $maxX + $padding); $maxY = [math]::Min($height - 1, $maxY + $padding)
$output = [System.Drawing.Bitmap]::new($maxX - $minX + 1, $maxY - $minY + 1, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
foreach ($index in $largest) { $x = $index % $width - $minX; $y = [math]::Floor($index / $width) - $minY; $output.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 255, 255, 255)) }
$output.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$output.Dispose(); $source.Dispose()
Write-Output "mask=$OutputPath size=$($maxX - $minX + 1)x$($maxY - $minY + 1) pixels=$($largest.Count)"
