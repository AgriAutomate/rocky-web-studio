-- Rocky Web Studio / Service Leads System
-- Migration: add_lead_scoring_fields.sql
--
-- Adds lead scoring and engagement tracking fields to service_leads table
-- Run this in Supabase SQL Editor after initial schema is created
--
-- Creates:
--  - Lead scoring fields (engagement_score, urgency_score)
--  - Qualification tracking (qualification_status)
--  - Source attribution (lead_source)
--  - Engagement tracking (last_engagement_date, engagement_count)
--  - Conversion tracking (conversion_date, conversion_value, roi_per_source)
-- Adds:
--  - Indexes for common query patterns
--  - Constraints for data validation

-- -----------------------------------------------------------------------------
-- Add Lead Scoring Fields
-- -----------------------------------------------------------------------------

-- Engagement Score (0-100)
-- Calculated by scoring workflow based on lead behavior
ALTER TABLE public.service_leads
ADD COLUMN IF NOT EXISTS engagement_score INTEGER NOT NULL DEFAULT 0;

-- Add constraint for valid range
ALTER TABLE public.service_leads
ADD CONSTRAINT service_leads_engagement_score_range
  CHECK (engagement_score >= 0 AND engagement_score <= 100);

-- Urgency Score (0-30)
-- Based on urgency field value and time sensitivity
ALTER TABLE public.service_leads
ADD COLUMN IF NOT EXISTS urgency_score INTEGER NOT NULL DEFAULT 0;

-- Add constraint for valid range
ALTER TABLE public.service_leads
ADD CONSTRAINT service_leads_urgency_score_range
  CHECK (urgency_score >= 0 AND urgency_score <= 30);

-- -----------------------------------------------------------------------------
-- Add Qualification Status
-- -----------------------------------------------------------------------------

-- Qualification Status
-- Determines routing in sales process
ALTER TABLE public.service_leads
ADD COLUMN IF NOT EXISTS qualification_status VARCHAR(20) NOT NULL DEFAULT 'new';

-- Add constraint for valid values
ALTER TABLE public.service_leads
ADD CONSTRAINT service_leads_qualification_status_values
  CHECK (qualification_status IN ('new', 'hot', 'warm', 'cold', 'won', 'rejected'));

-- Update existing records to have default status
UPDATE public.service_leads
SET qualification_status = 'new'
WHERE qualification_status IS NULL;

-- -----------------------------------------------------------------------------
-- Add Lead Source Attribution
-- -----------------------------------------------------------------------------

-- Lead Source
-- Categorized source from utm_source or other tracking
ALTER TABLE public.service_leads
ADD COLUMN IF NOT EXISTS lead_source VARCHAR(50);

-- Add constraint for valid values
ALTER TABLE public.service_leads
ADD CONSTRAINT service_leads_lead_source_values
  CHECK (lead_source IS NULL OR lead_source IN ('organic', 'paid_ad', 'referral', 'direct', 'partnership'));

-- -----------------------------------------------------------------------------
-- Add Engagement Tracking
-- -----------------------------------------------------------------------------

-- Last Engagement Date
-- Updates when lead opens email, clicks link, replies, etc.
-- Used for dormancy detection
ALTER TABLE public.service_leads
ADD COLUMN IF NOT EXISTS last_engagement_date TIMESTAMP WITH TIME ZONE;

-- Engagement Count
-- Track how many times lead has engaged
-- More engagements = warmer lead
ALTER TABLE public.service_leads
ADD COLUMN IF NOT EXISTS engagement_count INTEGER NOT NULL DEFAULT 0;

-- Add constraint for non-negative count
ALTER TABLE public.service_leads
ADD CONSTRAINT service_leads_engagement_count_nonnegative
  CHECK (engagement_count >= 0);

-- -----------------------------------------------------------------------------
-- Add Conversion Tracking
-- -----------------------------------------------------------------------------

-- Conversion Date
-- Set when lead becomes "won"
-- Null if not yet converted
ALTER TABLE public.service_leads
ADD COLUMN IF NOT EXISTS conversion_date TIMESTAMP WITH TIME ZONE;

-- Conversion Value
-- Total revenue from this lead
-- Sum of all related bookings
ALTER TABLE public.service_leads
ADD COLUMN IF NOT EXISTS conversion_value DECIMAL(10, 2);

-- Add constraint for non-negative value
ALTER TABLE public.service_leads
ADD CONSTRAINT service_leads_conversion_value_nonnegative
  CHECK (conversion_value IS NULL OR conversion_value >= 0);

