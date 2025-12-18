# PDF Generation System - Complete Debug Information

## 📁 File Structure

### Core PDF Generation Files
1. **`lib/pdf/generateClientReport.ts`** - Main PDF generation logic
2. **`lib/pdf/templates/reportTemplate.html`** - HTML template for PDF
3. **`app/api/questionnaire/submit/route.ts`** - API endpoint that calls PDF generation

### Supporting Files
4. **`lib/utils/sector-mapping.ts`** - Maps sectors to challenge IDs
5. **`lib/utils/pain-point-mapping.ts`** - Challenge details library
6. **`lib/utils/sectorMapping.ts`** - Sector challenge mapping
7. **`lib/env.ts`** - Environment variable validation
8. **`lib/utils/logger.ts`** - Logging utilities

---

## 🔧 Dependencies (package.json)

```json
{
  "@sparticuz/chromium": "^143.0.0",  // Production: Vercel/serverless Chromium
  "puppeteer-core": "^24.33.0"        // Puppeteer without bundled Chromium
}
```

---

## 🌍 Environment Variables

### Required for PDF Generation:
- **`CHROME_EXECUTABLE_PATH`** (Development only)
  - Example: `CHROME_EXECUTABLE_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"`
  - Used in: `lib/pdf/generateClientReport.ts:196`
  - Required in development, not needed in production

### Used for Base URL (Image Loading):
- **`NEXT_PUBLIC_URL`** (Optional)
  - Example: `NEXT_PUBLIC_URL="https://rockywebstudio.com.au"`
  - Used in: `lib/pdf/generateClientReport.ts:116`
  - Fallback order: `NEXT_PUBLIC_URL` → `VERCEL_URL` → `localhost:3000` (dev) → `rockywebstudio.com.au` (prod)

- **`VERCEL_URL`** (Auto-set by Vercel)
  - Automatically provided by Vercel in production
  - Used as fallback if `NEXT_PUBLIC_URL` is not set

### Debug/Development:
- **`DEBUG_PDF`** (Optional)
  - Set to `"true"` to write PDF to disk for local inspection
  - Used in: `lib/pdf/generateClientReport.ts:247`
  - Output: `test-report.pdf` in project root

- **`NODE_ENV`**
  - `"production"` → Uses `@sparticuz/chromium`
  - `"development"` → Uses local Chrome via `CHROME_EXECUTABLE_PATH`

---

## 📊 PDF Generation Flow

### 1. API Endpoint: `POST /api/questionnaire/submit`
**File:** `app/api/questionnaire/submit/route.ts`

**Flow:**
```
1. Validate form data (Zod)
2. Generate report data (sector → challenges)
3. Generate PDF (generatePdfReport)
   ├─ Generate HTML template
   ├─ Launch Puppeteer browser
   ├─ Render HTML to PDF
   └─ Return Uint8Array buffer
4. Convert PDF buffer to base64
5. Upload PDF to Supabase Storage (optional)
6. Send email with PDF attachment
7. Store response in Supabase
```

**Key Logging Points:**
- Line 81: `"Starting PDF generation"`
- Line 88: `"Calling generatePdfReport"` (with env vars)
- Line 98: `"generatePdfReport returned"` (buffer details)
- Line 114: `"PDF buffer generated"` (if successful)
- Line 134: `"PDF converted to base64 successfully"`
- Line 145: `"PDF generation failed - continuing without PDF"` (if error)

---

### 2. PDF Generation Function: `generatePdfReport()`
**File:** `lib/pdf/generateClientReport.ts:152`

**Parameters:**
```typescript
interface ReportData {
  clientName: string;        // From formData.firstName
  businessName: string;      // From formData.businessName
  sector: string;            // Formatted sector name
  topChallenges: ReportChallenge[];  // 2-3 challenges from sector mapping
  generatedDate: string;     // YYYY-MM-DD format
}
```

**Browser Launch Logic:**

