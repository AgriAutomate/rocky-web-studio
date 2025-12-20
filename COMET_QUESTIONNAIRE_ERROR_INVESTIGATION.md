# Comet Browser Prompt: Questionnaire Error Investigation

## 🎯 Use This Prompt in Comet Browser

Copy and paste this entire prompt into Comet Browser to investigate the questionnaire submission error:

---

```
I'm debugging a production error: "Failed to save questionnaire response" on rockywebstudio.com.au.

CONTEXT:
- Next.js app on Vercel
- Supabase PostgreSQL database
- Error occurs when submitting questionnaire form at /api/questionnaire/submit
- Function: storeQuestionnaireResponse() in lib/utils/supabase-client.ts
- Uses service role key: createServerSupabaseClient(true)

INVESTIGATION TASKS:

1. CHECK VERCEL FUNCTION LOGS
   - Go to: Vercel Dashboard → Project → Deployments → Latest → Functions tab
   - Find: /api/questionnaire/submit function logs
   - Look for:
     * "Failed to store questionnaire response in Supabase"
     * "Database error storing questionnaire response"
     * PostgreSQL error codes (42P01, 42501, 23502, etc.)
     * "Missing SUPABASE_SERVICE_ROLE_KEY"
     * "Missing SUPABASE_URL"
   - Copy the EXACT error message, error code, and stack trace

2. CHECK SUPABASE TABLE EXISTS
   - Go to: Supabase Dashboard → SQL Editor
   - Run:
     SELECT table_name 
     FROM information_schema.tables 
     WHERE table_schema = 'public' 
       AND table_name = 'questionnaire_responses';
   - If table doesn't exist, that's the problem
   - If table exists, get full schema:
     SELECT column_name, data_type, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_schema = 'public' 
       AND table_name = 'questionnaire_responses'
     ORDER BY ordinal_position;

3. CHECK RLS POLICIES
   - Run in Supabase SQL Editor:
     SELECT tablename, rowsecurity 
     FROM pg_tables 
     WHERE schemaname = 'public' 
       AND tablename = 'questionnaire_responses';
   - If RLS is enabled (rowsecurity = true):
     SELECT policyname, cmd, roles, qual, with_check
     FROM pg_policies
     WHERE schemaname = 'public' 
       AND tablename = 'questionnaire_responses';
   - Service role should bypass RLS, but verify

4. CHECK VERCEL ENVIRONMENT VARIABLES
   - Go to: Vercel Dashboard → Project → Settings → Environment Variables
   - Verify these are set for PRODUCTION:
     * SUPABASE_URL (should be https://xxx.supabase.co)
     * SUPABASE_SERVICE_ROLE_KEY (should start with eyJ...)
     * NEXT_PUBLIC_SUPABASE_URL (optional fallback)
     * NEXT_PUBLIC_SUPABASE_ANON_KEY (optional fallback)
   - Note which ones are MISSING

5. TEST DIRECT SQL INSERT
   - Run in Supabase SQL Editor:
     INSERT INTO questionnaire_responses (
       first_name,
       last_name,
       business_email,
       business_phone,
       business_name,
       sector,
       pain_points,
       challenges,
       status
     ) VALUES (
       'Test',
       'User',
       'test@example.com',
       '+61400000000',
       'Test Company',
       'healthcare',
       '[]'::jsonb,
       '[]'::jsonb,
       'submitted'
     ) RETURNING id;
   - If this fails, note the exact error
   - If this succeeds, the issue is in the code/environment

6. CHECK FIELD MAPPINGS
   - Code expects these columns (snake_case):
     * first_name, last_name, business_email, business_phone
     * business_name, sector
     * pain_points (JSONB array)
     * challenges (JSONB array)
     * job_description (optional TEXT)
     * utm_source, utm_campaign (optional VARCHAR)
     * status (VARCHAR, default 'submitted')
   - Compare with actual table schema from step 2
   - Note any mismatches

7. CHECK RECENT ERRORS IN SUPABASE
   - Go to: Supabase Dashboard → Logs → Postgres Logs
   - Filter for errors in last 24 hours
   - Look for INSERT errors on questionnaire_responses

EXPECTED OUTPUT:
- Exact error message from Vercel logs
- Table existence status
- Table schema (all columns with types)
- RLS status and policies
- Missing environment variables
- SQL insert test result
- Field mapping mismatches
- Recommended fix

Please investigate all 7 tasks and provide a detailed report with recommended fix.
```

---

## 🔍 Quick Manual Checks

While waiting for Comet investigation, you can check:

### 1. Vercel Environment Variables
- Go to Vercel Dashboard → Settings → Environment Variables
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set for Production

### 2. Supabase Table
- Go to Supabase Dashboard → Table Editor
- Check if `questionnaire_responses` table exists
- If missing, you need to create it

### 3. Test Locally
```bash
# Set in .env.local
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key

# Test the route
curl -X POST http://localhost:3000/api/questionnaire/submit \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "businessName": "Test Co",
    "businessEmail": "test@example.com",
    "businessPhone": "+61400000000",
    "sector": "healthcare",
    "selectedPainPoints": []
  }'
```

---

**Status:** Ready for Comet investigation  
**Priority:** High - Production error blocking form submissions
