-- Rocky Web Studio / AI Customer Support Chat
-- Schema: database/schema/ai_chat_support.sql
--
-- Creates:
--  - public.faq_knowledge_base (FAQ database for AI responses)
--  - public.chat_conversations (conversation history)
--  - public.chat_messages (individual messages)
--  - public.chat_escalations (human handoff tracking)
-- Adds:
--  - Indexes for performance
--  - Constraints for data validation
--  - Foreign key relationships

-- -----------------------------------------------------------------------------
-- Table: faq_knowledge_base
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.faq_knowledge_base (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- FAQ content
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'scheduling', 'pricing', 'services', 'locations', 'general'
  
  -- AI matching
  intent_keywords JSONB DEFAULT '[]'::jsonb, -- ["schedule", "book", "appointment"]
  intent_labels JSONB DEFAULT '[]'::jsonb, -- ["scheduling", "booking"]
  
  -- Response customization
  response_template TEXT, -- Template with placeholders
  response_variables JSONB DEFAULT '{}'::jsonb, -- {"booking_link": "/book", "phone": "+61..."}
  
  -- Metadata
  priority INTEGER DEFAULT 0, -- Higher priority = matched first
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER DEFAULT 0, -- Track how often this FAQ is used
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Multi-tenant support
  business_id BIGINT REFERENCES public.service_businesses(id) ON DELETE CASCADE,
  
  -- Constraints
  CONSTRAINT faq_knowledge_base_category_values
    CHECK (category IN ('scheduling', 'pricing', 'services', 'locations', 'general', 'reschedule', 'cancellation', 'payment', 'contact')),
  
  CONSTRAINT faq_knowledge_base_priority_range
    CHECK (priority >= 0 AND priority <= 100)
);

-- Indexes for faq_knowledge_base
CREATE INDEX IF NOT EXISTS idx_faq_knowledge_base_category
  ON public.faq_knowledge_base (category)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_faq_knowledge_base_intent_keywords
  ON public.faq_knowledge_base USING GIN (intent_keywords)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_faq_knowledge_base_intent_labels
  ON public.faq_knowledge_base USING GIN (intent_labels)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_faq_knowledge_base_priority
  ON public.faq_knowledge_base (priority DESC, usage_count DESC)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_faq_knowledge_base_business_id
  ON public.faq_knowledge_base (business_id)
  WHERE business_id IS NOT NULL;

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_faq_knowledge_base_search
  ON public.faq_knowledge_base USING GIN (to_tsvector('english', question || ' ' || answer))
  WHERE is_active = true;

-- Trigger for updated_at
CREATE TRIGGER trg_faq_knowledge_base_set_updated_at
  BEFORE UPDATE ON public.faq_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Table: chat_conversations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Chat widget identification
  chat_widget_id VARCHAR(255), -- Drift/Intercom/Crisp conversation ID
  visitor_id VARCHAR(255), -- Unique visitor identifier
  visitor_email VARCHAR(255),
  visitor_name VARCHAR(255),
  visitor_phone VARCHAR(50),
  
  -- Conversation metadata
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'resolved', 'escalated', 'closed'
  channel VARCHAR(50) NOT NULL DEFAULT 'chat', -- 'chat', 'email', 'phone'
  language VARCHAR(10) DEFAULT 'en',
  
  -- AI tracking
  ai_responses_count INTEGER DEFAULT 0,
  human_handoff_count INTEGER DEFAULT 0,
  escalation_reason TEXT,
  escalated_at TIMESTAMP WITH TIME ZONE,
  
  -- Satisfaction
  satisfaction_score INTEGER, -- 1-5 rating
  satisfaction_feedback TEXT,
  
  -- Multi-tenant support
  business_id BIGINT REFERENCES public.service_businesses(id) ON DELETE CASCADE,
  
  -- Constraints
  CONSTRAINT chat_conversations_status_values
    CHECK (status IN ('active', 'resolved', 'escalated', 'closed', 'pending')),
  
  CONSTRAINT chat_conversations_channel_values
    CHECK (channel IN ('chat', 'email', 'phone', 'sms')),
  
  CONSTRAINT chat_conversations_satisfaction_range
    CHECK (satisfaction_score IS NULL OR (satisfaction_score >= 1 AND satisfaction_score <= 5))
);