**Production (NODE_ENV === "production"):**
```typescript
// Uses @sparticuz/chromium
executablePath = await chromium.executablePath()
args = chromium.args (with no-sandbox flags)
```

**Development (NODE_ENV !== "production"):**
```typescript
// Uses local Chrome/Edge
executablePath = process.env.CHROME_EXECUTABLE_PATH
// Throws error if CHROME_EXECUTABLE_PATH is not set
```

**Puppeteer Launch Options:**
```typescript
{
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--no-first-run",
    "--no-zygote",
    "--single-process",
    "--disable-gpu"
  ],
  timeout: 30_000,  // 30 seconds
  defaultViewport: { width: 1200, height: 1600 }
}
```

**PDF Generation:**
```typescript
await page.setContent(html, {
  waitUntil: "domcontentloaded",  // Changed from networkidle0
  timeout: 10_000
});

const pdfBuffer = await Promise.race([
  page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" }
  }),
  // Timeout after 25 seconds
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error("PDF generation timeout after 25 seconds")), 25_000)
  )
]);
```

**Error Handling:**
- Browser launch errors → Logged with `logError()`
- PDF generation timeout → Throws after 25 seconds
- Template read errors → Logged and re-thrown
- Browser close errors → Logged but not re-thrown

---

### 3. HTML Template Generation: `generateHtmlTemplate()`
**File:** `lib/pdf/generateClientReport.ts:101`

**Template Path:**
```
lib/pdf/templates/reportTemplate.html
```

**Placeholders Replaced:**
- `{{CLIENT_NAME}}` → `escapeHtml(data.clientName)`
- `{{BUSINESS_NAME}}` → `escapeHtml(data.businessName)`
- `{{SECTOR}}` → `escapeHtml(data.sector)`
- `{{GENERATED_DATE}}` → `escapeHtml(data.generatedDate)`
- `{{CHALLENGES_HTML}}` → Rendered challenge sections
- `{{RWS_LOGO_URL}}` → `${baseUrl}/images/rws-logo-transparent.png`
- `{{AVOB_BADGE_URL}}` → `${baseUrl}/images/avob-logo-transparent.png`
- `{{AVOB_LOGO_URL}}` → `${baseUrl}/images/avob-logo-transparent.png`

**Base URL Resolution:**
```typescript
const baseUrl = 
  process.env.NEXT_PUBLIC_URL 
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://rockywebstudio.com.au");
```

---

### 4. Challenge Rendering: `renderChallengesSections()`
**File:** `lib/pdf/generateClientReport.ts:57`

**Input:** Array of `ReportChallenge` objects
**Output:** HTML string with challenge sections

**Challenge Structure:**
```typescript
interface ReportChallenge {
  number: number;              // Display number (1, 2, 3)
  title: string;               // Challenge title
  sections: string[];          // Bullet points
  roiTimeline: string;         // e.g. "3–9 months"
  projectCostRange: string;    // e.g. "$10k–$30k"
}
```

---

## 🔗 Data Flow: Sector → Challenges → PDF

### Step 1: Sector Mapping
**File:** `lib/utils/sector-mapping.ts`

```typescript
getTopChallengesForSector(sector: Sector): number[]
// Returns array of challenge IDs (e.g. [1, 3, 5])
```

**Sector Mapping File:** `lib/utils/sectorMapping.ts`
- Maps each sector to 2-3 challenge IDs
- Example: `healthcare → [3, 5, 6]`

### Step 2: Challenge Details
**File:** `lib/utils/pain-point-mapping.ts`

```typescript
getChallengeDetails(ids: number[]): ChallengeDetail[]
// Returns full challenge objects with title, sections, ROI, cost
```

**Challenge Library:** Contains 10 predefined challenges (IDs 1-10)
- Each challenge has: number, title, sections[], roiTimeline, projectCostRange

### Step 3: Report Data Assembly
**File:** `app/api/questionnaire/submit/route.ts:64-70`

