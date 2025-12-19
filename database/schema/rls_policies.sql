-- Rocky Web Studio / Row Level Security (RLS) Policies
-- Schema: database/schema/rls_policies.sql
--
-- Purpose: Enforce data isolation for multi-tenant architecture
-- All tables with business_id must have RLS enabled
-- Policies ensure users can only access data for their business_id

-- -----------------------------------------------------------------------------
-- Enable Row Level Security
-- -----------------------------------------------------------------------------

-- Enable RLS on all tenant-scoped tables
ALTER TABLE public.service_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_skill_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_surveys ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Helper Function: Get Business ID from API Key
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_business_id_from_api_key(api_key_param TEXT)
RETURNS BIGINT AS $$
DECLARE
  business_id_result BIGINT;
BEGIN
  SELECT id INTO business_id_result
  FROM public.service_businesses
  WHERE api_key = api_key_param
    AND status = 'active'
    AND subscription_status = 'active';
  
  RETURN business_id_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- Helper Function: Get Business ID from JWT (for Supabase Auth)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_business_id_from_jwt()
RETURNS BIGINT AS $$
DECLARE
  business_id_result BIGINT;
  user_email TEXT;
BEGIN
  -- Extract email from JWT token (Supabase Auth)
  user_email := (current_setting('request.jwt.claims', true)::json->>'email');
  
  -- Get business_id from owner_email
  SELECT id INTO business_id_result
  FROM public.service_businesses
  WHERE owner_email = user_email
    AND status = 'active';
  
  RETURN business_id_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- RLS Policies: service_businesses
-- -----------------------------------------------------------------------------

-- Policy: Businesses can view their own record
CREATE POLICY "businesses_select_own"
  ON public.service_businesses
  FOR SELECT
  USING (
    id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR id = public.get_business_id_from_jwt()
  );

-- Policy: Businesses can update their own record
CREATE POLICY "businesses_update_own"
  ON public.service_businesses
  FOR UPDATE
  USING (
    id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR id = public.get_business_id_from_jwt()
  );

-- -----------------------------------------------------------------------------
-- RLS Policies: service_leads
-- -----------------------------------------------------------------------------

-- Policy: Businesses can only access their own leads
CREATE POLICY "leads_select_business"
  ON public.service_leads
  FOR SELECT
  USING (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
  );

-- Policy: Businesses can insert leads for their business
CREATE POLICY "leads_insert_business"
  ON public.service_leads
  FOR INSERT
  WITH CHECK (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
  );

-- Policy: Businesses can update their own leads
CREATE POLICY "leads_update_business"
  ON public.service_leads
  FOR UPDATE
  USING (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
  );

-- Policy: Businesses can delete their own leads
CREATE POLICY "leads_delete_business"
  ON public.service_leads
  FOR DELETE
  USING (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
  );

-- -----------------------------------------------------------------------------
-- RLS Policies: service_bookings
-- -----------------------------------------------------------------------------

-- Policy: Businesses can only access their own bookings
CREATE POLICY "bookings_select_business"
  ON public.service_bookings
  FOR SELECT
  USING (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
  );

-- Policy: Businesses can insert bookings for their business
CREATE POLICY "bookings_insert_business"
  ON public.service_bookings
  FOR INSERT
  WITH CHECK (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
  );

-- Policy: Businesses can update their own bookings
CREATE POLICY "bookings_update_business"
  ON public.service_bookings
  FOR UPDATE
  USING (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
  );

-- -----------------------------------------------------------------------------
-- RLS Policies: service_types
-- -----------------------------------------------------------------------------

-- Policy: Businesses can view their own service types (and shared ones)
CREATE POLICY "service_types_select_business"
  ON public.service_types
  FOR SELECT
  USING (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
    OR business_id IS NULL  -- Shared service types
  );

-- Policy: Businesses can insert service types for their business
CREATE POLICY "service_types_insert_business"
  ON public.service_types
  FOR INSERT
  WITH CHECK (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
  );

-- Policy: Businesses can update their own service types
CREATE POLICY "service_types_update_business"
  ON public.service_types
  FOR UPDATE
  USING (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
  );

-- -----------------------------------------------------------------------------
-- RLS Policies: service_categories
-- -----------------------------------------------------------------------------

-- Policy: Businesses can view their own categories (and shared ones)
CREATE POLICY "categories_select_business"
  ON public.service_categories
  FOR SELECT
  USING (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
    OR business_id IS NULL  -- Shared categories
  );

-- Policy: Businesses can insert categories for their business
CREATE POLICY "categories_insert_business"
  ON public.service_categories
  FOR INSERT
  WITH CHECK (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
  );

