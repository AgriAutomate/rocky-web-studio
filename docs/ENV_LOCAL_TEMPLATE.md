# .env.local Template - Complete Configuration

## 📋 Complete Environment Variables Template

Copy this template to `.env.local` and fill in your actual values.

---

## 🔴 Required Variables

### Supabase Database
```bash
# Supabase Project Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Email Service (Resend)
```bash
# Resend Email API
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@rockywebstudio.com.au
```

### Application URL
```bash
# Application Base URL
NEXT_PUBLIC_URL=http://localhost:3000
# Production: https://rockywebstudio.com.au
```

---

## 📱 Mobile Message SMS (ACMA-Approved)

```bash
# Mobile Message SMS API (mobilemessage.com.au)
# ACMA-Approved Sender ID: "Rocky Web"
MOBILE_MESSAGE_API_URL=https://api.mobilemessage.com.au/v1
MOBILE_MESSAGE_API_USERNAME=your_username
MOBILE_MESSAGE_API_PASSWORD=your_password
MOBILE_MESSAGE_SENDER_ID=Rocky Web
```

---

## 🤖 AI Assistant (Claude API)

```bash
# Claude API for AI Assistant chatbot
ANTHROPIC_API_KEY=sk-ant-...
```

## 🤖 OpenAI API (AI Chat)

```bash
# OpenAI API for AI customer support chat
OPENAI_API_KEY=sk-...
```

---

## 💬 Chat Widget Integration

```bash
# Chat Widget Environment
NEXT_PUBLIC_CHAT_WIDGET_ENV=production
# Options: development, staging, production
```

### Option 1: Drift
```bash
# Drift Chat Widget
NEXT_PUBLIC_DRIFT_ID=your_drift_widget_id
DRIFT_API_KEY=your_drift_api_key
DRIFT_WEBHOOK_URL=https://api.drift.com/v1/conversations/{id}/messages
DRIFT_DASHBOARD_URL=https://app.drift.com
```

### Option 2: Intercom
```bash
# Intercom Chat Widget
NEXT_PUBLIC_INTERCOM_APP_ID=your_intercom_app_id
INTERCOM_ACCESS_TOKEN=your_intercom_token
INTERCOM_WEBHOOK_URL=https://api.intercom.io/conversations/{id}/parts
INTERCOM_DASHBOARD_URL=https://app.intercom.com
```

### Option 3: Crisp
```bash
# Crisp Chat Widget
NEXT_PUBLIC_CRISP_WEBSITE_ID=your_crisp_website_id
CRISP_IDENTIFIER=your_identifier
CRISP_KEY=your_key
CRISP_WEBHOOK_URL=https://api.crisp.im/v1/website/{website_id}/conversation/{session_id}/message
CRISP_DASHBOARD_URL=https://app.crisp.chat
```

---

## 🔔 Slack Integration

```bash
# Slack Bot for Notifications
SLACK_BOT_TOKEN=xoxb-...
SLACK_SUPPORT_CHANNEL=#customer-support
```

---

## 🔄 n8n Workflows

```bash
# n8n Webhook URLs
N8N_QUESTIONNAIRE_WEBHOOK_URL=https://your-n8n-instance.com/webhook/questionnaire
N8N_SERVICE_LEAD_WEBHOOK_URL=https://your-n8n-instance.com/webhook/service-lead
N8N_LEAD_SCORING_WEBHOOK_URL=https://your-n8n-instance.com/webhook/lead-scoring
N8N_NURTURE_WEBHOOK_URL=https://your-n8n-instance.com/webhook/nurture-drip
N8N_DUPLICATE_DETECTION_WEBHOOK_URL=https://your-n8n-instance.com/webhook/duplicate-detection
N8N_AI_CHAT_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ai-chat-handler
```

---

## 💳 Payment Processing (Stripe)

```bash
# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🗺️ Google Maps API

```bash
# Google Maps API (for ETA calculations)
GOOGLE_MAPS_API_KEY=AIza...
```

---

## 🔗 HubSpot Integration

```bash
# HubSpot CRM Integration
HUBSPOT_API_KEY=pat-na1-...
```

---

## 🏢 Multi-Tenant (Optional)

```bash
# Business ID for multi-tenant support
BUSINESS_ID=1
```

---

## 📊 Analytics & Monitoring

```bash
# Sentry Error Tracking
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DSN=https://...

# Google Analytics
NEXT_PUBLIC_GA_ID=G-...
```

---

## 🔐 Authentication

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
# Production: https://rockywebstudio.com.au
```

---

## 📝 Notes

1. **Never commit `.env.local` to git** (already in `.gitignore`)
2. **Use `.env.local.example`** as a template for team members
3. **Rotate secrets periodically** for security
4. **Use different values** for development and production
5. **Verify all variables** are set before deployment

---

## ✅ Verification

After setting up `.env.local`:

```bash
# Check TypeScript compilation
npm run type-check

# Start development server
npm run dev

# Verify environment variables loaded
# Check console for any missing variable warnings
```

---

## 📚 Related Documentation

- **AI Chat Environment Variables:** `docs/AI_CHAT_ENVIRONMENT_VARIABLES.md`
- **Mobile Message Setup:** `docs/ENVIRONMENT_VARIABLES_MOBILE_MESSAGE.md`
- **Vercel Environment Variables:** `VERCEL_ENV_VARIABLES.md`
- **Deployment Checklist:** `docs/AI_CHAT_DEPLOYMENT_CHECKLIST.md`

---

**Last Updated:** December 2024  
**Status:** Ready for use
