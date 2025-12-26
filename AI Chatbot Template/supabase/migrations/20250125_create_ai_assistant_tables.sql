-- Create AI Assistant conversation and message tables
-- Date: January 25, 2025
-- Purpose: Store AI Assistant chat history for lead qualification

-- AI Assistant Conversations Table
CREATE TABLE IF NOT EXISTS ai_assistant_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_message TEXT,
  message_count INTEGER DEFAULT 0,
  client_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Assistant Messages Table
CREATE TABLE IF NOT EXISTS ai_assistant_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_assistant_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_assistant_conversations_updated_at 
  ON ai_assistant_conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_assistant_messages_conversation_id 
  ON ai_assistant_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_ai_assistant_messages_created_at 
  ON ai_assistant_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE ai_assistant_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistant_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Service role can access all, anon cannot access
-- (AI Assistant is server-side only, no client access needed)
-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Service role can access all conversations" ON ai_assistant_conversations;
DROP POLICY IF EXISTS "Service role can access all messages" ON ai_assistant_messages;

CREATE POLICY "Service role can access all conversations"
  ON ai_assistant_conversations
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all messages"
  ON ai_assistant_messages
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists (idempotent)
DROP TRIGGER IF EXISTS update_ai_assistant_conversations_updated_at ON ai_assistant_conversations;

CREATE TRIGGER update_ai_assistant_conversations_updated_at
  BEFORE UPDATE ON ai_assistant_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

