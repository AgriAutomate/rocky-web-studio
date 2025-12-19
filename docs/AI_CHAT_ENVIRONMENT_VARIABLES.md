# AI Chat & SMS - Environment Variables

## 📋 Required Environment Variables

### Mobile Message SMS (ACMA-Approved)

```bash
# Mobile Message SMS API (mobilemessage.com.au)
# ACMA-Approved Sender ID: "Rocky Web"

MOBILE_MESSAGE_API_URL=https://api.mobilemessage.com.au/v1
MOBILE_MESSAGE_API_KEY=your_api_key_here
# OR use username/password (fallback):
# MOBILE_MESSAGE_API_USERNAME=your_username
# MOBILE_MESSAGE_API_PASSWORD=your_password
MOBILE_MESSAGE_SENDER_ID=Rocky Web
```

---

### OpenAI API (AI Chat)

```bash
# OpenAI API for intent extraction and response generation

OPENAI_API_KEY=sk-...
```

**Model Configuration:**
- **Intent Extraction:** `gpt-4-turbo-preview` (or `gpt-3.5-turbo` for cost savings)
- **Response Generation:** `gpt-4-turbo-preview` (or `gpt-3.5-turbo`)

---

### Chat Widget Environment

```bash
NEXT_PUBLIC_CHAT_WIDGET_ENV=production
# Options: development, staging, production
```

### Chat Widget Integration

**Drift:**
```bash
DRIFT_API_KEY=your_drift_api_key
DRIFT_WEBHOOK_URL=https://api.drift.com/v1/conversations/{id}/messages
DRIFT_DASHBOARD_URL=https://app.drift.com
```

**Intercom:**
```bash
INTERCOM_ACCESS_TOKEN=your_intercom_token
INTERCOM_WEBHOOK_URL=https://api.intercom.io/conversations/{id}/parts
INTERCOM_DASHBOARD_URL=https://app.intercom.com
```

**Crisp:**
```bash
CRISP_IDENTIFIER=your_identifier
CRISP_KEY=your_key
CRISP_WEBHOOK_URL=https://api.crisp.im/v1/website/{website_id}/conversation/{session_id}/message
CRISP_DASHBOARD_URL=https://app.crisp.chat
```

---

### n8n Configuration

```bash
# n8n webhook URLs (set in n8n environment variables)
N8N_AI_CHAT_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ai-chat-handler
CHAT_WIDGET_WEBHOOK_URL=https://api.drift.com/v1/conversations/{id}/messages
CHAT_WIDGET_DASHBOARD_URL=https://app.drift.com
BUSINESS_ID=1
```

---

### Slack Integration (Escalations)

```bash
# Slack bot token for #customer-support channel
SLACK_BOT_TOKEN=xoxb-...
SLACK_CUSTOMER_SUPPORT_CHANNEL=#customer-support
```

---

## 🔧 Setup Instructions

### Local Development (.env.local)

Create or update `.env.local`:

```bash
# Mobile Message SMS
MOBILE_MESSAGE_API_URL=https://api.mobilemessage.com.au/v1
MOBILE_MESSAGE_API_USERNAME=your_username
MOBILE_MESSAGE_API_PASSWORD=your_password
MOBILE_MESSAGE_SENDER_ID=Rocky Web

# OpenAI API
OPENAI_API_KEY=sk-...

# Chat Widget (choose one)
DRIFT_API_KEY=your_drift_api_key
DRIFT_WEBHOOK_URL=https://api.drift.com/v1/conversations/{id}/messages
DRIFT_DASHBOARD_URL=https://app.drift.com

# Slack
SLACK_BOT_TOKEN=xoxb-...
SLACK_CUSTOMER_SUPPORT_CHANNEL=#customer-support

# Business ID (for multi-tenant)
BUSINESS_ID=1
```

---

### Vercel Production

1. **Go to Vercel Dashboard:**
   - Project → Settings → Environment Variables

2. **Add all variables above**

3. **Set environment:**
   - Select: Production, Preview, Development

4. **Redeploy**

---

### n8n Environment Variables

**In n8n Settings → Environment Variables:**

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=sk-...

# Slack
SLACK_BOT_TOKEN=xoxb-...

# Chat Widget
CHAT_WIDGET_WEBHOOK_URL=https://api.drift.com/v1/conversations/{id}/messages
CHAT_WIDGET_DASHBOARD_URL=https://app.drift.com
BUSINESS_ID=1
```

---

## ✅ Verification

### Test Mobile Message SMS

```bash
curl -X POST http://localhost:3000/api/test/sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+61412345678",
    "message": "Test message from Rocky Web"
  }'
```

**Expected:** SMS received with sender "Rocky Web"

---

### Test OpenAI API

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

**Expected:** List of available models

---

### Test Chat Widget Webhook

```bash
curl -X POST https://your-n8n-instance.com/webhook/ai-chat-handler \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "test_123",
    "visitor_id": "visitor_456",
    "message": "How do I schedule a service?",
    "visitor_email": "test@example.com",
    "visitor_name": "Test User"
  }'
```

**Expected:** Response with booking information

---

## 📚 Related Documentation

- **Mobile Message Setup:** `docs/ENVIRONMENT_VARIABLES_MOBILE_MESSAGE.md`
- **n8n Configuration:** `docs/N8N_CONFIGURATION.md`
- **Chat Widget Setup:** `docs/CHAT_WIDGET_SETUP.md`
- **AI Chat Implementation:** `docs/AI_CHAT_IMPLEMENTATION_GUIDE.md`

---

**Last Updated:** December 2024  
**Status:** Ready for configuration
