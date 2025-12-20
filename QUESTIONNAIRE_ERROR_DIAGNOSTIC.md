# Questionnaire Submission Error - Diagnostic Guide

## 🐛 Error: "Failed to save questionnaire response"

This error occurs when the questionnaire form submission fails to save to Supabase.

---

## 🔍 Investigation Steps

### Step 1: Check Vercel Logs

1. **Go to Vercel Dashboard:**
   - Project → Deployments → Latest deployment
   - Click "Functions" tab
   - Look for `/api/questionnaire/submit` function logs

2. **Look for these error patterns:**
   - `"Failed to store questionnaire response in Supabase"`
   - `"Database error storing questionnaire response"`
   - `"Missing SUPABASE_SERVICE_ROLE_KEY"`
   - `"Missing SUPABASE_URL"`
   - PostgreSQL error codes (e.g., `42P01` = table doesn't exist, `42501` = permission denied)

### Step 2: Check Supabase Table Exists

**Run in Supabase SQL Editor:**
```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'questionnaire_responses';

-- If table exists, check structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'questionnaire_responses'
ORDER BY ordinal_position;
```

**Expected columns:**
- `id` (BIGSERIAL or UUID)
- `first_name` (VARCHAR or TEXT)
- `last_name` (VARCHAR or TEXT)
- `email` (VARCHAR or TEXT)
- `phone` (VARCHAR or TEXT)
- `company_name` (VARCHAR or TEXT)
- `sector` (VARCHAR or TEXT)
- `pain_points` (JSONB or TEXT[])
- `challenges` (JSONB or TEXT[])
- `job_description` (TEXT, nullable)
- `utm_source` (VARCHAR, nullable)
- `utm_campaign` (VARCHAR, nullable)
- `status` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Step 3: Check RLS Policies

**Run in Supabase SQL Editor:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'questionnaire_responses';

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'questionnaire_responses';
```

**If RLS is enabled:**
- Service role key should bypass RLS
- But check if there are any policies blocking INSERT

### Step 4: Check Environment Variables

**In Vercel Dashboard:**
- Project → Settings → Environment Variables
- Verify these are set for **Production**:
  - ✅ `SUPABASE_URL`
  - ✅ `SUPABASE_SERVICE_ROLE_KEY`
  - ✅ `NEXT_PUBLIC_SUPABASE_URL` (optional, fallback)
  - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional, fallback)

**Test in Vercel Function Logs:**
```javascript
// Add temporary logging in storeQuestionnaireResponse
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING');
console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
```

### Step 5: Test Direct Insert

**Run in Supabase SQL Editor:**
```sql
-- Test insert with same structure as code
INSERT INTO questionnaire_responses (
  first_name,
  last_name,
  email,
  phone,
  company_name,
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
```

**If this fails:**
- Check column types match
- Check constraints (NOT NULL, CHECK, etc.)
- Check foreign keys

---

## 🔧 Common Issues & Fixes

### Issue 1: Table Doesn't Exist

**Error:** `relation "public.questionnaire_responses" does not exist`

**Fix:**
1. Check if table was created in a migration
2. Run migration in Supabase SQL Editor
3. Verify table exists

### Issue 2: RLS Blocking Insert

**Error:** `new row violates row-level security policy`

**Fix:**
1. Disable RLS temporarily:
   ```sql
   ALTER TABLE questionnaire_responses DISABLE ROW LEVEL SECURITY;
   ```
2. Or create policy for service role:
   ```sql
   CREATE POLICY "Allow service role inserts"
   ON questionnaire_responses
   FOR INSERT
   TO service_role
   WITH CHECK (true);
   ```

### Issue 3: Column Type Mismatch

**Error:** `column "pain_points" is of type jsonb but expression is of type text`

**Fix:**
- Ensure `pain_points` and `challenges` are sent as JSONB arrays
- Code uses: `formData.selectedPainPoints || []` which should be an array

### Issue 4: Missing Environment Variables

**Error:** `Missing SUPABASE_SERVICE_ROLE_KEY environment variable`

**Fix:**
1. Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel environment variables
2. Redeploy
3. Verify in function logs

### Issue 5: Field Name Mismatch

**Error:** `column "first_name" does not exist` or similar

**Fix:**
- Check actual column names in Supabase
- Update `storeQuestionnaireResponse` to match actual schema

---

## 🧪 Test Script

**Create test file:** `scripts/test-questionnaire-insert.ts`

```typescript
import { storeQuestionnaireResponse } from '@/lib/utils/supabase-client';

async function test() {
  const result = await storeQuestionnaireResponse({
    firstName: 'Test',
    lastName: 'User',
    businessName: 'Test Company',
    businessEmail: 'test@example.com',
    businessPhone: '+61400000000',
    sector: 'healthcare',
    selectedPainPoints: [],
  }, null, null);
  
  console.log('Result:', result);
}

test().catch(console.error);
```

**Run:**
```bash
npx ts-node scripts/test-questionnaire-insert.ts
```

---

## 📋 Comet Browser Prompt

If you need deeper investigation, use this Comet browser prompt:

```
I'm debugging a "Failed to save questionnaire response" error on my production site.

CONTEXT:
- Next.js app deployed on Vercel
- Supabase database backend
- Error occurs when submitting questionnaire form
- Route: /api/questionnaire/submit
- Function: storeQuestionnaireResponse() in lib/utils/supabase-client.ts

INVESTIGATION NEEDED:
1. Check Vercel function logs for /api/questionnaire/submit
   - Look for Supabase error messages
   - Check for missing environment variables
   - Look for PostgreSQL error codes

2. Check Supabase Dashboard:
   - Verify questionnaire_responses table exists
   - Check table schema matches code expectations
   - Verify RLS policies allow service role inserts
   - Check recent inserts (if any succeeded)

3. Check Vercel Environment Variables:
   - Verify SUPABASE_URL is set
   - Verify SUPABASE_SERVICE_ROLE_KEY is set
   - Check if variables are set for Production environment

4. Test direct database insert:
   - Try inserting a test row in Supabase SQL Editor
   - Compare error with production error

5. Check field mappings:
   - Verify column names match (snake_case)
   - Verify data types match (JSONB for arrays)
   - Check for NOT NULL constraints

Please investigate and provide:
- Exact error message from logs
- Table schema vs code expectations
- Environment variable status
- Recommended fix
```

---

## ✅ Quick Fix Checklist

- [ ] Verify `questionnaire_responses` table exists in Supabase
- [ ] Check table schema matches code expectations
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
- [ ] Verify `SUPABASE_URL` is set in Vercel
- [ ] Check RLS policies don't block service role
- [ ] Test direct SQL insert in Supabase
- [ ] Check Vercel function logs for exact error
- [ ] Verify field names match (snake_case)
- [ ] Verify data types match (JSONB for arrays)

---

**Last Updated:** December 2024  
**Status:** Diagnostic guide ready
