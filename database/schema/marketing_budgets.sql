-- Rocky Web Studio / Marketing Budgets
-- Schema: database/schema/marketing_budgets.sql
--
-- Creates:
--  - public.marketing_budgets (monthly budget tracking by lead source)
-- Adds:
--  - Constraints for data validation
--  - Indexes for lookups
--  - Auto-populating timestamps

-- -----------------------------------------------------------------------------
-- Shared trigger function for updated_at (if not already exists)
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
-- Table: marketing_budgets
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.marketing_budgets (
  id SERIAL PRIMARY KEY,
  lead_source VARCHAR(50) NOT NULL UNIQUE,
  monthly_budget DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT marketing_budgets_lead_source_values
    CHECK (lead_source IN ('organic', 'paid_ad', 'referral', 'direct', 'partnership', 'unknown')),
  
  CONSTRAINT marketing_budgets_budget_nonnegative
    CHECK (monthly_budget >= 0)
);

-- Index for active budgets lookup
CREATE INDEX IF NOT EXISTS idx_marketing_budgets_is_active
  ON public.marketing_budgets (is_active)
  WHERE is_active = true;

-- Index for lead_source lookup
CREATE INDEX IF NOT EXISTS idx_marketing_budgets_lead_source
  ON public.marketing_budgets (lead_source);

-- Trigger for updated_at
CREATE TRIGGER trg_marketing_budgets_set_updated_at
  BEFORE UPDATE ON public.marketing_budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Sample Data: marketing_budgets
-- -----------------------------------------------------------------------------
-- Insert sample budgets using UPSERT to make this idempotent
INSERT INTO public.marketing_budgets (lead_source, monthly_budget, is_active)
VALUES 
  ('organic', 500.00, true),      -- SEO/content marketing
  ('paid_ad', 2000.00, true),     -- Google Ads, Facebook Ads
  ('referral', 0.00, true),       -- No direct cost
  ('direct', 0.00, true),         -- No direct cost
  ('partnership', 300.00, true),  -- Partnership costs
  ('unknown', 0.00, true)         -- Unknown source
ON CONFLICT (lead_source) DO UPDATE SET
  monthly_budget = EXCLUDED.monthly_budget,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- -----------------------------------------------------------------------------
-- Comments for Documentation
-- -----------------------------------------------------------------------------
COMMENT ON TABLE public.marketing_budgets IS 'Monthly marketing budget allocation by lead source for ROI calculations';
COMMENT ON COLUMN public.marketing_budgets.lead_source IS 'Lead source: organic, paid_ad, referral, direct, partnership, unknown';
COMMENT ON COLUMN public.marketing_budgets.monthly_budget IS 'Monthly marketing spend allocated to this lead source (in dollars)';
COMMENT ON COLUMN public.marketing_budgets.is_active IS 'Whether this budget allocation is currently active';
