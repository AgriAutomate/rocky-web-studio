# Questionnaire Workflow - Complete Architecture Documentation

## 🏗️ Current Architecture

### Implementation Stack

**Platform**: Next.js 16.0.10 (App Router) on Vercel
- **Runtime**: Node.js (serverless functions)
- **Route Type**: API Route (`app/api/questionnaire/submit/route.ts`)
- **Deployment**: Vercel serverless functions
- **Build System**: Turbopack

### Email Service

**Provider**: **Resend** (`resend` v6.6.0)
- **From Address**: `noreply@rockywebstudio.com.au`
- **Integration**: Direct API calls via `resend.emails.send()`
- **Email Framework**: React Email (`@react-email/components` v1.0.1)
- **Template**: `lib/email/ClientAcknowledgementEmail.tsx`
- **Attachment Support**: Base64 PDF attachments

**API Key Management**: 
- Stored in: `RESEND_API_KEY` environment variable
- Validated via: `lib/env.ts` (Zod schema)
- Access: Lazy import in route handler (prevents build-time errors)

### PDF Generation

**Technology**: **Puppeteer-core** (`puppeteer-core` v24.33.0) + **@sparticuz/chromium** (v143.0.0)

**Architecture**:
- **Production (Vercel)**: Uses `@sparticuz/chromium` - pre-built Chromium binary optimized for serverless
- **Development (Local)**: Uses local Chrome/Edge via `CHROME_EXECUTABLE_PATH` env var
- **Template**: HTML file (`lib/pdf/templates/reportTemplate.html`) with placeholder injection
- **Output**: PDF Buffer → Base64 string for email attachment

**Process Flow**:
1. Load HTML template from `lib/pdf/templates/reportTemplate.html`
2. Inject dynamic data (client name, business name, sector, challenges)
3. Launch Puppeteer browser (headless)
4. Render HTML to PDF (A4 format, 20px margins)
5. Return PDF as `Uint8Array` buffer
6. Convert to Node.js `Buffer`, then to Base64 string

**Timeout**: 15 seconds max per PDF (configurable)

### Database & Storage

**Provider**: **Supabase**
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage (S3-compatible)
- **Bucket**: `rockywebstudio`
- **Path**: `questionnaire-reports/[clientId]-report-[date].pdf`

**Table**: `questionnaire_responses`
- Fields: `id`, `client_id`, `first_name`, `last_name`, `business_name`, `business_email`, `business_phone`, `sector`, `pain_points[]`, `pdf_url`, `pdf_generated_at`, `email_sent_at`, `created_at`

