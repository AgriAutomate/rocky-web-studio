# Production Build Checklist - Questionnaire Workflow

## ✅ File Inventory & Git Tracking

### Core API Route
- ✅ `app/api/questionnaire/submit/route.ts` - Main POST handler
  - Status: Tracked by Git
  - Contains: Module load logging, lazy imports, JSON-only responses

### Questionnaire Form Components
- ✅ `app/questionnaire/page.tsx` - Questionnaire page
- ✅ `components/QuestionnaireForm.tsx` - Form component
- ✅ `app/lib/questionnaireConfig.ts` - Form configuration

### PDF Generation
- ✅ `lib/pdf/generateClientReport.ts` - PDF generator
  - Status: Tracked by Git
  - Uses: Puppeteer-core, @sparticuz/chromium
- ✅ `lib/pdf/templates/reportTemplate.html` - PDF HTML template
  - Status: Tracked by Git
  - Contains: All placeholders for data injection

### Challenge Data Files
- ✅ `lib/data/challenges/index.ts` - Challenge library loader
  - Status: Tracked by Git
  - Lazy loads markdown files
- ✅ All 10 challenge markdown files:
  - `01-operating-costs.md` ✅
  - `02-cash-flow.md` ✅
  - `03-compliance.md` ✅
  - `04-digital-transform.md` ✅
  - `05-cybersecurity.md` ✅
  - `06-labour.md` ✅
  - `07-demand.md` ✅
  - `08-market-access.md` ✅
  - `09-connectivity.md` ✅
  - `10-leadership.md` ✅
  - Status: All tracked by Git

### Utility Functions
- ✅ `lib/utils/pain-point-mapping.ts` - Challenge library re-exports
- ✅ `lib/utils/pain-point-to-challenge.ts` - Pain point to challenge ID mapping
- ✅ `lib/utils/sector-mapping.ts` - Sector to challenge mapping
- ✅ `lib/utils/validators.ts` - Zod validation schemas
- ✅ `lib/utils/logger.ts` - Structured logging
- ✅ `lib/utils/supabase-client.ts` - Supabase operations
  - Status: All tracked by Git

### Supabase Integration
- ✅ `lib/supabase/client.ts` - Supabase client factory
  - Status: Tracked by Git
  - Exports: `createServerSupabaseClient()`

### Email Templates
- ✅ `lib/email/ClientAcknowledgementEmail.tsx` - React Email component
  - Status: Tracked by Git
  - Uses: React Email framework

### Environment & Types
- ✅ `lib/env.ts` - Environment variable validation
  - Status: Tracked by Git
  - **FIXED**: Now production-safe (throws in prod, logs in dev)
- ✅ `lib/types/questionnaire.ts` - TypeScript types
  - Status: Tracked by Git

### Configuration Files
- ✅ `.env.local.example` - Environment variable template
  - Status: Exists (not git-ignored)
- ✅ `.gitignore` - Correctly ignores `.env.local` (secrets)

## ✅ Production-Safe Environment Handling

### lib/env.ts Changes

**Before (Problem):**
- Threw errors in development during module import
- Caused Next.js to render HTML error pages
- Route handler never got chance to return JSON

**After (Fixed):**
- **Production**: Throws immediately on missing vars (fail fast)
- **Development**: Logs warning, throws only when env vars are accessed
- Route handler can catch errors and return JSON

### Key Changes:

1. **getEnv() function**:
   - Production: Throws immediately
   - Development: Stores error info, returns marker object

2. **Proxy getter**:
   - Checks for missing vars marker
   - Throws helpful error when property accessed
   - Route handler catches and returns JSON

3. **Lazy imports in route**:
   - `env` and `logger` imported inside handler
   - Prevents module-load-time errors

## ✅ Import Chain Verification

All imports resolve correctly:

```
route.ts
├── @/lib/utils/validators ✅
├── @/lib/utils/sector-mapping ✅
├── @/lib/utils/pain-point-mapping ✅
│   └── @/lib/data/challenges/index.ts ✅
│       └── lib/data/challenges/*.md (10 files) ✅
├── @/lib/utils/pain-point-to-challenge ✅
├── @/lib/pdf/generateClientReport ✅
│   └── lib/pdf/templates/reportTemplate.html ✅
├── @/lib/utils/supabase-client ✅
│   └── @/lib/supabase/client ✅
├── @/lib/email/ClientAcknowledgementEmail ✅
├── @/lib/env ✅ (lazy import)
├── @/lib/utils/logger ✅ (lazy import)
└── @/lib/types/questionnaire ✅
```

## ✅ .gitignore Verification

Checked `.gitignore` - correctly configured:
- ✅ Ignores `.env.local` (secrets)
- ✅ Ignores `.env.*.local` (local overrides)
- ✅ **Does NOT ignore**:
  - `lib/**` (all utility files)
  - `app/**` (all route files)
  - `lib/data/**` (challenge markdown files)
  - `lib/pdf/**` (PDF templates)
  - `.env.local.example` (template file)

## ✅ Production Build Steps

### 1. Type Check
```bash
npm run type-check
```
Status: ✅ Passes

### 2. Lint Check
```bash
npm run lint
```
Status: ⏳ To be run

### 3. Production Build
```bash
npm run build
```
Status: ⏳ To be run

## 🔧 Required Environment Variables (Vercel)

These must be set in Vercel project settings:

### Required:
- `RESEND_API_KEY` - Resend email API key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for server-side operations)

### Optional:
- `NEXT_PUBLIC_SUPABASE_URL` - Public Supabase URL (for client-side)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Supabase anon key (for client-side)
- `NEXT_PUBLIC_URL` - Base URL for PDF image URLs
- `SLACK_WEBHOOK_URL` - Slack notifications (optional)
- `CALENDLY_URL` - Calendly integration (optional)

## 📝 Files Created/Modified

### Modified:
1. `lib/env.ts` - Made production-safe (throws in prod, logs in dev)
2. `app/api/questionnaire/submit/route.ts` - Already hardened with lazy imports

### Verified (No Changes Needed):
- All challenge markdown files ✅
- PDF template ✅
- Email component ✅
- Supabase client ✅
- All utility functions ✅

## 🚀 Next Steps

1. **Run production build**:
   ```bash
   npm run build
   ```

2. **Fix any build errors** (especially missing modules)

3. **Verify environment variables** are set in Vercel:
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Ensure all required vars are set

4. **Deploy and test**:
   - Deploy to Vercel
   - Test questionnaire submission
   - Verify PDF generation
   - Verify email sending
   - Verify Supabase storage

## ✅ Summary

- ✅ All required files are tracked by Git
- ✅ No critical files are git-ignored
- ✅ Environment handling is production-safe
- ✅ Lazy imports prevent module-load-time errors
- ✅ Route handler always returns JSON
- ✅ TypeScript compiles without errors

**Ready for production build!** 🎉
