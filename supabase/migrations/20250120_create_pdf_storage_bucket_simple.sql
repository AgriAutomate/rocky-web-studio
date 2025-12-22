-- Create Supabase Storage Bucket for PDF Reports (Simple Version)
-- Migration: 20250120_create_pdf_storage_bucket_simple.sql
--
-- This is a simplified version that only creates the bucket.
-- Storage policies should be configured via Supabase Dashboard.
--
-- If you get permission errors with the full migration, use this version instead.

-- -----------------------------------------------------------------------------
-- Create Storage Bucket
-- -----------------------------------------------------------------------------
-- This creates a public bucket for PDF storage.
-- Policies can be configured via Dashboard: Storage → rockywebstudio → Policies

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rockywebstudio',
  'rockywebstudio',
  true, -- Public bucket - PDFs are accessible via public URLs
  52428800, -- 50MB file size limit
  ARRAY['application/pdf'] -- Only allow PDF files
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf'];

-- -----------------------------------------------------------------------------
-- Next Steps: Configure Policies via Dashboard
-- -----------------------------------------------------------------------------
-- After running this migration, configure policies in Supabase Dashboard:
--
-- 1. Go to: Storage → rockywebstudio → Policies
-- 2. Create these policies:
--
--    Policy 1: "Public PDF Read Access"
--    - Operation: SELECT (MUST CHECK THIS BOX in Dashboard)
--    - Target roles: public
--    - USING expression: bucket_id = 'rockywebstudio'
--      OR: bucket_id = 'rockywebstudio' AND name LIKE 'questionnaire-reports/%'
--
--    Policy 2: "Service Role PDF Upload"
--    - Operation: INSERT (MUST CHECK THIS BOX in Dashboard)
--    - Target roles: service_role
--    - WITH CHECK expression: bucket_id = 'rockywebstudio' AND name LIKE 'questionnaire-reports/%'
--
--    Policy 3: "Service Role PDF Update"
--    - Operation: UPDATE (MUST CHECK THIS BOX in Dashboard)
--    - Target roles: service_role
--    - USING expression: bucket_id = 'rockywebstudio' AND name LIKE 'questionnaire-reports/%'
--    - WITH CHECK expression: bucket_id = 'rockywebstudio' AND name LIKE 'questionnaire-reports/%'
--
--    Policy 4: "Service Role PDF Delete"
--    - Operation: DELETE (MUST CHECK THIS BOX in Dashboard)
--    - Target roles: service_role
--    - USING expression: bucket_id = 'rockywebstudio' AND name LIKE 'questionnaire-reports/%'
--
-- IMPORTANT: In Supabase Dashboard, you MUST check the operation checkbox
-- (SELECT/INSERT/UPDATE/DELETE) - the expression alone isn't enough!
--
-- Note: For public buckets, read access is usually automatic, but Policy 1 ensures it.
