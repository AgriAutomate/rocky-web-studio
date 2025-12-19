# n8n Workflow: AI Customer Chat Handler

## 📋 Workflow Overview

**Workflow Name:** AI Customer Chat Handler

**Purpose:** Process customer chat messages, extract intent using OpenAI, match to FAQ database, generate responses, and escalate complex queries to human agents via Slack.

**Trigger:** Chat widget webhook (Drift/Intercom/Crisp)

**Expected Behavior:**
- Receive chat message from widget
- Extract intent using OpenAI
- Match to FAQ knowledge base
- Generate appropriate response
- Escalate complex queries to Slack
- Log all interactions for training

---

## 🔄 Workflow Flow

### Step 1: Receive Chat Message

**Node:** Webhook Trigger

**Configuration:**
- **Path:** `ai-chat-handler`
- **Method:** POST
- **Expected Payload:**
  ```json
  {
    "conversation_id": "conv_123",
    "visitor_id": "visitor_456",
    "message": "How do I schedule a service?",
    "visitor_email": "user@example.com",
    "visitor_name": "John Doe",
    "channel": "chat"
  }
  ```

---

### Step 2: Create/Update Conversation

**Node:** Supabase (PostgreSQL)

**Operation:** Execute Query

**Query:**
```sql
INSERT INTO chat_conversations (
  chat_widget_id,
  visitor_id,
  visitor_email,
  visitor_name,
  status,
  channel,
  business_id
) VALUES ($1, $2, $3, $4, 'active', $5, $6)
ON CONFLICT (chat_widget_id) DO UPDATE SET
  updated_at = NOW(),
  visitor_email = EXCLUDED.visitor_email,
  visitor_name = EXCLUDED.visitor_name
RETURNING id;
```

**Parameters:**
- `$1`: `{{ $json.conversation_id }}`
- `$2`: `{{ $json.visitor_id }}`
- `$3`: `{{ $json.visitor_email }}`
- `$4`: `{{ $json.visitor_name }}`
- `$5`: `{{ $json.channel || 'chat' }}`
- `$6`: `{{ $env.BUSINESS_ID || 1 }}`

---

### Step 3: Save User Message

**Node:** Supabase (PostgreSQL)

**Operation:** Execute Query

**Query:**
```sql
INSERT INTO chat_messages (
  conversation_id,
  message_text,
  sender_type,
  sender_id
) VALUES ($1, $2, 'user', $3)
RETURNING id;
```

**Parameters:**
- `$1`: `{{ $json.conversation_id }}`
- `$2`: `{{ $json.message }}`
- `$3`: `{{ $json.visitor_id }}`

---

### Step 4: Extract Intent with OpenAI

**Node:** OpenAI

**Operation:** Chat Completion

**Model:** `gpt-4-turbo-preview` or `gpt-3.5-turbo`

**System Prompt:**
```
You are a customer support AI assistant for Rocky Web Studio, a service business in Rockhampton, Australia.

Your role is to analyze customer messages and extract the intent and key information.

Available intents:
- scheduling: Customer wants to book/schedule a service
- pricing: Customer asks about costs/prices
- locations: Customer asks about service area/coverage
- reschedule: Customer wants to change booking time
- cancellation: Customer wants to cancel booking
- payment: Customer asks about payment methods
- contact: Customer wants contact information
- general: General questions or unclear intent

Respond with a JSON object:
{
  "intent": "scheduling",
  "confidence": 0.95,
  "keywords": ["schedule", "book", "appointment"],
  "entities": {
    "service_type": "emergency",
    "urgency": "today"
  },
  "needs_escalation": false,
  "escalation_reason": null
}

Set needs_escalation to true if:
- Question is too complex for FAQ
- Customer expresses frustration/anger
- Request requires human judgment
- Intent confidence < 0.5
```

**User Message:**
```
{{ $json.message }}
```

**Temperature:** `0.3` (lower = more consistent)

**Max Tokens:** `150`

---

### Step 5: Parse OpenAI Response

**Node:** Code (Function)

**JavaScript:**
```javascript
const items = $input.all();
const openaiResponse = items[0].json;
const conversationData = items[1].json;

// Extract intent data from OpenAI response
let intentData;
try {
  const content = openaiResponse.choices?.[0]?.message?.content || '{}';
  intentData = JSON.parse(content);
} catch (error) {
  // Fallback if JSON parsing fails
  intentData = {
    intent: 'general',
    confidence: 0.5,
    keywords: [],
    entities: {},
    needs_escalation: false,
    escalation_reason: null
  };
}

// Extract token usage
const tokensUsed = openaiResponse.usage?.total_tokens || 0;

return [{
  json: {
    ...conversationData,
    ai_intent: intentData.intent,
    ai_confidence: intentData.confidence,
    ai_keywords: intentData.keywords,
    ai_entities: intentData.entities,
    needs_escalation: intentData.needs_escalation,
    escalation_reason: intentData.escalation_reason,
    ai_tokens_used: tokensUsed,
    ai_model: 'gpt-4-turbo-preview'
  }
}];
```

