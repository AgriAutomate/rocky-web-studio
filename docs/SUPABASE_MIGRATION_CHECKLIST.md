# Supabase Migration Checklist

## ⚠️ CRITICAL: Run These Migrations Before Using Admin UI

The admin UI for Case Studies and Testimonials requires these database tables to exist. If you haven't run the migrations yet, the admin pages will fail.

## Required Migrations

### 1. Case Studies Table
**File:** `supabase/migrations/20250126_create_case_studies_table.sql`
**Status:** ⏳ **NEEDS TO BE RUN**

### 2. Testimonials Table  
**File:** `supabase/migrations/20250127_create_testimonials_table.sql`
**Status:** ⏳ **NEEDS TO BE RUN**

## How to Run Migrations

### Option A: Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. For each migration file:
   - Open the file: `supabase/migrations/20250126_create_case_studies_table.sql`
   - Copy the entire SQL content
   - Paste into SQL Editor
   - Click **Run**
   - Repeat for `20250127_create_testimonials_table.sql`

### Option B: Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or run migrations individually
supabase migration up
```

### Option C: Direct Database Connection

If you have direct database access, run the SQL files directly.

## Verify Migrations Ran Successfully

Run these queries in Supabase SQL Editor to verify:

```sql
-- Check case_studies table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'case_studies';

-- Check testimonials table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'testimonials';

-- Check RLS policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('case_studies', 'testimonials');
```

## What Happens If Migrations Aren't Run?

- ❌ Admin pages (`/admin/case-studies`, `/admin/testimonials`) will show errors
- ❌ API routes will return 500 errors
- ❌ Public pages will show "No data available" or errors
- ✅ The build will succeed (migrations don't affect build)
- ✅ The code is ready, just needs database tables

## After Running Migrations

1. ✅ Tables will be created with all columns
2. ✅ RLS policies will be set up (public read, admin write)
3. ✅ Indexes will be created for performance
4. ✅ You can start using the admin UI immediately

## Quick Test

After running migrations, test by:

1. Go to `/admin/case-studies` - should show empty list (no errors)
2. Go to `/admin/testimonials` - should show empty list (no errors)
3. Try creating a test case study or testimonial

If you see errors, check:
- Migration ran completely (check Supabase dashboard)
- Environment variables are set correctly
- You're logged in as admin user

