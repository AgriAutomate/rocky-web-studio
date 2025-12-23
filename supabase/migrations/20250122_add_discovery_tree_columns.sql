-- Rocky Web Studio / Discovery Tree Extension
-- Migration: 20250122_add_discovery_tree_columns.sql
--
-- Adds JSONB columns to questionnaire_responses table to support
-- guided discovery tree and richer business profile data.
--
-- This migration is idempotent and safe for existing rows.

-- -----------------------------------------------------------------------------
-- Add new JSONB columns for discovery tree data
-- -----------------------------------------------------------------------------

-- Sector-specific operational data (h6-h10, t6-t10, r6-r10, p6-p10)
-- Stores answers from sector-specific questionnaire sections
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS sector_specific_data JSONB DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_responses.sector_specific_data IS 
  'Stores sector-specific operational answers (hospitality/trades/retail/professional-services blocks)';

-- Goals array (from q3 checkbox selections)
-- Stores selected goals as array of strings
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_responses.goals IS 
  'Array of selected goal identifiers from questionnaire q3';

-- Primary offers array (from q5 checkbox selections)
-- Stores selected business offers as array of strings
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS primary_offers JSONB DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_responses.primary_offers IS 
  'Array of selected primary business offer identifiers from questionnaire q5';

-- Business profile data
-- Structured business context: revenue, employees, years, digital maturity
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS business_profile JSONB DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_responses.business_profile IS 
  'Business profile data: annualRevenue, employeeCount, yearsInBusiness, digitalMaturity';

-- Discovery tree data
-- Stores trunk (integrations, data migration, success metrics) and branch answers
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS discovery_tree JSONB DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_responses.discovery_tree IS 
  'Guided discovery tree data: trunk (universal questions), branches (sector-specific), priorities';

-- -----------------------------------------------------------------------------
-- Create indexes for JSONB columns (optional but improves query performance)
-- -----------------------------------------------------------------------------

-- Index for querying by sector-specific data keys
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_sector_specific_data
  ON public.questionnaire_responses USING GIN (sector_specific_data);

-- Index for querying by goals
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_goals
  ON public.questionnaire_responses USING GIN (goals);

-- Index for querying by primary offers
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_primary_offers
  ON public.questionnaire_responses USING GIN (primary_offers);

-- Index for querying by business profile
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_business_profile
  ON public.questionnaire_responses USING GIN (business_profile);

-- Index for querying by discovery tree
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_discovery_tree
  ON public.questionnaire_responses USING GIN (discovery_tree);
