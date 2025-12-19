# Chat Widget Setup Guide

## 📋 Overview

This guide covers setting up chat widgets (Drift, Intercom, or Crisp) to integrate with the AI customer support chat system.

---

## 🎯 Supported Widgets

- **Drift** (Recommended)
- **Intercom**
- **Crisp**

---

## 🔧 Drift Setup

### Step 1: Create Drift Account

1. Sign up at drift.com
2. Complete setup wizard
3. Get API credentials from Settings → API

### Step 2: Configure Webhook

1. Go to Settings → Integrations → Webhooks
2. Add new webhook:
   - **URL:** `https://your-n8n-instance.com/webhook/ai-chat-handler`
   - **Events:** `conversation:message:created`
   - **Method:** POST

### Step 3: Install Widget

1. Go to Settings → Widgets
2. Copy embed code
3. Add to your website (Next.js):
   ```tsx
   // app/layout.tsx
   import Script from 'next/script';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Script
             strategy="afterInteractive"
             src="https://js.driftt.com/include/{{your-drift-id}}/latest.js"
           />
         </body>
       </html>
     );
   }
   ```

### Step 4: Configure API Access

**Environment Variables:**
```bash
DRIFT_API_KEY=your_api_key_here
DRIFT_WEBHOOK_URL=https://api.drift.com/v1/conversations/{id}/messages
```

---

## 🔧 Intercom Setup

### Step 1: Create Intercom Account

1. Sign up at intercom.com
2. Complete setup wizard
3. Get API credentials from Settings → Developers → API

### Step 2: Configure Webhook

1. Go to Settings → Developers → Webhooks
2. Add new webhook:
   - **URL:** `https://your-n8n-instance.com/webhook/ai-chat-handler`
   - **Events:** `conversation.user.created`, `conversation.user.replied`
   - **Method:** POST

### Step 3: Install Widget

1. Go to Settings → Installation
2. Copy Messenger code
3. Add to your website:
   ```tsx
   // app/layout.tsx
   import Script from 'next/script';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Script id="intercom-script">
             {`
               window.intercomSettings = {
                 app_id: "{{your-app-id}}"
               };
               (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/{{your-app-id}}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
             `}
           </Script>
         </body>
       </html>
     );
   }
   ```

### Step 4: Configure API Access

**Environment Variables:**
```bash
INTERCOM_ACCESS_TOKEN=your_access_token_here
INTERCOM_WEBHOOK_URL=https://api.intercom.io/conversations/{id}/parts
```

---

## 🔧 Crisp Setup

### Step 1: Create Crisp Account

1. Sign up at crisp.chat
2. Complete setup wizard
3. Get API credentials from Settings → API

### Step 2: Configure Webhook

1. Go to Settings → Integrations → Webhooks
2. Add new webhook:
   - **URL:** `https://your-n8n-instance.com/webhook/ai-chat-handler`
   - **Events:** `message:received`
   - **Method:** POST

### Step 3: Install Widget

1. Go to Settings → Website → Install
2. Copy embed code
3. Add to your website:
   ```tsx
   // app/layout.tsx
   import Script from 'next/script';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Script
             strategy="afterInteractive"
             src="https://client.crisp.chat/l.js"
             data-crisp-website-id="{{your-website-id}}"
           />
         </body>
       </html>
     );
   }
   ```

### Step 4: Configure API Access

**Environment Variables:**
```bash
CRISP_IDENTIFIER=your_identifier_here
CRISP_KEY=your_key_here
CRISP_WEBHOOK_URL=https://api.crisp.im/v1/website/{website_id}/conversation/{session_id}/message
```

---

## 🔌 n8n Webhook Configuration

### Webhook Node Settings

**Path:** `ai-chat-handler`

**Method:** POST

**Expected Payload:**
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

## 🧪 Testing

### Test Message Flow

1. **Open chat widget** on your website
2. **Send test message:** "How do I schedule a service?"
3. **Check n8n execution:**
   - Webhook received ✅
   - Intent extracted ✅
   - FAQ matched ✅
   - Response sent ✅
4. **Verify response** in chat widget
5. **Check database:**
   - Conversation created ✅
   - Messages logged ✅

### Test Escalation

1. **Send frustrated message:** "This is terrible!"
2. **Check Slack:** Escalation posted ✅
3. **Check database:** Escalation record created ✅

---

## 📊 Monitoring

### Key Metrics to Track

- **Messages per day**
- **FAQ match rate**
- **Escalation rate**
- **Average response time**
- **Customer satisfaction**

### Dashboard Queries

```sql
-- Daily message count
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
```

---

## 🚨 Troubleshooting

### Webhook Not Receiving Messages

1. **Check webhook URL** in chat widget settings
2. **Verify n8n workflow** is active
3. **Check webhook logs** in n8n
4. **Test webhook** with curl:
   ```bash
   curl -X POST https://your-n8n-instance.com/webhook/ai-chat-handler \
     -H "Content-Type: application/json" \
     -d '{"conversation_id":"test","message":"test"}'
   ```

### Responses Not Sending

1. **Check chat widget API credentials**
2. **Verify API endpoint** is correct
3. **Check n8n execution logs** for errors
4. **Test API directly** with curl

### OpenAI Errors

1. **Verify API key** is set correctly
2. **Check rate limits** in OpenAI dashboard
3. **Review prompt** for syntax errors
4. **Check token usage** (may be hitting limits)

---

## ✅ Success Criteria

- [ ] Chat widget installed on website
- [ ] Webhook receiving messages
- [ ] Intent extraction working
- [ ] FAQ matching working
- [ ] Responses sending to widget
- [ ] Escalations posting to Slack
- [ ] All interactions logged

---

## 📚 Related Documentation

- **Workflow:** `docs/n8n-ai-chat-workflow.md`
- **Prompts:** `docs/OPENAI_CHAT_PROMPTS.md`
- **Database:** `database/schema/ai_chat_support.sql`
- **Quick Reference:** `docs/AI_CHAT_QUICK_REFERENCE.md`

---

**Last Updated:** December 2024  
**Status:** Ready for implementation
