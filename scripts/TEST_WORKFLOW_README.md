# Questionnaire Workflow Test Script

## Overview

This script tests the complete end-to-end questionnaire workflow:
1. ✅ Form submission to API
2. ✅ PDF generation
3. ✅ Email sending
4. ✅ Supabase database storage
5. ✅ PDF storage upload

## Prerequisites

1. **Dev server running**: `npm run dev` (should be on http://localhost:3000)
2. **Environment variables set**: `.env.local` must contain:
   - `RESEND_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CHROME_EXECUTABLE_PATH` (for local PDF generation)
   
   **Setup**: Copy `.env.local.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.local.example .env.local
   # Then edit .env.local with your actual credentials
   ```
   
   **Or sync from main project**:
   ```bash
   powershell -ExecutionPolicy Bypass -File .\scripts\sync-env-local.ps1
   ```
   
3. **Supabase configured**: Table `questionnaire_responses` exists and is accessible
4. **Storage bucket**: `rockywebstudio` bucket exists with `questionnaire-reports` folder

## Usage

### Running While Dev Server is Active

**Important**: The test script needs the dev server to be running. Run it in a **separate terminal window/tab**:

1. **Terminal 1** (keep running):
   ```bash
   npm run dev
   ```

2. **Terminal 2** (new window):
   ```bash
   npm run test:workflow
   ```

Or use PowerShell split pane: Right-click terminal → "Split Terminal"

### Basic Usage
```bash
# In a separate terminal from dev server
npm run test:workflow
```

### With Custom Settings
```bash
# Custom API URL
TEST_API_URL=http://localhost:3000/api/questionnaire/submit npm run test:workflow

# Custom test email
TEST_EMAIL=your-test@email.com npm run test:workflow

# Both
TEST_API_URL=http://localhost:3000/api/questionnaire/submit TEST_EMAIL=test@example.com npm run test:workflow
```

### Direct Node Execution
```bash
node scripts/test-questionnaire-workflow.js
```

## What It Tests

### ✅ Step 1: Form Submission
- Submits test questionnaire data to `/api/questionnaire/submit`
- Verifies response is JSON (not HTML error page)
- Checks for success response with `clientId`
- Verifies `pdfGeneratedAt` timestamp

### ✅ Step 2: PDF URL Verification
- If PDF URL is returned, verifies it's accessible
- Checks Content-Type is `application/pdf`
- Verifies file size

### ✅ Step 3: Results Summary
- Shows pass/fail for each test step
- Displays timing information
- Provides error details if any step fails

## Test Data

The script uses realistic test data:
- **Business**: "Test Business Pty Ltd"
- **Sector**: "professional-services"
- **Challenges**: operating-costs, cash-flow, digital-transformation
- **Goals**: reduce-operating-costs, increase-online-visibility
- **Email**: Uses `TEST_EMAIL` env var or defaults to `test@example.com`

## Expected Output

```
🧪 Questionnaire Workflow Test
==================================================
API URL: http://localhost:3000/api/questionnaire/submit
Test Email: test@example.com
==================================================

📝 Step 1: Submitting questionnaire form...
✅ Form submitted successfully
   Client ID: abc123-def456-...
   PDF Generated: Yes

⏳ Waiting 3 seconds for async operations...

📄 Step 2: Verifying PDF URL...
✅ PDF URL is accessible
   URL: https://...supabase.co/storage/v1/object/public/...
   Content-Type: application/pdf
   Size: 123456 bytes

==================================================
📊 Test Results Summary
==================================================
✅ Form Submission (1234ms)
✅ PDF URL (567ms)
--------------------------------------------------
Total: 2 tests
✅ Passed: 2
❌ Failed: 0
⏱️  Total Duration: 1801ms
==================================================

🎉 All tests passed!
```

## Troubleshooting

### Error: "Expected JSON but got text/html"
- **Cause**: API route is returning HTML error page instead of JSON
- **Fix**: Check server logs for errors, verify challenge library loads correctly

### Error: "PDF URL is null"
- **Cause**: PDF generation or upload failed
- **Fix**: Check server logs for PDF generation errors, verify Supabase storage bucket exists

### Error: "ECONNREFUSED"
- **Cause**: Dev server not running
- **Fix**: Start dev server with `npm run dev`

### Error: "Missing required environment variables"
- **Cause**: `.env.local` not configured
- **Fix**: 
  1. **Sync from main project** (recommended):
     ```bash
     powershell -ExecutionPolicy Bypass -File .\scripts\sync-env-local.ps1
     ```
  2. **Or create manually**: Copy `.env.local.example` to `.env.local` and fill in values
  3. **Restart dev server** after creating/updating `.env.local`

## Manual Verification

After running the test, manually verify:

1. **Email**: Check inbox for `TEST_EMAIL` - should receive email with PDF attachment
2. **Supabase Dashboard**: 
   - Go to Table Editor → `questionnaire_responses`
   - Find row with `business_name = "Test Business Pty Ltd"`
   - Verify `pdf_url` is not NULL
   - Verify `pdf_generated_at` and `email_sent_at` are set
3. **Storage**: 
   - Go to Storage → `rockywebstudio` → `questionnaire-reports`
   - Verify PDF file exists with format `[clientId]-report-[date].pdf`

## Next Steps

If tests pass:
- ✅ Workflow is functioning correctly
- ✅ PDFs are generating
- ✅ Emails are sending
- ✅ Storage is working

If tests fail:
- Check server logs for detailed error messages
- Verify environment variables are set correctly
- Check Supabase dashboard for storage bucket configuration
- Review error messages in test output
