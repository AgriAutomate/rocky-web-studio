# 🔍 Questionnaire Error - Complete Debugging Guide

## Current Status
- ✅ Column names fixed (`business_email`, `business_phone`, `business_name`)
- ✅ Enhanced error logging added
- ✅ Diagnostic endpoint created
- ❌ Still getting "Failed to save questionnaire response"

## 🚀 Quick Diagnostic (START HERE)

### Step 1: Run Diagnostic Endpoint

**Visit this URL:**
```
https://your-domain.com/api/questionnaire/test-db
```

Or locally:
```
http://localhost:3000/api/questionnaire/test-db
```

**This will show you:**
- ✅ Environment variables status
- ✅ Supabase client creation
- ✅ Table access permissions
- ✅ **Exact insert error** (if any)
- ✅ RLS status notes

### Step 2: Check the Response

**Look for `insertTest` in the response:**

```json
{
  "checks": {
    "insertTest": {
      "success": false,
      "error": "permission denied for table questionnaire_responses",
      "errorCode": "42501",
      "fullError": "{ ... }"
    }
  }
}
```

**The `error` field tells you exactly what's wrong!**

## 🔧 Common Errors & Fixes

### Error 1: "permission denied for table questionnaire_responses"

**Cause:** RLS blocking OR wrong API key

**Fix:**
```sql
-- In Supabase SQL Editor
-- Option 1: Disable RLS (temporary)
ALTER TABLE questionnaire_responses DISABLE ROW LEVEL SECURITY;

-- Option 2: Add service role policy (recommended)
CREATE POLICY "Service role can insert questionnaire_responses"
ON questionnaire_responses
FOR INSERT
TO service_role
WITH CHECK (true);
```

**Also check:** Vercel has `SUPABASE_SERVICE_ROLE_KEY` set (not anon key!)

---

### Error 2: "relation 'questionnaire_responses' does not exist"

**Cause:** Table doesn't exist

**Fix:**
1. Open Supabase SQL Editor
2. Run migration: `supabase/migrations/20251219_create_questionnaire_responses.sql`
3. Verify table exists:
```sql
SELECT * FROM questionnaire_responses LIMIT 1;
```

---

### Error 3: "null value in column 'X' violates not-null constraint"

**Cause:** Missing required field

**Fix:** Check the payload structure matches the table schema

---

### Error 4: "new row violates check constraint"

**Cause:** Invalid `status` or `sector` value

**Fix:** 
- `status` must be: `submitted`, `processed`, `sent`, or `failed`
- `sector` must be one of: `healthcare`, `manufacturing`, `mining`, `agriculture`, `retail`, `hospitality`, `professional-services`, `construction`, `other`

---

## 📊 Enhanced Logging

The code now logs detailed errors to Vercel function logs:

**Check Vercel Logs:**
1. Vercel Dashboard → Project → Deployments → Latest
2. Click **Functions** tab
3. Find `/api/questionnaire/submit`
4. Look for: "Failed to store questionnaire response in Supabase"
5. Check `fullError` field for complete details

## 🎯 Most Likely Issues (After Column Fix)

1. **Missing `SUPABASE_SERVICE_ROLE_KEY` in Vercel** (60%)
   - Check Vercel → Settings → Environment Variables
   - Must be **service_role** key (not anon key)
   - Redeploy after adding

2. **RLS Blocking Inserts** (30%)
   - Run diagnostic endpoint to confirm
   - Disable RLS or add service role policy

3. **Table Doesn't Exist** (10%)
   - Run migration in Supabase SQL Editor

## ✅ Action Plan

1. **Run diagnostic endpoint** → See exact error
2. **Check Vercel logs** → See full error details
3. **Fix based on error** → Follow fixes above
4. **Test again** → Should work!

---

## 📝 Files Changed

- ✅ `lib/utils/supabase-client.ts` - Fixed column names, enhanced logging
- ✅ `app/api/questionnaire/submit/route.ts` - Better error messages
- ✅ `app/api/questionnaire/test-db/route.ts` - **NEW diagnostic endpoint**
- ✅ Migration file updated with correct schema

---

**Next Step:** Run `/api/questionnaire/test-db` to see exactly what's failing!