**Client Creation**:
- Server-side: `createServerSupabaseClient(useServiceRole: true)` for admin operations
- Uses: `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

## 📋 Complete Workflow Steps

### Step-by-Step Process

1. **Form Submission** (`components/QuestionnaireForm.tsx`)
   - User completes multi-step questionnaire
   - Client-side validation (Zod)
   - POST to `/api/questionnaire/submit`

2. **API Route Handler** (`app/api/questionnaire/submit/route.ts`)
   - **Step 1**: Parse & Validate (100ms target)
     - Extract JSON body
     - Validate with `validateQuestionnaireFormSafe()` (Zod)
     - Return 400 JSON if validation fails
   
   - **Step 2**: Generate Report Data (100ms target)
     - Map user-selected pain points → challenge IDs
     - Fallback to sector-based challenges if no selections
     - Load challenge details from markdown files
     - Build `ReportData` object
   
   - **Step 3**: Generate PDF (8-10 seconds)
     - Call `generatePdfReport(reportData)`
     - Puppeteer renders HTML template to PDF
     - Convert PDF buffer to Base64
     - **Non-blocking**: If PDF fails, continue without it
   
   - **Step 4**: Upload PDF to Storage (2-3 seconds, optional)
     - Only if PDF generation succeeded
     - Upload to Supabase Storage bucket `rockywebstudio/questionnaire-reports/`
     - Get public URL for database storage
     - **Non-blocking**: If upload fails, continue without URL
   
   - **Step 5**: Send Email (3-5 seconds)
     - Create Resend instance
     - Render React Email component
     - Attach PDF (if generated) as Base64
     - Send via `resend.emails.send()`
     - **Non-blocking**: If email fails, log error but don't fail request
   
   - **Step 6**: Store in Supabase Database (500ms)
     - Insert questionnaire response record
     - Store PDF URL (if available)
     - Update `email_sent_at` timestamp
     - **Non-blocking**: If storage fails, log error but don't fail request
   
   - **Step 7**: Return Response (50ms)
     - Return JSON: `{ success: true, clientId, pdfGeneratedAt }`
     - Always returns JSON (never HTML error pages)

### Total Execution Time

- **Best case**: ~12-15 seconds (all steps succeed)
- **Worst case**: ~5-8 seconds (PDF fails, but other steps succeed)
- **Vercel timeout**: 30 seconds (Hobby) / 60 seconds (Pro)

## 🔌 Current Integrations

### External APIs/Services

1. **Resend API** (Email)
   - Endpoint: `resend.emails.send()`
   - Authentication: API key (`RESEND_API_KEY`)
   - Rate limits: Unknown (not documented in code)

2. **Supabase API** (Database + Storage)
   - Database: PostgreSQL via `@supabase/supabase-js` v2.87.3
   - Storage: S3-compatible API
   - Authentication: Service role key (`SUPABASE_SERVICE_ROLE_KEY`)
   - Client: Created per-request (not cached at module scope)

3. **Puppeteer/Chromium** (PDF)
   - Local dev: System Chrome/Edge
   - Production: @sparticuz/chromium binary
   - No external API calls

### Authentication & Credentials

**Management**: Environment variables via `lib/env.ts`
- **Validation**: Zod schema with lazy validation
- **Storage**: 
  - Local: `.env.local` (git-ignored)
  - Production: Vercel Environment Variables dashboard
- **Required Variables**:
  - `RESEND_API_KEY` (required)
  - `SUPABASE_URL` (required)
  - `SUPABASE_SERVICE_ROLE_KEY` (required)
  - `CHROME_EXECUTABLE_PATH` (dev only, optional)
  - `SLACK_WEBHOOK_URL` (optional)
  - `CALENDLY_URL` (optional)

**Security**:
- Service role keys never exposed to client
- All server-side operations use service role
- Client-side uses public anon key (separate from workflow)

### Error Handling & Logging

**Logging System**: Custom structured logger (`lib/utils/logger.ts`)
- **Output**: Console (stdout/stderr) + optional Slack webhook
- **Format**: JSON structured logs with metadata
- **Levels**: `info`, `error`

**Error Handling Strategy**:
- **PDF Generation**: Non-blocking - logs error, continues without PDF
- **Email Sending**: Non-blocking - logs error, continues (data still stored)
- **Supabase Storage**: Non-blocking - logs error, continues (email still sent)
- **Database Insert**: Non-blocking - logs error, but request still succeeds

**Error Logging Points**:
1. Validation failures (400) - logged with details
2. PDF generation failures - logged with full error stack
3. Email send failures - logged with Resend API error details
4. Supabase failures - logged with error codes and messages
5. Catastrophic errors - logged with full stack trace

### Volume & Performance

**Expected Throughput**:
- **Frequency**: On-demand (user-triggered form submissions)
- **Peak**: Unknown (no rate limiting implemented)
- **Average**: Likely < 10 submissions/day (SME business)

**Performance Characteristics**:
- **Cold start**: ~30 seconds (Puppeteer browser launch on Vercel)
- **Warm request**: ~12-15 seconds (PDF generation + email)
- **Bottleneck**: PDF generation (8-10 seconds) is the slowest step

**Scalability Considerations**:
- Serverless functions scale automatically
- Each request is independent (no shared state)
- PDF generation is CPU/memory intensive
- Vercel Pro plan recommended for production (60s timeout vs 30s)

## 🛠️ MCP-Specific Context

### Tools/Services MCP Would Need to Connect To

1. **File Storage** (Supabase Storage)
   - Bucket: `rockywebstudio`
   - Path: `questionnaire-reports/`
   - Operations: Upload PDF, get public URL

2. **Email API** (Resend)
   - Operations: Send email with PDF attachment
   - Authentication: API key

3. **Database** (Supabase PostgreSQL)
   - Table: `questionnaire_responses`
   - Operations: Insert record, update timestamps

4. **PDF Generation** (Puppeteer/Chromium)
   - Local: System browser executable
   - Production: @sparticuz/chromium binary
   - Operations: Render HTML to PDF buffer

### Workflow Complexity

**Type**: **Multi-step orchestrated workflow**

```
Form Submission
    ↓
Validation (Zod)
    ↓
Challenge Selection (pain points → challenge IDs)
    ↓
PDF Generation (Puppeteer)
    ↓
PDF Storage Upload (Supabase)
    ↓
Email Composition (React Email)
    ↓
Email Sending (Resend)
    ↓
Database Storage (Supabase)
    ↓
