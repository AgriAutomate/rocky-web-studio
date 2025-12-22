-- Create Clients Table
-- Migration: 20250122_create_clients_table.sql
--
-- Creates a clients table for client management and CRM functionality.
-- This table is separate from questionnaire_responses and can be used
-- for ongoing client relationship management.

-- -----------------------------------------------------------------------------
-- Ensure set_updated_at() function exists (required for trigger)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Table: clients
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Business Information
  business_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone VARCHAR(50),
  
  -- Sector and Classification
  sector_slug VARCHAR(100) NOT NULL,
  
  -- Goals and Challenges (stored as arrays)
  goal_slugs TEXT[] DEFAULT '{}',
  challenge_slugs TEXT[] DEFAULT '{}',
  
  -- PDF Generation Status
  pdf_generation_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  pdf_url TEXT,
  pdf_generated_at TIMESTAMP WITH TIME ZONE,
  
  -- Sales Pipeline
  sales_stage VARCHAR(50) NOT NULL DEFAULT 'lead',
  
  -- Assignment and Notes
  assigned_to TEXT, -- User ID or email of assigned staff member
  notes TEXT,
  
  -- Link to questionnaire response (optional)
  questionnaire_response_id BIGINT REFERENCES public.questionnaire_responses(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT clients_pdf_generation_status_values
    CHECK (pdf_generation_status IN ('pending', 'processing', 'completed', 'failed')),
  
  CONSTRAINT clients_sales_stage_values
    CHECK (sales_stage IN ('lead', 'qualified', 'proposal', 'won', 'lost')),
  
  CONSTRAINT clients_sector_slug_values
    CHECK (sector_slug IN (
      'professional-services',
      'healthcare-allied',
      'hospitality',
      'retail',
      'automotive-mechanical',
      'trades-construction',
      'education-training',
      'non-profit-community',
      'agriculture-rural',
      'veterans-defence',
      'arts-music-creative',
      'government-council',
      'fitness-wellness',
      'real-estate-property',
      'transport-logistics',
      'events-entertainment'
    ))
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

-- Unique index on contact email
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_contact_email
  ON public.clients (contact_email);

-- Index on PDF generation status (for filtering)
CREATE INDEX IF NOT EXISTS idx_clients_pdf_generation_status
  ON public.clients (pdf_generation_status);

-- Index on sales stage (for pipeline management)
CREATE INDEX IF NOT EXISTS idx_clients_sales_stage
  ON public.clients (sales_stage);

-- Index on assigned_to (for staff assignment filtering)
CREATE INDEX IF NOT EXISTS idx_clients_assigned_to
  ON public.clients (assigned_to) WHERE assigned_to IS NOT NULL;

-- Index on created_at (for sorting)
CREATE INDEX IF NOT EXISTS idx_clients_created_at
  ON public.clients (created_at DESC);

-- Index on sector (for sector-based filtering)
CREATE INDEX IF NOT EXISTS idx_clients_sector_slug
  ON public.clients (sector_slug);

-- Index on questionnaire_response_id (for linking)
CREATE INDEX IF NOT EXISTS idx_clients_questionnaire_response_id
  ON public.clients (questionnaire_response_id) WHERE questionnaire_response_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Trigger for updated_at
-- -----------------------------------------------------------------------------
CREATE TRIGGER trg_clients_set_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Comments
-- -----------------------------------------------------------------------------
COMMENT ON TABLE public.clients IS 'Client management table for CRM and sales pipeline tracking';
COMMENT ON COLUMN public.clients.pdf_generation_status IS 'Status of PDF report generation';
COMMENT ON COLUMN public.clients.sales_stage IS 'Current stage in sales pipeline';
COMMENT ON COLUMN public.clients.assigned_to IS 'User ID or email of assigned sales rep/staff member';
COMMENT ON COLUMN public.clients.goal_slugs IS 'Array of goal slugs selected by client';
COMMENT ON COLUMN public.clients.challenge_slugs IS 'Array of challenge slugs identified for client';
