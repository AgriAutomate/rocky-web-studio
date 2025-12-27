-- Create case_studies table
-- Date: January 26, 2025
-- Purpose: Creates table and indexes for case studies CMS
-- Status: Ready for Week 4 implementation

BEGIN;

-- Create case_studies table
CREATE TABLE IF NOT EXISTS case_studies (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content JSONB, -- Portable Text or Markdown stored as JSON
  
  -- Categorization
  category TEXT, -- 'accessibility', 'ai', 'cms', 'general'
  featured BOOLEAN DEFAULT false,
  
  -- Publishing
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'archived'
  published_at TIMESTAMPTZ,
  
  -- Metrics (for case study results)
  before_metrics JSONB, -- { axe_violations: 6, lighthouse_score: 72, ... }
  after_metrics JSONB,  -- { axe_violations: 0, lighthouse_score: 98, ... }
  
  -- Media
  hero_image_url TEXT,
  images JSONB, -- Array of image objects: [{ url, alt, caption }]
  
  -- Testimonial
  testimonial_text TEXT,
  testimonial_author TEXT,
  testimonial_company TEXT,
  testimonial_author_role TEXT,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies(slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_status ON case_studies(status);
CREATE INDEX IF NOT EXISTS idx_case_studies_featured ON case_studies(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_case_studies_category ON case_studies(category);
CREATE INDEX IF NOT EXISTS idx_case_studies_published ON case_studies(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_case_studies_created ON case_studies(created_at DESC);

-- Full-text search index (for search functionality)
CREATE INDEX IF NOT EXISTS idx_case_studies_search ON case_studies USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content::text, ''))
);

-- Enable Row Level Security
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Public can read published case studies" ON case_studies;
DROP POLICY IF EXISTS "Authenticated users can read all case studies" ON case_studies;
DROP POLICY IF EXISTS "Admins can manage case studies" ON case_studies;
DROP POLICY IF EXISTS "Service role full access" ON case_studies;

-- Policy: Public can read published case studies
CREATE POLICY "Public can read published case studies"
  ON case_studies
  FOR SELECT
  USING (status = 'published');

-- Policy: Authenticated users can read all (for admin preview)
CREATE POLICY "Authenticated users can read all case studies"
  ON case_studies
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Admins can manage all case studies
CREATE POLICY "Admins can manage case studies"
  ON case_studies
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
  ON case_studies
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMIT;


