-- Rocky Web Studio / NPS Calculation Queries
-- File: docs/NPS_CALCULATION_QUERIES.sql
--
-- Collection of SQL queries for calculating Net Promoter Score (NPS)
-- and related customer satisfaction metrics

-- -----------------------------------------------------------------------------
-- Calculate NPS Score (Current Month)
-- -----------------------------------------------------------------------------
-- Formula: NPS = (% Promoters - % Detractors) × 100
-- Promoters: NPS 9-10
-- Passives: NPS 7-8
-- Detractors: NPS 0-6

WITH nps_data AS (
  SELECT 
    COUNT(*) FILTER (WHERE nps_score >= 9) as promoters,
    COUNT(*) FILTER (WHERE nps_score BETWEEN 7 AND 8) as passives,
    COUNT(*) FILTER (WHERE nps_score <= 6) as detractors,
    COUNT(*) as total_responses
  FROM customer_surveys
  WHERE survey_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
    AND survey_date < DATE_TRUNC('month', CURRENT_DATE)
    AND nps_score IS NOT NULL
)
SELECT 
  promoters,
  passives,
  detractors,
  total_responses,
  ROUND((promoters::DECIMAL / NULLIF(total_responses, 0)) * 100, 2) as promoter_percent,
  ROUND((passives::DECIMAL / NULLIF(total_responses, 0)) * 100, 2) as passive_percent,
  ROUND((detractors::DECIMAL / NULLIF(total_responses, 0)) * 100, 2) as detractor_percent,
  ROUND(
    ((promoters::DECIMAL / NULLIF(total_responses, 0)) - 
     (detractors::DECIMAL / NULLIF(total_responses, 0))) * 100, 
    2
  ) as nps_score
FROM nps_data;

-- -----------------------------------------------------------------------------
-- NPS Trend (Month-over-Month)
-- -----------------------------------------------------------------------------
SELECT 
  DATE_TRUNC('month', survey_date) as month,
  COUNT(*) FILTER (WHERE nps_score >= 9) as promoters,
  COUNT(*) FILTER (WHERE nps_score BETWEEN 7 AND 8) as passives,
  COUNT(*) FILTER (WHERE nps_score <= 6) as detractors,
  COUNT(*) as total_responses,
  ROUND(
    ((COUNT(*) FILTER (WHERE nps_score >= 9)::DECIMAL / NULLIF(COUNT(*), 0)) - 
     (COUNT(*) FILTER (WHERE nps_score <= 6)::DECIMAL / NULLIF(COUNT(*), 0))) * 100, 
    2
  ) as nps_score
FROM customer_surveys
WHERE survey_date >= CURRENT_DATE - INTERVAL '6 months'
  AND nps_score IS NOT NULL
GROUP BY DATE_TRUNC('month', survey_date)
ORDER BY month DESC;

-- -----------------------------------------------------------------------------
-- Response Rate
-- -----------------------------------------------------------------------------
SELECT 
  DATE_TRUNC('month', survey_sent_date) as month,
  COUNT(*) FILTER (WHERE survey_completed = true) as completed,
  COUNT(*) FILTER (WHERE survey_sent_date IS NOT NULL) as sent,
  ROUND(
    (COUNT(*) FILTER (WHERE survey_completed = true)::DECIMAL / 
     NULLIF(COUNT(*) FILTER (WHERE survey_sent_date IS NOT NULL), 0)) * 100, 
    2
  ) as response_rate_percent
FROM customer_surveys
WHERE survey_sent_date >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', survey_sent_date)
ORDER BY month DESC;

-- -----------------------------------------------------------------------------
-- Top Feedback Themes (by Sentiment)
-- -----------------------------------------------------------------------------
SELECT 
  sentiment,
  COUNT(*) as count,
  ROUND(AVG(nps_score), 2) as avg_nps,
  ROUND(AVG(csat_score), 2) as avg_csat,
  STRING_AGG(DISTINCT SUBSTRING(feedback_text, 1, 100), ' | ') as sample_feedback
FROM customer_surveys
WHERE survey_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
  AND feedback_text IS NOT NULL
  AND feedback_text != ''
  AND sentiment IS NOT NULL
GROUP BY sentiment
ORDER BY count DESC;

