-- PDF Components System
-- Migration: 20251220_create_pdf_components.sql
--
-- Creates tables for storing PDF components and templates in Supabase
-- Components can be assembled dynamically to generate PDFs

-- -----------------------------------------------------------------------------
-- Table: pdf_components
-- Stores individual PDF components (header, sections, challenges, footer, etc.)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pdf_components (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Component Metadata
  component_key VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'header', 'challenge-1', 'footer'
  component_type VARCHAR(50) NOT NULL, -- 'header', 'section', 'challenge', 'footer', 'cta'
  title VARCHAR(255),
  description TEXT,
  
  -- Component Content
  content_html TEXT NOT NULL, -- HTML template with placeholders like {{businessName}}
  content_json JSONB, -- Structured data for complex components
  styles JSONB, -- CSS styles or component styling config
  
  -- Component Configuration
  display_order INTEGER DEFAULT 0, -- Order in which component appears
  is_active BOOLEAN DEFAULT TRUE,
  sector_filter VARCHAR(100)[], -- Which sectors this component applies to (empty = all)
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_component_id BIGINT REFERENCES pdf_components(id), -- For component variants
  
  -- Metadata
  created_by VARCHAR(100),
  notes TEXT
);

-- -----------------------------------------------------------------------------
-- Table: pdf_templates
-- Defines which components to use and in what order
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pdf_templates (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Template Metadata
  template_key VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'questionnaire-report', 'service-quote'
  template_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Component Assembly
  component_keys TEXT[] NOT NULL, -- Array of component_key values in order
  -- Example: ['header', 'intro', 'challenge-1', 'challenge-2', 'challenge-3', 'cta', 'footer']
  
  -- Template Configuration
  page_size VARCHAR(20) DEFAULT 'A4', -- A4, Letter, etc.
  orientation VARCHAR(10) DEFAULT 'portrait', -- portrait, landscape
  margins JSONB DEFAULT '{"top": 40, "right": 40, "bottom": 40, "left": 40}'::jsonb,
  
  -- Styling
  theme JSONB, -- Colors, fonts, spacing
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Versioning
  version INTEGER DEFAULT 1
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pdf_components_key ON pdf_components(component_key);
CREATE INDEX IF NOT EXISTS idx_pdf_components_type ON pdf_components(component_type);
CREATE INDEX IF NOT EXISTS idx_pdf_components_active ON pdf_components(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_pdf_components_order ON pdf_components(display_order);
CREATE INDEX IF NOT EXISTS idx_pdf_templates_key ON pdf_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_pdf_templates_active ON pdf_templates(is_active) WHERE is_active = TRUE;

-- Trigger for updated_at
CREATE TRIGGER trg_pdf_components_set_updated_at
  BEFORE UPDATE ON pdf_components
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_pdf_templates_set_updated_at
  BEFORE UPDATE ON pdf_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Comments
COMMENT ON TABLE pdf_components IS 'Stores reusable PDF components that can be assembled into PDFs';
COMMENT ON TABLE pdf_templates IS 'Defines which components to use and how to assemble them into PDFs';
COMMENT ON COLUMN pdf_components.content_html IS 'HTML template with placeholders like {{businessName}}, {{sector}}, etc.';
COMMENT ON COLUMN pdf_components.sector_filter IS 'Array of sectors this component applies to. Empty array = applies to all sectors.';
