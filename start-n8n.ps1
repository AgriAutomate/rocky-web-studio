# n8n Startup Script with Configuration
# Sets required environment variables and starts n8n

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  n8n Startup Script" -ForegroundColor Cyan
Write-Host "  Rocky Web Studio" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Configuring n8n environment variables..." -ForegroundColor Green

# Database Configuration
$env:DB_SQLITE_POOL_SIZE = "10"

# Task Runners (Required for future versions)
$env:N8N_RUNNERS_ENABLED = "true"

# Environment Variable Access (Set to false to allow $env in Code nodes)
$env:N8N_BLOCK_ENV_ACCESS_IN_NODE = "false"

# Git Node Security (Set to true if not using bare repos)
$env:N8N_GIT_NODE_DISABLE_BARE_REPOS = "true"

Write-Host ""
Write-Host "Environment variables configured:" -ForegroundColor Green
Write-Host "  ✓ DB_SQLITE_POOL_SIZE = $env:DB_SQLITE_POOL_SIZE" -ForegroundColor Yellow
Write-Host "  ✓ N8N_RUNNERS_ENABLED = $env:N8N_RUNNERS_ENABLED" -ForegroundColor Yellow
Write-Host "  ✓ N8N_BLOCK_ENV_ACCESS_IN_NODE = $env:N8N_BLOCK_ENV_ACCESS_IN_NODE" -ForegroundColor Yellow
Write-Host "  ✓ N8N_GIT_NODE_DISABLE_BARE_REPOS = $env:N8N_GIT_NODE_DISABLE_BARE_REPOS" -ForegroundColor Yellow
Write-Host ""

Write-Host "Starting n8n..." -ForegroundColor Green
Write-Host "  Editor will be available at: http://localhost:5678" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

# Start n8n
n8n