```typescript
const reportData: ReportData = {
  clientName: formData.firstName,
  businessName: formData.businessName,
  sector: formatSectorName(formData.sector),
  topChallenges: challengeDetails,  // From getChallengeDetails()
  generatedDate: new Date().toISOString().slice(0, 10)
};
```

---

## 🖼️ Image Assets

**Expected Images (public/images/):**
- `rws-logo-transparent.png` - Rocky Web Studio logo
- `avob-logo-transparent.png` - AVOB badge/logo

**Image URLs in PDF:**
- Production: `https://rockywebstudio.com.au/images/rws-logo-transparent.png`
- Development: `http://localhost:3000/images/rws-logo-transparent.png`
- Vercel: `https://${VERCEL_URL}/images/rws-logo-transparent.png`

**Note:** Images must be accessible via HTTP/HTTPS for Puppeteer to load them.

---

## 🐛 Common Issues & Debugging

### Issue 1: PDF Not Generating
**Symptoms:** Empty buffer, timeout, or error in logs

**Check:**
1. **Development:**
   - Is `CHROME_EXECUTABLE_PATH` set in `.env.local`?
   - Does the path exist and point to Chrome/Edge executable?
   - Check logs for: `"Puppeteer launch options (dev/prod)"`

2. **Production:**
   - Is `@sparticuz/chromium` installed?
   - Check Vercel logs for browser launch errors
   - Look for: `"Failed to generate PDF report"` in logs

3. **Both:**
   - Check timeout: PDF generation has 25-second timeout
   - Check template path: `lib/pdf/templates/reportTemplate.html` must exist
   - Check HTML generation: Look for `"generateHtmlTemplate"` errors

### Issue 2: PDF Not Attaching to Email
**Symptoms:** Email sent but no attachment

**Check:**
1. **PDF Generation:**
   - Look for: `"PDF buffer generated"` (should have non-zero length)
   - Look for: `"PDF converted to base64 successfully"` (should have length > 0)

2. **Email Attachment:**
   - Look for: `"Email options prepared with PDF attachment"` (should have `hasAttachment: true`)
   - Check attachment object:
     ```typescript
     {
       filename: "RockyWebStudio-Deep-Dive-Report.pdf",
       content: pdfBase64,  // Must be base64 string, not Buffer
       contentType: "application/pdf"  // Must be exactly "application/pdf"
     }
     ```

3. **Resend API:**
   - Check for: `"Resend email send failed"` with error details
   - Verify `RESEND_API_KEY` is valid

### Issue 3: Images Not Loading in PDF
**Symptoms:** PDF generated but logos missing

**Check:**
1. **Base URL:**
   - Verify `NEXT_PUBLIC_URL` or `VERCEL_URL` is set correctly
   - Check generated URLs in logs (should be full HTTP/HTTPS URLs)

2. **Image Files:**
   - Verify files exist: `public/images/rws-logo-transparent.png`
   - Verify files are accessible via browser at the generated URL

3. **Network:**
   - Puppeteer must be able to fetch images via HTTP/HTTPS
   - In development, ensure dev server is running on `localhost:3000`

### Issue 4: Template Not Found
**Symptoms:** `"Failed to read PDF report template"` error

**Check:**
1. **File Path:**
   - Template must be at: `lib/pdf/templates/reportTemplate.html`
   - Check file exists in project

2. **File Permissions:**
   - Ensure file is readable
   - Check file encoding (should be UTF-8)

---

## 📝 Logging Points

### In `app/api/questionnaire/submit/route.ts`:
- Line 81: `"Starting PDF generation"`
- Line 88: `"Calling generatePdfReport"` (with `hasChromePath`, `nodeEnv`)
- Line 98: `"generatePdfReport returned"` (buffer details)
- Line 114: `"PDF buffer generated"` (if successful)
- Line 134: `"PDF converted to base64 successfully"`
- Line 145: `"PDF generation failed - continuing without PDF"` (if error)
- Line 202: `"Checking PDF attachment conditions"`
- Line 230: `"Email options prepared with PDF attachment"` (or without)
- Line 271: `"About to send email via Resend"`
- Line 285: `"Email sent successfully with PDF attachment"` (or without)