-- ROI Per Source
-- Calculated metric: revenue / marketing_cost
-- Used for attribution reporting
ALTER TABLE public.service_leads
ADD COLUMN IF NOT EXISTS roi_per_source DECIMAL(5, 2);

-- -----------------------------------------------------------------------------
-- Add Nurture Email Tracking
-- -----------------------------------------------------------------------------

-- Nurture Stage Tracking
-- Track which emails in the nurture sequence have been sent
ALTER TABLE public.service_leads
ADD COLUMN IF NOT EXISTS nurture_stage_1_sent BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.service_leads
ADD COLUMN IF NOT EXISTS nurture_stage_2_sent BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.service_leads
ADD COLUMN IF NOT EXISTS nurture_stage_3_sent BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.service_leads
ADD COLUMN IF NOT EXISTS nurture_stage_4_sent BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.service_leads
ADD COLUMN IF NOT EXISTS nurture_stage_5_sent BOOLEAN NOT NULL DEFAULT false;

-- -----------------------------------------------------------------------------
-- Create Indexes for Performance
-- -----------------------------------------------------------------------------

-- Index for qualification status filtering
CREATE INDEX IF NOT EXISTS idx_service_leads_qualification_status
  ON public.service_leads (qualification_status);

-- Index for engagement score sorting (descending for hottest leads first)
CREATE INDEX IF NOT EXISTS idx_service_leads_engagement_score
  ON public.service_leads (engagement_score DESC);

-- Index for last engagement date (for dormancy detection)
CREATE INDEX IF NOT EXISTS idx_service_leads_last_engagement_date
  ON public.service_leads (last_engagement_date DESC)
  WHERE last_engagement_date IS NOT NULL;

-- Composite index for common query: qualification + engagement score
CREATE INDEX IF NOT EXISTS idx_service_leads_qualification_engagement
  ON public.service_leads (qualification_status, engagement_score DESC);

-- Index for lead source analysis
CREATE INDEX IF NOT EXISTS idx_service_leads_lead_source
  ON public.service_leads (lead_source)
  WHERE lead_source IS NOT NULL;

-- Index for conversion tracking
CREATE INDEX IF NOT EXISTS idx_service_leads_conversion_date
  ON public.service_leads (conversion_date DESC)
  WHERE conversion_date IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Comments for Documentation
-- -----------------------------------------------------------------------------

COMMENT ON COLUMN public.service_leads.engagement_score IS 'Lead engagement score (0-100) calculated by scoring workflow based on behavior';
COMMENT ON COLUMN public.service_leads.urgency_score IS 'Urgency score (0-30) based on urgency field value and time sensitivity';
COMMENT ON COLUMN public.service_leads.qualification_status IS 'Qualification status: new, hot, warm, cold, won, rejected - determines sales routing';
COMMENT ON COLUMN public.service_leads.lead_source IS 'Categorized lead source: organic, paid_ad, referral, direct, partnership';
COMMENT ON COLUMN public.service_leads.last_engagement_date IS 'Last time lead engaged (email open, link click, reply, etc.) - used for dormancy detection';
COMMENT ON COLUMN public.service_leads.engagement_count IS 'Total number of times lead has engaged - more engagements = warmer lead';
COMMENT ON COLUMN public.service_leads.conversion_date IS 'Date when lead converted to "won" status - null if not yet converted';
COMMENT ON COLUMN public.service_leads.conversion_value IS 'Total revenue from this lead (sum of all related bookings)';
COMMENT ON COLUMN public.service_leads.roi_per_source IS 'Calculated ROI metric: revenue / marketing_cost - used for attribution reporting';
COMMENT ON COLUMN public.service_leads.nurture_stage_1_sent IS 'Email 2 (Day 3) sent flag - tracks "Here''s what makes us different" email';
COMMENT ON COLUMN public.service_leads.nurture_stage_2_sent IS 'Email 3 (Day 7) sent flag - tracks "See what our customers say" email';
COMMENT ON COLUMN public.service_leads.nurture_stage_3_sent IS 'Email 4 (Day 14) sent flag - tracks "Special offer ending Sunday" email';
COMMENT ON COLUMN public.service_leads.nurture_stage_4_sent IS 'Email 5 (Day 28) sent flag - tracks "One last chance" email';
COMMENT ON COLUMN public.service_leads.nurture_stage_5_sent IS 'Reserved for future email stages';
