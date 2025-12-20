# Questionnaire Error Investigation Summary

## 🐛 Error: "Failed to save questionnaire response"

**Location:** Production site (rockywebstudio.com.au)  
**Route:** `/api/questionnaire/submit`  
**Function:** `storeQuestionnaireResponse()` in `lib/utils/supabase-client.ts`

---

## 🔍 Most Likely Causes

### 1. Table Doesn't Exist ⚠️ **MOST LIKELY**

The `questionnaire_responses` table may not exist in production Supabase.

**Check:**
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'questionnaire_responses'
);
```

**Fix:** Run migration `supabase/migrations/20251219_create_questionnaire_responses.sql`

---

### 2. Missing Environment Variables

**Check Vercel:**
- `SUPABASE_SERVICE_ROLE_KEY` - Required for service role access
- `SUPABASE_URL` - Required for database connection

**Fix:** Add to Vercel Dashboard → Settings → Environment Variables → Production

---

### 3. RLS (Row Level Security) Blocking

Even with service role, RLS policies might block inserts.

**Check:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'questionnaire_responses';
```

**Fix:** Disable RLS or create policy for service role

---

### 4. Schema Mismatch

Code expects specific column names/types that don't match table.

**Code expects:**
- `first_name`, `last_name`, `email`, `phone` (VARCHAR)
- `company_name`, `sector` (VARCHAR)
- `pain_points`, `challenges` (JSONB arrays)
- `status` (VARCHAR, default 'submitted')

**Fix:** Compare with actual table schema and update code or schema

---

## 🚀 Quick Fix Steps

### Step 1: Verify Table Exists

**In Supabase SQL Editor:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'questionnaire_responses';
```

**If no results:** Table doesn't exist - run migration

### Step 2: Run Migration (If Table Missing)

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of: `supabase/migrations/20251219_create_questionnaire_responses.sql`
3. Paste and execute
4. Verify table created:
   ```sql
   SELECT COUNT(*) FROM questionnaire_responses;
   ```

### Step 3: Check Environment Variables

**In Vercel Dashboard:**
- Project → Settings → Environment Variables
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set for Production
- Verify `SUPABASE_URL` is set for Production
- **Redeploy** after adding

### Step 4: Test Direct Insert

**In Supabase SQL Editor:**
```sql
INSERT INTO questionnaire_responses (
  first_name, last_name, email, phone,
  company_name, sector,
  pain_points, challenges, status
) VALUES (
  'Test', 'User', 'test@example.com', '+61400000000',
  'Test Co', 'healthcare',
  '[]'::jsonb, '[]'::jsonb, 'submitted'
) RETURNING id;
```

**If this works:** Issue is in code/environment  
**If this fails:** Issue is in table schema

---

## 📋 Files Created

1. **`supabase/migrations/20251219_create_questionnaire_responses.sql`**
   - Migration to create table if missing
   - Includes all required columns matching code expectations

2. **`QUESTIONNAIRE_ERROR_DIAGNOSTIC.md`**
   - Detailed diagnostic guide
   - Step-by-step investigation

3. **`COMET_QUESTIONNAIRE_ERROR_INVESTIGATION.md`**
   - Comet browser prompt for deeper investigation
   - 7-step investigation checklist

4. **`QUESTIONNAIRE_ERROR_QUICK_FIX.md`**
   - Quick fix guide
   - Most common issues and solutions

---

## 🎯 Next Actions

### Immediate (Do First):

1. **Check if table exists:**
   ```sql
   SELECT EXISTS (
     SELECT FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name = 'questionnaire_responses'
   );
   ```

2. **If table missing:** Run migration `supabase/migrations/20251219_create_questionnaire_responses.sql`

3. **Check Vercel environment variables:**
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_URL`

### If Still Failing:

**Use Comet Browser Prompt:**
- Open: `COMET_QUESTIONNAIRE_ERROR_INVESTIGATION.md`
- Copy the prompt
- Paste into Comet Browser
- Follow the 7-step investigation

---

## 📊 Expected Table Schema

```sql
CREATE TABLE questionnaire_responses (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  pain_points JSONB DEFAULT '[]'::jsonb,
  challenges JSONB DEFAULT '[]'::jsonb,
  job_description TEXT,
  utm_source VARCHAR(255),
  utm_campaign VARCHAR(255),
  status VARCHAR(50) DEFAULT 'submitted',
  email_sent_at TIMESTAMP WITH TIME ZONE
);
```

---

**Status:** Investigation ready  
**Priority:** High - Production error blocking form submissions  
**Next:** Check table existence, run migration if needed
