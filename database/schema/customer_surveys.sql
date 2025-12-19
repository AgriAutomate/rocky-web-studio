-- Rocky Web Studio / Customer Surveys (NPS, CSAT, Effort)
-- Schema: database/schema/customer_surveys.sql
--
-- Creates:
--  - public.customer_surveys (NPS, CSAT, and Effort score tracking)
-- Adds:
--  - Constraints for data validation
--  - Indexes for performance
--  - Foreign key relationships

-- -----------------------------------------------------------------------------
-- Table: customer_surveys
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_surveys (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Relationships
  lead_id UUID REFERENCES public.service_leads(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.service_bookings(id) ON DELETE CASCADE,
  
  -- Survey details
  survey_type VARCHAR(50) NOT NULL, -- 'nps', 'csat', 'effort', 'combined'
  survey_date TIMESTAMP WITH TIME ZONE,
  survey_sent_date TIMESTAMP WITH TIME ZONE,
  survey_response_date TIMESTAMP WITH TIME ZONE,
  
  -- Scores
  nps_score INTEGER, -- 0-10 (Net Promoter Score)
  csat_score INTEGER, -- 0-5 (Customer Satisfaction)
  effort_score INTEGER, -- 1-7 (Customer Effort Score, lower is better)
  
  -- Feedback and analysis
  feedback_text TEXT,
  sentiment VARCHAR(50), -- 'positive', 'neutral', 'negative'
  sentiment_confidence DECIMAL(5, 2), -- 0-100 confidence score
  
  -- Follow-up tracking
  follow_up_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'responded', 'resolved', 'closed'
  follow_up_date TIMESTAMP WITH TIME ZONE,
  follow_up_notes TEXT,
  
  -- Survey metadata
  survey_link VARCHAR(255), -- Typeform or survey platform link
  survey_platform VARCHAR(50), -- 'typeform', 'google_forms', 'custom'
  response_id VARCHAR(100), -- External survey response ID
  
  -- Tracking
  email_opened BOOLEAN DEFAULT false,
  email_opened_date TIMESTAMP WITH TIME ZONE,
  survey_clicked BOOLEAN DEFAULT false,
  survey_clicked_date TIMESTAMP WITH TIME ZONE,
  survey_completed BOOLEAN DEFAULT false,
  
  -- Constraints
  CONSTRAINT customer_surveys_survey_type_values
    CHECK (survey_type IN ('nps', 'csat', 'effort', 'combined')),
  
  CONSTRAINT customer_surveys_nps_score_range
    CHECK (nps_score IS NULL OR (nps_score >= 0 AND nps_score <= 10)),
  
  CONSTRAINT customer_surveys_csat_score_range
    CHECK (csat_score IS NULL OR (csat_score >= 0 AND csat_score <= 5)),
  
  CONSTRAINT customer_surveys_effort_score_range
    CHECK (effort_score IS NULL OR (effort_score >= 1 AND effort_score <= 7)),
  
  CONSTRAINT customer_surveys_sentiment_values
    CHECK (sentiment IS NULL OR sentiment IN ('positive', 'neutral', 'negative')),
  
  CONSTRAINT customer_surveys_follow_up_status_values
    CHECK (follow_up_status IN ('pending', 'sent', 'responded', 'resolved', 'closed')),
  
  CONSTRAINT customer_surveys_sentiment_confidence_range
    CHECK (sentiment_confidence IS NULL OR (sentiment_confidence >= 0 AND sentiment_confidence <= 100)),
  
  -- At least one relationship required
  CONSTRAINT customer_surveys_has_relationship
    CHECK (lead_id IS NOT NULL OR booking_id IS NOT NULL)
);

-- Indexes for customer_surveys
CREATE INDEX IF NOT EXISTS idx_customer_surveys_lead_id
  ON public.customer_surveys (lead_id)
  WHERE lead_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customer_surveys_booking_id
  ON public.customer_surveys (booking_id)
  WHERE booking_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customer_surveys_survey_type
  ON public.customer_surveys (survey_type);

CREATE INDEX IF NOT EXISTS idx_customer_surveys_survey_date
  ON public.customer_surveys (survey_date DESC)
  WHERE survey_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customer_surveys_nps_score
  ON public.customer_surveys (nps_score)
  WHERE nps_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customer_surveys_sentiment
  ON public.customer_surveys (sentiment)
  WHERE sentiment IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customer_surveys_follow_up_status
  ON public.customer_surveys (follow_up_status)
  WHERE follow_up_status != 'closed';

-- Composite index for NPS calculations
CREATE INDEX IF NOT EXISTS idx_customer_surveys_nps_date
  ON public.customer_surveys (survey_date DESC, nps_score)
  WHERE survey_date IS NOT NULL AND nps_score IS NOT NULL;

-- Index for response tracking
CREATE INDEX IF NOT EXISTS idx_customer_surveys_response_tracking
  ON public.customer_surveys (survey_completed, survey_response_date)
  WHERE survey_sent_date IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER trg_customer_surveys_set_updated_at
  BEFORE UPDATE ON public.customer_surveys
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Comments for Documentation
-- -----------------------------------------------------------------------------

COMMENT ON TABLE public.customer_surveys IS 'Customer survey responses including NPS, CSAT, and Effort scores';

COMMENT ON COLUMN public.customer_surveys.lead_id IS 'References service_leads.id - customer who completed survey';
COMMENT ON COLUMN public.customer_surveys.booking_id IS 'References service_bookings.id - booking that triggered survey';
COMMENT ON COLUMN public.customer_surveys.survey_type IS 'Type of survey: nps, csat, effort, or combined';
COMMENT ON COLUMN public.customer_surveys.nps_score IS 'Net Promoter Score: 0-10 (0-6=Detractor, 7-8=Passive, 9-10=Promoter)';
COMMENT ON COLUMN public.customer_surveys.csat_score IS 'Customer Satisfaction Score: 0-5 stars';
COMMENT ON COLUMN public.customer_surveys.effort_score IS 'Customer Effort Score: 1-7 (1=easiest, 7=most difficult)';
COMMENT ON COLUMN public.customer_surveys.feedback_text IS 'Free-form customer feedback text';
COMMENT ON COLUMN public.customer_surveys.sentiment IS 'AI-analyzed sentiment: positive, neutral, or negative';
COMMENT ON COLUMN public.customer_surveys.sentiment_confidence IS 'AI confidence score (0-100) for sentiment analysis';
COMMENT ON COLUMN public.customer_surveys.follow_up_status IS 'Follow-up status: pending, sent, responded, resolved, closed';
COMMENT ON COLUMN public.customer_surveys.survey_link IS 'URL to survey (Typeform, Google Forms, etc.)';
COMMENT ON COLUMN public.customer_surveys.survey_completed IS 'Whether customer completed the survey';
