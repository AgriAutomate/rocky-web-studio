# AI Assistant Widget Template Deployment Script (PowerShell)
# 
# This script automates the deployment of the AI Assistant widget template
# for a new client.
#
# Usage: .\scripts\deploy-ai-assistant-template.ps1 -ClientName "new-client"

param(
    [Parameter(Mandatory=$false)]
    [string]$ClientName = "new-client"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying AI Assistant Widget Template for: $ClientName" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create client directory
Write-Host "📁 Creating client directory..." -ForegroundColor Yellow
$ClientDir = "clients\$ClientName"
New-Item -ItemType Directory -Force -Path $ClientDir | Out-Null
Set-Location $ClientDir

# Step 2: Copy template files
Write-Host "📋 Copying template files..." -ForegroundColor Yellow
$TemplateFiles = @(
    @{Source = "..\..\components\AIAssistantWidget.tsx"; Dest = "components\"},
    @{Source = "..\..\app\api\ai-assistant"; Dest = "app\api\"},
    @{Source = "..\..\lib\claude.ts"; Dest = "lib\"},
    @{Source = "..\..\lib\rate-limit.ts"; Dest = "lib\"},
    @{Source = "..\..\lib\config\ai-assistant-template.ts"; Dest = "lib\config\"},
    @{Source = "..\..\types\ai-assistant.ts"; Dest = "types\"},
    @{Source = "..\..\supabase\migrations\20250125_create_ai_assistant_tables.sql"; Dest = "supabase\migrations\"}
)

foreach ($file in $TemplateFiles) {
    $destDir = Split-Path -Path $file.Dest -Parent
    if ($destDir -and -not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    }
    Copy-Item -Path $file.Source -Destination $file.Dest -Recurse -Force
}

# Step 3: Create configuration file
Write-Host "⚙️  Creating configuration file..." -ForegroundColor Yellow
$ConfigContent = @"
/**
 * Client Configuration
 * 
 * Update this file with client-specific information
 */

import { CLIENT_CONFIG } from './ai-assistant-template';

// Update CLIENT_CONFIG in ai-assistant-template.ts with client-specific data
export { CLIENT_CONFIG };
"@
New-Item -ItemType Directory -Force -Path "lib\config" | Out-Null
$ConfigContent | Out-File -FilePath "lib\config\client-config.ts" -Encoding UTF8

# Step 4: Create .env.example
Write-Host "📝 Creating environment template..." -ForegroundColor Yellow
$EnvExample = @"
# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
NEXT_PUBLIC_URL=https://your-domain.com

# Optional: Sentry
SENTRY_DSN=your-sentry-dsn
"@
$EnvExample | Out-File -FilePath ".env.example" -Encoding UTF8

# Step 5: Create README
Write-Host "📖 Creating deployment README..." -ForegroundColor Yellow
$ReadmeContent = @"
# AI Assistant Widget - $ClientName

## Quick Start

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure client settings:**
   - Edit \`lib/config/ai-assistant-template.ts\`
   - Update CLIENT_CONFIG with client-specific data

3. **Set up environment variables:**
   \`\`\`bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   \`\`\`

4. **Set up Supabase:**
   - Create new Supabase project
   - Run migration: \`supabase/migrations/20250125_create_ai_assistant_tables.sql\`

5. **Deploy:**
   \`\`\`bash
   npm run build
   vercel deploy --prod
   \`\`\`

## Customization Checklist

- [ ] Update company name, location, business type
- [ ] Update services list
- [ ] Update FAQs
- [ ] Update website links
- [ ] Customize branding (colors, logo)
- [ ] Update system prompt customizations
- [ ] Test knowledge base accuracy
- [ ] Deploy to production

## Support

For questions or issues, contact Rocky Web Studio.
"@
$ReadmeContent | Out-File -FilePath "README.md" -Encoding UTF8

# Step 6: Create deployment checklist
Write-Host "✅ Creating deployment checklist..." -ForegroundColor Yellow
$ChecklistContent = @"
# Deployment Checklist

## Phase 1: Setup (2 hours)
- [ ] Clone/create project
- [ ] Install dependencies
- [ ] Create Supabase project
- [ ] Run database migrations
- [ ] Set up Vercel project
- [ ] Configure environment variables

## Phase 2: Customization (4 hours)
- [ ] Update client configuration (lib/config/ai-assistant-template.ts)
- [ ] Update knowledge base (services, FAQs)
- [ ] Customize system prompt
- [ ] Update website links
- [ ] Configure branding (colors, logo)
- [ ] Test knowledge base accuracy

## Phase 3: Integration (2 hours)
- [ ] Add widget to layout (app/layout.tsx)
- [ ] Configure widget position/styling
- [ ] Test widget on all pages
- [ ] Verify accessibility (WCAG 2.1 AA)

## Phase 4: Testing & Launch (2 hours)
- [ ] Test conversation flow
- [ ] Verify rate limiting
- [ ] Test error handling
- [ ] Check mobile responsiveness
- [ ] Deploy to production
- [ ] Monitor for 24 hours

**Total Time:** ~10 hours (48 hours with buffer)
"@
$ChecklistContent | Out-File -FilePath "DEPLOYMENT_CHECKLIST.md" -Encoding UTF8

Write-Host ""
Write-Host "✅ Template deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. cd $ClientDir"
Write-Host "2. Edit lib/config/ai-assistant-template.ts with client data"
Write-Host "3. Follow DEPLOYMENT_CHECKLIST.md"
Write-Host ""
Write-Host "📚 Documentation: docs/AI_ASSISTANT_TEMPLATE_GUIDE.md" -ForegroundColor Yellow

