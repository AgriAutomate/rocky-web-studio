# AI Customer Support Chat - Implementation Guide

## 📋 Overview

Complete implementation guide for AI-powered customer support chat using OpenAI, FAQ database, and Slack escalation.

---

## 🎯 Expected Impact

| Metric | Target | Measurement |
|--------|--------|------------|
| **Chat Response Time** | < 30 seconds | Time from message to response |
| **First-Response Rate** | 60-70% | Automated responses / Total messages |
| **Escalation Rate** | 30-40% | Escalated conversations / Total |
| **Support Cost Reduction** | 50-70% | Reduced human agent time |
| **Customer Satisfaction** | +15% | Improvement in CSAT scores |

---

## ✅ Capabilities

### ✓ Can Automate (60-70% of messages)

- **FAQs** - Common questions from knowledge base
- **Scheduling Info** - How to book, availability
- **Pricing Questions** - Service costs and packages
- **Service Descriptions** - What services are offered
- **Rescheduling Requests** - Change booking times
- **Location Questions** - Service area coverage
- **General Inquiries** - Basic information requests

### ✗ Cannot Automate (Escalate to Human)

- **Specific Account Issues** - Account access, billing history
- **Payment Disputes** - Refunds, chargebacks, payment problems
- **Complaints** - Service quality issues, negative feedback
- **Service Recovery** - Making things right after problems
- **Custom Requests** - Non-standard service requirements
- **Complex Technical Issues** - Requires expert knowledge
- **Legal/Contract Questions** - Terms, agreements, liability

---

## 🔄 Chat Workflow Examples

### 1. "How do I schedule a service?"

**AI Intent:** `booking`  
**Confidence:** `0.95`  
**Response:**
```
You can schedule a service by visiting our booking form at rockywebstudio.com.au/book. 
We offer same-day, next 48 hours, and next week availability. 
Would you like to book now? 📅
```
**Next Action:** `book`  
**Type:** FAQ match

---

### 2. "What's your pricing?"

**AI Intent:** `pricing`  
**Confidence:** `0.90`  
**Response:**
```
Our services range from $75-$200 depending on the service type:

• Emergency services: $150
• Standard services: $100
• Premium services: $200
• Consultations: $75

Would you like more details about a specific service?
```
**Next Action:** `learn_more`  
**Type:** Database query (service_types table)

---

### 3. "Where do you operate?"

**AI Intent:** `location`  
**Confidence:** `0.85`  
**Response:**
```
We serve Rockhampton and surrounding areas within a 200km radius. 
This includes Yeppoon, Emu Park, Gladstone, and many other Central Queensland locations.

Is your location included? 📍
```
**Next Action:** `learn_more`  
**Type:** FAQ match

---

### 4. "Reschedule my booking"

**AI Intent:** `reschedule`  
**Confidence:** `0.90`  
**Response:**
```
Yes! You can reschedule your booking by replying to your confirmation SMS with "RESCHEDULE" 
or by visiting rockywebstudio.com.au/book.

I can also help you find a new time that works. What date would you prefer?
```
**Next Action:** `book`  
**Type:** FAQ match + Action trigger

---

### 5. Unknown/Complex Questions

**AI Intent:** `other`  
**Confidence:** `0.40`  
**Needs Escalation:** `true`  
**Response:**
```
Thanks for your message! I'm connecting you with our team who can help you better. 
Someone will be with you shortly. 👋
```
**Next Action:** `contact`  
**Type:** Escalated to Slack

---

## 🗄️ Database Setup

### Step 1: Run Migration

```sql
-- Execute: database/schema/ai_chat_support.sql
```

### Step 2: Populate FAQ Knowledge Base

```sql
-- Example: Add more FAQs
INSERT INTO faq_knowledge_base (
  question,
  answer,
  category,
  intent_keywords,
  intent_labels,
  response_template,
  priority
) VALUES (
  'How long does a service take?',
  'Service duration varies by type: Emergency (2 hours), Standard (1.5 hours), Premium (3 hours), Consultation (1 hour).',
  'services',
  '["duration", "how long", "time", "takes"]'::jsonb,
  '["services", "duration"]'::jsonb,
  'Service duration varies by type: Emergency (2 hours), Standard (1.5 hours), Premium (3 hours), Consultation (1 hour).',
  75
);
```

### Step 3: Configure Response Variables

```sql
-- Update FAQ with variables
UPDATE faq_knowledge_base
SET response_variables = '{
  "booking_link": "rockywebstudio.com.au/book",
  "phone": "+61 456 370 719",
  "email": "info@rockywebstudio.com.au"
}'::jsonb
WHERE id = 1;
```

---

## 🔧 n8n Workflow Setup

### Step 1: Import Workflow

