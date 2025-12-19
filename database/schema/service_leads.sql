-- Rocky Web Studio / Service Leads System
-- Schema: database/schema/service_leads.sql
--
-- Creates:
--  - public.service_leads (main lead capture table)
--  - public.service_bookings (booking/appointment table)
--  - public.service_types (reference/lookup table)
-- Adds:
--  - Constraints for required fields and data validation
--  - Indexes for common query patterns
--  - Foreign keys with cascade delete
--  - Auto-populating timestamps

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
-- gen_random_uuid() is provided by pgcrypto in Supabase.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- Shared trigger function for updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- Table: service_types (reference/lookup table)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_types (
  id INTEGER PRIMARY KEY,
  service_name VARCHAR(255) NOT NULL,
  service_key VARCHAR(100) UNIQUE NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  category VARCHAR(100) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for active service types lookup
CREATE INDEX IF NOT EXISTS idx_service_types_is_active
  ON public.service_types (is_active)
  WHERE is_active = true;

-- Index for service_key lookup
CREATE INDEX IF NOT EXISTS idx_service_types_service_key
  ON public.service_types (service_key);

-- Trigger for updated_at
CREATE TRIGGER trg_service_types_set_updated_at
  BEFORE UPDATE ON public.service_types
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Table: service_leads (main lead capture table)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Required contact information
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  
  -- Service details
  service_type VARCHAR(255),
  urgency VARCHAR(20), -- 'today', 'next_48h', 'next_week'
  location VARCHAR(255),
  description TEXT,
  
  -- Status and flags
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  
  -- Integration IDs
  hubspot_contact_id VARCHAR(255),
  hubspot_deal_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  
  -- UTM tracking
  utm_source VARCHAR(255),
  utm_campaign VARCHAR(255),
  
  -- Internal management
  assigned_staff VARCHAR(255),
  internal_notes TEXT,
  
  -- Constraints
  CONSTRAINT service_leads_urgency_values
    CHECK (urgency IS NULL OR urgency IN ('today', 'next_48h', 'next_week')),
  
  CONSTRAINT service_leads_status_values
    CHECK (status IN ('new', 'contacted', 'qualified', 'scheduled', 'completed', 'cancelled', 'lost'))
);

-- Indexes for service_leads
CREATE INDEX IF NOT EXISTS idx_service_leads_status
  ON public.service_leads (status);

CREATE INDEX IF NOT EXISTS idx_service_leads_email
  ON public.service_leads (email);

CREATE INDEX IF NOT EXISTS idx_service_leads_is_urgent
  ON public.service_leads (is_urgent)
  WHERE is_urgent = true;

CREATE INDEX IF NOT EXISTS idx_service_leads_created_at
  ON public.service_leads (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_service_leads_service_type
  ON public.service_leads (service_type)
  WHERE service_type IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER trg_service_leads_set_updated_at
  BEFORE UPDATE ON public.service_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Table: service_bookings (booking/appointment table)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Foreign key to service_leads
  lead_id UUID NOT NULL REFERENCES public.service_leads(id) ON DELETE CASCADE,
  
  -- Scheduling information
  scheduled_date DATE NOT NULL,
  time_window VARCHAR(100), -- e.g., '09:00-12:00', 'afternoon', 'evening'
  booking_status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  
  -- Financial information
  estimated_cost DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),
  
  -- Access and instructions
  access_instructions TEXT,
  
  -- Constraints
  CONSTRAINT service_bookings_status_values
    CHECK (booking_status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  
  CONSTRAINT service_bookings_cost_nonnegative
    CHECK (
      (estimated_cost IS NULL OR estimated_cost >= 0) AND
      (actual_cost IS NULL OR actual_cost >= 0)
    )
);

-- Indexes for service_bookings
CREATE INDEX IF NOT EXISTS idx_service_bookings_lead_id
  ON public.service_bookings (lead_id);

CREATE INDEX IF NOT EXISTS idx_service_bookings_scheduled_date
  ON public.service_bookings (scheduled_date);

CREATE INDEX IF NOT EXISTS idx_service_bookings_booking_status
  ON public.service_bookings (booking_status);

CREATE INDEX IF NOT EXISTS idx_service_bookings_lead_id_scheduled_date
  ON public.service_bookings (lead_id, scheduled_date);

-- -----------------------------------------------------------------------------
-- Sample Data: service_types
-- -----------------------------------------------------------------------------
-- Insert sample service types using UPSERT to make this idempotent
INSERT INTO public.service_types (id, service_name, service_key, base_price, category, is_active)
VALUES 
  (1, 'Emergency Service', 'emergency', 150.00, 'urgent', true),
  (2, 'Standard Service', 'standard', 100.00, 'routine', true),
  (3, 'Premium Service', 'premium', 200.00, 'premium', true),
  (4, 'Consultation', 'consultation', 75.00, 'assessment', true)
ON CONFLICT (id) DO UPDATE SET
  service_name = EXCLUDED.service_name,
  service_key = EXCLUDED.service_key,
  base_price = EXCLUDED.base_price,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Also handle conflicts on service_key
INSERT INTO public.service_types (id, service_name, service_key, base_price, category, is_active)
VALUES 
  (1, 'Emergency Service', 'emergency', 150.00, 'urgent', true),
  (2, 'Standard Service', 'standard', 100.00, 'routine', true),
  (3, 'Premium Service', 'premium', 200.00, 'premium', true),
  (4, 'Consultation', 'consultation', 75.00, 'assessment', true)
ON CONFLICT (service_key) DO UPDATE SET
  id = EXCLUDED.id,
  service_name = EXCLUDED.service_name,
  base_price = EXCLUDED.base_price,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- -----------------------------------------------------------------------------
-- Comments for documentation
-- -----------------------------------------------------------------------------
COMMENT ON TABLE public.service_leads IS 'Main table for capturing service lead information';
COMMENT ON TABLE public.service_bookings IS 'Stores booking/appointment information linked to service leads';
COMMENT ON TABLE public.service_types IS 'Reference table for available service types and pricing';

COMMENT ON COLUMN public.service_leads.status IS 'Lead status: new, contacted, qualified, scheduled, completed, cancelled, lost';
COMMENT ON COLUMN public.service_leads.urgency IS 'Urgency level: today, next_48h, next_week';
COMMENT ON COLUMN public.service_leads.is_urgent IS 'Boolean flag indicating if lead requires urgent attention (urgency = today)';

COMMENT ON COLUMN public.service_bookings.booking_status IS 'Booking status: scheduled, confirmed, in_progress, completed, cancelled, no_show';
COMMENT ON COLUMN public.service_bookings.time_window IS 'Time window for the booking (e.g., 09:00-12:00, afternoon, evening)';
