# AI Chat Migration Fix - service_businesses Dependency

## 🐛 Issue

The migration `20251219_create_ai_chat_support.sql` was failing with:

```
ERROR: 42P01: relation "public.service_businesses" does not exist
```

## ✅ Solution

The migration has been updated to:

1. **Remove foreign key constraints** from CREATE TABLE statements
2. **Make `business_id` nullable** (no FK constraint at creation)
3. **Add FK constraints conditionally** at the end if `service_businesses` exists

## 📝 Changes Made

### Before (Failed):
```sql
CREATE TABLE IF NOT EXISTS public.faq_knowledge_base (
  ...
  business_id BIGINT REFERENCES public.service_businesses(id) ON DELETE CASCADE,
  ...
);
```

### After (Works):
```sql
CREATE TABLE IF NOT EXISTS public.faq_knowledge_base (
  ...
  business_id BIGINT,  -- No FK constraint
  ...
);

-- Later in migration:
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'service_businesses'
  ) THEN
    ALTER TABLE public.faq_knowledge_base
    ADD CONSTRAINT faq_knowledge_base_business_id_fkey
    FOREIGN KEY (business_id) REFERENCES public.service_businesses(id) ON DELETE CASCADE;
  END IF;
END $$;
```

## 🚀 Migration Order

The migration now works regardless of whether `service_businesses` exists:

1. **If `service_businesses` doesn't exist:**
   - Tables are created without FK constraints
   - `business_id` is nullable and can be set later
   - FK constraints can be added after `service_businesses` is created

2. **If `service_businesses` exists:**
   - Tables are created without FK constraints
   - FK constraints are automatically added at the end

## ✅ Verification

Run the migration:

```bash
npm run migrate:chat
```

Then execute in Supabase SQL Editor. The migration should complete successfully.

---

**Status:** ✅ Fixed  
**Migration File:** `supabase/migrations/20251219_create_ai_chat_support.sql`  
**Last Updated:** December 2024
