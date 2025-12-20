-- Rocky Web Studio / Questionnaire Responses Table
-- Migration: 20251219_create_questionnaire_responses.sql
--
-- Creates questionnaire_responses table if it doesn't exist
-- This table stores questionnaire form submissions

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
-- Table: questionnaire_responses
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questionnaire_responses (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Client ID (UUID for tracking)
  client_id UUID,
  
  -- Contact Information
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  business_email VARCHAR(255) NOT NULL,
  business_phone VARCHAR(50) NOT NULL,
  
  -- Business Information
  business_name VARCHAR(255) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  
  -- Questionnaire Data
  pain_points JSONB DEFAULT '[]'::jsonb,
  challenges JSONB DEFAULT '[]'::jsonb,
  job_description TEXT,
  
  -- PDF Tracking
  pdf_url VARCHAR(500),
  pdf_generated_at TIMESTAMP WITH TIME ZONE,
  
  -- Marketing Attribution
  utm_source VARCHAR(255),
  utm_campaign VARCHAR(255),
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'submitted',
  
  -- Email Tracking
  email_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT questionnaire_responses_status_values
    CHECK (status IN ('submitted', 'processed', 'sent', 'failed')),
  
  CONSTRAINT questionnaire_responses_sector_values
    CHECK (sector IN (
      'healthcare', 'manufacturing', 'mining', 'agriculture',
      'retail', 'hospitality', 'professional-services', 'construction', 'other'
    ))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_business_email
  ON public.questionnaire_responses (business_email);

CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_status
  ON public.questionnaire_responses (status);

CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_created_at
  ON public.questionnaire_responses (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_sector
  ON public.questionnaire_responses (sector);

-- Trigger for updated_at
CREATE TRIGGER trg_questionnaire_responses_set_updated_at
  BEFORE UPDATE ON public.questionnaire_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Comments
COMMENT ON TABLE public.questionnaire_responses IS 'Stores questionnaire form submissions';
COMMENT ON COLUMN public.questionnaire_responses.pain_points IS 'JSONB array of selected pain points';
COMMENT ON COLUMN public.questionnaire_responses.challenges IS 'JSONB array of challenge IDs derived from pain points';
