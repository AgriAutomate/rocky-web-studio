# PDF Generation & Email Attachment Debugging Checklist

## Quick Diagnosis Steps

### 1. Check Terminal Logs After Form Submission

Look for these log messages in order:

#### PDF Generation Flow:
- ✅ `Starting PDF generation` - PDF generation started
- ✅ `Puppeteer launch options (dev/prod)` - Shows executablePath
- ❌ `PDF generation failed - continuing without PDF` - **PDF generation error**
- ✅ `PDF buffer generated` - PDF created successfully (check bufferLength > 0)
- ✅ `PDF converted to base64 successfully` - Base64 conversion worked

#### Email Attachment Flow:
- ✅ `Email options prepared with PDF attachment` - Attachment added to email
- ❌ `Email options prepared without PDF attachment` - **No PDF to attach**
- ✅ `[DEV] Resend email options (sanitized)` - Shows attachment metadata
- ✅ `Email sent successfully with PDF attachment` - Email sent with PDF
- ❌ `Email sent successfully without PDF attachment` - **Email sent but no PDF**

### 2. Common Issues & Solutions

#### Issue A: PDF Not Generating

**Symptoms:**
- See `PDF generation failed - continuing without PDF` in logs
- Error message in logs

**Possible Causes:**
1. **CHROME_EXECUTABLE_PATH not set or invalid**
   - Check `.env.local` has `CHROME_EXECUTABLE_PATH`
   - Verify path exists: `Test-Path "C:\Program Files\Microsoft\Edge\Application\msedge.exe"`
   - Error: "CHROME_EXECUTABLE_PATH is not set" or "Failed to launch the browser process"

2. **Puppeteer timeout**
   - Error: "PDF generation timeout after 25 seconds"
   - Solution: Increase timeout or check system resources

3. **Image loading issues**
   - Images in PDF template not loading (check baseUrl in logs)
   - Error: Images fail to load in Puppeteer

4. **Memory/resource issues**
   - Error: Browser crashes or out of memory
   - Solution: Check system resources

**Debug Steps:**
```bash
# Check if Chrome/Edge path is correct
Test-Path $env:CHROME_EXECUTABLE_PATH

# Check if DEBUG_PDF=true creates test-report.pdf
# If yes, PDF is generating but not attaching
# If no, PDF generation is failing
```

#### Issue B: PDF Generated But Not Attaching

**Symptoms:**
- See `PDF buffer generated` with length > 0
- See `PDF converted to base64 successfully`
- But see `Email options prepared without PDF attachment`
- OR see `Email sent successfully without PDF attachment`

**Possible Causes:**
1. **Base64 conversion issue**
   - Check logs for `Base64 conversion produced empty string`
   - Verify `base64Length` in logs is > 0

2. **Attachment object structure**
   - Check `[DEV] Resend email options` shows `attachmentsCount: 1`
   - Verify `contentType: "application/pdf"`
   - Verify `contentLength > 0`

3. **Resend API rejection**
   - Check for `Resend email send failed` error
   - Look for `resendResponseStatus` and `resendResponseBody` in error logs
   - Common: Attachment too large, invalid format, API limits

**Debug Steps:**
```bash
# In dev mode, check the [DEV] Resend email options log
# Should show:
# - hasAttachments: true
# - attachmentsCount: 1
# - attachments[0].contentType: "application/pdf"
# - attachments[0].contentLength: > 0 (should be large, e.g., 50,000+)
```

### 3. Enhanced Debugging

#### Enable DEBUG_PDF Mode

Add to `.env.local`:
```bash
DEBUG_PDF=true
```

This will write `test-report.pdf` to project root if PDF generates successfully.

#### Check Logs for Specific Errors

Look for these error patterns:

1. **Puppeteer errors:**
   - "Failed to launch the browser process"
   - "executablePath or channel must be specified"
   - "PDF generation timeout"

2. **Base64 errors:**
   - "Base64 conversion produced empty string"
   - Check `base64Length: 0` in logs

3. **Resend errors:**
   - "Resend email send failed"
   - Check `resendResponseStatus` (400, 422, 500, etc.)
   - Check `resendResponseBody` for API error details

### 4. Test Scenarios

#### Scenario 1: PDF Generates, Email Sends, But No Attachment

**Expected logs:**
- ✅ `PDF buffer generated`
- ✅ `PDF converted to base64 successfully`
- ✅ `Email options prepared with PDF attachment`
- ✅ `Email sent successfully with PDF attachment`

**If you see:**
- ❌ `Email options prepared without PDF attachment` → Check why `pdfBase64` is null/empty
- ❌ `Email sent successfully without PDF attachment` → PDF was generated but not attached

#### Scenario 2: PDF Generation Fails

**Expected logs:**
- ❌ `PDF generation failed - continuing without PDF`
- Error details in log

**Check:**
- CHROME_EXECUTABLE_PATH is set correctly
- Chrome/Edge executable exists at that path
- System has enough resources

#### Scenario 3: Email Sends But Attachment Missing

**Expected logs:**
- ✅ All PDF generation logs pass
- ✅ `Email sent successfully with PDF attachment`
- But email has no attachment

**Possible causes:**
- Resend API silently rejected attachment (check Resend dashboard)
- Attachment too large (Resend limit: 25MB)
- Invalid attachment format

### 5. Quick Fixes

#### Fix 1: Verify CHROME_EXECUTABLE_PATH
```bash
# In PowerShell
$env:CHROME_EXECUTABLE_PATH
Test-Path $env:CHROME_EXECUTABLE_PATH
```

#### Fix 2: Test PDF Generation Directly
```typescript
// Temporarily add to route.ts before email send
if (pdfBuffer) {
  const fs = require('fs');
  fs.writeFileSync('debug-pdf.pdf', Buffer.from(pdfBuffer));
  console.log('DEBUG: PDF written to debug-pdf.pdf');
}
```

#### Fix 3: Verify Attachment Structure
Check the `[DEV] Resend email options` log shows:
```json
{
  "hasAttachments": true,
  "attachmentsCount": 1,
  "attachments": [{
    "filename": "RockyWebStudio-Deep-Dive-Report.pdf",
    "contentType": "application/pdf",
    "contentLength": 50000+  // Should be large
  }]
}
```

### 6. Next Steps

1. **Run a test submission** and capture all terminal logs
2. **Check which scenario** matches your logs
3. **Follow the debug steps** for that scenario
4. **Share the logs** if you need help interpreting them
