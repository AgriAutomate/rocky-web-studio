-- Create Supabase Storage Bucket for PDF Reports
-- Migration: 20250120_create_pdf_storage_bucket.sql
--
-- Creates a public storage bucket for questionnaire PDF reports.
-- This bucket will store generated PDF files that can be accessed via public URLs.
--
-- NOTE: Storage policies must be created via Supabase Dashboard or with proper permissions.
-- This migration creates the bucket only. Policies should be configured via Dashboard.

-- -----------------------------------------------------------------------------
-- Create Storage Bucket
-- -----------------------------------------------------------------------------
-- Note: This requires the storage extension to be enabled in Supabase
-- If the bucket already exists, this will not error (idempotent)

-- Insert bucket configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rockywebstudio',
  'rockywebstudio',
  true, -- Public bucket - PDFs are accessible via public URLs
  52428800, -- 50MB file size limit (PDFs should be much smaller)
  ARRAY['application/pdf'] -- Only allow PDF files
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf'];

-- -----------------------------------------------------------------------------
-- Storage Policies (RLS for Storage)
-- -----------------------------------------------------------------------------
-- NOTE: Creating policies on storage.objects requires owner permissions.
-- If you get "must be owner of relation objects" error, skip this section
-- and create policies via Supabase Dashboard instead (see instructions below).
--
-- For public buckets, read access is automatically granted.
-- We only need policies for INSERT/UPDATE/DELETE operations.

-- Try to create policies (will fail gracefully if permissions are insufficient)
DO $$
BEGIN
  -- Drop existing policies if they exist (for idempotency)
  DROP POLICY IF EXISTS "Public PDF Read Access" ON storage.objects;
  DROP POLICY IF EXISTS "Service Role PDF Upload" ON storage.objects;
  DROP POLICY IF EXISTS "Service Role PDF Update" ON storage.objects;
  DROP POLICY IF EXISTS "Service Role PDF Delete" ON storage.objects;

  -- Policy: Allow public read access to PDFs
  -- Note: For public buckets, this is usually automatic, but we'll create it explicitly
  EXECUTE $$
    CREATE POLICY "Public PDF Read Access"
    ON storage.objects
    FOR SELECT
    TO public
    USING (
      bucket_id = 'rockywebstudio' AND
      (storage.foldername(name))[1] = 'questionnaire-reports'
    )
  $$;

  -- Policy: Allow service role to upload PDFs
  EXECUTE $$
    CREATE POLICY "Service Role PDF Upload"
    ON storage.objects
    FOR INSERT
    TO service_role
    WITH CHECK (
      bucket_id = 'rockywebstudio' AND
      (storage.foldername(name))[1] = 'questionnaire-reports'
    )
  $$;

  -- Policy: Allow service role to update PDFs
  EXECUTE $$
    CREATE POLICY "Service Role PDF Update"
    ON storage.objects
    FOR UPDATE
    TO service_role
    USING (
      bucket_id = 'rockywebstudio' AND
      (storage.foldername(name))[1] = 'questionnaire-reports'
    )
  $$;

  -- Policy: Allow service role to delete PDFs
  EXECUTE $$
    CREATE POLICY "Service Role PDF Delete"
    ON storage.objects
    FOR DELETE
    TO service_role
    USING (
      bucket_id = 'rockywebstudio' AND
      (storage.foldername(name))[1] = 'questionnaire-reports'
    )
  $$;

EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Insufficient privileges to create storage policies. Please create them via Supabase Dashboard.';
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating storage policies: %. Policies should be created via Supabase Dashboard.', SQLERRM;
END $$;

-- -----------------------------------------------------------------------------
-- Alternative: Create Policies via Dashboard
-- -----------------------------------------------------------------------------
-- If the policy creation above fails, create policies manually via Dashboard:
--
-- 1. Go to: Supabase Dashboard → Storage → rockywebstudio → Policies
-- 2. Click "New Policy"
-- 3. Create these 4 policies:
--
--    Policy 1: "Public PDF Read Access"
--    - Operation: SELECT
--    - Target roles: public
--    - USING expression: bucket_id = 'rockywebstudio' AND (storage.foldername(name))[1] = 'questionnaire-reports'
--
--    Policy 2: "Service Role PDF Upload"
--    - Operation: INSERT
--    - Target roles: service_role
--    - WITH CHECK expression: bucket_id = 'rockywebstudio' AND (storage.foldername(name))[1] = 'questionnaire-reports'
--
--    Policy 3: "Service Role PDF Update"
--    - Operation: UPDATE
--    - Target roles: service_role
--    - USING expression: bucket_id = 'rockywebstudio' AND (storage.foldername(name))[1] = 'questionnaire-reports'
--
--    Policy 4: "Service Role PDF Delete"
--    - Operation: DELETE
--    - Target roles: service_role
--    - USING expression: bucket_id = 'rockywebstudio' AND (storage.foldername(name))[1] = 'questionnaire-reports'
--
-- Note: For public buckets, read access is usually automatic, but Policy 1 ensures it.