-- Indexes for chat_conversations
CREATE INDEX IF NOT EXISTS idx_chat_conversations_chat_widget_id
  ON public.chat_conversations (chat_widget_id)
  WHERE chat_widget_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_conversations_visitor_id
  ON public.chat_conversations (visitor_id)
  WHERE visitor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_conversations_status
  ON public.chat_conversations (status)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_chat_conversations_business_id
  ON public.chat_conversations (business_id)
  WHERE business_id IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER trg_chat_conversations_set_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Table: chat_messages
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Conversation reference
  conversation_id BIGINT NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  
  -- Message content
  message_text TEXT NOT NULL,
  sender_type VARCHAR(50) NOT NULL, -- 'user', 'ai', 'human'
  sender_id VARCHAR(255), -- User ID, AI model name, or agent ID
  
  -- AI processing
  ai_intent VARCHAR(100), -- Extracted intent from OpenAI
  ai_confidence DECIMAL(3,2), -- 0.00 to 1.00
  ai_model VARCHAR(50), -- 'gpt-4', 'gpt-3.5-turbo', etc.
  ai_tokens_used INTEGER,
  
  -- FAQ matching
  faq_matched_id BIGINT REFERENCES public.faq_knowledge_base(id) ON DELETE SET NULL,
  faq_match_confidence DECIMAL(3,2),
  
  -- Response metadata
  response_type VARCHAR(50), -- 'faq', 'generated', 'escalated', 'action'
  response_data JSONB DEFAULT '{}'::jsonb, -- Additional response data
  
  -- Constraints
  CONSTRAINT chat_messages_sender_type_values
    CHECK (sender_type IN ('user', 'ai', 'human', 'system')),
  
  CONSTRAINT chat_messages_response_type_values
    CHECK (response_type IS NULL OR response_type IN ('faq', 'generated', 'escalated', 'action', 'fallback')),
  
  CONSTRAINT chat_messages_confidence_range
    CHECK (ai_confidence IS NULL OR (ai_confidence >= 0 AND ai_confidence <= 1)),
  
  CONSTRAINT chat_messages_faq_confidence_range
    CHECK (faq_match_confidence IS NULL OR (faq_match_confidence >= 0 AND faq_match_confidence <= 1))
);

-- Indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id
  ON public.chat_messages (conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_type
  ON public.chat_messages (sender_type);

CREATE INDEX IF NOT EXISTS idx_chat_messages_ai_intent
  ON public.chat_messages (ai_intent)
  WHERE ai_intent IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_messages_faq_matched_id
  ON public.chat_messages (faq_matched_id)
  WHERE faq_matched_id IS NOT NULL;

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_chat_messages_search
  ON public.chat_messages USING GIN (to_tsvector('english', message_text));

-- -----------------------------------------------------------------------------
-- Table: chat_escalations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_escalations (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Conversation reference
  conversation_id BIGINT NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  
  -- Escalation details
  escalation_reason TEXT NOT NULL,
  escalation_type VARCHAR(50) NOT NULL, -- 'complex', 'unable_to_help', 'user_request', 'sentiment'
  priority VARCHAR(50) NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  -- Handoff tracking
  slack_channel VARCHAR(255), -- Slack channel where ticket was created
  slack_thread_ts VARCHAR(100), -- Slack thread timestamp
  assigned_to VARCHAR(255), -- Agent/team assigned
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'assigned', 'in_progress', 'resolved'
  
  -- Resolution
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  
  -- Constraints
  CONSTRAINT chat_escalations_escalation_type_values
    CHECK (escalation_type IN ('complex', 'unable_to_help', 'user_request', 'sentiment', 'technical', 'billing')),
  
  CONSTRAINT chat_escalations_priority_values
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  CONSTRAINT chat_escalations_status_values
    CHECK (status IN ('pending', 'assigned', 'in_progress', 'resolved', 'closed'))
);

-- Indexes for chat_escalations
CREATE INDEX IF NOT EXISTS idx_chat_escalations_conversation_id
  ON public.chat_escalations (conversation_id);

CREATE INDEX IF NOT EXISTS idx_chat_escalations_status
  ON public.chat_escalations (status)
  WHERE status IN ('pending', 'assigned', 'in_progress');

CREATE INDEX IF NOT EXISTS idx_chat_escalations_priority
  ON public.chat_escalations (priority, created_at DESC)
  WHERE status IN ('pending', 'assigned', 'in_progress');

-- Trigger for updated_at
CREATE TRIGGER trg_chat_escalations_set_updated_at
  BEFORE UPDATE ON public.chat_escalations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Sample Data: FAQ Knowledge Base
-- -----------------------------------------------------------------------------
INSERT INTO public.faq_knowledge_base (question, answer, category, intent_keywords, intent_labels, response_template, priority) VALUES
  (
    'How do I schedule a service?',
    'You can schedule a service by visiting our booking form at {{booking_link}}. We offer same-day, next 48 hours, and next week availability. Would you like me to help you book now?',
    'scheduling',
    '["schedule", "book", "appointment", "booking", "when can you come", "need service"]'::jsonb,
    '["scheduling", "booking"]'::jsonb,
    'You can schedule a service by visiting our booking form at {{booking_link}}. We offer same-day, next 48 hours, and next week availability. Would you like me to help you book now?',
    90
  ),
  (
    'What''s your pricing?',
    'Our services range from $75-$200 depending on the service type. Emergency services start at $150, standard services at $100, premium services at $200, and consultations at $75. Would you like more details about a specific service?',
    'pricing',
    '["price", "cost", "how much", "pricing", "fee", "charge", "expensive", "cheap"]'::jsonb,
    '["pricing", "cost"]'::jsonb,
    'Our services range from $75-$200 depending on the service type. Emergency services start at $150, standard services at $100, premium services at $200, and consultations at $75. Would you like more details about a specific service?',
    85
  ),
  (
    'Where do you operate?',
    'We serve Rockhampton and surrounding areas within a 200km radius. This includes Yeppoon, Emu Park, Gladstone, and many other Central Queensland locations. Is your location included? 📍',
    'locations',
    '["where", "location", "area", "service area", "do you come to", "coverage", "operate"]'::jsonb,
    '["location", "service_area"]'::jsonb,
    'We serve Rockhampton and surrounding areas within a 200km radius. This includes Yeppoon, Emu Park, Gladstone, and many other Central Queensland locations. Is your location included? 📍',
    80
  ),
  (
    'Can I reschedule my booking?',
    'Yes! You can reschedule your booking by replying to your confirmation SMS with "RESCHEDULE" or by visiting {{booking_link}}. I can also help you find a new time that works. What date would you prefer?',
    'reschedule',
    '["reschedule", "change time", "different date", "move appointment", "change booking"]'::jsonb,
    '["reschedule", "change_booking"]'::jsonb,
    'Yes! You can reschedule your booking by replying to your confirmation SMS with "RESCHEDULE" or by visiting {{booking_link}}. I can also help you find a new time that works. What date would you prefer?',
    75
  ),
  (
    'How do I cancel my booking?',
    'You can cancel your booking by replying "CANCEL" to your confirmation SMS or by contacting us at {{phone}}. Cancellations made more than 24 hours in advance receive a full refund. Would you like me to help you cancel now?',
    'cancellation',
    '["cancel", "cancel booking", "refund", "don''t need service"]'::jsonb,
    '["cancellation", "refund"]'::jsonb,
    'You can cancel your booking by replying "CANCEL" to your confirmation SMS or by contacting us at {{phone}}. Cancellations made more than 24 hours in advance receive a full refund. Would you like me to help you cancel now?',
    70
  )
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Comments for Documentation
-- -----------------------------------------------------------------------------

COMMENT ON TABLE public.faq_knowledge_base IS 'FAQ knowledge base for AI customer support chat responses';
COMMENT ON TABLE public.chat_conversations IS 'Chat conversation tracking and metadata';
COMMENT ON TABLE public.chat_messages IS 'Individual chat messages with AI processing metadata';
COMMENT ON TABLE public.chat_escalations IS 'Human handoff tracking for escalated conversations';

COMMENT ON COLUMN public.faq_knowledge_base.intent_keywords IS 'JSONB array of keywords for intent matching: ["schedule", "book"]';
COMMENT ON COLUMN public.faq_knowledge_base.intent_labels IS 'JSONB array of intent labels: ["scheduling", "booking"]';
COMMENT ON COLUMN public.faq_knowledge_base.response_template IS 'Response template with placeholders like {{booking_link}}';
COMMENT ON COLUMN public.faq_knowledge_base.response_variables IS 'JSONB object with variable values: {"booking_link": "/book", "phone": "+61..."}';

COMMENT ON COLUMN public.chat_messages.ai_intent IS 'Extracted intent from OpenAI analysis';
COMMENT ON COLUMN public.chat_messages.ai_confidence IS 'AI confidence score (0.00 to 1.00)';
COMMENT ON COLUMN public.chat_messages.faq_matched_id IS 'ID of matched FAQ entry if found';
COMMENT ON COLUMN public.chat_messages.faq_match_confidence IS 'Confidence score for FAQ match (0.00 to 1.00)';

COMMENT ON COLUMN public.chat_escalations.escalation_type IS 'Reason for escalation: complex, unable_to_help, user_request, sentiment';
COMMENT ON COLUMN public.chat_escalations.slack_thread_ts IS 'Slack thread timestamp for tracking conversation';