### In `lib/pdf/generateClientReport.ts`:
- Line 213: `"Puppeteer launch options (dev/prod)"` (dev only)
- Line 252: `"[DEV] PDF written to disk for inspection"` (if `DEBUG_PDF=true`)
- Line 271: `"Failed to generate PDF report"` (on error)

---

## 🧪 Testing Locally

### 1. Set Environment Variables
```bash
# .env.local
CHROME_EXECUTABLE_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
DEBUG_PDF="true"  # Optional: write PDF to disk
NEXT_PUBLIC_URL="http://localhost:3000"  # Optional
```

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Submit Questionnaire
- Go to `http://localhost:3000/questionnaire`
- Fill out form and submit
- Check terminal logs for PDF generation steps

### 4. Check Output
- If `DEBUG_PDF=true`, check `test-report.pdf` in project root
- Check email for PDF attachment
- Check Supabase for stored response

---

## 🚀 Production Deployment (Vercel)

### Required Environment Variables:
- `RESEND_API_KEY` - For sending emails
- `SUPABASE_URL` - For storing responses
- `SUPABASE_SERVICE_ROLE_KEY` - For Supabase access
- `NEXT_PUBLIC_URL` - Base URL for images (optional, uses VERCEL_URL if not set)

### Not Required:
- `CHROME_EXECUTABLE_PATH` - Only needed in development
- `DEBUG_PDF` - Only for local testing

### Vercel Configuration:
- Uses `@sparticuz/chromium` automatically
- Chromium binary is bundled with the deployment
- No additional configuration needed

---

## 📋 Checklist for Debugging

- [ ] Check `CHROME_EXECUTABLE_PATH` is set (development)
- [ ] Check `NEXT_PUBLIC_URL` or `VERCEL_URL` is set (for images)
- [ ] Verify template file exists: `lib/pdf/templates/reportTemplate.html`
- [ ] Verify image files exist: `public/images/rws-logo-transparent.png`, `avob-logo-transparent.png`
- [ ] Check logs for "Starting PDF generation"
- [ ] Check logs for "PDF buffer generated" (should have length > 0)
- [ ] Check logs for "PDF converted to base64 successfully"
- [ ] Check logs for "Email options prepared with PDF attachment"
- [ ] Check logs for "Email sent successfully with PDF attachment"
- [ ] Verify `RESEND_API_KEY` is valid
- [ ] Check Vercel function logs for timeout errors (25-second limit)
- [ ] Verify `@sparticuz/chromium` is installed (production)
- [ ] Check browser launch errors in logs
- [ ] Verify images are accessible at generated URLs

---

## 🔍 Key Code Locations

1. **PDF Generation Entry Point:** `app/api/questionnaire/submit/route.ts:96`
2. **PDF Generation Function:** `lib/pdf/generateClientReport.ts:152`
3. **HTML Template Generation:** `lib/pdf/generateClientReport.ts:101`
4. **Browser Launch:** `lib/pdf/generateClientReport.ts:176-209`
5. **PDF Rendering:** `lib/pdf/generateClientReport.ts:219-244`
6. **Email Attachment:** `app/api/questionnaire/submit/route.ts:210-228`
7. **Sector Mapping:** `lib/utils/sector-mapping.ts:7`
8. **Challenge Details:** `lib/utils/pain-point-mapping.ts:126`

---

## 📞 Support

If PDF generation is still failing after checking all above:
1. Enable `DEBUG_PDF="true"` in `.env.local` to write PDF to disk
2. Check Vercel function logs for detailed error messages
3. Verify all environment variables are set correctly
4. Check that images are accessible via HTTP/HTTPS
5. Verify Puppeteer can launch browser (check executable path)
