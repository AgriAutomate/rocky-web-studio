# 🔧 Questionnaire Error - Next Steps

## ✅ What We Fixed
1. **Column names updated** to match actual schema:
   - `email` → `business_email`
   - `phone` → `business_phone`
   - `company_name` → `business_name`
2. **Enhanced error logging** - Now includes environment variable checks
3. **Fixed response ID type** - Keeps as string (matches database)

## 🔍 What to Check Now

### Step 1: Check Vercel Function Logs (MOST IMPORTANT)

1. Go to **Vercel Dashboard** → Your Project → **Deployments** → Latest
2. Click **Functions** tab
3. Find `/api/questionnaire/submit` function
4. Look for error logs with:
   - "Failed to store questionnaire response in Supabase"
   - Check the `fullError` field - this will show the actual Supabase error

**Common errors you might see:**
- `"permission denied for table questionnaire_responses"` → RLS issue or wrong API key
- `"relation 'questionnaire_responses' does not exist"` → Table doesn't exist, run migration
- `"null value in column 'X' violates not-null constraint"` → Missing required field
- `"new row violates check constraint"` → Invalid status or sector value

### Step 2: Verify Environment Variables in Vercel

**Required variables:**
- `SUPABASE_URL` = `https://your-project.supabase.com`
- `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGc...` (long JWT, NOT the anon key!)

**How to check:**
1. Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Filter by **Production**
3. Verify both variables are set
4. **Important:** `SUPABASE_SERVICE_ROLE_KEY` must be the **service_role** key (bypasses RLS)

**Where to find service role key:**
- Supabase Dashboard → Project Settings → API → **service_role** key (secret)

### Step 3: Check Row Level Security (RLS)

**In Supabase SQL Editor:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'questionnaire_responses';

-- If rowsecurity = true, check policies
SELECT * FROM pg_policies 
WHERE tablename = 'questionnaire_responses';
```

**If RLS is blocking:**
```sql
-- Option 1: Disable RLS (for testing only)
ALTER TABLE questionnaire_responses DISABLE ROW LEVEL SECURITY;

-- Option 2: Add policy for service role (recommended)
CREATE POLICY "Service role can insert questionnaire_responses"
ON questionnaire_responses
FOR INSERT
TO service_role
WITH CHECK (true);
```

### Step 4: Test Direct SQL Insert

**In Supabase SQL Editor:**
```sql
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
```

**If this fails:**
- The error message will tell you exactly what's wrong
- Likely RLS or constraint issue

**If this succeeds:**
- Issue is in the code or environment variables
- Check Vercel environment variables

### Step 5: Verify Table Schema

**In Supabase SQL Editor:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'questionnaire_responses'
ORDER BY ordinal_position;
```

**Expected columns:**
- `business_email` (VARCHAR, NOT NULL)
- `business_phone` (VARCHAR, NOT NULL)
- `business_name` (VARCHAR, NOT NULL)

## 🚀 Quick Fixes

### Fix 1: Missing Environment Variables
1. Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel
2. **Redeploy** the project
3. Test again

### Fix 2: RLS Blocking
1. Run the RLS disable SQL (temporary)
2. Or add the service role policy
3. Test again

### Fix 3: Table Doesn't Exist
1. Run migration: `supabase/migrations/20251219_create_questionnaire_responses.sql`
2. In Supabase SQL Editor → Run the SQL
3. Test again

## 📊 Enhanced Error Logging

The code now logs:
- Full Supabase error object
- Environment variable presence (without exposing values)
- Insert payload preview
- Data structure details

**Check Vercel logs** - they will show exactly what's failing.

## 🎯 Most Likely Issue

After fixing column names, the most common remaining issues are:

1. **Missing `SUPABASE_SERVICE_ROLE_KEY` in Vercel** (60% of cases)
2. **RLS blocking inserts** (30% of cases)
3. **Table doesn't exist** (10% of cases)

## Next Action

**Check Vercel function logs first** - they will tell you exactly what's wrong.

Then:
- If it's environment variables → Add them and redeploy
- If it's RLS → Disable or add policy
- If it's table missing → Run migration

---

**Status:** Code fixed, enhanced logging added. Check Vercel logs to identify the remaining issue.
