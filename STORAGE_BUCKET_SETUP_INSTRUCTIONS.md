# 📦 Supabase Storage Bucket Setup Instructions

**Issue:** `ERROR: 42501: must be owner of relation objects`

This error occurs because creating storage policies requires owner permissions. Here's how to set up the storage bucket properly.

---

## ✅ Solution: Two-Step Setup

### Step 1: Create Bucket via SQL (This Works)

Run this SQL in Supabase SQL Editor:

```sql
-- Create Storage Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rockywebstudio',
  'rockywebstudio',
  true, -- Public bucket
  52428800, -- 50MB file size limit
  ARRAY['application/pdf'] -- Only allow PDF files
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf'];
```

**This should work without permission errors.**

---

### Step 2: Create Policies via Dashboard (Recommended)

Since SQL policy creation requires owner permissions, create policies via the Supabase Dashboard:

#### 1. Navigate to Storage
- Go to: **Supabase Dashboard → Storage → rockywebstudio**
- If bucket doesn't exist, create it first (Step 1 above)

#### 2. Create Policies
Click **"Policies"** tab, then **"New Policy"** for each:

---

#### Policy 1: Public PDF Read Access

**Settings:**
- **Policy Name:** `Public PDF Read Access`
- **Operation:** `SELECT`
- **Target roles:** `public`
- **USING expression:**
  ```sql
  bucket_id = 'rockywebstudio' AND (storage.foldername(name))[1] = 'questionnaire-reports'
  ```

**Purpose:** Allows anyone to read/download PDFs from the bucket.

---

#### Policy 2: Service Role PDF Upload

**Settings:**
- **Policy Name:** `Service Role PDF Upload`
- **Operation:** `INSERT`
- **Target roles:** `service_role`
- **WITH CHECK expression:**
  ```sql
  bucket_id = 'rockywebstudio' AND (storage.foldername(name))[1] = 'questionnaire-reports'
  ```

**Purpose:** Allows server-side code (using service role key) to upload PDFs.

---

#### Policy 3: Service Role PDF Update

**Settings:**
- **Policy Name:** `Service Role PDF Update`
- **Operation:** `UPDATE`
- **Target roles:** `service_role`
- **USING expression:**
  ```sql
  bucket_id = 'rockywebstudio' AND (storage.foldername(name))[1] = 'questionnaire-reports'
  ```

**Purpose:** Allows server-side code to update/replace PDFs.

---

#### Policy 4: Service Role PDF Delete

**Settings:**
- **Policy Name:** `Service Role PDF Delete`
- **Operation:** `DELETE`
- **Target roles:** `service_role`
- **USING expression:**
  ```sql
  bucket_id = 'rockywebstudio' AND (storage.foldername(name))[1] = 'questionnaire-reports'
  ```

**Purpose:** Allows server-side code to delete PDFs for cleanup.

---

## 🔍 Verification

### Check Bucket Exists

```sql
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'rockywebstudio';
```

**Expected Result:**
- `id`: `rockywebstudio`
- `name`: `rockywebstudio`
- `public`: `true`
- `file_size_limit`: `52428800`
- `allowed_mime_types`: `{application/pdf}`

### Check Policies Exist

```sql
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%PDF%';
```

**Expected Result:** 4 policies listed

---

## 🚀 Alternative: Use Simple Migration

If you prefer, use the simplified migration file:

**File:** `supabase/migrations/20250120_create_pdf_storage_bucket_simple.sql`

This file:
- ✅ Creates the bucket (no permission issues)
- ✅ Provides instructions for Dashboard policy creation
- ✅ No policy creation attempts (avoids permission errors)

---

## 📝 Quick Setup Checklist

- [ ] Run bucket creation SQL (Step 1)
- [ ] Verify bucket exists in Dashboard
- [ ] Create Policy 1: Public PDF Read Access
- [ ] Create Policy 2: Service Role PDF Upload
- [ ] Create Policy 3: Service Role PDF Update
- [ ] Create Policy 4: Service Role PDF Delete
- [ ] Test PDF upload via API
- [ ] Verify PDF URL in database

---

## ✅ Success Criteria

After setup, you should be able to:

1. ✅ Upload PDFs via API (`/api/questionnaire/submit`)
2. ✅ Access PDFs via public URLs
3. ✅ See storage URLs in `questionnaire_responses.pdf_url` column
4. ✅ Download PDFs from confirmation page

---

## 🆘 Troubleshooting

### Error: "Bucket not found"
- **Solution:** Run Step 1 SQL to create the bucket

### Error: "Permission denied" when uploading
- **Solution:** Verify Policy 2 (Service Role PDF Upload) exists

### Error: "Cannot read PDF" (404)
- **Solution:** Verify Policy 1 (Public PDF Read Access) exists and bucket is public

### PDFs still using base64 URLs
- **Solution:** Check API logs for upload errors, verify storage bucket exists

---

**Setup Complete!** Once the bucket and policies are configured, PDFs will automatically upload to Supabase Storage.
