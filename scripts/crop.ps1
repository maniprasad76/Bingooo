Add-Type -AssemblyName System.Drawing

$src = "C:\Users\manip\.gemini\antigravity-ide\brain\80115de1-e232-4fda-b340-c6fe81fc4e8a\.user_uploaded\media_1788368591204.png"
$targetDir = "C:\Users\manip\Desktop\bingooo\apps\frontend\public\images\landing"

if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
}

function Save-Crop($fileName, $x, $y, $w, $h) {
    $bmp = [System.Drawing.Bitmap]::FromFile($src)
    $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $cropped = $bmp.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $destPath = Join-Path $targetDir $fileName
    $cropped.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()
    $bmp.Dispose()
    Write-Output "Cropped $fileName ($w x $h)"
}

Save-Crop "hero-model.png" 340 68 342 217

Save-Crop "cat-tshirts.png" 24 324 152 132
Save-Crop "cat-hoodies.png" 184 324 152 132
Save-Crop "cat-jeans.png" 344 324 152 132
Save-Crop "cat-custom.png" 504 324 152 132

Save-Crop "prod-oversized.png" 25 586 150 102
Save-Crop "prod-chaos.png" 183 586 150 102
Save-Crop "prod-hoodie.png" 341 586 150 102
Save-Crop "prod-jeans.png" 499 586 150 102

Save-Crop "brand-model.png" 0 749 145 87

Save-Crop "ugc-1.png" 25 874 98 68
Save-Crop "ugc-2.png" 128 874 98 68
Save-Crop "ugc-3.png" 231 874 98 68
Save-Crop "ugc-4.png" 334 874 98 68
Save-Crop "ugc-5.png" 437 874 98 68
Save-Crop "ugc-6.png" 540 874 98 68

Write-Output "Done cropping all landing images!"
