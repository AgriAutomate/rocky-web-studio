# 🔍 Deep Diagnostic: "Failed to save questionnaire response"

## Current Status
- ✅ Column names fixed (`business_email`, `business_phone`, `business_name`)
- ❌ Still getting "Failed to save questionnaire response" error

## Error Location
**File:** `app/api/questionnaire/submit/route.ts`
- Line 170: Returns error when `responseId` is null
- Line 189: Returns error when database exception occurs

## Root Cause Analysis

The error occurs when `storeQuestionnaireResponse()` returns `null`. This function returns `null` in these cases:

1. **Missing required fields** (line 132-138)
2. **Supabase insert error** (line 190-201)
3. **No data returned** (line 204-210)
4. **No ID in data** (line 216-222)

## Most Likely Causes (After Column Fix)

### 1. Row Level Security (RLS) Blocking Insert
**Check:**
```sql
-- In Supabase SQL Editor
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'questionnaire_responses';

-- If rowsecurity = true, check policies:
SELECT * FROM pg_policies 
WHERE tablename = 'questionnaire_responses';
```

**Fix if RLS is blocking:**
```sql
-- Option 1: Disable RLS temporarily (for testing)
ALTER TABLE questionnaire_responses DISABLE ROW LEVEL SECURITY;

-- Option 2: Add policy for service role (recommended)
CREATE POLICY "Service role can insert questionnaire_responses"
ON questionnaire_responses
FOR INSERT
TO service_role
WITH CHECK (true);
```

### 2. Missing Environment Variables
**Check Vercel:**
- `SUPABASE_URL` - Must be set
- `SUPABASE_SERVICE_ROLE_KEY` - Must be set (NOT anon key!)

**Verify in code:**
The `createServerSupabaseClient(true)` should use service role key. Check `lib/supabase/client.ts` to confirm.

### 3. Table Still Has Wrong Schema
**Check actual table structure:**
```sql
-- In Supabase SQL Editor
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'questionnaire_responses'
ORDER BY ordinal_position;
```

**Compare with expected:**
- `business_email` (VARCHAR, NOT NULL)
- `business_phone` (VARCHAR, NOT NULL)
- `business_name` (VARCHAR, NOT NULL)

### 4. Constraint Violation
**Check constraints:**
```sql
-- Check status constraint
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%questionnaire_responses%';

-- Check sector constraint values
-- Must be one of: healthcare, manufacturing, mining, agriculture, retail, hospitality, professional-services, construction, other
```

## Immediate Debug Steps

### Step 1: Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Deployments → Latest → Functions
2. Find `/api/questionnaire/submit` function logs
3. Look for:
   - "Failed to store questionnaire response in Supabase"
   - Error message, error code, error details
   - Payload keys being sent

### Step 2: Test Direct Insert in Supabase
```sql
-- Run in Supabase SQL Editor
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
- Check the error message
- Likely RLS or constraint issue

**If this succeeds:**
- Issue is in the code or environment variables
- Check Vercel environment variables

### Step 3: Add Enhanced Error Logging

Temporarily add more detailed error logging to see the actual Supabase error:

```typescript
// In lib/utils/supabase-client.ts, around line 190
if (error) {
  await logger.error("Failed to store questionnaire response in Supabase", { 
    error: error.message,
    errorCode: error.code,
    errorDetails: error.details,
    errorHint: error.hint,
    // ADD THESE:
    fullErrorObject: JSON.stringify(error, null, 2),
    supabaseUrl: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
    insertPayload: JSON.stringify(insertPayload, null, 2),
  });
  return null;
}
```

### Step 4: Verify Environment Variables in Vercel

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Verify these are set for **Production**:
   - `SUPABASE_URL` = `https://your-project.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGc...` (long JWT token)
3. **Redeploy** after adding/updating variables

## Quick Fix Checklist

- [ ] Check Vercel logs for actual error message
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel (not anon key)
- [ ] Check if RLS is enabled and blocking inserts
- [ ] Test direct SQL insert in Supabase
- [ ] Verify table schema matches code expectations
- [ ] Check sector value is valid (one of the allowed values)
- [ ] Redeploy after fixing environment variables

## Expected Error Messages

If you see these in logs, here's what they mean:

- **"relation 'questionnaire_responses' does not exist"** → Table doesn't exist, run migration
- **"permission denied for table questionnaire_responses"** → RLS blocking or wrong key
- **"column 'X' does not exist"** → Schema mismatch (should be fixed now)
- **"new row violates check constraint"** → Invalid status or sector value
- **"null value in column 'X' violates not-null constraint"** → Missing required field

## Next Steps

1. **Check Vercel function logs** - This will show the actual Supabase error
2. **Run the SQL test insert** - Confirms if it's a code issue or database issue
3. **Verify environment variables** - Most common cause after schema fixes
4. **Check RLS policies** - Second most common cause

---

**Priority:** Check Vercel logs first - they will tell us exactly what's failing.
