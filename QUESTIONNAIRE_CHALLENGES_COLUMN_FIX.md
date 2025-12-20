# ✅ Questionnaire Fix - Missing 'challenges' Column

## 🔍 Issue Found

**Error:** `"Could not find the 'challenges' column of 'questionnaire_responses' in the schema cache"`

**Root Cause:** The `challenges` column doesn't exist in the actual database table, but the code is trying to insert into it.

## ✅ Solution

### Step 1: Add the Missing Column

**In Supabase SQL Editor:**

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this SQL:

```sql
-- Add missing 'challenges' column to questionnaire_responses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'questionnaire_responses' 
      AND column_name = 'challenges'
  ) THEN
    ALTER TABLE public.questionnaire_responses
    ADD COLUMN challenges JSONB DEFAULT '[]'::jsonb;
    
    COMMENT ON COLUMN public.questionnaire_responses.challenges IS 'JSONB array of challenge IDs derived from pain points';
  END IF;
END $$;
```

3. Click **Run**

### Step 2: Verify Column Added

**Run this to verify:**
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'questionnaire_responses'
  AND column_name = 'challenges';
```

**Expected result:**
- `column_name`: `challenges`
- `data_type`: `jsonb`
- `column_default`: `'[]'::jsonb`

### Step 3: Test Again

1. **Test diagnostic endpoint:**
   ```
   https://rockywebstudio.com.au/api/questionnaire/test-db
   ```
   Should now show `"insertTest": { "success": true }`

2. **Test actual form:**
   - Go to questionnaire form
   - Submit
   - Should work! ✅

## 📋 What This Column Does

The `challenges` column stores:
- JSONB array of challenge IDs
- Derived from selected pain points
- Used for reporting and analysis

## ✅ Status

- ✅ Diagnostic endpoint identified the issue
- ✅ Migration file created: `supabase/migrations/20251220_add_challenges_column.sql`
- ⏳ **Action needed:** Run the SQL in Supabase SQL Editor

---

**Next Step:** Run the SQL above in Supabase SQL Editor, then test the form again!
