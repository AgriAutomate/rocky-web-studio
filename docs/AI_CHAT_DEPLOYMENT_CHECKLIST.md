# AI Chat + SMS Deployment Checklist

## 🎯 Pre-Deployment Checklist

### Part 1: Database Migration ✅

- [ ] **Migration file created:** `supabase/migrations/20251219_create_ai_chat_support.sql`
- [ ] **Run migration script:** `npm run migrate:chat:verify`
- [ ] **Execute migration in Supabase:**
  1. Open Supabase Dashboard → SQL Editor
  2. Copy contents of `supabase/migrations/20251219_create_ai_chat_support.sql`
  3. Paste and execute
- [ ] **Verify tables created:**
  ```sql
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name IN ('faq_knowledge_base', 'chat_conversations', 'chat_messages', 'chat_escalations');
  ```
  **Expected:** 4 rows returned
- [ ] **Verify sample FAQs inserted:**
  ```sql
  SELECT COUNT(*) FROM faq_knowledge_base;
  ```
  **Expected:** 5 rows (sample FAQs)

---

### Part 2: Environment Variables ✅

#### Local Development (.env.local)

- [ ] **Mobile Message SMS:**
  ```bash
  MOBILE_MESSAGE_API_URL=https://api.mobilemessage.com.au/v1
  MOBILE_MESSAGE_API_KEY=your_api_key_here
  # OR use username/password (fallback):
  # MOBILE_MESSAGE_API_USERNAME=your_username
  # MOBILE_MESSAGE_API_PASSWORD=your_password
  MOBILE_MESSAGE_SENDER_ID=Rocky Web
  ```

- [ ] **OpenAI API:**
  ```bash
  OPENAI_API_KEY=sk-...
  ```

- [ ] **Chat Widget (choose one):**
  ```bash
  # Drift
  DRIFT_API_KEY=your_drift_api_key
  DRIFT_WEBHOOK_URL=https://api.drift.com/v1/conversations/{id}/messages
  DRIFT_DASHBOARD_URL=https://app.drift.com
  
  # OR Intercom
  INTERCOM_ACCESS_TOKEN=your_token
  INTERCOM_WEBHOOK_URL=https://api.intercom.io/conversations/{id}/parts
  
  # OR Crisp
  CRISP_IDENTIFIER=your_identifier
  CRISP_KEY=your_key
  ```

- [ ] **Slack:**
  ```bash
  SLACK_BOT_TOKEN=xoxb-...
  SLACK_SUPPORT_CHANNEL=#customer-support
  ```

- [ ] **Business ID:**
  ```bash
  BUSINESS_ID=1
  ```

- [ ] **Chat Widget Environment:**
  ```bash
  NEXT_PUBLIC_CHAT_WIDGET_ENV=production
  ```

#### Vercel Production

- [ ] **Add all variables to Vercel Dashboard**
- [ ] **Set for Production environment**
- [ ] **Redeploy application**

#### n8n Environment Variables

- [ ] **Supabase credentials**
- [ ] **OpenAI API key**
- [ ] **Slack bot token**
- [ ] **Chat widget webhook URLs**
- [ ] **Business ID**

---

### Part 3: n8n Workflow Setup ✅

- [ ] **Import workflow:**
  - Import `docs/n8n-ai-chat-workflow.json`
  - Verify all nodes configured

- [ ] **Configure credentials:**
  - Supabase PostgreSQL
  - OpenAI API
  - Slack API
  - Chat Widget API (Drift/Intercom/Crisp)

- [ ] **Set environment variables in n8n:**
  - `CHAT_WIDGET_WEBHOOK_URL`
  - `CHAT_WIDGET_DASHBOARD_URL`
  - `BUSINESS_ID`

- [ ] **Activate workflow**
- [ ] **Copy webhook URL**
- [ ] **Configure in chat widget settings**

---

### Part 4: Chat Widget Installation ✅

- [ ] **Choose widget:** Drift / Intercom / Crisp
- [ ] **Install widget code on website**
- [ ] **Configure webhook:**
  - URL: `https://your-n8n-instance.com/webhook/ai-chat-handler`
  - Events: Message received
  - Method: POST

- [ ] **Test widget:**
  - Open chat widget on website
  - Send test message
  - Verify response received

---

### Part 5: Testing ✅

#### Database Tests

- [ ] **Verify tables exist:**
  ```sql
  SELECT COUNT(*) FROM faq_knowledge_base;
  SELECT COUNT(*) FROM chat_conversations;
  SELECT COUNT(*) FROM chat_messages;
  SELECT COUNT(*) FROM chat_escalations;
  ```

- [ ] **Test FAQ queries:**
  ```sql
  SELECT * FROM faq_knowledge_base 
  WHERE category = 'scheduling' 
  AND is_active = true;
  ```

#### SMS Tests

- [ ] **Test SMS sending:**
  ```bash
  curl -X POST http://localhost:3000/api/test/sms \
    -H "Content-Type: application/json" \
    -d '{"to": "+61412345678", "message": "Test"}'
  ```

- [ ] **Verify SMS received** with sender "Rocky Web"

#### AI Chat Tests

- [ ] **Test webhook:**
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

- [ ] **Verify response** includes booking link
- [ ] **Check database** for logged conversation
- [ ] **Test escalation** with frustrated message
- [ ] **Verify Slack** notification posted

---

### Part 6: Production Deployment ✅

- [ ] **Run database migration in production Supabase**
- [ ] **Set all environment variables in Vercel**
- [ ] **Deploy application**
- [ ] **Verify production chat widget**
- [ ] **Test end-to-end in production**
- [ ] **Monitor error logs**
- [ ] **Set up monitoring/alerts**

---

## 📊 Success Metrics

After deployment, monitor:

- [ ] **Chat Response Time:** < 30 seconds average
- [ ] **FAQ Match Rate:** 60-70%
- [ ] **Escalation Rate:** 30-40%
- [ ] **SMS Delivery Rate:** > 95%
- [ ] **Customer Satisfaction:** 4.0+ / 5.0

---

## 🚨 Troubleshooting

### Migration Issues

**Problem:** Tables not created

**Solution:**
1. Check Supabase SQL Editor for errors
2. Verify `set_updated_at()` function exists
3. Check `service_businesses` table exists (for foreign key)

### Environment Variables Not Working

**Problem:** Variables not accessible

**Solution:**
1. Restart development server
2. Check `.env.local` file syntax
3. Verify no typos in variable names
4. Check Vercel environment variables are set

### n8n Workflow Not Triggering

**Problem:** Webhook not receiving messages

**Solution:**
1. Verify workflow is active
2. Check webhook URL is correct
3. Test webhook with curl
4. Check n8n execution logs

---

## 📚 Related Documentation

- **Migration:** `supabase/migrations/20251219_create_ai_chat_support.sql`
- **Environment Variables:** `docs/AI_CHAT_ENVIRONMENT_VARIABLES.md`
- **Implementation Guide:** `docs/AI_CHAT_IMPLEMENTATION_GUIDE.md`
- **n8n Setup:** `docs/N8N_CONFIGURATION.md`
- **Chat Widget:** `docs/CHAT_WIDGET_SETUP.md`

---

**Deployment Date:** ___________  
**Deployed By:** ___________  
**Status:** ⏳ Pending
