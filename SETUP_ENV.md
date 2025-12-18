# Environment Variables Setup Guide

## Why `.env.local` is in `.gitignore`

`.env.local` contains **secret credentials** (API keys, database passwords, etc.) and should **never** be committed to git for security reasons.

However, you need it for local development and testing. Here's how to set it up:

## Option 1: Sync from Main Project (Recommended)

If you have `.env.local` configured in your main project (`C:\RockyWebStudio\rocky-web-studio`), sync it:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\sync-env-local.ps1
```

This will copy `.env.local` from the main project to:
- Cursor project (current location)
- Claude projects

## Option 2: Create from Template

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in your actual values:
   - Get `RESEND_API_KEY` from https://resend.com/api-keys
   - Get `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from Supabase Dashboard → Settings → API
   - Set `CHROME_EXECUTABLE_PATH` to your Chrome/Edge installation path

3. Restart your dev server:
   ```bash
   npm run dev
   ```

## Required Environment Variables

### For Questionnaire Workflow Testing

```bash
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Supabase Database & Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# Public Supabase (for client-side)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# Base URL for PDF image URLs
NEXT_PUBLIC_URL=http://localhost:3000

# Local browser for Puppeteer (Windows)
CHROME_EXECUTABLE_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

## Verify Setup

After setting up `.env.local`, verify it's loaded:

```bash
# Check if variables are accessible (in Node.js)
node -e "require('dotenv').config({ path: '.env.local' }); console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'SET' : 'NOT SET');"
```

Or run the test script:
```bash
npm run test:workflow
```

## Security Notes

- ✅ `.env.local` is in `.gitignore` - **DO NOT** remove it
- ✅ `.env.local.example` is committed - safe template with no secrets
- ✅ Never commit `.env.local` to git
- ✅ Never share `.env.local` publicly
- ✅ Use sync script to copy between projects (keeps secrets local)

## Troubleshooting

### "Missing required environment variables" error
- Check `.env.local` exists in project root
- Verify variable names match exactly (case-sensitive)
- Restart dev server after creating/editing `.env.local`
- Check for typos or extra spaces in variable values

### Variables not loading
- Ensure `.env.local` is in project root (same level as `package.json`)
- Check file name is exactly `.env.local` (not `.env.local.txt` or similar)
- Restart dev server completely (stop and start again)

### Sync script not working
- Verify main project path: `C:\RockyWebStudio\rocky-web-studio`
- Check `.env.local` exists in main project
- Run PowerShell as administrator if permission errors occur