---

### Step 6: Check if Escalation Needed

**Node:** IF

**Condition:**
```
{{ $json.needs_escalation }} === true
```

**Routes:**
- **True:** → Escalate to Slack
- **False:** → Continue to FAQ matching

---

### Step 7: Match to FAQ Database

**Node:** Supabase (PostgreSQL)

**Operation:** Execute Query

**Query:**
```sql
SELECT 
  id,
  question,
  answer,
  category,
  response_template,
  response_variables,
  priority,
  (
    -- Calculate match score based on intent labels and keywords
    CASE 
      WHEN $1 = ANY(SELECT jsonb_array_elements_text(intent_labels)) THEN 100
      WHEN $2 = ANY(SELECT jsonb_array_elements_text(intent_keywords)) THEN 80
      ELSE 0
    END +
    -- Boost priority
    priority * 0.1
  ) as match_score
FROM faq_knowledge_base
WHERE is_active = true
  AND (
    $1 = ANY(SELECT jsonb_array_elements_text(intent_labels))
    OR $2 = ANY(SELECT jsonb_array_elements_text(intent_keywords))
    OR category = $1
  )
ORDER BY match_score DESC, usage_count DESC
LIMIT 1;
```

**Parameters:**
- `$1`: `{{ $json.ai_intent }}`
- `$2`: First keyword from `{{ $json.ai_keywords }}`

---

### Step 8: Generate Response (If No FAQ Match)

**Node:** OpenAI

**Operation:** Chat Completion

**Model:** `gpt-4-turbo-preview`

**System Prompt:**
```
You are a friendly customer support assistant for Rocky Web Studio, a service business in Rockhampton, Australia.

Guidelines:
- Be helpful, professional, and concise
- Use Australian English spelling
- Include relevant links when helpful
- Ask clarifying questions if needed
- If you don't know something, offer to connect them with the team

Context:
- Service area: Rockhampton and 200km radius
- Services: Emergency ($150), Standard ($100), Premium ($200), Consultation ($75)
- Booking: Available same-day, next 48h, or next week
- Phone: +61 456 370 719
- Website: rockywebstudio.com.au

Customer intent: {{ $json.ai_intent }}
Customer message: {{ $json.message }}
```

**User Message:**
```
{{ $json.message }}
```

**Temperature:** `0.7`

**Max Tokens:** `300`

---

### Step 9: Format Response

**Node:** Code (Function)

**JavaScript:**
```javascript
const items = $input.all();
const conversationData = items[0].json;
const faqMatch = items[1]?.json || null;
const generatedResponse = items[2]?.json || null;

let responseText;
let responseType;
let faqId = null;
let faqConfidence = 0;

if (faqMatch && faqMatch.id) {
  // Use FAQ response
  responseText = faqMatch.response_template || faqMatch.answer;
  responseType = 'faq';
  faqId = faqMatch.id;
  faqConfidence = 0.9;
  
  // Replace template variables
  const variables = faqMatch.response_variables || {};
  responseText = responseText.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
} else if (generatedResponse) {
  // Use generated response
  responseText = generatedResponse.choices?.[0]?.message?.content || 
    "I'm here to help! Let me connect you with our team for more assistance.";
  responseType = 'generated';
  faqConfidence = 0.3;
} else {
  // Fallback response
  responseText = "Thanks for your message! I'm connecting you with our team who can help you better.";
  responseType = 'fallback';
}

return [{
  json: {
    ...conversationData,
    response_text: responseText,
    response_type: responseType,
    faq_matched_id: faqId,
    faq_match_confidence: faqConfidence
  }
}];
```

---

### Step 10: Save AI Response

**Node:** Supabase (PostgreSQL)

**Operation:** Execute Query

**Query:**
```sql
INSERT INTO chat_messages (
  conversation_id,
  message_text,
  sender_type,
  sender_id,
  ai_intent,
  ai_confidence,
  ai_model,
  ai_tokens_used,
  faq_matched_id,
  faq_match_confidence,
  response_type,
  response_data
) VALUES ($1, $2, 'ai', 'gpt-4', $3, $4, $5, $6, $7, $8, $9, $10);

-- Update FAQ usage count if matched
UPDATE faq_knowledge_base 
SET usage_count = usage_count + 1,
    last_used_at = NOW()
WHERE id = $7;
```

