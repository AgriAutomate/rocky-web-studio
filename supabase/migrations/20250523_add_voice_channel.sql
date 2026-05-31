-- Add channel column for chat vs voice assistant sessions
ALTER TABLE ai_assistant_conversations ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'chat';
ALTER TABLE ai_assistant_messages ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'chat';
