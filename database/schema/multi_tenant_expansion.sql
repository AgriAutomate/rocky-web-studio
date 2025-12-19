-- Rocky Web Studio / Multi-Tenant Portfolio Expansion
-- Schema: database/schema/multi_tenant_expansion.sql
--
-- Creates:
--  - public.service_categories (service category taxonomy)
--  - public.service_businesses (multi-tenant business accounts)
-- Extends:
--  - public.service_types (adds multi-service fields)
--  - public.service_leads (adds business_id for tenant isolation)
--  - All other tables (adds business_id for data isolation)
-- Adds:
--  - Multi-tenant data isolation
--  - API key authentication support
--  - Customization fields

-- -----------------------------------------------------------------------------
-- Enable UUID extension (if not already enabled)
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- Table: service_categories
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_categories (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Category details
  category_name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Multi-tenant support (optional - can be shared or business-specific)
  business_id BIGINT REFERENCES public.service_businesses(id) ON DELETE CASCADE,
  
  -- Constraints
  CONSTRAINT service_categories_name_unique
    UNIQUE (category_name, business_id)
);

-- Indexes for service_categories
CREATE INDEX IF NOT EXISTS idx_service_categories_business_id
  ON public.service_categories (business_id)
  WHERE business_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_service_categories_is_active
  ON public.service_categories (is_active)
  WHERE is_active = true;

