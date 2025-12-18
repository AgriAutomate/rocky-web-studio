# Sync .env.local file from main project to all other project locations
# Usage: .\scripts\sync-env-local.ps1

$mainProject = "C:\RockyWebStudio\rocky-web-studio"
$sourceEnvFile = Join-Path $mainProject ".env.local"
$targetProjects = @(
    "C:\Users\marti\.cursor\projects\c-Users-marti-rocky-web-studio",
    "C:\Users\marti\.claude\projects\C--RockyWebStudio-rocky-web-studio",
    "C:\Users\marti\.claude\projects\C--Users-marti-rocky-web-studio"
)

Write-Host "=== Syncing .env.local from Main Project ===" -ForegroundColor Cyan
Write-Host "Source: $sourceEnvFile" -ForegroundColor Yellow
Write-Host ""

# Check if source exists
if (-not (Test-Path $sourceEnvFile)) {
    Write-Host "ERROR: Source .env.local does not exist: $sourceEnvFile" -ForegroundColor Red
    exit 1
}

Write-Host "Source .env.local found" -ForegroundColor Green
Write-Host ""

$filesCopied = 0
$errors = 0

foreach ($target in $targetProjects) {
    Write-Host "=== Syncing to: $target ===" -ForegroundColor Cyan
    
    if (-not (Test-Path $target)) {
        Write-Host "  Target directory does not exist, creating..." -ForegroundColor Yellow
        try {
            New-Item -ItemType Directory -Path $target -Force | Out-Null
            Write-Host "  Created target directory" -ForegroundColor Green
        } catch {
            Write-Host "  Failed to create target directory: $_" -ForegroundColor Red
            $errors++
            continue
        }
    }
    
    $targetEnvFile = Join-Path $target ".env.local"
    
    try {
        # Check if target exists and is different
        $shouldCopy = $true
        if (Test-Path $targetEnvFile) {
            $sourceHash = (Get-FileHash $sourceEnvFile -Algorithm MD5).Hash
            $targetHash = (Get-FileHash $targetEnvFile -Algorithm MD5).Hash
            if ($sourceHash -eq $targetHash) {
                $shouldCopy = $false
                Write-Host "  .env.local already up to date (skipped)" -ForegroundColor Gray
            } else {
                Write-Host "  .env.local differs, will be updated" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  .env.local does not exist, will be created" -ForegroundColor Yellow
        }
        
        if ($shouldCopy) {
            Copy-Item -Path $sourceEnvFile -Destination $targetEnvFile -Force
            Write-Host "  Copied .env.local successfully" -ForegroundColor Green
            $filesCopied++
        }
    } catch {
        Write-Host "  Error copying .env.local: $_" -ForegroundColor Red
        $errors++
    }
    
    Write-Host ""
}

Write-Host "=== Sync Complete ===" -ForegroundColor Cyan
Write-Host "Files copied: $filesCopied" -ForegroundColor Green
if ($errors -eq 0) {
    Write-Host "Errors: $errors" -ForegroundColor Green
} else {
    Write-Host "Errors: $errors" -ForegroundColor Red
}
