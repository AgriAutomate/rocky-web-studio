# Perplexity Comet Browser - Audit Data Missing Debug Prompt

## Context
I'm debugging a Next.js application where website audit data should appear in a PDF report but is not showing up. The audit system uses Google PageSpeed Insights API and runs asynchronously after questionnaire submission.

## Expected Behavior
1. User submits questionnaire with website URL (q2 field)
2. Questionnaire response is saved to database
3. Website audit is triggered asynchronously (fire-and-forget POST to `/api/audit-website`)
4. PDF is generated immediately after submission
5. PDF should include audit data section showing:
   - Performance scores
   - Detected platform/CMS
   - Top issues/recommendations
   - Or status message if audit is pending/running

## Actual Behavior
PDF is generated successfully but contains NO audit data section at all. The audit section doesn't appear even as "pending" or "running".

## Key Files to Investigate

### 1. Questionnaire Submit Route
**File:** `app/api/questionnaire/submit/route.ts`
- Line ~340-370: PDF generation happens here
- Line ~343-375: Audit data fetching before PDF generation
- Line ~420-468: Audit trigger (fire-and-forget POST request)
- **Key Question:** Is `auditDataForPDF` being populated correctly? Is it null/undefined?

### 2. PDF Generation Service
**File:** `lib/pdf/generateFromComponents.ts`
- Line ~44-102: `generatePDFFromComponents()` function
- Line ~73-82: Creates PDF document element with props
- **Key Question:** Is `auditData` prop being passed correctly to the PDF component?

### 3. PDF Document Component
**File:** `lib/pdf/PDFDocument.tsx`
- Line ~144-170: `PDFDocumentProps` interface includes `auditData?`
- Line ~218-226: Component receives `auditData = null` as prop
- Line ~295-350: Audit section rendering logic
- **Key Question:** Is the conditional `{auditData && ...}` evaluating correctly? Why might it not render?

### 4. Audit Service
**File:** `lib/services/audit-service.ts`
- Line ~439: API key check: `process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_PAGESPEED_API_KEY`
- Line ~438-500: `getPageSpeedMetrics()` function
- **Key Question:** Is the API key being read correctly? Is the audit actually running?

### 5. Audit API Route
**File:** `app/api/audit-website/route.ts`
- Line ~232-290: 24-hour idempotency check
- Line ~299-310: Fire-and-forget audit trigger
- **Key Question:** Is the audit POST request actually being sent? Is it succeeding?

## Specific Debugging Questions

1. **Timing Issue:**
   - The audit is triggered AFTER the PDF is generated. Could this be a race condition?
   - The code fetches audit data before PDF generation (line ~343), but the audit trigger happens AFTER (line ~420). Is this the issue?

2. **Data Flow:**
   - When `auditDataForPDF` is fetched (line ~346), what does the database query return?
   - Is `auditResponse` null, undefined, or an empty object?
   - Is `auditDataForPDF` being set correctly before being passed to PDF generation?

3. **Conditional Rendering:**
   - In `PDFDocument.tsx` line ~295, the condition is `{auditData && ...}`
   - If `auditData` is `null` (the default), the section won't render
   - Should we show a section even when audit hasn't started yet?

4. **Environment Variables:**
   - The API key is in `.env.local` as `GOOGLE_PAGESPEED_API_KEY`
   - The code checks `process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_PAGESPEED_API_KEY`
   - Is the environment variable accessible in the serverless function context?

5. **Audit Trigger:**
   - The audit trigger uses `void fetch()` (fire-and-forget)
   - Is the fetch request actually being sent?
   - Are there any CORS or network errors preventing the audit from starting?

## Code Flow to Trace

```
1. Questionnaire submitted → app/api/questionnaire/submit/route.ts
2. Response saved → responseId obtained
3. PDF generation starts → Line ~340
4. Audit data fetch attempted → Line ~343-375
   - Queries: audit_results, audit_status, audit_error, website_url
   - Sets auditDataForPDF
5. PDF generated with auditData → Line ~376
6. Audit trigger sent (async) → Line ~420-468
   - POST to /api/audit-website
   - Sets audit_status to "pending"
7. Audit runs in background → lib/services/audit-service.ts
8. Audit completes → Updates database with audit_results
```

## What to Check

1. **Database State:**
   - Query `questionnaire_responses` table for the specific response ID
   - Check: `audit_status`, `audit_results`, `audit_error`, `website_url`
   - Is `website_url` populated? Is `audit_status` set?

2. **Server Logs:**
   - Look for "Could not fetch audit data for PDF" log messages
   - Look for "Website audit triggered" log messages
   - Look for any errors in audit service execution

3. **Network Requests:**
   - Check if POST to `/api/audit-website` is being made
   - Check response status codes
   - Check for any fetch errors

4. **Environment Variables:**
   - Verify `GOOGLE_PAGESPEED_API_KEY` is set in Vercel environment variables
   - Check if it's accessible in serverless function context
   - Verify the API key format is correct

## Expected Output

Please help me identify:
1. Why `auditData` might be null/undefined when PDF is generated
2. Whether the audit trigger is actually firing
3. If there are any errors preventing audit execution
4. Whether the conditional rendering logic is correct
5. Any timing/race condition issues
6. Environment variable access issues

Provide specific code locations, potential fixes, and debugging steps to resolve this issue.