-- -----------------------------------------------------------------------------
-- RLS Policies: technician_availability
-- -----------------------------------------------------------------------------

-- Policy: Businesses can only access their own technician availability
CREATE POLICY "technician_availability_select_business"
  ON public.technician_availability
  FOR SELECT
  USING (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
  );

-- Policy: Businesses can insert availability for their business
CREATE POLICY "technician_availability_insert_business"
  ON public.technician_availability
  FOR INSERT
  WITH CHECK (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
  );

-- Policy: Businesses can update their own availability
CREATE POLICY "technician_availability_update_business"
  ON public.technician_availability
  FOR UPDATE
  USING (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
  );

-- -----------------------------------------------------------------------------
-- RLS Policies: technician_skills
-- -----------------------------------------------------------------------------

-- Policy: Businesses can only access their own technician skills
CREATE POLICY "technician_skills_select_business"
  ON public.technician_skills
  FOR SELECT
  USING (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
  );

-- Policy: Businesses can insert skills for their business
CREATE POLICY "technician_skills_insert_business"
  ON public.technician_skills
  FOR INSERT
  WITH CHECK (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
  );

-- -----------------------------------------------------------------------------
-- RLS Policies: service_skill_requirements
-- -----------------------------------------------------------------------------

-- Policy: Businesses can only access their own skill requirements
CREATE POLICY "skill_requirements_select_business"
  ON public.service_skill_requirements
  FOR SELECT
  USING (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
  );

-- Policy: Businesses can insert requirements for their business
CREATE POLICY "skill_requirements_insert_business"
  ON public.service_skill_requirements
  FOR INSERT
  WITH CHECK (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
  );

-- -----------------------------------------------------------------------------
-- RLS Policies: manual_assignments
-- -----------------------------------------------------------------------------

-- Policy: Businesses can only access their own manual assignments
CREATE POLICY "manual_assignments_select_business"
  ON public.manual_assignments
  FOR SELECT
  USING (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
  );

-- Policy: Businesses can insert assignments for their business
CREATE POLICY "manual_assignments_insert_business"
  ON public.manual_assignments
  FOR INSERT
  WITH CHECK (
    business_id = public.get_business_id_from_api_key(current_setting('app.business_id', true)::BIGINT)
    OR business_id = public.get_business_id_from_jwt()
  );

-- -----------------------------------------------------------------------------
-- RLS Policies: service_subscriptions (if table exists)
-- -----------------------------------------------------------------------------

-- Policy: Businesses can only access their own subscriptions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_subscriptions') THEN
    EXECUTE 'CREATE POLICY "subscriptions_select_business" ON public.service_subscriptions FOR SELECT USING (business_id = public.get_business_id_from_api_key(current_setting(''app.business_id'', true)::BIGINT) OR business_id = public.get_business_id_from_jwt())';
    EXECUTE 'CREATE POLICY "subscriptions_insert_business" ON public.service_subscriptions FOR INSERT WITH CHECK (business_id = public.get_business_id_from_api_key(current_setting(''app.business_id'', true)::BIGINT) OR business_id = public.get_business_id_from_jwt())';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- RLS Policies: subscription_payments (if table exists)
-- -----------------------------------------------------------------------------

-- Policy: Businesses can only access their own payments
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_payments') THEN
    EXECUTE 'CREATE POLICY "payments_select_business" ON public.subscription_payments FOR SELECT USING (business_id = public.get_business_id_from_api_key(current_setting(''app.business_id'', true)::BIGINT) OR business_id = public.get_business_id_from_jwt())';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- RLS Policies: customer_surveys (if table exists)
-- -----------------------------------------------------------------------------

-- Policy: Businesses can only access their own surveys
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_surveys') THEN
    EXECUTE 'CREATE POLICY "surveys_select_business" ON public.customer_surveys FOR SELECT USING (business_id = public.get_business_id_from_api_key(current_setting(''app.business_id'', true)::BIGINT) OR business_id = public.get_business_id_from_jwt())';
    EXECUTE 'CREATE POLICY "surveys_insert_business" ON public.customer_surveys FOR INSERT WITH CHECK (business_id = public.get_business_id_from_api_key(current_setting(''app.business_id'', true)::BIGINT) OR business_id = public.get_business_id_from_jwt())';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- Comments for Documentation
-- -----------------------------------------------------------------------------

COMMENT ON FUNCTION public.get_business_id_from_api_key IS 'Helper function to extract business_id from API key for RLS policies';
COMMENT ON FUNCTION public.get_business_id_from_jwt IS 'Helper function to extract business_id from JWT token (Supabase Auth) for RLS policies';
