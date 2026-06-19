Add-Type -AssemblyName System.Drawing

$width = 200
$height = 2000
$outputDir = Join-Path $PSScriptRoot "..\docs\assets"
$outputPath = Join-Path $outputDir "clt-ou-pj-200x2000.jpg"
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$navy = [System.Drawing.Color]::FromArgb(20, 35, 46)
$navyLight = [System.Drawing.Color]::FromArgb(32, 53, 65)
$mint = [System.Drawing.Color]::FromArgb(38, 139, 121)
$lime = [System.Drawing.Color]::FromArgb(199, 231, 95)
$paper = [System.Drawing.Color]::FromArgb(248, 246, 239)
$terracotta = [System.Drawing.Color]::FromArgb(205, 100, 74)
$white = [System.Drawing.Color]::White

$backgroundRect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$backgroundBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $backgroundRect,
    $navy,
    $navyLight,
    [System.Drawing.Drawing2D.LinearGradientMode]::Vertical
)
$graphics.FillRectangle($backgroundBrush, $backgroundRect)

function Add-Circle($x, $y, $size, $color) {
    $brush = New-Object System.Drawing.SolidBrush($color)
    $graphics.FillEllipse($brush, $x, $y, $size, $size)
    $brush.Dispose()
}

function Add-RoundedCard($x, $y, $w, $h, $radius, $color) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $diameter = $radius * 2
    $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
    $path.AddArc($x + $w - $diameter, $y, $diameter, $diameter, 270, 90)
    $path.AddArc($x + $w - $diameter, $y + $h - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($x, $y + $h - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    $brush = New-Object System.Drawing.SolidBrush($color)
    $graphics.FillPath($brush, $path)
    $brush.Dispose()
    $path.Dispose()
}

function Add-CenteredText($text, $font, $color, $y, $boxHeight) {
    $brush = New-Object System.Drawing.SolidBrush($color)
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $rect = New-Object System.Drawing.RectangleF(8, $y, 184, $boxHeight)
    $graphics.DrawString($text, $font, $brush, $rect, $format)
    $format.Dispose()
    $brush.Dispose()
}

$fontBold = New-Object System.Drawing.Font("Segoe UI", 38, [System.Drawing.FontStyle]::Bold)
$fontMedium = New-Object System.Drawing.Font("Segoe UI", 15, [System.Drawing.FontStyle]::Bold)
$fontSmall = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Regular)
$fontTiny = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)

Add-Circle 140 45 95 ([System.Drawing.Color]::FromArgb(35, $mint))
Add-Circle -35 250 105 ([System.Drawing.Color]::FromArgb(28, $lime))

Add-CenteredText "CLT" $fontBold $white 80 70
Add-CenteredText "ou" $fontMedium $lime 152 35
Add-CenteredText "PJ" $fontBold $white 184 70
Add-CenteredText "ESCOLHA COM CLAREZA" $fontTiny $lime 275 35

$linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(90, $white), 2)
$graphics.DrawLine($linePen, 45, 340, 155, 340)

Add-RoundedCard 22 390 156 245 16 $paper
Add-CenteredText "CLT" $fontMedium $navy 410 35
$idPen = New-Object System.Drawing.Pen($mint, 5)
$graphics.DrawRectangle($idPen, 48, 465, 104, 70)
Add-Circle 61 480 26 $mint
$graphics.DrawLine($idPen, 96, 486, 137, 486)
$graphics.DrawLine($idPen, 96, 505, 128, 505)
$graphics.DrawLine($idPen, 48, 566, 152, 566)
$graphics.DrawLine($idPen, 48, 590, 125, 590)

$connectorPen = New-Object System.Drawing.Pen($lime, 5)
$connectorPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$connectorPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawLine($connectorPen, 100, 650, 100, 730)
Add-Circle 88 686 24 $lime

