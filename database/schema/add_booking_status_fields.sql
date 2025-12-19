-- Rocky Web Studio / Service Bookings Status Tracking
-- Schema: database/schema/add_booking_status_fields.sql
--
-- Extends:
--  - public.service_bookings (adds status tracking and technician fields)
-- Adds:
--  - Technician assignment fields
--  - Vehicle tracking
--  - Customer notification tracking
--  - ETA tracking
--  - Extended booking status values
--  - Indexes for performance

-- -----------------------------------------------------------------------------
-- Add New Columns to service_bookings
-- -----------------------------------------------------------------------------

-- Technician Assignment
-- Links to technician assigned to the booking
ALTER TABLE public.service_bookings
ADD COLUMN IF NOT EXISTS technician_id VARCHAR(100);

-- Technician Display Name
-- Used in customer notifications (e.g., "Your tech is Jane Smith")
ALTER TABLE public.service_bookings
ADD COLUMN IF NOT EXISTS technician_name VARCHAR(100);

-- Vehicle/Fleet Identifier
-- Vehicle ID for customer recognition and tracking
ALTER TABLE public.service_bookings
ADD COLUMN IF NOT EXISTS vehicle_id VARCHAR(50);

-- Real-time Tracking URL
-- Link to GPS tracking or real-time location (optional, for future integration)
ALTER TABLE public.service_bookings
ADD COLUMN IF NOT EXISTS tracking_url VARCHAR(255);

-- Customer Notification Timestamp
-- Tracks when last SMS/email notification was sent to prevent duplicates
ALTER TABLE public.service_bookings
ADD COLUMN IF NOT EXISTS customer_notification_sent TIMESTAMP WITH TIME ZONE;

-- Estimated Time of Arrival (in minutes)
-- Updated as technician approaches customer location
ALTER TABLE public.service_bookings
ADD COLUMN IF NOT EXISTS eta_minutes INTEGER;

-- -----------------------------------------------------------------------------
-- Update booking_status CHECK Constraint
-- -----------------------------------------------------------------------------

-- Migrate existing 'confirmed' status to 'assigned' (if any exist)
UPDATE public.service_bookings
SET booking_status = 'assigned'
WHERE booking_status = 'confirmed';

-- Drop existing constraint if it exists
ALTER TABLE public.service_bookings
DROP CONSTRAINT IF EXISTS service_bookings_status_values;

-- Add new constraint with extended status values
ALTER TABLE public.service_bookings
ADD CONSTRAINT service_bookings_status_values
  CHECK (booking_status IN (
    'scheduled',      -- Initial, confirmed booking
    'assigned',       -- Tech assigned, customer notified
    'en-route',       -- Tech on the way to location
    'completed',      -- Service finished
    'payment-pending', -- Invoice sent, awaiting payment
    'paid',           -- Payment received
    'cancelled',      -- Booking cancelled
    'in_progress',    -- Service in progress (existing)
    'no_show'         -- Customer no-show (existing)
  ));

-- -----------------------------------------------------------------------------
-- Add Constraints for New Fields
-- -----------------------------------------------------------------------------

-- ETA must be non-negative
ALTER TABLE public.service_bookings
ADD CONSTRAINT service_bookings_eta_nonnegative
  CHECK (eta_minutes IS NULL OR eta_minutes >= 0);

-- -----------------------------------------------------------------------------
-- Create Indexes for Performance
-- -----------------------------------------------------------------------------

-- Index for booking status filtering (common query pattern)
CREATE INDEX IF NOT EXISTS idx_booking_status
  ON public.service_bookings (booking_status);

-- Index for customer notification tracking (for finding unsent notifications)
CREATE INDEX IF NOT EXISTS idx_customer_notification_sent
  ON public.service_bookings (customer_notification_sent DESC)
  WHERE customer_notification_sent IS NOT NULL;

-- Index for technician assignment lookups
CREATE INDEX IF NOT EXISTS idx_service_bookings_technician_id
  ON public.service_bookings (technician_id)
  WHERE technician_id IS NOT NULL;

-- Index for vehicle tracking
CREATE INDEX IF NOT EXISTS idx_service_bookings_vehicle_id
  ON public.service_bookings (vehicle_id)
  WHERE vehicle_id IS NOT NULL;

-- Composite index for active bookings by technician
CREATE INDEX IF NOT EXISTS idx_service_bookings_technician_status
  ON public.service_bookings (technician_id, booking_status)
  WHERE technician_id IS NOT NULL
    AND booking_status IN ('assigned', 'en-route', 'in_progress');

-- Index for scheduled date + status (common query: upcoming bookings)
CREATE INDEX IF NOT EXISTS idx_service_bookings_scheduled_status
  ON public.service_bookings (scheduled_date, booking_status)
  WHERE booking_status IN ('scheduled', 'assigned', 'en-route');

-- -----------------------------------------------------------------------------
-- Comments for Documentation
-- -----------------------------------------------------------------------------

COMMENT ON COLUMN public.service_bookings.technician_id IS 'ID of technician assigned to this booking - used for SMS notifications and tracking';
COMMENT ON COLUMN public.service_bookings.technician_name IS 'Display name of technician for customer notifications (e.g., "Your tech is Jane Smith")';
COMMENT ON COLUMN public.service_bookings.vehicle_id IS 'Vehicle/fleet identifier for customer recognition and tracking';
COMMENT ON COLUMN public.service_bookings.tracking_url IS 'Link to real-time GPS tracking or location service (optional, for future integration)';
COMMENT ON COLUMN public.service_bookings.customer_notification_sent IS 'Timestamp of last SMS/email notification sent to customer - prevents duplicate notifications';
COMMENT ON COLUMN public.service_bookings.eta_minutes IS 'Estimated time of arrival in minutes - updated as technician approaches customer location';
COMMENT ON COLUMN public.service_bookings.booking_status IS 'Extended status values: scheduled, assigned, en-route, completed, payment-pending, paid, cancelled, in_progress, no_show';