Response Return (JSON)
```

**Complexity Factors**:
- **7 distinct steps** with dependencies
- **3 external services** (Resend, Supabase DB, Supabase Storage)
- **1 heavy operation** (PDF generation with Puppeteer)
- **Non-blocking error handling** (failures don't stop workflow)
- **State management** (clientId, pdfUrl, timestamps passed between steps)

## 🐛 The Real Problem

### Primary Issue: **Module Import-Time Errors**

**Symptom**: Route returns HTML error pages instead of JSON

**Root Cause**: 
- Next.js evaluates route modules during build/import
- `lib/logger.ts` imports `env` at module scope
- `lib/env.ts` validates environment variables
- If `.env.local` missing → validation throws → Next.js renders HTML

**Why It's Hard to Fix**:
- Error happens **before** route handler code runs
- Try-catch blocks can't catch import-time errors
- Next.js catches module errors and renders HTML error pages
- Our JSON error handler never gets a chance to run

### Secondary Issues

1. **Build-Time Failures**
   - Production build fails if env vars not set locally
   - Need to distinguish build-time vs runtime errors

2. **PDF Generation Reliability**
   - Puppeteer browser launch can timeout (30s+ cold start)
   - Chromium binary may not be available in all environments
   - Large PDFs can cause memory issues

3. **Email Delivery Failures**
   - Resend API rate limits (unknown)
   - Large attachments (PDFs) may exceed size limits
   - Email delivery is async - no immediate confirmation

4. **Integration Coordination**
   - 7-step workflow with dependencies
   - Errors in one step shouldn't block others
   - Need to track state across steps (clientId, pdfUrl, etc.)

## 🔧 Current Fixes Applied

### ✅ What's Been Fixed

1. **Lazy Imports**
   - `env` and `logger` imported inside handler (not module scope)
   - Prevents import-time errors

2. **Production-Safe Environment Handling**
   - Build-time: Logs warning, allows build to complete
   - Runtime: Throws on missing vars (fail fast)
   - Development: Logs warning, throws only when accessed

3. **Route Hardening**
   - All error paths return JSON
   - Module load logging for debugging
   - Dynamic route export (`force-dynamic`)

4. **Logger Fix**
   - Removed static `env` import
   - Uses `process.env.SLACK_WEBHOOK_URL` directly (optional var)

### ❌ What's Still Failing

**Build still fails** because:
- Next.js evaluates route during "Collecting page data" phase
- Even with lazy imports, something is accessing env vars
- Need to make route completely build-safe

## 📊 Failure Points Analysis

### 1. PDF Generation Timeout
- **Risk**: High (8-10 second operation)
- **Mitigation**: Non-blocking - workflow continues without PDF
- **Impact**: Email sent without attachment, data still stored

### 2. Email Delivery Failure
- **Risk**: Medium (external API dependency)
- **Mitigation**: Non-blocking - logs error, continues
- **Impact**: Data stored, but client doesn't receive email

### 3. Supabase Storage Failure
- **Risk**: Low (usually fast, 2-3 seconds)
- **Mitigation**: Non-blocking - continues without PDF URL
- **Impact**: PDF not accessible via URL, but email attachment still works

### 4. Database Insert Failure
- **Risk**: Low (usually fast, <500ms)
- **Mitigation**: Non-blocking - logs error
- **Impact**: Data not persisted, but email still sent

### 5. Module Import Failure (Current Issue)
- **Risk**: **CRITICAL** (blocks entire route)
- **Mitigation**: Lazy imports, production-safe env handling
- **Impact**: Route returns HTML error page instead of JSON

## 🎯 Recommended Solutions

### Immediate Fix (For Engineer)

1. **Fix `.env.local` issue**:
   ```bash
   # Ensure .env.local exists with all required vars
   powershell -ExecutionPolicy Bypass -File .\scripts\sync-env-local.ps1
   ```

2. **Verify build passes**:
   ```bash
   npm run build
   ```

3. **Test route returns JSON**:
   ```bash
   node scripts/test-api-direct.js
   ```

### Long-Term Improvements

1. **Make all imports lazy** (if build still fails)
2. **Add retry logic** for PDF generation
3. **Implement queue system** for high-volume scenarios
4. **Add monitoring** (Sentry already integrated)
5. **Consider background jobs** for PDF generation (decouple from request)

## 📝 Summary

**Architecture**: Next.js API route → Puppeteer PDF → Resend Email → Supabase Storage/DB

**Current Problem**: Module import-time errors causing HTML error pages

**Root Cause**: Environment variable validation happening during module import

**Status**: Route hardened, but build still needs env vars to complete

**Next Step**: Ensure `.env.local` exists OR make build completely env-agnostic