Add-RoundedCard 22 745 156 245 16 $paper
Add-CenteredText "PJ" $fontMedium $navy 765 35
$docPen = New-Object System.Drawing.Pen($terracotta, 5)
$graphics.DrawRectangle($docPen, 50, 822, 100, 118)
$graphics.DrawLine($docPen, 68, 850, 132, 850)
$graphics.DrawLine($docPen, 68, 878, 132, 878)
$graphics.DrawLine($docPen, 68, 906, 116, 906)
Add-Circle 112 912 48 $terracotta
$checkPen = New-Object System.Drawing.Pen($white, 5)
$graphics.DrawLines($checkPen, @(
    (New-Object System.Drawing.Point(124, 936)),
    (New-Object System.Drawing.Point(132, 945)),
    (New-Object System.Drawing.Point(146, 928))
))

Add-CenteredText "COMPARE" $fontMedium $lime 1040 35
Add-CenteredText "salario • beneficios`nimpostos • riscos" $fontSmall $white 1080 70

Add-RoundedCard 20 1200 160 315 18 ([System.Drawing.Color]::FromArgb(235, $white))
Add-CenteredText "DECISAO" $fontMedium $navy 1222 35

$chartPen = New-Object System.Drawing.Pen($mint, 7)
$chartPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$chartPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawLines($chartPen, @(
    (New-Object System.Drawing.Point(45, 1390)),
    (New-Object System.Drawing.Point(72, 1352)),
    (New-Object System.Drawing.Point(100, 1368)),
    (New-Object System.Drawing.Point(132, 1308)),
    (New-Object System.Drawing.Point(157, 1322))
))
Add-Circle 69 1349 9 $lime
Add-Circle 96 1364 9 $lime
Add-Circle 128 1304 9 $lime

$shieldPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$shieldPath.AddPolygon(@(
    (New-Object System.Drawing.Point(100, 1248)),
    (New-Object System.Drawing.Point(137, 1264)),
    (New-Object System.Drawing.Point(132, 1310)),
    (New-Object System.Drawing.Point(100, 1336)),
    (New-Object System.Drawing.Point(68, 1310)),
    (New-Object System.Drawing.Point(63, 1264))
))
$shieldBrush = New-Object System.Drawing.SolidBrush($navy)
$graphics.FillPath($shieldBrush, $shieldPath)
$graphics.DrawLines($checkPen, @(
    (New-Object System.Drawing.Point(82, 1290)),
    (New-Object System.Drawing.Point(95, 1303)),
    (New-Object System.Drawing.Point(119, 1278))
))

Add-CenteredText "ENTENDA" $fontMedium $lime 1585 35
Add-CenteredText "Uma recomendacao`nexplicavel para negociar`ncom mais seguranca." $fontSmall $white 1630 100

Add-Circle 65 1790 70 $lime
$personPen = New-Object System.Drawing.Pen($navy, 7)
Add-Circle 88 1805 24 $navy
$graphics.DrawLine($personPen, 100, 1835, 100, 1892)
$graphics.DrawLine($personPen, 100, 1850, 72, 1875)
$graphics.DrawLine($personPen, 100, 1850, 132, 1870)
$graphics.DrawLine($personPen, 100, 1890, 78, 1920)
$graphics.DrawLine($personPen, 100, 1890, 124, 1920)

Add-CenteredText "CLT OU PJ" $fontTiny $white 1940 30

$qualityEncoder = [System.Drawing.Imaging.Encoder]::Quality
$encoderParameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($qualityEncoder, 92L)
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq "image/jpeg" }
$bitmap.Save($outputPath, $jpegCodec, $encoderParameters)

$encoderParameters.Dispose()
$shieldBrush.Dispose()
$shieldPath.Dispose()
$checkPen.Dispose()
$chartPen.Dispose()
$docPen.Dispose()
$connectorPen.Dispose()
$idPen.Dispose()
$linePen.Dispose()
$fontTiny.Dispose()
$fontSmall.Dispose()
$fontMedium.Dispose()
$fontBold.Dispose()
$backgroundBrush.Dispose()
$graphics.Dispose()
$bitmap.Dispose()

Write-Output $outputPath
