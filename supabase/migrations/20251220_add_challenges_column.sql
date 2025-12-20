-- Add missing 'challenges' column to questionnaire_responses table
-- Migration: 20251220_add_challenges_column.sql

-- Check if column exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'questionnaire_responses' 
      AND column_name = 'challenges'
  ) THEN
    ALTER TABLE public.questionnaire_responses
    ADD COLUMN challenges JSONB DEFAULT '[]'::jsonb;
    
    COMMENT ON COLUMN public.questionnaire_responses.challenges IS 'JSONB array of challenge IDs derived from pain points';
  END IF;
END $$;