**Parameters:**
- `$1`: `{{ $json.conversation_id }}`
- `$2`: `{{ $json.response_text }}`
- `$3`: `{{ $json.ai_intent }}`
- `$4`: `{{ $json.ai_confidence }}`
- `$5`: `{{ $json.ai_model }}`
- `$6`: `{{ $json.ai_tokens_used }}`
- `$7`: `{{ $json.faq_matched_id }}`
- `$8`: `{{ $json.faq_match_confidence }}`
- `$9`: `{{ $json.response_type }}`
- `$10`: `{{ JSON.stringify($json.ai_entities) }}`

---

### Step 11: Send Response to Chat Widget

**Node:** HTTP Request

**Method:** POST

**URL:** `{{ $env.CHAT_WIDGET_WEBHOOK_URL }}` (Drift/Intercom/Crisp API)

**Headers:**
- `Authorization`: `Bearer {{ $env.CHAT_WIDGET_API_KEY }}`
- `Content-Type`: `application/json`

**Body:**
```json
{
  "conversation_id": "{{ $json.conversation_id }}",
  "message": "{{ $json.response_text }}",
  "type": "bot"
}
```

---

### Step 12: Escalate to Slack (If Needed)

**Node:** Slack

**Operation:** Post Message

**Channel:** `#customer-support`

**Message:**
```
🚨 *Escalation Required*

*Conversation ID:* {{ $json.conversation_id }}
*Visitor:* {{ $json.visitor_name }} ({{ $json.visitor_email }})
*Reason:* {{ $json.escalation_reason }}

*Customer Message:*
{{ $json.message }}

*AI Analysis:*
- Intent: {{ $json.ai_intent }}
- Confidence: {{ $json.ai_confidence }}

*Take over:* [View Conversation]({{ $env.CHAT_WIDGET_DASHBOARD_URL }}/conversations/{{ $json.conversation_id }})
```

**Thread:** Create thread for conversation tracking

---

### Step 13: Create Escalation Record

**Node:** Supabase (PostgreSQL)

**Operation:** Execute Query

**Query:**
```sql
INSERT INTO chat_escalations (
  conversation_id,
  escalation_reason,
  escalation_type,
  priority,
  slack_channel,
  slack_thread_ts,
  status
) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
RETURNING id;
```

**Parameters:**
- `$1`: `{{ $json.conversation_id }}`
- `$2`: `{{ $json.escalation_reason }}`
- `$3`: `{{ $json.escalation_type || 'complex' }}`
- `$4`: `{{ $json.priority || 'normal' }}`
- `$5`: `#customer-support`
- `$6`: `{{ $json.slack_thread_ts }}`

---

## 🔌 Integrations

### Chat Widgets

**Drift:**
- Webhook URL: `https://api.drift.com/v1/conversations/{id}/messages`
- API Key: From Drift dashboard

**Intercom:**
- Webhook URL: `https://api.intercom.io/conversations/{id}/parts`
- API Key: From Intercom dashboard

**Crisp:**
- Webhook URL: `https://api.crisp.im/v1/website/{website_id}/conversation/{session_id}/message`
- API Key: From Crisp dashboard

---

### OpenAI

**Model:** `gpt-4-turbo-preview` (or `gpt-3.5-turbo` for cost savings)

**API Key:** From OpenAI dashboard

**Rate Limits:**
- GPT-4: 10,000 tokens/minute
- GPT-3.5: 1,000,000 tokens/minute

---

## 📊 Success Metrics

### Response Accuracy
- **Goal:** 80%+ FAQ match rate
- **Track:** `faq_match_confidence > 0.7`

### Escalation Rate
- **Goal:** < 20% escalation rate
- **Track:** `human_handoff_count / total_messages`

### Response Time
- **Goal:** < 2 seconds average
- **Track:** Time from message received to response sent

### Customer Satisfaction
- **Goal:** 4.0+ average rating
- **Track:** `satisfaction_score` in conversations

---

## 🚨 Error Handling

### OpenAI API Failure
- **Action:** Use fallback FAQ response
- **Log:** Error details for review

### FAQ Database Unavailable
- **Action:** Use OpenAI generated response
- **Log:** Database connection error

### Chat Widget API Failure
- **Action:** Retry 3 times with exponential backoff
- **Fallback:** Email response to visitor

---

## ✅ Success Criteria

- [ ] Chat messages received and processed
- [ ] Intent extraction working (80%+ accuracy)
- [ ] FAQ matching working (70%+ match rate)
- [ ] Responses sent to chat widget
- [ ] Escalations created in Slack
- [ ] All interactions logged to database
- [ ] Response time < 2 seconds

---

## 📚 Related Documentation

- **Database Schema:** `database/schema/ai_chat_support.sql`
- **OpenAI Prompts:** `docs/OPENAI_CHAT_PROMPTS.md`
- **Chat Widget Setup:** `docs/CHAT_WIDGET_SETUP.md`

---

**Last Updated:** December 2024  
**Status:** Ready for implementation
