# Test AI Assistant API (PowerShell)
# Usage: .\scripts\test-ai-assistant.ps1

$API_URL = "http://localhost:3000/api/ai-assistant"

Write-Host "🧪 Testing AI Assistant API" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Basic message
Write-Host "Test 1: Basic message" -ForegroundColor Yellow
Write-Host "---------------------" -ForegroundColor Yellow

$body = @{
    messages = @(
        @{
            role = "user"
            content = "What services do you offer?"
        }
    )
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri $API_URL -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# Test 2: Conversation with history
Write-Host "Test 2: Conversation with history" -ForegroundColor Yellow
Write-Host "----------------------------------" -ForegroundColor Yellow

$body2 = @{
    messages = @(
        @{
            role = "user"
            content = "What services do you offer?"
        },
        @{
            role = "assistant"
            content = "We offer web development services."
        },
        @{
            role = "user"
            content = "How much does a website cost?"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response2 = Invoke-WebRequest -Uri $API_URL -Method POST -Body $body2 -ContentType "application/json" -UseBasicParsing
    Write-Host "Response Status: $($response2.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    Write-Host $response2.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Tests complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Check Supabase for stored conversations:" -ForegroundColor Cyan
Write-Host "SELECT * FROM ai_assistant_conversations ORDER BY created_at DESC LIMIT 5;" -ForegroundColor Gray

