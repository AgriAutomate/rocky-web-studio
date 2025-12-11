# n8n Workflow Setup Guide
## Custom Song Order Automation

This guide will help you import and configure the n8n workflow for automated custom song order processing.

---

## 📋 Prerequisites

### 1. n8n Installation
- **Self-hosted:** Install via Docker/npm
- **Cloud:** Sign up at [n8n.cloud](https://n8n.cloud)

### 2. Required API Keys & Credentials

Gather these before starting:

| Service | What You Need | Where to Get It |
|---------|---------------|-----------------|
| **Supabase** | URL + Service Role Key | [Project Settings → API](https://supabase.com/dashboard/project/gtjhtmrtbinegydatrnx/settings/api) |
| **Stripe** | Secret Key (sk_live_...) | [API Keys](https://dashboard.stripe.com/apikeys) |
| **Claude API** | API Key | [Anthropic Console](https://console.anthropic.com/settings/keys) |
| **Slack** | Incoming Webhook URL | [Slack Apps](https://api.slack.com/apps) → Create webhook |
| **Resend** | API Key | [Resend Dashboard](https://resend.com/api-keys) |

---

## 🚀 Import Workflow

### Step 1: Import JSON

1. Open n8n dashboard
2. Click **"Workflows"** in sidebar
3. Click **"Import from File"** or **"Import from URL"**
4. Select `song-order-automation.json`
5. Click **"Import"**

### Step 2: Configure Credentials

The workflow needs 5 credential sets. Configure each one:

#### A. Supabase API

1. Click on any Supabase node (green database icon)
2. Click **"Create New Credential"**
3. Enter:
   - **Name:** `Supabase - Rocky Web Studio`
   - **Host:** `https://gtjhtmrtbinegydatrnx.supabase.co`
   - **Service Role Secret:** `[YOUR_SUPABASE_SERVICE_ROLE_KEY]`
4. Click **"Save"**

#### B. Claude API (Anthropic)

1. Click on **"Generate Suno Prompt (Claude)"** node
2. Click **"Create New Credential"** → **"Header Auth"**
3. Enter:
   - **Name:** `Claude API Key`
   - **Header Name:** `x-api-key`
   - **Header Value:** `[YOUR_CLAUDE_API_KEY]`
4. Click **"Save"**

#### C. Stripe API

1. Click on **"Update Stripe Metadata"** node
2. Click **"Create New Credential"** → **"Header Auth"**
3. Enter:
   - **Name:** `Stripe API Key`
   - **Header Name:** `Authorization`
   - **Header Value:** `Bearer [YOUR_STRIPE_SECRET_KEY]`
4. Click **"Save"**

#### D. Slack Webhook

1. Go to n8n **Settings** → **Environment Variables**
2. Add:
   - **Name:** `SLACK_WEBHOOK_URL`
   - **Value:** `[YOUR_SLACK_WEBHOOK_URL]`
3. Click **"Save"**

#### E. Resend Email API

1. Click on **"Send Completion Email"** node
2. Click **"Create New Credential"** → **"Resend API"**
3. Enter:
   - **Name:** `Resend - Rocky Web Studio`
   - **API Key:** `[YOUR_RESEND_API_KEY]`
4. Click **"Save"**

---

## 🔗 Configure Webhooks

### Webhook 1: Stripe Payment

**In n8n:**
1. Click **"Stripe Payment Webhook"** node
2. Copy the **Production URL** (e.g., `https://your-n8n.com/webhook/stripe-payment-webhook`)

**In Stripe Dashboard:**
1. Go to **Developers → Webhooks**
2. Click **"Add endpoint"**
3. Paste n8n webhook URL
4. Select event: `payment_intent.succeeded`
5. Click **"Add endpoint"**

### Webhook 2: Suno Track Complete

**In n8n:**
1. Click **"Webhook: Suno Track Complete"** node
2. Copy the **Production URL** (e.g., `https://your-n8n.com/webhook/suno-track-complete`)

**Usage:**
- Call this webhook when Suno track is ready
- POST request with JSON:
```json
{
  "orderId": "CS-12345",
  "sunoUrl": "https://suno.ai/song/abc123",
  "embedUrl": "https://suno.ai/embed/abc123",
  "title": "Custom Song Title"
}
```

---

## 🧪 Test the Workflow

### Test 1: Payment Webhook

**Option A: Use Stripe CLI**
```bash
stripe trigger payment_intent.succeeded
```

**Option B: Make Test Payment**
1. Go to your checkout page
2. Use test card: `4242 4242 4242 4242`
3. Complete checkout
4. Watch workflow execute in n8n

### Test 2: Suno Completion Webhook

Use cURL or Postman:
```bash
curl -X POST https://your-n8n.com/webhook/suno-track-complete \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "CS-TEST-001",
    "sunoUrl": "https://suno.ai/song/test123",
    "embedUrl": "https://suno.ai/embed/test123",
    "title": "Test Song"
  }'
```

---

## 📊 Workflow Overview

### Flow 1: New Order (Stripe → Supabase → Slack)

```
Stripe Webhook → Filter → Extract Data → Claude Prompt → Supabase → Slack → Respond
```

**What it does:**
1. Receives Stripe `payment_intent.succeeded` event
2. Filters for successful payments only
3. Extracts customer & order data
4. Generates Suno prompt using Claude AI
5. Saves order to Supabase database
6. Sends Slack notification to #song-orders
7. Responds 200 OK to Stripe

### Flow 2: Track Complete (Suno → Email → Stripe → Slack)

```
Suno Webhook → Parse → Update DB → Get Order → Email → Stripe Update → Slack → Respond
```

**What it does:**
1. Receives Suno track completion webhook
2. Parses track URL and metadata
3. Updates Supabase order status to "COMPLETED"
4. Retrieves full order details
5. Sends email to customer with embedded player
6. Updates Stripe metadata with Suno URL
7. Sends completion notification to Slack
8. Responds 200 OK to webhook caller

---

## 🎨 Customization

### Modify Email Template

Edit the **"Send Completion Email"** node:
- Click node → Edit HTML
- Customize branding, colors, text
- Test with your email address

### Adjust Slack Messages

Edit Slack notification nodes:
- Customize message formatting
- Add/remove fields
- Change button labels/URLs

### Change Claude Prompt

Edit **"Generate Suno Prompt"** node:
- Modify the prompt template
- Adjust max_tokens (default: 1024)
- Change model if needed

---

## 🔍 Monitoring & Debugging

### View Execution History

1. Go to **Executions** in n8n sidebar
2. Click on any execution to see detailed logs
3. Check each node's input/output data

### Enable Webhook Logging

In n8n settings:
- Enable **"Save Execution Progress"**
- Enable **"Save Manual Executions"**
- Set **"Execution Timeout"** to 5 minutes

### Common Issues

| Issue | Solution |
|-------|----------|
| **Webhook not triggering** | Check Stripe/Suno webhook configuration |
| **Supabase insert fails** | Verify service role key has insert permissions |
| **Email not sending** | Check Resend API key and from email verified |
| **Claude timeout** | Increase HTTP request timeout to 30s |
| **Slack 404 error** | Verify webhook URL in environment variables |

---

## 📈 Production Checklist

Before going live:

- [ ] All credentials configured and tested
- [ ] Webhooks registered in Stripe dashboard
- [ ] Supabase RLS policies allow service role access
- [ ] Test email sent successfully
- [ ] Slack notifications appear in correct channel
- [ ] Claude API quota sufficient
- [ ] Workflow activated (toggle ON)
- [ ] Error handling tested (try invalid data)
- [ ] Execution timeout set appropriately
- [ ] Backup/export workflow JSON

---

## 🆘 Support Resources

- **n8n Docs:** https://docs.n8n.io
- **Community Forum:** https://community.n8n.io
- **Stripe Webhooks:** https://stripe.com/docs/webhooks
- **Supabase API:** https://supabase.com/docs/reference/javascript
- **Claude API:** https://docs.anthropic.com
- **Resend Docs:** https://resend.com/docs

---

## 🔐 Security Notes

1. **Never commit credentials to git**
2. Use environment variables for all secrets
3. Enable webhook signature verification (Stripe)
4. Restrict Supabase service role key usage
5. Use HTTPS for all webhook endpoints
6. Rotate API keys periodically
7. Monitor execution logs for unauthorized access

---

## 📝 Maintenance

### Monthly Tasks
- Review execution logs for errors
- Check API quota usage
- Update Claude model if new version available
- Test full workflow end-to-end

### As Needed
- Update email template for seasonal changes
- Adjust Slack message formatting
- Modify Suno prompt based on feedback
- Add new fields to database schema

---

**Workflow Version:** 1.0
**Last Updated:** 2025-12-07
**Author:** Rocky Web Studio (with Claude Code)
