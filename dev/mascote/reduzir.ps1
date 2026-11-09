# Reduz as poses recortadas para o tamanho usado no app (3x de 84 pontos de altura).
Add-Type -AssemblyName System.Drawing
$origem = Join-Path $PSScriptRoot 'recorte'
$destino = Join-Path $PSScriptRoot '..\..\src\mascote\img'
New-Item -ItemType Directory -Force $destino | Out-Null
foreach ($n in 1,2,3,4,5,7,8) {
  $im = [System.Drawing.Image]::FromFile((Join-Path $origem "pose-$n.png"))
  if ($n -eq 5) { $w = 360; $h = [int](360 * $im.Height / $im.Width) } else { $h = 384; $w = [int](384 * $im.Width / $im.Height) }
  $bmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $attr = New-Object System.Drawing.Imaging.ImageAttributes
  $attr.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)
  $g.DrawImage($im, (New-Object System.Drawing.Rectangle 0, 0, $w, $h), 0, 0, $im.Width, $im.Height, [System.Drawing.GraphicsUnit]::Pixel, $attr)
  $out = Join-Path $destino "pose-$n.png"
  $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose(); $im.Dispose()
  Write-Output ("pose-$n  ${w}x${h}  {0:N0} KB" -f ((Get-Item $out).Length / 1KB))
}
