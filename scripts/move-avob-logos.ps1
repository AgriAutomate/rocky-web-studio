# Script to move AVOB logo files from project root to /public directory
# Run this script after placing the logo files in the project root

$files = @("AVOB_DF.png", "AVOB_DF.jpg", "AVOB.jpg")
$publicDir = "public"

Write-Host "Moving AVOB logo files to /public directory..." -ForegroundColor Cyan

foreach ($file in $files) {
    if (Test-Path $file) {
        $destination = Join-Path $publicDir $file
        Move-Item -Path $file -Destination $destination -Force
        Write-Host "✓ Moved $file to $destination" -ForegroundColor Green
    } else {
        Write-Host "✗ $file not found in project root" -ForegroundColor Yellow
    }
}

Write-Host "`nVerifying files in /public directory..." -ForegroundColor Cyan
$movedFiles = Get-ChildItem -Path $publicDir -Filter "AVOB*" | Select-Object Name
if ($movedFiles) {
    Write-Host "Files in /public:" -ForegroundColor Green
    $movedFiles | ForEach-Object { Write-Host "  ✓ $($_.Name)" -ForegroundColor Green }
} else {
    Write-Host "No AVOB files found in /public directory" -ForegroundColor Yellow
}

Write-Host "`nDone!" -ForegroundColor Cyan

