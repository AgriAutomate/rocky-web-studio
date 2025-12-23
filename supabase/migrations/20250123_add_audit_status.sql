-- Rocky Web Studio / Website Audit System
-- Migration: 20250123_add_audit_status.sql
--
-- Adds audit status tracking columns to questionnaire_responses table.
-- Supports explicit status tracking: pending, running, completed, failed
--
-- This migration is idempotent and safe for existing rows.

-- -----------------------------------------------------------------------------
-- Add audit status tracking columns
-- -----------------------------------------------------------------------------

-- Audit status: pending (queued), running (in progress), completed (success), failed (error)
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS audit_status TEXT DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_responses.audit_status IS 
  'Audit status: pending (queued), running (in progress), completed (success), failed (error)';

-- Timestamp when audit started running
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS audit_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_responses.audit_started_at IS 
  'Timestamp when audit started running';

-- -----------------------------------------------------------------------------
-- Create indexes for efficient querying
-- -----------------------------------------------------------------------------

-- Index for querying audits by status
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_audit_status
  ON public.questionnaire_responses (audit_status)
  WHERE audit_status IS NOT NULL;
