-- Create Supabase Storage Bucket for PDF Reports
-- Migration: 20250120_create_pdf_storage_bucket.sql
--
-- Creates a public storage bucket for questionnaire PDF reports.
-- This bucket will store generated PDF files that can be accessed via public URLs.

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
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Storage Policies (RLS for Storage)
-- -----------------------------------------------------------------------------

-- Policy: Allow public read access to PDFs
-- Anyone can read/download PDFs from the bucket
CREATE POLICY "Public PDF Read Access"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'rockywebstudio' AND
  (storage.foldername(name))[1] = 'questionnaire-reports'
);

-- Policy: Allow authenticated service role to upload PDFs
-- Only server-side code (using service role key) can upload
CREATE POLICY "Service Role PDF Upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'rockywebstudio' AND
  (storage.foldername(name))[1] = 'questionnaire-reports' AND
  auth.role() = 'service_role'
);

-- Policy: Allow service role to update PDFs (for replacements)
CREATE POLICY "Service Role PDF Update"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'rockywebstudio' AND
  (storage.foldername(name))[1] = 'questionnaire-reports' AND
  auth.role() = 'service_role'
);

-- Policy: Allow service role to delete PDFs (for cleanup)
CREATE POLICY "Service Role PDF Delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'rockywebstudio' AND
  (storage.foldername(name))[1] = 'questionnaire-reports' AND
  auth.role() = 'service_role'
);

-- -----------------------------------------------------------------------------
-- Comments
-- -----------------------------------------------------------------------------
COMMENT ON POLICY "Public PDF Read Access" ON storage.objects IS 
  'Allows public read access to PDF files in the questionnaire-reports folder';

COMMENT ON POLICY "Service Role PDF Upload" ON storage.objects IS 
  'Allows service role (server-side) to upload PDF files';

COMMENT ON POLICY "Service Role PDF Update" ON storage.objects IS 
  'Allows service role to update/replace PDF files';

COMMENT ON POLICY "Service Role PDF Delete" ON storage.objects IS 
  'Allows service role to delete PDF files for cleanup';
