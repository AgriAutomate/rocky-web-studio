-- Rocky Web Studio / Website Audit System
-- Migration: 20250122_add_audit_columns.sql
--
-- Adds website audit-related columns to questionnaire_responses table.
-- Supports automated website audits triggered after questionnaire submission.
--
-- This migration is idempotent and safe for existing rows.

-- -----------------------------------------------------------------------------
-- Add audit-related columns
-- -----------------------------------------------------------------------------

-- Website URL provided by client (from questionnaire q2)
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS website_url TEXT DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_responses.website_url IS 
  'Website URL provided by client in questionnaire (q2 field)';

-- Audit results stored as JSONB
-- Contains: WebsiteInfo, TechStackInfo, PerformanceMetrics, SEO metrics, etc.
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS audit_results JSONB DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_responses.audit_results IS 
  'Complete website audit results including tech stack, performance, SEO, and recommendations';

-- Timestamp when audit completed successfully
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS audit_completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_responses.audit_completed_at IS 
  'Timestamp when website audit completed successfully';

-- Error message if audit failed
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS audit_error TEXT DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_responses.audit_error IS 
  'Error message if website audit failed (timeout, invalid URL, API error, etc.)';

-- -----------------------------------------------------------------------------
-- Create indexes for efficient querying
-- -----------------------------------------------------------------------------

-- Index for querying audits by completion status
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_audit_completed_at
  ON public.questionnaire_responses (audit_completed_at DESC)
  WHERE audit_completed_at IS NOT NULL;

-- Index for querying audits with errors
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_audit_error
  ON public.questionnaire_responses (audit_error)
  WHERE audit_error IS NOT NULL;

-- Index for querying by website URL (useful for duplicate detection)
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_website_url
  ON public.questionnaire_responses (website_url)
  WHERE website_url IS NOT NULL;

-- GIN index for JSONB queries on audit_results
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_audit_results
  ON public.questionnaire_responses USING GIN (audit_results)
  WHERE audit_results IS NOT NULL;
