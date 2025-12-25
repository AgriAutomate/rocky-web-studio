#!/bin/bash
# Test AI Assistant API
# Usage: ./scripts/test-ai-assistant.sh

API_URL="http://localhost:3000/api/ai-assistant"

echo "🧪 Testing AI Assistant API"
echo "============================"
echo ""

# Test 1: Basic message
echo "Test 1: Basic message"
echo "---------------------"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What services do you offer?"}
    ]
  }' \
  --no-buffer \
  -v

echo ""
echo ""
echo "Test 2: Conversation with history"
echo "----------------------------------"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What services do you offer?"},
      {"role": "assistant", "content": "We offer web development services."},
      {"role": "user", "content": "How much does a website cost?"}
    ]
  }' \
  --no-buffer

echo ""
echo ""
echo "✅ Tests complete!"
echo ""
echo "Check Supabase for stored conversations:"
echo "SELECT * FROM ai_assistant_conversations ORDER BY created_at DESC LIMIT 5;"

