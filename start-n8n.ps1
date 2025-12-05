# PowerShell script to start n8n with Docker
# Make sure Docker Desktop is running before executing this script

# Create n8n data directory if it doesn't exist
if (-not (Test-Path ".n8n-data")) {
    New-Item -ItemType Directory -Path ".n8n-data" | Out-Null
    Write-Host "Created .n8n-data directory"
}

# Get the current directory path
$currentPath = (Get-Location).Path

# Run n8n Docker container
Write-Host "Starting n8n container..."
docker run -d `
  --name rocky-n8n `
  -p 5678:5678 `
  -v "${currentPath}\.n8n-data:/home/node/.n8n" `
  -e N8N_BASIC_AUTH_ACTIVE=true `
  -e N8N_BASIC_AUTH_USER=admin `
  -e N8N_BASIC_AUTH_PASSWORD=27ParkAvenue `
  n8nio/n8n

if ($LASTEXITCODE -eq 0) {
    Write-Host "n8n started successfully!"
    Write-Host "Access n8n at: http://localhost:5678"
    Write-Host "Username: admin"
    Write-Host "Password: 27ParkAvenue"
} else {
    Write-Host "Failed to start n8n. Make sure Docker Desktop is running."
}

