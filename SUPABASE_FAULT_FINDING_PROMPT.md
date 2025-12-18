# Supabase Fault Finding Prompt for Comet Browser Assistant

## Context
I'm working on a Next.js questionnaire-to-PDF workflow for Rocky Web Studio. The system:
1. Collects questionnaire data from users
2. Generates personalized PDF reports based on user-selected challenges
3. Stores questionnaire responses in Supabase
4. Uploads PDFs to Supabase Storage
5. Sends emails with PDF attachments via Resend

## Current Issue
The PDF generation workflow may be failing at the Supabase integration step. I need help diagnosing Supabase connection, storage, and database issues.

## What to Check

### 1. Supabase Connection & Authentication
- [ ] Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set correctly in environment variables
- [ ] Check if Supabase client is initializing correctly
- [ ] Verify service role key has proper permissions (not using anon key for server-side operations)
- [ ] Test basic Supabase connection with a simple query
- [ ] Check for CORS errors in browser console
- [ ] Verify Supabase project is active and not paused

### 2. Database Table Structure
- [ ] Confirm `questionnaire_responses` table exists
- [ ] Verify table schema matches the code expectations:
  - `id` (BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY)
  - `client_id` (UUID NOT NULL DEFAULT gen_random_uuid())
  - `first_name`, `last_name`, `business_name`, `business_email`, `business_phone` (TEXT)
  - `sector` (TEXT)
  - `pain_points` (TEXT[] - array)
  - `pdf_url` (TEXT)
  - `pdf_generated_at`, `email_sent_at`, `created_at`, `updated_at` (TIMESTAMP)
- [ ] Check if RLS (Row Level Security) policies are blocking inserts
- [ ] Verify service role key bypasses RLS (should work, but check)
- [ ] Test a manual INSERT query in Supabase SQL editor

### 3. Supabase Storage Configuration
- [ ] Verify storage bucket `rockywebstudio` exists
- [ ] Check bucket is set to private (not public)
- [ ] Verify storage policies allow service role to upload files
- [ ] Test manual file upload in Supabase dashboard
- [ ] Check file path format: `questionnaire-reports/[CLIENT_ID]-report-[DATE].pdf`
- [ ] Verify storage quota/limits aren't exceeded
- [ ] Check if file size limits are blocking PDF uploads (PDFs can be large)

### 4. Code-Level Issues
- [ ] Check `lib/utils/supabase-client.ts` for correct Supabase client initialization
- [ ] Verify `storeQuestionnaireResponse()` function is being called
- [ ] Check `uploadPdfToStorage()` function for correct buffer handling
- [ ] Verify error handling/logging is capturing Supabase errors
- [ ] Check if PDF buffer is being converted correctly before upload
- [ ] Verify file naming convention matches storage expectations

### 5. API Route Issues
- [ ] Check `app/api/questionnaire/submit/route.ts` for Supabase calls
- [ ] Verify Supabase operations are awaited correctly
- [ ] Check if errors are being caught and logged
- [ ] Verify response handling (don't block email send if Supabase fails)
- [ ] Check for timeout issues (Supabase operations taking too long)

### 6. Environment Variables
- [ ] Verify `.env.local` has correct Supabase credentials
- [ ] Check Vercel environment variables match local
- [ ] Verify no typos in variable names (`SUPABASE_URL` vs `SUPABASE_SERVICE_ROLE_KEY`)
- [ ] Check if variables are being loaded correctly in production

### 7. Common Supabase Errors to Look For
- **"Invalid API key"** → Wrong key or expired key
- **"Row Level Security policy violation"** → RLS blocking operation, need service role
- **"Bucket not found"** → Storage bucket doesn't exist or wrong name
- **"Storage object not found"** → File path incorrect or file doesn't exist
- **"Request timeout"** → Network issue or Supabase project paused
- **"Payload too large"** → PDF file exceeds size limits
- **"Permission denied"** → Service role key doesn't have required permissions

## Debugging Steps

1. **Test Supabase Connection**
   ```typescript
   // In Supabase SQL Editor or API route
   SELECT * FROM questionnaire_responses LIMIT 1;
   ```

2. **Test Storage Upload**
   ```typescript
   // Manual test in Supabase dashboard Storage section
   // Try uploading a test PDF file
   ```

3. **Check Logs**
   - Vercel function logs for API route errors
   - Supabase dashboard logs for database/storage errors
   - Browser console for client-side errors

4. **Verify Service Role Key**
   - Should start with `eyJ...` (JWT token)
   - Found in Supabase Dashboard → Settings → API → Service Role Key
   - Never expose in client-side code (only server-side)

5. **Test Database Insert**
   ```sql
   -- In Supabase SQL Editor
   INSERT INTO questionnaire_responses (
     first_name, last_name, business_name, business_email, sector
   ) VALUES (
     'Test', 'User', 'Test Business', 'test@example.com', 'retail'
   );
   ```

## Files to Review
- `lib/utils/supabase-client.ts` - Supabase client initialization
- `app/api/questionnaire/submit/route.ts` - Main API route with Supabase calls
- `.env.local` - Environment variables (check locally)
- Vercel Dashboard → Environment Variables (check production)

## Expected Behavior
1. Form submission → API route receives data
2. PDF generated → Buffer created successfully
3. Supabase insert → `questionnaire_responses` row created with `id` returned
4. Storage upload → PDF uploaded to `rockywebstudio/questionnaire-reports/`
5. Storage URL → Public URL retrieved and stored in database
6. Email sent → With PDF attachment

## What to Report Back
- Which step is failing?
- Exact error messages from logs
- Supabase dashboard status (project active/paused?)
- Storage bucket configuration
- Database table structure
- RLS policies on `questionnaire_responses` table
- Any successful operations vs. failed ones

---

**Use this prompt with Comet to systematically diagnose Supabase integration issues in the PDF generation workflow.**
