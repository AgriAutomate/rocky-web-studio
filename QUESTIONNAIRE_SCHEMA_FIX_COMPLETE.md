# Questionnaire Schema Fix - Complete ✅

## 🐛 Issue Found

**Error:** `column "email" does not exist`

**Root Cause:** Code was using column name `email` but table has `business_email`.

---

## ✅ Fix Applied

### Updated Code (`lib/utils/supabase-client.ts`)

**Changed column mappings:**
- ❌ `email` → ✅ `business_email`
- ❌ `phone` → ✅ `business_phone`
- ❌ `company_name` → ✅ `business_name`

**Updated insert payload:**
```typescript
const insertPayload = {
  first_name: formData.firstName,
  last_name: formData.lastName,
  business_email: formData.businessEmail,  // ✅ Fixed
  business_phone: formData.businessPhone,  // ✅ Fixed
  business_name: formData.businessName,    // ✅ Fixed
  sector: formData.sector,
  pain_points: formData.selectedPainPoints || [],
  challenges: challenges,
  status: 'submitted',
};
```

---

### Updated Migration (`supabase/migrations/20251219_create_questionnaire_responses.sql`)

**Schema now matches actual table structure:**
- ✅ `business_email` (not `email`)
- ✅ `business_phone` (not `phone`)
- ✅ `business_name` (not `company_name`)
- ✅ Added `client_id` (UUID, optional)
- ✅ Added `pdf_url` (VARCHAR, optional)
- ✅ Added `pdf_generated_at` (TIMESTAMP, optional)

---

## 🚀 Next Steps

### If Table Already Exists:

The code is now fixed to match the existing schema. **No migration needed** - just deploy the code fix.

### If Table Doesn't Exist:

Run the migration `supabase/migrations/20251219_create_questionnaire_responses.sql` in Supabase SQL Editor.

---

## ✅ Verification

After deploying the fix:

1. **Test form submission** on production
2. **Check Vercel logs** - should see successful insert
3. **Check Supabase** - new row should appear in `questionnaire_responses` table

---

**Status:** ✅ Code fixed to match actual schema  
**Files Changed:**
- `lib/utils/supabase-client.ts` - Updated column names
- `supabase/migrations/20251219_create_questionnaire_responses.sql` - Updated schema
- Diagnostic docs updated

**Next:** Deploy code fix to production
