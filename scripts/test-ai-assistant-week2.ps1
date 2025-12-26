# Week 2: Comprehensive AI Assistant Testing Script
# Usage: .\scripts\test-ai-assistant-week2.ps1
# Prerequisites: Dev server running on http://localhost:3000

$API_URL = "http://localhost:3000/api/ai-assistant"
$TestResults = @()
$PassCount = 0
$FailCount = 0

Write-Host "🧪 Week 2: AI Assistant Comprehensive Testing" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if dev server is running
Write-Host "Checking if dev server is running..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Dev server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Dev server is not running. Start it with: npm run dev" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting tests..." -ForegroundColor Yellow
Write-Host ""

# Test Questions (Priority Order)
$TestQuestions = @(
    @{
        Category = "Basic Functionality"
        Question = "Hello"
        Expected = "greeting"
    },
    @{
        Category = "Basic Functionality"
        Question = "What services do you offer?"
        Expected = "services information"
    },
    @{
        Category = "Business Questions"
        Question = "How much does a website cost?"
        Expected = "pricing information"
    },
    @{
        Category = "Business Questions"
        Question = "How long does it take to build a website?"
        Expected = "timeline information"
    },
    @{
        Category = "Service-Specific"
        Question = "Do you help with website accessibility?"
        Expected = "accessibility services"
    },
    @{
        Category = "Service-Specific"
        Question = "What technologies do you use?"
        Expected = "technology stack"
    },
    @{
        Category = "Business Questions"
        Question = "How can I contact you?"
        Expected = "contact information"
    },
    @{
        Category = "Follow-up"
        Question = "Tell me more about that"
        Expected = "follow-up response"
        RequiresHistory = $true
        PreviousQuestion = "What services do you offer?"
    }
)

# Function to send message to API
function Test-AIMessage {
    param(
        [string]$Question,
        [array]$MessageHistory = @(),
        [int]$TestNumber
    )
    
    $messages = @()
    
    # Add message history if provided
    foreach ($msg in $MessageHistory) {
        $messages += @{
            role = $msg.role
            content = $msg.content
        }
    }
    
    # Add current question
    $messages += @{
        role = "user"
        content = $Question
    }
    
    $body = @{
        messages = $messages
    } | ConvertTo-Json -Depth 10
    
    $startTime = Get-Date
    $responseReceived = $false
    $fullResponse = ""
    $errorOccurred = $false
    $errorMessage = ""
    
    try {
        $response = Invoke-WebRequest -Uri $API_URL -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
        $endTime = Get-Date
        $responseTime = ($endTime - $startTime).TotalSeconds
        
        # Parse streaming response
        $streamContent = $response.Content
        $lines = $streamContent -split "`n"
        
        foreach ($line in $lines) {
            if ($line -match "^data: (.+)$") {
                $data = $matches[1]
                try {
                    $json = $data | ConvertFrom-Json
                    if ($json.chunk) {
                        $fullResponse += $json.chunk
                        $responseReceived = $true
                    }
                    if ($json.done) {
                        break
                    }
                    if ($json.error) {
                        $errorOccurred = $true
                        $errorMessage = $json.error
                        break
                    }
                } catch {
                    # Skip invalid JSON
                }
            }
        }
        
        return @{
            Success = $responseReceived -and -not $errorOccurred
            ResponseTime = [math]::Round($responseTime, 2)
            ResponseLength = $fullResponse.Length
            Response = $fullResponse
            Error = $errorMessage
            StatusCode = $response.StatusCode
        }
    } catch {
        $endTime = Get-Date
        $responseTime = ($endTime - $startTime).TotalSeconds
        
        return @{
            Success = $false
            ResponseTime = [math]::Round($responseTime, 2)
            ResponseLength = 0
            Response = ""
            Error = $_.Exception.Message
            StatusCode = 0
        }
    }
}

# Run tests
$messageHistory = @()
$testNum = 1

foreach ($test in $TestQuestions) {
    Write-Host "Test #$testNum : $($test.Category)" -ForegroundColor Yellow
    Write-Host "Question: `"$($test.Question)`"" -ForegroundColor Gray
    
    $result = Test-AIMessage -Question $test.Question -MessageHistory $messageHistory -TestNumber $testNum
    
    if ($result.Success) {
        Write-Host "✅ PASS" -ForegroundColor Green
        Write-Host "   Response Time: $($result.ResponseTime)s" -ForegroundColor Gray
        Write-Host "   Response Length: $($result.ResponseLength) chars" -ForegroundColor Gray
        $PassCount++
        
        # Add to message history for follow-up tests
        if ($test.RequiresHistory -and $messageHistory.Count -eq 0) {
            $messageHistory += @{
                role = "user"
                content = $test.PreviousQuestion
            }
            # We'd need to get the previous response, but for now just add user message
        }
    } else {
        Write-Host "❌ FAIL" -ForegroundColor Red
        Write-Host "   Error: $($result.Error)" -ForegroundColor Red
        Write-Host "   Status Code: $($result.StatusCode)" -ForegroundColor Red
        $FailCount++
    }
    
    Write-Host ""
    
    # Store result
    $TestResults += @{
        TestNumber = $testNum
        Category = $test.Category
        Question = $test.Question
        Success = $result.Success
        ResponseTime = $result.ResponseTime
        ResponseLength = $result.ResponseLength
        Error = $result.Error
    }
    
    $testNum++
    
    # Small delay between tests
    Start-Sleep -Milliseconds 500
}

# Summary
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Total Tests: $($TestQuestions.Count)" -ForegroundColor White
Write-Host "Passed: $PassCount" -ForegroundColor Green
Write-Host "Failed: $FailCount" -ForegroundColor Red
Write-Host ""

if ($FailCount -eq 0) {
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Review errors above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Detailed Results:" -ForegroundColor Cyan
foreach ($result in $TestResults) {
    $status = if ($result.Success) { "✅" } else { "❌" }
    Write-Host "$status Test #$($result.TestNumber): $($result.Category) - Response Time: $($result.ResponseTime)s" -ForegroundColor $(if ($result.Success) { "Green" } else { "Red" })
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Review test results above" -ForegroundColor White
Write-Host "2. Check browser console for any errors (F12)" -ForegroundColor White
Write-Host "3. Verify conversations stored in Supabase dashboard" -ForegroundColor White
Write-Host "4. Test manually on different browsers/devices" -ForegroundColor White
Write-Host ""

