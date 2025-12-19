-- Rocky Web Studio / Add Service Duration Field
-- Schema: database/schema/add_service_duration_field.sql
--
-- Extends:
--  - public.service_types (adds estimated duration for scheduling)
-- Adds:
--  - estimated_duration_minutes field for scheduling calculations

-- -----------------------------------------------------------------------------
-- Add Estimated Duration Field
-- -----------------------------------------------------------------------------

ALTER TABLE public.service_types
ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER NOT NULL DEFAULT 60;

-- Update existing service types with default durations
UPDATE public.service_types
SET estimated_duration_minutes = CASE
  WHEN service_key = 'emergency' THEN 120  -- 2 hours
  WHEN service_key = 'standard' THEN 90    -- 1.5 hours
  WHEN service_key = 'premium' THEN 180    -- 3 hours
  WHEN service_key = 'consultation' THEN 60 -- 1 hour
  ELSE 60
END
WHERE estimated_duration_minutes = 60;

-- Add constraint for positive duration
ALTER TABLE public.service_types
ADD CONSTRAINT service_types_duration_positive
  CHECK (estimated_duration_minutes > 0);

-- Create index for duration queries
CREATE INDEX IF NOT EXISTS idx_service_types_duration
  ON public.service_types (estimated_duration_minutes);

-- -----------------------------------------------------------------------------
-- Comments for Documentation
-- -----------------------------------------------------------------------------

COMMENT ON COLUMN public.service_types.estimated_duration_minutes IS 'Estimated service duration in minutes - used for scheduling and capacity calculations';