-- -----------------------------------------------------------------------------
-- Common Complaints (Detractors)
-- -----------------------------------------------------------------------------
SELECT 
  feedback_text,
  nps_score,
  csat_score,
  survey_date,
  follow_up_status
FROM customer_surveys
WHERE nps_score <= 6
  AND feedback_text IS NOT NULL
  AND feedback_text != ''
  AND survey_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY nps_score ASC, survey_date DESC
LIMIT 20;

-- -----------------------------------------------------------------------------
-- Promoter Retention Rate
-- -----------------------------------------------------------------------------
SELECT 
  COUNT(*) FILTER (WHERE sl.status = 'active' OR sl.status = 'won') as active_promoters,
  COUNT(*) as total_promoters,
  ROUND(
    (COUNT(*) FILTER (WHERE sl.status = 'active' OR sl.status = 'won')::DECIMAL / 
     NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as retention_rate_percent
FROM customer_surveys cs
INNER JOIN service_leads sl ON sl.id = cs.lead_id
WHERE cs.nps_score >= 9
  AND cs.survey_date >= CURRENT_DATE - INTERVAL '90 days';

-- -----------------------------------------------------------------------------
-- Revenue from Promoter Referrals
-- -----------------------------------------------------------------------------
SELECT 
  COUNT(DISTINCT sl.id) as referral_customers,
  COUNT(*) as referral_bookings,
  SUM(sb.actual_cost) FILTER (WHERE sb.booking_status = 'paid') as referral_revenue,
  AVG(sb.actual_cost) FILTER (WHERE sb.booking_status = 'paid') as avg_referral_value
FROM service_leads sl
INNER JOIN service_bookings sb ON sb.lead_id = sl.id
WHERE sl.utm_source = 'referral'
  AND sl.created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
  AND sl.created_at < DATE_TRUNC('month', CURRENT_DATE);

-- -----------------------------------------------------------------------------
-- NPS by Service Type
-- -----------------------------------------------------------------------------
SELECT 
  sb.service_type,
  COUNT(*) as response_count,
  COUNT(*) FILTER (WHERE cs.nps_score >= 9) as promoters,
  COUNT(*) FILTER (WHERE cs.nps_score <= 6) as detractors,
  ROUND(AVG(cs.nps_score), 2) as avg_nps,
  ROUND(
    ((COUNT(*) FILTER (WHERE cs.nps_score >= 9)::DECIMAL / NULLIF(COUNT(*), 0)) - 
     (COUNT(*) FILTER (WHERE cs.nps_score <= 6)::DECIMAL / NULLIF(COUNT(*), 0))) * 100, 
    2
  ) as nps_score
FROM customer_surveys cs
INNER JOIN service_bookings sb ON sb.id = cs.booking_id
WHERE cs.survey_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
  AND cs.nps_score IS NOT NULL
GROUP BY sb.service_type
ORDER BY nps_score DESC;

-- -----------------------------------------------------------------------------
-- Detractor Recovery Rate
-- -----------------------------------------------------------------------------
SELECT 
  COUNT(*) FILTER (WHERE cs.follow_up_status = 'resolved') as recovered,
  COUNT(*) FILTER (WHERE cs.nps_score <= 6) as total_detractors,
  ROUND(
    (COUNT(*) FILTER (WHERE cs.follow_up_status = 'resolved')::DECIMAL / 
     NULLIF(COUNT(*) FILTER (WHERE cs.nps_score <= 6), 0)) * 100, 
    2
  ) as recovery_rate_percent
FROM customer_surveys cs
WHERE cs.nps_score <= 6
  AND cs.survey_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month';

-- -----------------------------------------------------------------------------
-- Survey Completion Time
-- -----------------------------------------------------------------------------
SELECT 
  AVG(EXTRACT(EPOCH FROM (survey_response_date - survey_sent_date)) / 3600) as avg_hours_to_complete,
  MIN(EXTRACT(EPOCH FROM (survey_response_date - survey_sent_date)) / 3600) as min_hours_to_complete,
  MAX(EXTRACT(EPOCH FROM (survey_response_date - survey_sent_date)) / 3600) as max_hours_to_complete
FROM customer_surveys
WHERE survey_completed = true
  AND survey_sent_date IS NOT NULL
  AND survey_response_date IS NOT NULL
  AND survey_date >= CURRENT_DATE - INTERVAL '30 days';
