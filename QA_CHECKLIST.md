# End-to-End Questionnaire QA Checklist

## Setup & Environment

### Required Environment Variables (.env.local)
```bash
RESEND_API_KEY=<your-test-key>
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
DEBUG_PDF=true
NEXT_PUBLIC_URL=http://localhost:3000
```

### Start Dev Server
```bash
pnpm install
pnpm dev
```

## 1. Questionnaire Submission Test

### Steps
1. Open `http://localhost:3000/questionnaire`
2. Complete all questions with realistic test data
3. Click Submit

### Expected Terminal Logs (in order)

#### PDF Generation
- ✅ `Starting PDF generation` (with clientName, businessName, sector)
- ✅ `PDF buffer generated` (with bufferLength > 0, bufferType: "Uint8Array")
- ✅ `PDF converted to base64 successfully` (with base64Length > 0, base64Preview)

#### Email Preparation
- ✅ `Email options prepared with PDF attachment` (when PDF succeeds)
  - `hasAttachment: true`
  - `attachmentFilename: "RockyWebStudio-Deep-Dive-Report.pdf"`
  - `attachmentContentType: "application/pdf"`
  - `attachmentSizeEstimateKB: > 0`
  - `base64Length: > 0`

#### Dev-Only Resend Logging
- ✅ `[DEV] Resend email options (sanitized)`
  - `hasAttachments: true`
  - `attachmentsCount: 1`
  - `attachments[0].filename === "RockyWebStudio-Deep-Dive-Report.pdf"`
  - `attachments[0].contentType === "application/pdf"`
  - `attachments[0].contentLength > 0`
  - `attachments[0].contentPreview: "JVBERi0xLjQKJeLjz9MK..."` (base64 preview)

#### Email Sent
- ✅ `Email sent successfully with PDF attachment`
  - `hasPdfAttachment: true`
  - `attachmentSizeEstimateKB: > 0`

#### PDF File Output (if DEBUG_PDF=true)
- ✅ `[DEV] PDF written to disk for inspection: <path>/test-report.pdf`

### Failure Cases to Verify
- If PDF generation fails: Should see `PDF generation failed - continuing without PDF` and email sent without attachment
- If base64 conversion fails: Should see `Base64 conversion produced empty string` and email sent without attachment

## 2. PDF File Verification (DEBUG_PDF=true)

### File Location
- `test-report.pdf` in project root

### Visual Checks
- ✅ Report renders without errors
- ✅ All dynamic data present (client name, business name, sector, challenges)
- ✅ RWS logo visible on cover page
- ✅ AVOB badge visible on cover page
- ✅ AVOB logo visible in footer (Page 5)
  - Width ≈ 100px
  - Height: auto
  - Centered (margin: 8px auto 0)
  - Not distorted

## 3. AVOB Logo URL Verification

### Expected URLs
- **Local Dev**: `http://localhost:3000/images/avob/AVOB_DF.png`
- **Production**: `https://www.rockywebstudio.com.au/images/avob/AVOB_DF.png`

### Code Location
- `lib/pdf/generateClientReport.ts` line 129: `AVOB_LOGO_URL` replacement

## 4. Site Footer AVOB Link Verification

### Location
- `http://localhost:3000/` (homepage footer)

### Expected HTML
```tsx
<a
  href="https://www.avob.org.au/"
  target="_blank"
  rel="noopener noreferrer"
  className="hover:underline"
>
  Certified Australian Veteran Owned Business
</a>
```

### Visual Checks
- ✅ Text is clickable
- ✅ Hover shows underline
- ✅ Click opens `https://www.avob.org.au/` in new tab

### Code Location
- `components/footer.tsx` lines 33-40

## 5. Email Template AVOB Links Verification

### Files to Check
1. `lib/email/ClientAcknowledgementEmail.tsx`
2. `lib/email-templates/components/EmailLayout.tsx`

### Expected Links
- ✅ All instances of "Certified Australian Veteran Owned Business" wrapped in:
  ```tsx
  <Link href="https://www.avob.org.au/" style={link}>
    Certified Australian Veteran Owned Business
  </Link>
  ```

### Code Locations
- `ClientAcknowledgementEmail.tsx` lines 128-133
- `EmailLayout.tsx` lines 68-73

## 6. Code Quality Checks

### Linting
```bash
pnpm lint
# Should pass (or show only known warnings)
```

### Type Checking
```bash
pnpm type-check
# Should pass with no errors
```

### Dev-Only Code Guards
- ✅ Resend payload logging: `if (process.env.NODE_ENV !== "production")`
- ✅ PDF file write: `if (process.env.NODE_ENV !== "production" && process.env.DEBUG_PDF === "true")`

## 7. Summary Comments Verification

### File: `app/api/questionnaire/submit/route.ts`
- ✅ Top-of-file comments explain:
  - PDF attachment conditions (success/no attachment/error)
  - Logging branches (success/no-PDF/error)
  - Dev-only features

## Troubleshooting

### PDF Not Attached
1. Check terminal logs for PDF generation errors
2. Verify `pdfBase64` is non-empty before email send
3. Check Resend API key is valid
4. Verify attachment object structure matches Resend API

### AVOB Logo Not Visible in PDF
1. Check base URL resolves correctly (localhost:3000 in dev)
2. Verify image file exists at expected path
3. Check Puppeteer can load external images (may need network access)
4. Inspect generated HTML template for correct `{{AVOB_LOGO_URL}}` replacement

### AVOB Links Not Working
1. Verify href is exactly `https://www.avob.org.au/` (no trailing slash issues)
2. Check React Email Link component is used (not plain `<a>`)
3. Verify styles are applied correctly
