-- Rocky Web Studio / MRR Tracking Queries
-- File: docs/MRR_TRACKING_QUERIES.sql
--
-- Collection of SQL queries for tracking Monthly Recurring Revenue (MRR)
-- Use these queries in n8n workflows or reporting dashboards

-- -----------------------------------------------------------------------------
-- Current MRR (All Active Subscriptions Normalized to Monthly)
-- -----------------------------------------------------------------------------
SELECT 
  SUM(
    CASE 
      WHEN frequency = 'monthly' THEN amount
      WHEN frequency = 'quarterly' THEN amount / 3
      WHEN frequency = 'annual' THEN amount / 12
    END
  ) as current_mrr,
  COUNT(*) as active_subscriptions
FROM service_subscriptions
WHERE status = 'active'
  AND billing_date <= CURRENT_DATE + INTERVAL '1 month';

-- -----------------------------------------------------------------------------
-- New MRR (This Month)
-- -----------------------------------------------------------------------------
SELECT 
  SUM(
    CASE 
      WHEN frequency = 'monthly' THEN amount
      WHEN frequency = 'quarterly' THEN amount / 3
      WHEN frequency = 'annual' THEN amount / 12
    END
  ) as new_mrr,
  COUNT(*) as new_subscriptions
FROM service_subscriptions
WHERE status = 'active'
  AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
  AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';

-- -----------------------------------------------------------------------------
-- Churn MRR (This Month)
-- -----------------------------------------------------------------------------
SELECT 
  SUM(
    CASE 
      WHEN frequency = 'monthly' THEN amount
      WHEN frequency = 'quarterly' THEN amount / 3
      WHEN frequency = 'annual' THEN amount / 12
    END
  ) as churn_mrr,
  COUNT(*) as churned_subscriptions
FROM service_subscriptions
WHERE status = 'cancelled'
  AND cancellation_date >= DATE_TRUNC('month', CURRENT_DATE)
  AND cancellation_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';

-- -----------------------------------------------------------------------------
-- Net MRR Growth (This Month)
-- -----------------------------------------------------------------------------
WITH new_mrr AS (
  SELECT SUM(
    CASE 
      WHEN frequency = 'monthly' THEN amount
      WHEN frequency = 'quarterly' THEN amount / 3
      WHEN frequency = 'annual' THEN amount / 12
    END
  ) as value
  FROM service_subscriptions
  WHERE status = 'active'
    AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
),
churn_mrr AS (
  SELECT SUM(
    CASE 
      WHEN frequency = 'monthly' THEN amount
      WHEN frequency = 'quarterly' THEN amount / 3
      WHEN frequency = 'annual' THEN amount / 12
    END
  ) as value
  FROM service_subscriptions
  WHERE status = 'cancelled'
    AND cancellation_date >= DATE_TRUNC('month', CURRENT_DATE)
    AND cancellation_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
)
SELECT 
  COALESCE(new_mrr.value, 0) as new_mrr,
  COALESCE(churn_mrr.value, 0) as churn_mrr,
  COALESCE(new_mrr.value, 0) - COALESCE(churn_mrr.value, 0) as net_mrr_growth,
  CASE 
    WHEN COALESCE(new_mrr.value, 0) > 0 
    THEN ROUND(
      ((COALESCE(new_mrr.value, 0) - COALESCE(churn_mrr.value, 0)) / COALESCE(new_mrr.value, 0)) * 100, 
      2
    )
    ELSE 0
  END as growth_rate_percent
FROM new_mrr, churn_mrr;

-- -----------------------------------------------------------------------------
-- MRR by Service Type
-- -----------------------------------------------------------------------------
SELECT 
  service_type,
  SUM(
    CASE 
      WHEN frequency = 'monthly' THEN amount
      WHEN frequency = 'quarterly' THEN amount / 3
      WHEN frequency = 'annual' THEN amount / 12
    END
  ) as mrr,
  COUNT(*) as subscription_count,
  AVG(amount) as avg_subscription_value
FROM service_subscriptions
WHERE status = 'active'
  AND billing_date <= CURRENT_DATE + INTERVAL '1 month'