-- Trigger for updated_at
CREATE TRIGGER trg_service_categories_set_updated_at
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Table: service_businesses (Multi-tenant business accounts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_businesses (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Business identification
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(50), -- 'plumbing', 'hvac', 'electrical', 'general', etc.
  owner_email VARCHAR(255) NOT NULL,
  
  -- API authentication
  api_key VARCHAR(255) UNIQUE NOT NULL,
  api_key_created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  api_key_last_used TIMESTAMP WITH TIME ZONE,
  
  -- Branding
  primary_color VARCHAR(7), -- Hex color code (e.g., #FF5733)
  secondary_color VARCHAR(7),
  logo_url VARCHAR(255),
  favicon_url VARCHAR(255),
  
  -- Payment integration
  stripe_account_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  
  -- Subscription & pricing tier
  pricing_tier VARCHAR(50) NOT NULL DEFAULT 'starter', -- 'starter', 'pro', 'enterprise'
  subscription_status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
  subscription_start_date DATE,
  subscription_end_date DATE,
  monthly_recurring_revenue DECIMAL(10, 2) DEFAULT 0,
  
  -- Limits (based on pricing tier)
  max_leads_per_month INTEGER DEFAULT 100,
  max_service_types INTEGER DEFAULT 1,
  max_users INTEGER DEFAULT 1,
  
  -- Features (JSONB for flexible feature flags)
  features JSONB DEFAULT '{}'::jsonb,
  -- Example: {"recurring_billing": true, "sms_notifications": false, "lead_scoring": false}
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Example: {"mlm_partner_id": "uuid", "referral_code": "ABC123"}
  
  -- Constraints
  CONSTRAINT service_businesses_tier_values
    CHECK (pricing_tier IN ('starter', 'pro', 'enterprise')),
  
  CONSTRAINT service_businesses_status_values
    CHECK (status IN ('active', 'suspended', 'cancelled', 'trial')),
  
  CONSTRAINT service_businesses_subscription_status_values
    CHECK (subscription_status IN ('active', 'suspended', 'cancelled', 'trial', 'past_due')),
  
  CONSTRAINT service_businesses_email_format
    CHECK (owner_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for service_businesses
CREATE INDEX IF NOT EXISTS idx_service_businesses_api_key
  ON public.service_businesses (api_key)
  WHERE api_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_service_businesses_owner_email
  ON public.service_businesses (owner_email);

CREATE INDEX IF NOT EXISTS idx_service_businesses_pricing_tier
  ON public.service_businesses (pricing_tier);

CREATE INDEX IF NOT EXISTS idx_service_businesses_status
  ON public.service_businesses (status)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_service_businesses_stripe_account_id
  ON public.service_businesses (stripe_account_id)
  WHERE stripe_account_id IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER trg_service_businesses_set_updated_at
  BEFORE UPDATE ON public.service_businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Function to generate API key
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS TEXT AS $$
BEGIN
  RETURN 'rws_' || encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Extend service_types table
-- -----------------------------------------------------------------------------
ALTER TABLE public.service_types
ADD COLUMN IF NOT EXISTS business_id BIGINT REFERENCES public.service_businesses(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS category_id BIGINT REFERENCES public.service_categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS skill_requirements JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS pricing_model VARCHAR(50) NOT NULL DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS inventory_items JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS skill_level_required VARCHAR(50) NOT NULL DEFAULT 'mid',
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN NOT NULL DEFAULT false;

-- Constraints for service_types extensions
ALTER TABLE public.service_types
ADD CONSTRAINT service_types_pricing_model_values
  CHECK (pricing_model IN ('fixed', 'hourly', 'tiered', 'custom'));

ALTER TABLE public.service_types
ADD CONSTRAINT service_types_skill_level_values
  CHECK (skill_level_required IN ('junior', 'mid', 'senior', 'expert'));

-- Indexes for service_types extensions
CREATE INDEX IF NOT EXISTS idx_service_types_business_id
  ON public.service_types (business_id)
  WHERE business_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_service_types_category_id
  ON public.service_types (category_id)
  WHERE category_id IS NOT NULL;

-- Update unique constraint to include business_id
ALTER TABLE public.service_types
DROP CONSTRAINT IF EXISTS service_types_service_key_key;

ALTER TABLE public.service_types
ADD CONSTRAINT service_types_service_key_business_unique
  UNIQUE (service_key, business_id);

-- -----------------------------------------------------------------------------
-- Extend service_leads table
-- -----------------------------------------------------------------------------
ALTER TABLE public.service_leads
ADD COLUMN IF NOT EXISTS business_id BIGINT REFERENCES public.service_businesses(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_by VARCHAR(100);

-- Indexes for service_leads extensions
CREATE INDEX IF NOT EXISTS idx_service_leads_business_id
  ON public.service_leads (business_id)
  WHERE business_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_service_leads_created_by
  ON public.service_leads (created_by)
  WHERE created_by IS NOT NULL;

-- Composite index for business-scoped queries
CREATE INDEX IF NOT EXISTS idx_service_leads_business_status
  ON public.service_leads (business_id, status)
  WHERE business_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Extend service_bookings table
-- -----------------------------------------------------------------------------
ALTER TABLE public.service_bookings
ADD COLUMN IF NOT EXISTS business_id BIGINT REFERENCES public.service_businesses(id) ON DELETE CASCADE;

-- Indexes for service_bookings extensions
CREATE INDEX IF NOT EXISTS idx_service_bookings_business_id
  ON public.service_bookings (business_id)
  WHERE business_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Extend technician_availability table
-- -----------------------------------------------------------------------------
ALTER TABLE public.technician_availability
ADD COLUMN IF NOT EXISTS business_id BIGINT REFERENCES public.service_businesses(id) ON DELETE CASCADE;

-- Indexes for technician_availability extensions
CREATE INDEX IF NOT EXISTS idx_technician_availability_business_id
  ON public.technician_availability (business_id)
  WHERE business_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Extend technician_skills table
-- -----------------------------------------------------------------------------
ALTER TABLE public.technician_skills
ADD COLUMN IF NOT EXISTS business_id BIGINT REFERENCES public.service_businesses(id) ON DELETE CASCADE;

-- Indexes for technician_skills extensions
CREATE INDEX IF NOT EXISTS idx_technician_skills_business_id
  ON public.technician_skills (business_id)
  WHERE business_id IS NOT NULL;

-- Update unique constraint to include business_id
ALTER TABLE public.technician_skills
DROP CONSTRAINT IF EXISTS technician_skills_unique;

ALTER TABLE public.technician_skills
ADD CONSTRAINT technician_skills_technician_skill_business_unique
  UNIQUE (technician_id, skill_name, business_id);

-- -----------------------------------------------------------------------------
-- Extend service_skill_requirements table
-- -----------------------------------------------------------------------------
ALTER TABLE public.service_skill_requirements
ADD COLUMN IF NOT EXISTS business_id BIGINT REFERENCES public.service_businesses(id) ON DELETE CASCADE;

-- Indexes for service_skill_requirements extensions
CREATE INDEX IF NOT EXISTS idx_service_skill_requirements_business_id
  ON public.service_skill_requirements (business_id)
  WHERE business_id IS NOT NULL;

-- Update unique constraint to include business_id
ALTER TABLE public.service_skill_requirements
DROP CONSTRAINT IF EXISTS service_skill_requirements_unique;

ALTER TABLE public.service_skill_requirements
ADD CONSTRAINT service_skill_requirements_service_skill_business_unique
  UNIQUE (service_type, required_skill, business_id);

-- -----------------------------------------------------------------------------
-- Extend manual_assignments table
-- -----------------------------------------------------------------------------
ALTER TABLE public.manual_assignments
ADD COLUMN IF NOT EXISTS business_id BIGINT REFERENCES public.service_businesses(id) ON DELETE CASCADE;

-- Indexes for manual_assignments extensions
CREATE INDEX IF NOT EXISTS idx_manual_assignments_business_id
  ON public.manual_assignments (business_id)
  WHERE business_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Sample Data: Default Business (for existing data migration)
-- -----------------------------------------------------------------------------
-- Create a default business for existing data
INSERT INTO public.service_businesses (
  business_name,
  business_type,
  owner_email,
  api_key,
  pricing_tier,
  status,
  max_leads_per_month,
  max_service_types,
  features
) VALUES (
  'Rocky Web Studio',
  'general',
  'martin@rockywebstudio.com.au',
  public.generate_api_key(),
  'enterprise',
  'active',
  999999,
  999999,
  '{"recurring_billing": true, "sms_notifications": true, "lead_scoring": true, "nps_surveys": true, "hubspot_integration": true}'::jsonb
)
ON CONFLICT (api_key) DO NOTHING
RETURNING id;

-- Update existing records to use default business (if needed)
-- This should be run separately after verifying the default business exists
-- UPDATE public.service_leads SET business_id = (SELECT id FROM public.service_businesses WHERE business_name = 'Rocky Web Studio' LIMIT 1) WHERE business_id IS NULL;
-- UPDATE public.service_types SET business_id = (SELECT id FROM public.service_businesses WHERE business_name = 'Rocky Web Studio' LIMIT 1) WHERE business_id IS NULL;

-- -----------------------------------------------------------------------------
-- Comments for Documentation
-- -----------------------------------------------------------------------------

COMMENT ON TABLE public.service_categories IS 'Service category taxonomy for organizing service types';
COMMENT ON TABLE public.service_businesses IS 'Multi-tenant business accounts with API key authentication and subscription management';

COMMENT ON COLUMN public.service_businesses.api_key IS 'Unique API key for authentication (format: rws_<base64>)';
COMMENT ON COLUMN public.service_businesses.pricing_tier IS 'Subscription tier: starter ($99/mo), pro ($299/mo), enterprise (custom)';
COMMENT ON COLUMN public.service_businesses.features IS 'JSONB feature flags: {"recurring_billing": true, "sms_notifications": false, ...}';
COMMENT ON COLUMN public.service_businesses.metadata IS 'JSONB metadata: {"mlm_partner_id": "uuid", "referral_code": "ABC123"}';

COMMENT ON COLUMN public.service_types.skill_requirements IS 'JSONB skill requirements: {"required": ["diagnosis", "pressure_testing"]}';
COMMENT ON COLUMN public.service_types.pricing_model IS 'Pricing model: fixed, hourly, tiered, custom';
COMMENT ON COLUMN public.service_types.inventory_items IS 'JSONB inventory: {"materials": ["o-ring", "valve"], "tools": ["wrench"]}';
COMMENT ON COLUMN public.service_types.skill_level_required IS 'Minimum skill level required: junior, mid, senior, expert';

COMMENT ON COLUMN public.service_leads.business_id IS 'Multi-tenant isolation: All queries must filter by business_id';
COMMENT ON COLUMN public.service_leads.created_by IS 'User/API key that created the lead (for audit trail)';
