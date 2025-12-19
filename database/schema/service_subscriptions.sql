-- Rocky Web Studio / Service Subscriptions
-- Schema: database/schema/service_subscriptions.sql
--
-- Creates:
--  - public.service_subscriptions (recurring subscription management)
--  - public.subscription_payments (payment history tracking)
-- Adds:
--  - Constraints for data validation
--  - Indexes for performance
--  - Foreign key relationships

-- -----------------------------------------------------------------------------
-- Table: service_subscriptions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Customer relationship
  customer_id UUID NOT NULL REFERENCES public.service_leads(id) ON DELETE CASCADE,
  
  -- Subscription details
  service_type VARCHAR(50) NOT NULL,
  frequency VARCHAR(50) NOT NULL, -- 'monthly', 'quarterly', 'annual'
  amount DECIMAL(10, 2) NOT NULL,
  
  -- Billing schedule
  billing_date DATE NOT NULL,
  next_billing_date DATE,
  
  -- Status and management
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'paused', 'cancelled'
  stripe_subscription_id VARCHAR(100),
  auto_renewal BOOLEAN NOT NULL DEFAULT true,
  
  -- Cancellation tracking
  cancellation_date TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  
  -- Constraints
  CONSTRAINT service_subscriptions_frequency_values
    CHECK (frequency IN ('monthly', 'quarterly', 'annual')),
  
  CONSTRAINT service_subscriptions_status_values
    CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  
  CONSTRAINT service_subscriptions_amount_positive
    CHECK (amount > 0),
  
  CONSTRAINT service_subscriptions_billing_date_valid
    CHECK (billing_date IS NOT NULL),
  
  CONSTRAINT service_subscriptions_cancellation_logic
    CHECK (
      (status = 'cancelled' AND cancellation_date IS NOT NULL) OR
      (status != 'cancelled' AND cancellation_date IS NULL) OR
      (status = 'cancelled' AND cancellation_date IS NULL)
    )
);

-- Indexes for service_subscriptions
CREATE INDEX IF NOT EXISTS idx_service_subscriptions_customer_id
  ON public.service_subscriptions (customer_id);

CREATE INDEX IF NOT EXISTS idx_service_subscriptions_status
  ON public.service_subscriptions (status)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_service_subscriptions_billing_date
  ON public.service_subscriptions (billing_date)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_service_subscriptions_next_billing_date
  ON public.service_subscriptions (next_billing_date)
  WHERE status = 'active' AND next_billing_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_service_subscriptions_stripe_subscription_id
  ON public.service_subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- Composite index for daily billing queries
CREATE INDEX IF NOT EXISTS idx_service_subscriptions_billing_status
  ON public.service_subscriptions (billing_date, status)
  WHERE status = 'active';

-- Index for churn prevention queries
CREATE INDEX IF NOT EXISTS idx_service_subscriptions_paused_created
  ON public.service_subscriptions (status, created_at)
  WHERE status = 'paused' AND cancellation_date IS NULL;

-- Trigger for updated_at
CREATE TRIGGER trg_service_subscriptions_set_updated_at
  BEFORE UPDATE ON public.service_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Table: subscription_payments
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Subscription relationship
  subscription_id BIGINT NOT NULL REFERENCES public.service_subscriptions(id) ON DELETE CASCADE,
  
  -- Payment details
  payment_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
  
  -- Stripe integration
  stripe_charge_id VARCHAR(100),
  stripe_payment_intent_id VARCHAR(100),
  
  -- Retry tracking
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_retry_date TIMESTAMP WITH TIME ZONE,
  next_retry_date DATE,
  
  -- Failure details
  failure_reason TEXT,
  failure_code VARCHAR(50),
  
  -- Constraints
  CONSTRAINT subscription_payments_status_values
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'processing')),
  
  CONSTRAINT subscription_payments_amount_positive
    CHECK (amount > 0),
  
  CONSTRAINT subscription_payments_retry_count_nonnegative
    CHECK (retry_count >= 0)
);

-- Indexes for subscription_payments
CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription_id
  ON public.subscription_payments (subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscription_payments_status
  ON public.subscription_payments (status);

CREATE INDEX IF NOT EXISTS idx_subscription_payments_payment_date
  ON public.subscription_payments (payment_date DESC);

CREATE INDEX IF NOT EXISTS idx_subscription_payments_stripe_charge_id
  ON public.subscription_payments (stripe_charge_id)
  WHERE stripe_charge_id IS NOT NULL;

-- Index for failed payments needing retry
CREATE INDEX IF NOT EXISTS idx_subscription_payments_failed_retry
  ON public.subscription_payments (status, next_retry_date)
  WHERE status = 'failed' AND next_retry_date IS NOT NULL;

-- Composite index for payment history queries
CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription_status
  ON public.subscription_payments (subscription_id, status, payment_date DESC);

-- -----------------------------------------------------------------------------
-- Comments for Documentation
-- -----------------------------------------------------------------------------

COMMENT ON TABLE public.service_subscriptions IS 'Recurring subscription management for service customers';
COMMENT ON TABLE public.subscription_payments IS 'Payment history and tracking for subscription billing';

COMMENT ON COLUMN public.service_subscriptions.customer_id IS 'References service_leads.id - customer who owns this subscription';
COMMENT ON COLUMN public.service_subscriptions.frequency IS 'Billing frequency: monthly, quarterly, or annual';
COMMENT ON COLUMN public.service_subscriptions.amount IS 'Recurring billing amount in dollars';
COMMENT ON COLUMN public.service_subscriptions.billing_date IS 'Next date when subscription should be billed';
COMMENT ON COLUMN public.service_subscriptions.next_billing_date IS 'Calculated next billing date after successful payment';
COMMENT ON COLUMN public.service_subscriptions.status IS 'Subscription status: active, paused, cancelled, expired';
COMMENT ON COLUMN public.service_subscriptions.stripe_subscription_id IS 'Stripe subscription object ID for automatic billing';
COMMENT ON COLUMN public.service_subscriptions.auto_renewal IS 'Whether subscription automatically renews on billing date';
COMMENT ON COLUMN public.service_subscriptions.cancellation_date IS 'Timestamp when subscription was cancelled';
COMMENT ON COLUMN public.service_subscriptions.cancellation_reason IS 'Reason provided for cancellation';

COMMENT ON COLUMN public.subscription_payments.subscription_id IS 'References service_subscriptions.id - subscription being billed';
COMMENT ON COLUMN public.subscription_payments.payment_date IS 'Date when payment was processed or attempted';
COMMENT ON COLUMN public.subscription_payments.amount IS 'Payment amount in dollars';
COMMENT ON COLUMN public.subscription_payments.status IS 'Payment status: pending, completed, failed, refunded, processing';
COMMENT ON COLUMN public.subscription_payments.stripe_charge_id IS 'Stripe charge ID for successful payments';
COMMENT ON COLUMN public.subscription_payments.retry_count IS 'Number of retry attempts for failed payments';
COMMENT ON COLUMN public.subscription_payments.next_retry_date IS 'Next date to retry failed payment';
COMMENT ON COLUMN public.subscription_payments.failure_reason IS 'Reason for payment failure (if applicable)';