GROUP BY service_type
ORDER BY mrr DESC;

-- -----------------------------------------------------------------------------
-- MRR by Frequency
-- -----------------------------------------------------------------------------
SELECT 
  frequency,
  COUNT(*) as subscription_count,
  SUM(amount) as total_revenue,
  SUM(
    CASE 
      WHEN frequency = 'monthly' THEN amount
      WHEN frequency = 'quarterly' THEN amount / 3
      WHEN frequency = 'annual' THEN amount / 12
    END
  ) as normalized_mrr
FROM service_subscriptions
WHERE status = 'active'
  AND billing_date <= CURRENT_DATE + INTERVAL '1 month'
GROUP BY frequency
ORDER BY normalized_mrr DESC;

-- -----------------------------------------------------------------------------
-- MRR Trend (Last 6 Months)
-- -----------------------------------------------------------------------------
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(
    CASE 
      WHEN frequency = 'monthly' THEN amount
      WHEN frequency = 'quarterly' THEN amount / 3
      WHEN frequency = 'annual' THEN amount / 12
    END
  ) as new_mrr_added,
  SUM(
    CASE 
      WHEN frequency = 'monthly' THEN amount
      WHEN frequency = 'quarterly' THEN amount / 3
      WHEN frequency = 'annual' THEN amount / 12
    END
  ) FILTER (WHERE status = 'cancelled') as churn_mrr,
  COUNT(*) FILTER (WHERE status = 'active') as active_count
FROM service_subscriptions
WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- -----------------------------------------------------------------------------
-- Projected Annual Revenue
-- -----------------------------------------------------------------------------
SELECT 
  SUM(
    CASE 
      WHEN frequency = 'monthly' THEN amount * 12
      WHEN frequency = 'quarterly' THEN amount * 4
      WHEN frequency = 'annual' THEN amount
    END
  ) as projected_annual_revenue,
  COUNT(*) as active_subscriptions
FROM service_subscriptions
WHERE status = 'active'
  AND billing_date <= CURRENT_DATE + INTERVAL '1 month';

-- -----------------------------------------------------------------------------
-- Customer Lifetime Value (LTV) by Service Type
-- -----------------------------------------------------------------------------
SELECT 
  ss.service_type,
  COUNT(DISTINCT ss.customer_id) as customer_count,
  AVG(ss.amount) as avg_subscription_value,
  AVG(
    CASE 
      WHEN ss.frequency = 'monthly' THEN ss.amount * 12
      WHEN ss.frequency = 'quarterly' THEN ss.amount * 4
      WHEN ss.frequency = 'annual' THEN ss.amount
    END
  ) as avg_annual_value,
  AVG(
    EXTRACT(EPOCH FROM (COALESCE(ss.cancellation_date, CURRENT_DATE) - ss.created_at)) / 86400
  ) as avg_subscription_days,
  AVG(
    (EXTRACT(EPOCH FROM (COALESCE(ss.cancellation_date, CURRENT_DATE) - ss.created_at)) / 86400) / 30.44
  ) * AVG(ss.amount) as estimated_ltv
FROM service_subscriptions ss
WHERE ss.status IN ('active', 'cancelled')
GROUP BY ss.service_type
ORDER BY estimated_ltv DESC;

-- -----------------------------------------------------------------------------
-- Payment Success Rate
-- -----------------------------------------------------------------------------
SELECT 
  DATE_TRUNC('month', payment_date) as month,
  COUNT(*) FILTER (WHERE status = 'completed') as successful_payments,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_payments,
  COUNT(*) as total_payments,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / 
     NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as success_rate_percent
FROM subscription_payments
WHERE payment_date >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', payment_date)
ORDER BY month DESC;

-- -----------------------------------------------------------------------------
-- Churn Rate by Service Type
-- -----------------------------------------------------------------------------
SELECT 
  service_type,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) as total_count,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'cancelled')::DECIMAL / 
     NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as churn_rate_percent
FROM service_subscriptions
GROUP BY service_type
ORDER BY churn_rate_percent DESC;
