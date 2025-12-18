# Sync all files from Cursor project to other project locations
# Usage: .\scripts\sync-all-projects.ps1

$cursorProject = "C:\Users\marti\.cursor\projects\c-Users-marti-rocky-web-studio"
$targetProjects = @(
    "C:\RockyWebStudio\rocky-web-studio",
    "C:\Users\marti\.claude\projects\C--RockyWebStudio-rocky-web-studio",
    "C:\Users\marti\.claude\projects\C--Users-marti-rocky-web-studio"
)

# Directories and files to exclude (only match if in path, not the project root name)
$excludePatterns = @(
    "\node_modules\",
    "\.next\",
    "\.git\",
    "\.cursor\",
    "\.claude\",
    "\.n8n-data\",
    "\__tests__\",
    ".log",
    ".env.local",
    ".env",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml"
)

Write-Host "=== Syncing Cursor Project to All Projects ===" -ForegroundColor Cyan
Write-Host "Source: $cursorProject" -ForegroundColor Yellow
Write-Host "Targets: $($targetProjects.Count) projects" -ForegroundColor Yellow
Write-Host ""

$filesCopied = 0
$filesSkipped = 0
$errors = 0

# Get all files from Cursor project, excluding certain directories
$allFiles = Get-ChildItem -Path $cursorProject -Recurse -File | Where-Object {
    $filePath = $_.FullName
    $relativePath = $filePath.Substring($cursorProject.Length + 1).ToLower()
    $shouldExclude = $false
    
    # Check if relative path contains any exclude pattern (as directory or file)
    foreach ($pattern in $excludePatterns) {
        $patternLower = $pattern.ToLower().Replace("\", "")
        # Check if pattern appears as a directory or exact filename match
        if ($relativePath.Contains("\$patternLower\") -or $relativePath.StartsWith("$patternLower\") -or $relativePath.EndsWith("\$patternLower") -or $relativePath -eq $patternLower -or $_.Name.ToLower() -like "*$patternLower*") {
            $shouldExclude = $true
            break
        }
    }
    
    return -not $shouldExclude
}

Write-Host "Found $($allFiles.Count) files to sync" -ForegroundColor Green
Write-Host ""

foreach ($target in $targetProjects) {
    Write-Host "=== Syncing to: $target ===" -ForegroundColor Cyan
    
    if (-not (Test-Path $target)) {
        Write-Host "  Target directory does not exist, skipping..." -ForegroundColor Red
        $errors++
        continue
    }
    
    $targetCopied = 0
    $targetSkipped = 0
    
    foreach ($file in $allFiles) {
        $relativePath = $file.FullName.Substring($cursorProject.Length + 1)
        $targetPath = Join-Path $target $relativePath
        $targetDir = Split-Path $targetPath -Parent
        
        try {
            # Create target directory if it doesn't exist
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            }
            
            # Check if file exists and is different
            $shouldCopy = $true
            if (Test-Path $targetPath) {
                $sourceHash = (Get-FileHash $file.FullName -Algorithm MD5).Hash
                $targetHash = (Get-FileHash $targetPath -Algorithm MD5).Hash
                if ($sourceHash -eq $targetHash) {
                    $shouldCopy = $false
                    $targetSkipped++
                }
            }
            
            if ($shouldCopy) {
                Copy-Item -Path $file.FullName -Destination $targetPath -Force
                $targetCopied++
                $filesCopied++
            } else {
                $filesSkipped++
            }
        } catch {
            Write-Host "  Error copying $relativePath : $_" -ForegroundColor Red
            $errors++
        }
    }
    
    Write-Host "  Copied: $targetCopied files" -ForegroundColor Green
    Write-Host "  Skipped (unchanged): $targetSkipped files" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "=== Sync Complete ===" -ForegroundColor Cyan
Write-Host "Total files copied: $filesCopied" -ForegroundColor Green
Write-Host "Total files skipped (unchanged): $filesSkipped" -ForegroundColor Gray
if ($errors -eq 0) {
    Write-Host "Errors: $errors" -ForegroundColor Green
} else {
    Write-Host "Errors: $errors" -ForegroundColor Red
}