1. Open n8n
2. Go to Workflows → Import
3. Import `docs/n8n-ai-chat-workflow.json`

### Step 2: Configure Credentials

**Required Credentials:**
- **Supabase:** PostgreSQL connection
- **OpenAI:** API key from OpenAI dashboard
- **Slack:** Bot token for #customer-support channel
- **Chat Widget:** API credentials (Drift/Intercom/Crisp)

### Step 3: Set Environment Variables

```
CHAT_WIDGET_WEBHOOK_URL=https://api.drift.com/v1/conversations/{id}/messages
CHAT_WIDGET_DASHBOARD_URL=https://app.drift.com
BUSINESS_ID=1
```

### Step 4: Activate Workflow

1. Toggle workflow to "Active"
2. Copy webhook URL
3. Configure in chat widget settings

---

## 🎨 Chat Widget Configuration

### Drift Setup

1. **Go to Settings → Integrations → Webhooks**
2. **Add webhook:**
   - URL: `https://your-n8n-instance.com/webhook/ai-chat-handler`
   - Events: `conversation:message:created`
   - Method: POST

3. **Configure API:**
   - Get API key from Settings → API
   - Add to n8n environment variables

### Intercom Setup

1. **Go to Settings → Developers → Webhooks**
2. **Add webhook:**
   - URL: `https://your-n8n-instance.com/webhook/ai-chat-handler`
   - Events: `conversation.user.created`, `conversation.user.replied`

### Crisp Setup

1. **Go to Settings → Integrations → Webhooks**
2. **Add webhook:**
   - URL: `https://your-n8n-instance.com/webhook/ai-chat-handler`
   - Events: `message:received`

---

## 📊 Monitoring & Analytics

### Key Metrics Dashboard

```sql
-- Daily message volume
SELECT DATE(created_at) as date, COUNT(*) as messages
FROM chat_messages
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- FAQ match rate
SELECT 
  COUNT(*) FILTER (WHERE faq_matched_id IS NOT NULL) as faq_matches,
  COUNT(*) as total_messages,
  ROUND(
    (COUNT(*) FILTER (WHERE faq_matched_id IS NOT NULL)::DECIMAL / 
     NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as match_rate
FROM chat_messages
WHERE sender_type = 'ai'
  AND created_at >= CURRENT_DATE - INTERVAL '7 days';

-- Escalation rate
SELECT 
  COUNT(*) FILTER (WHERE status = 'escalated') as escalated,
  COUNT(*) as total_conversations,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'escalated')::DECIMAL / 
     NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as escalation_rate
FROM chat_conversations
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';

-- Average response time
SELECT 
  AVG(EXTRACT(EPOCH FROM (ai_response_time - user_message_time))) as avg_seconds
FROM (
  SELECT 
    conversation_id,
    MIN(created_at) FILTER (WHERE sender_type = 'user') as user_message_time,
    MIN(created_at) FILTER (WHERE sender_type = 'ai') as ai_response_time
  FROM chat_messages
  WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY conversation_id
) response_times
WHERE ai_response_time IS NOT NULL;
```

---

## 🚨 Troubleshooting

### OpenAI API Errors

**Problem:** Rate limits or API errors

**Solution:**
- Check OpenAI dashboard for usage
- Implement retry logic with exponential backoff
- Consider using GPT-3.5-turbo for cost savings
- Monitor token usage

### FAQ Not Matching

**Problem:** Low FAQ match rate

**Solution:**
- Review intent keywords in FAQ entries
- Add more variations to `intent_keywords`
- Update `intent_labels` to match OpenAI intents
- Increase FAQ priority for common questions

### Escalation Not Working

**Problem:** Escalations not posting to Slack

**Solution:**
- Verify Slack bot token
- Check Slack channel exists (#customer-support)
- Review n8n execution logs
- Test Slack node separately

---

## ✅ Success Criteria

- [ ] Chat widget installed and receiving messages
- [ ] n8n workflow active and processing messages
- [ ] OpenAI intent extraction working (80%+ accuracy)
- [ ] FAQ matching working (60-70% match rate)
- [ ] Responses sending to chat widget
- [ ] Escalations posting to Slack
- [ ] All interactions logged to database
- [ ] Response time < 30 seconds average
- [ ] Customer satisfaction improved

---

## 📚 Related Documentation

- **Workflow:** `docs/n8n-ai-chat-workflow.md`
- **Prompts:** `docs/OPENAI_CHAT_PROMPTS.md`
- **Database:** `database/schema/ai_chat_support.sql`
- **Widget Setup:** `docs/CHAT_WIDGET_SETUP.md`
- **Quick Reference:** `docs/AI_CHAT_QUICK_REFERENCE.md`

---

**Last Updated:** December 2024  
**Status:** Ready for implementation
