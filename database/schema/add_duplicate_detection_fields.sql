-- Rocky Web Studio / Duplicate Detection & Merging
-- Schema: database/schema/add_duplicate_detection_fields.sql
--
-- Extends:
--  - public.service_leads (adds duplicate detection and merging fields)
-- Adds:
--  - Duplicate relationship tracking
--  - Merge metadata
--  - Indexes for duplicate detection queries

-- -----------------------------------------------------------------------------
-- Add New Columns to service_leads
-- -----------------------------------------------------------------------------

-- Duplicate Relationship
-- References the primary service_leads.id if this record is a duplicate
ALTER TABLE public.service_leads
ADD COLUMN IF NOT EXISTS duplicate_of UUID
  REFERENCES public.service_leads(id) ON DELETE SET NULL;

-- Merge Date
-- Timestamp when duplicate was merged into primary record
ALTER TABLE public.service_leads
ADD COLUMN IF NOT EXISTS merge_date TIMESTAMP WITH TIME ZONE;

-- Merge Notes
-- Explanation of why this record was marked as duplicate
ALTER TABLE public.service_leads
ADD COLUMN IF NOT EXISTS merge_notes TEXT;

-- Duplicate Detection Score
-- Similarity score (0-100) used for duplicate detection
ALTER TABLE public.service_leads
ADD COLUMN IF NOT EXISTS duplicate_score INTEGER;

-- Is Primary Record
-- Boolean flag indicating if this is the primary (non-duplicate) record
ALTER TABLE public.service_leads
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT true;

-- -----------------------------------------------------------------------------
-- Add Constraints for New Fields
-- -----------------------------------------------------------------------------

-- Duplicate score must be between 0 and 100
ALTER TABLE public.service_leads
ADD CONSTRAINT service_leads_duplicate_score_range
  CHECK (duplicate_score IS NULL OR (duplicate_score >= 0 AND duplicate_score <= 100));

-- Prevent circular references (record cannot be duplicate of itself)
ALTER TABLE public.service_leads
ADD CONSTRAINT service_leads_no_self_duplicate
  CHECK (duplicate_of IS NULL OR duplicate_of != id);

-- -----------------------------------------------------------------------------
-- Create Indexes for Performance
-- -----------------------------------------------------------------------------

-- Index for duplicate relationship lookups
CREATE INDEX IF NOT EXISTS idx_service_leads_duplicate_of
  ON public.service_leads (duplicate_of)
  WHERE duplicate_of IS NOT NULL;

-- Index for finding all duplicates of a primary record
CREATE INDEX IF NOT EXISTS idx_service_leads_duplicate_primary
  ON public.service_leads (duplicate_of, is_primary)
  WHERE duplicate_of IS NOT NULL;

-- Index for duplicate detection queries (phone + email)
CREATE INDEX IF NOT EXISTS idx_service_leads_phone_email
  ON public.service_leads (phone, email)
  WHERE is_primary = true;

-- Index for name similarity searches
CREATE INDEX IF NOT EXISTS idx_service_leads_name_phone
  ON public.service_leads (first_name, last_name, phone)
  WHERE is_primary = true;

-- Index for merge date tracking
CREATE INDEX IF NOT EXISTS idx_service_leads_merge_date
  ON public.service_leads (merge_date DESC)
  WHERE merge_date IS NOT NULL;

-- Index for duplicate score filtering
CREATE INDEX IF NOT EXISTS idx_service_leads_duplicate_score
  ON public.service_leads (duplicate_score DESC)
  WHERE duplicate_score IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Enable pg_trgm Extension for Similarity Matching
-- -----------------------------------------------------------------------------

-- Enable trigram extension for fuzzy name matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN index for fast similarity searches on names
CREATE INDEX IF NOT EXISTS idx_service_leads_name_similarity
  ON public.service_leads USING GIN ((first_name || ' ' || last_name) gin_trgm_ops)
  WHERE is_primary = true;

-- -----------------------------------------------------------------------------
-- Comments for Documentation
-- -----------------------------------------------------------------------------

COMMENT ON COLUMN public.service_leads.duplicate_of IS 'References primary service_leads.id if this record is a duplicate - used for merging and consolidation';
COMMENT ON COLUMN public.service_leads.merge_date IS 'Timestamp when duplicate was merged into primary record';
COMMENT ON COLUMN public.service_leads.merge_notes IS 'Explanation of why this record was marked as duplicate and merged';
COMMENT ON COLUMN public.service_leads.duplicate_score IS 'Similarity score (0-100) calculated during duplicate detection - higher score = more likely duplicate';
COMMENT ON COLUMN public.service_leads.is_primary IS 'Boolean flag indicating if this is the primary (non-duplicate) record - false for merged duplicates';
