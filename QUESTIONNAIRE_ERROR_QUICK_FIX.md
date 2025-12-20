# Questionnaire Error - Quick Fix Guide

## 🚨 Immediate Actions

### Step 1: Check if Table Exists

**Run in Supabase SQL Editor:**
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'questionnaire_responses'
);
```

**If returns `false`:**
- Table doesn't exist - run migration below

**If returns `true`:**
- Table exists - check schema mismatch (see Step 2)

---

### Step 2: Create Table (If Missing)

**Run migration in Supabase SQL Editor:**
- Copy contents of: `supabase/migrations/20251219_create_questionnaire_responses.sql`
- Paste and execute in Supabase SQL Editor

**Or run directly:**
```sql
-- See: supabase/migrations/20251219_create_questionnaire_responses.sql
-- Copy entire file contents and run
```

---

### Step 3: Verify Environment Variables

**In Vercel Dashboard:**
1. Go to: Project → Settings → Environment Variables
2. Verify these are set for **Production**:
   - ✅ `SUPABASE_URL` = `https://xxx.supabase.co`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY` = `eyJ...` (starts with eyJ)
3. If missing, add them
4. **Redeploy** after adding

---

### Step 4: Check RLS (Row Level Security)

**Run in Supabase SQL Editor:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'questionnaire_responses';
```

**If `rowsecurity = true` and you're using service role:**
- Service role should bypass RLS automatically
- But if issues persist, temporarily disable:
  ```sql
  ALTER TABLE questionnaire_responses DISABLE ROW LEVEL SECURITY;
  ```

---

### Step 5: Test Direct Insert

**Run in Supabase SQL Editor:**
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
- Check exact error message
- Compare column names/types with code expectations
- Fix schema or update code

---

## 🔧 Most Likely Issues

### Issue 1: Table Doesn't Exist ⚠️ MOST LIKELY

**Symptom:** Error `relation "public.questionnaire_responses" does not exist`

**Fix:** Run migration `supabase/migrations/20251219_create_questionnaire_responses.sql`

---

### Issue 2: Missing Environment Variable

**Symptom:** Error `Missing SUPABASE_SERVICE_ROLE_KEY`

**Fix:** Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel environment variables

---

### Issue 3: Column Type Mismatch

**Symptom:** Error `column "pain_points" is of type jsonb but expression is of type text`

**Fix:** Ensure code sends arrays as JSONB:
```typescript
pain_points: formData.selectedPainPoints || [], // Should be array
challenges: challenges, // Should be array
```

---

### Issue 4: RLS Blocking Insert

**Symptom:** Error `new row violates row-level security policy`

**Fix:** Disable RLS or create policy for service role

---

## 📋 Verification Checklist

After fixes:

- [ ] Table exists in Supabase
- [ ] Table schema matches code expectations
- [ ] Environment variables set in Vercel
- [ ] Direct SQL insert works
- [ ] Form submission works on production
- [ ] Check Vercel logs for success

---

**Priority:** High - Production error  
**Next Step:** Run migration if table missing, or use Comet prompt for deeper investigation
