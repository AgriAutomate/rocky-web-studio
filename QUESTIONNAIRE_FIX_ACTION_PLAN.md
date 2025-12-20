# 🎯 Questionnaire Fix - Action Plan

## Step 1: Wait for Vercel Deployment (1-2 minutes)

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project
3. Go to **Deployments** tab
4. Wait for the latest deployment to show **"Ready"** status
5. ✅ Deployment complete when status is green

---

## Step 2: Test Diagnostic Endpoint

### Option A: Via Browser
1. Open your browser
2. Visit: `https://rockywebstudio.com.au/api/questionnaire/test-db`
   - (Replace with your actual domain if different)
3. You should see a JSON response

### Option B: Via curl (Terminal)
```bash
curl https://rockywebstudio.com.au/api/questionnaire/test-db
```

### What to Look For

**✅ If everything works:**
```json
{
  "summary": {
    "allChecksPassed": true,
    "status": "OK"
  }
}
```

**❌ If there's an issue:**
```json
{
  "checks": {
    "insertTest": {
      "success": false,
      "error": "permission denied for table questionnaire_responses",
      "errorCode": "42501"
    }
  },
  "summary": {
    "allChecksPassed": false,
    "status": "ISSUES FOUND"
  }
}
```

**📋 Copy the `error` message** - this tells you exactly what's wrong!

---

## Step 3: Check Vercel Function Logs

1. Go to **Vercel Dashboard** → Your Project
2. Click **Deployments** → Latest deployment
3. Click **Functions** tab
4. Find `/api/questionnaire/submit` in the list
5. Click on it to see logs
6. Look for errors with:
   - "Failed to store questionnaire response in Supabase"
   - Check the `fullError` field for complete details

---

## Step 4: Fix Based on Error

### Fix 1: "permission denied for table questionnaire_responses"

**This means RLS is blocking OR wrong API key**

**Solution A: Disable RLS (Quick Test)**
1. Go to **Supabase Dashboard** → SQL Editor
2. Run:
```sql
ALTER TABLE questionnaire_responses DISABLE ROW LEVEL SECURITY;
```
3. Test the form again

**Solution B: Add Service Role Policy (Recommended)**
1. Go to **Supabase Dashboard** → SQL Editor
2. Run:
```sql
CREATE POLICY "Service role can insert questionnaire_responses"
ON questionnaire_responses
FOR INSERT
TO service_role
WITH CHECK (true);
```
3. Test the form again

**Also check:** Vercel has `SUPABASE_SERVICE_ROLE_KEY` set (not anon key!)

---

### Fix 2: "relation 'questionnaire_responses' does not exist"

**This means the table doesn't exist**

**Solution:**
1. Go to **Supabase Dashboard** → SQL Editor
2. Open file: `supabase/migrations/20251219_create_questionnaire_responses.sql`
3. Copy the entire SQL content
4. Paste into Supabase SQL Editor
5. Click **Run**
6. Verify table exists:
```sql
SELECT * FROM questionnaire_responses LIMIT 1;
```
7. Test the form again

---

### Fix 3: Missing Environment Variables

**Check Vercel Environment Variables:**
1. Go to **Vercel Dashboard** → Project → **Settings** → **Environment Variables**
2. Filter by **Production**
3. Verify these exist:
   - `SUPABASE_URL` = `https://your-project.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGc...` (long JWT)

**If missing:**
1. Click **Add New**
2. Add `SUPABASE_SERVICE_ROLE_KEY`
3. Get value from: **Supabase Dashboard** → Project Settings → API → **service_role** key
4. Click **Save**
5. **Redeploy** the project (Vercel will auto-redeploy or click Redeploy button)
6. Wait for deployment
7. Test again

---

## Step 5: Test the Actual Form

1. Go to your website: `https://rockywebstudio.com.au/questionnaire`
2. Fill out the form
3. Submit
4. ✅ Should see success message
5. ✅ Check Supabase table to verify data saved

---

## Quick Checklist

- [ ] Vercel deployment complete
- [ ] Diagnostic endpoint tested (`/api/questionnaire/test-db`)
- [ ] Error message identified
- [ ] Fix applied (RLS/Env Vars/Table)
- [ ] Form tested and working
- [ ] Data appears in Supabase table

---

## Need Help?

**Share the diagnostic endpoint response** and I'll help interpret it!

The response will look like:
```json
{
  "checks": {
    "insertTest": {
      "error": "YOUR ERROR MESSAGE HERE"
    }
  }
}
```

Copy that `error` message and I can tell you exactly how to fix it.

---

**Status:** Ready to test! Follow steps 1-5 above.
