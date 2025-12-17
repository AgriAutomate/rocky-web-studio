# Stop All Next.js Dev Servers
# This script finds and stops all Node.js processes that are likely dev servers

Write-Host "🔍 Finding Node.js processes..." -ForegroundColor Yellow

# Get all node processes
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($nodeProcesses.Count -eq 0) {
    Write-Host "✅ No Node.js processes found. All clear!" -ForegroundColor Green
    exit 0
}

Write-Host "`nFound $($nodeProcesses.Count) Node.js process(es):" -ForegroundColor Cyan
$nodeProcesses | ForEach-Object {
    Write-Host "  - PID: $($_.Id) | CPU: $([math]::Round($_.CPU, 2))s | Memory: $([math]::Round($_.WorkingSet64 / 1MB, 2)) MB" -ForegroundColor Gray
}

# Check which ports are in use
Write-Host "`n🔍 Checking common dev server ports (3000-3010)..." -ForegroundColor Yellow
$portsInUse = @()
3000..3010 | ForEach-Object {
    $port = $_
    $result = netstat -ano | Select-String ":$port.*LISTENING"
    if ($result) {
        $pid = ($result -split '\s+')[-1]
        $portsInUse += @{Port=$port; PID=$pid}
        Write-Host "  ⚠️  Port $port is in use by PID $pid" -ForegroundColor Red
    }
}

if ($portsInUse.Count -eq 0) {
    Write-Host "  ✅ No dev server ports in use" -ForegroundColor Green
}

Write-Host "`n⚠️  WARNING: This will stop ALL Node.js processes!" -ForegroundColor Red
Write-Host "   This includes:" -ForegroundColor Yellow
Write-Host "   - Next.js dev servers" -ForegroundColor Yellow
Write-Host "   - Other Node.js applications" -ForegroundColor Yellow
Write-Host "   - Cursor/VS Code extensions (will restart automatically)" -ForegroundColor Yellow

$confirmation = Read-Host "`nDo you want to stop all Node.js processes? (y/N)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host "`n❌ Cancelled. No processes were stopped." -ForegroundColor Yellow
    exit 0
}

Write-Host "`n🛑 Stopping Node.js processes..." -ForegroundColor Red
$stopped = 0
$nodeProcesses | ForEach-Object {
    try {
        Stop-Process -Id $_.Id -Force -ErrorAction Stop
        Write-Host "  ✅ Stopped PID $($_.Id)" -ForegroundColor Green
        $stopped++
    } catch {
        Write-Host "  ❌ Failed to stop PID $($_.Id): $_" -ForegroundColor Red
    }
}

Write-Host "`n✅ Stopped $stopped out of $($nodeProcesses.Count) process(es)" -ForegroundColor Green

# Clean up lock files
Write-Host "`n🧹 Cleaning up Next.js lock files..." -ForegroundColor Yellow
$lockFiles = @(
    ".next\dev\lock",
    ".next\cache\lock"
)

foreach ($lockFile in $lockFiles) {
    if (Test-Path $lockFile) {
        Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ Removed $lockFile" -ForegroundColor Green
    }
}

Write-Host "`n✨ Done! You can now start a fresh dev server with: npm run dev" -ForegroundColor Green

