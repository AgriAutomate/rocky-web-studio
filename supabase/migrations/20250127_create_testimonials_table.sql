-- Create testimonials table
-- Date: January 27, 2025
-- Purpose: Creates table and indexes for testimonials CMS
-- Status: Ready for Week 5 implementation

BEGIN;

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Client Information
  client_name TEXT NOT NULL,
  client_title TEXT,
  client_company TEXT,
  client_image_url TEXT,
  
  -- Content
  content TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  
  -- Relationships
  service_type TEXT, -- 'accessibility', 'ai', 'cms', 'general'
  case_study_id UUID REFERENCES case_studies(id) ON DELETE SET NULL,
  
  -- Publishing
  published BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0, -- For manual ordering
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON testimonials(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_case_study_id ON testimonials(case_study_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON testimonials(display_order, created_at DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_service_type ON testimonials(service_type) WHERE published = true;

-- Enable Row Level Security
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Public can read published testimonials" ON testimonials;
DROP POLICY IF EXISTS "Authenticated users can read all testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
DROP POLICY IF EXISTS "Service role full access" ON testimonials;

-- Policy: Public can read published testimonials
CREATE POLICY "Public can read published testimonials"
  ON testimonials
  FOR SELECT
  USING (published = true);

-- Policy: Authenticated users can read all (for admin preview)
CREATE POLICY "Authenticated users can read all testimonials"
  ON testimonials
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Admins can manage all testimonials
CREATE POLICY "Admins can manage testimonials"
  ON testimonials
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Service role can do everything (for API)
CREATE POLICY "Service role full access"
  ON testimonials
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMIT;

