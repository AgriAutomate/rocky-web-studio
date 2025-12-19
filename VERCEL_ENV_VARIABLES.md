# Vercel Environment Variables - Complete List

## 🔴 Required Variables (Must be set for production)

These variables are **required** and validated by `lib/env.ts`. The application will fail if these are missing in production.

### Email Service (Resend)
- **`RESEND_API_KEY`** (Required)
  - Description: API key for Resend email service
  - Format: `sk-proj-...` (starts with `sk-proj-`)
  - Used for: Sending questionnaire confirmation emails with PDF attachments
  - Where to get: [Resend Dashboard](https://resend.com/api-keys)

### Supabase Database & Storage
- **`SUPABASE_URL`** (Required)
  - Description: Your Supabase project URL
  - Format: `https://[project-id].supabase.co`
  - Used for: Database connections and storage operations
  - Where to get: Supabase Project Settings → API → Project URL

- **`SUPABASE_SERVICE_ROLE_KEY`** (Required)
  - Description: Supabase service role key (server-side only, has admin privileges)
  - Format: JWT token starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - Used for: Server-side database operations, storage uploads, questionnaire response storage
  - ⚠️ **SECURITY**: Never expose this to the client. Server-side only.
  - Where to get: Supabase Project Settings → API → Service Role Key (secret)

### Public Supabase (Client-Side)
- **`NEXT_PUBLIC_SUPABASE_URL`** (Required for client-side)
  - Description: Same as `SUPABASE_URL` but exposed to the browser
  - Format: `https://[project-id].supabase.co`
  - Used for: Client-side Supabase operations (if any)
  - Where to get: Same as `SUPABASE_URL`

- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** (Required for client-side)
  - Description: Supabase anonymous/public key (safe for client-side)
  - Format: JWT token starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - Used for: Client-side Supabase operations (if any)
  - Where to get: Supabase Project Settings → API → anon/public key

### Application URL
- **`NEXT_PUBLIC_URL`** (Required)
  - Description: Base URL for the application (used in PDF generation for image URLs)
  - Format: 
    - Production: `https://your-domain.com`
    - Preview: `https://your-preview-url.vercel.app`
  - Used for: Generating absolute URLs in PDF reports
  - Example: `https://rockywebstudio.com.au`

---

## 🟡 Optional Variables (Recommended but not required)

These variables enhance functionality but the app will work without them.

### Logging & Monitoring
- **`SLACK_WEBHOOK_URL`** (Optional)
  - Description: Slack webhook URL for error notifications and logging
  - Format: `https://hooks.slack.com/services/...`
  - Used for: Sending structured logs to Slack channel
  - Where to get: [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
  - Default: If not set, logs only go to console

### n8n Workflow Integration
- **`N8N_QUESTIONNAIRE_WEBHOOK_URL`** (Optional)
  - Description: n8n webhook URL for questionnaire submission processing
  - Format: `https://your-n8n-instance/webhook/questionnaire`
  - Used for: Triggering n8n workflow when questionnaire is submitted
  - Where to get: n8n Dashboard → Workflows → Webhook URL
  - Default: If not set, webhook trigger is skipped (logged but not blocking)

- **`N8N_SERVICE_LEAD_WEBHOOK_URL`** (Optional)
  - Description: n8n webhook URL for service lead processing
  - Format: `https://your-n8n-instance/webhook/service-lead`
  - Used for: Triggering n8n workflow when service lead is submitted
  - Where to get: n8n Dashboard → Workflows → Webhook URL
  - Default: If not set, webhook trigger is skipped (logged but not blocking)

- **`N8N_LEAD_SCORING_WEBHOOK_URL`** (Optional)
  - Description: n8n webhook URL for lead scoring automation
  - Format: `https://your-n8n-instance/webhook/lead-scoring`
  - Used for: Triggering lead scoring workflow
  - Where to get: n8n Dashboard → Workflows → Webhook URL
  - Default: If not set, webhook trigger is skipped

- **`N8N_NURTURE_WEBHOOK_URL`** (Optional)
  - Description: n8n webhook URL for nurture drip campaigns
  - Format: `https://your-n8n-instance/webhook/nurture-drip`
  - Used for: Triggering nurture email sequences
  - Where to get: n8n Dashboard → Workflows → Webhook URL
  - Default: If not set, webhook trigger is skipped

- **`N8N_DUPLICATE_DETECTION_WEBHOOK_URL`** (Optional)
  - Description: n8n webhook URL for duplicate lead detection
  - Format: `https://your-n8n-instance/webhook/duplicate-detection`
  - Used for: Triggering duplicate detection workflow
  - Where to get: n8n Dashboard → Workflows → Webhook URL
  - Default: If not set, webhook trigger is skipped

- **`N8N_AI_CHAT_WEBHOOK_URL`** (Optional)
  - Description: n8n webhook URL for AI customer chat handler
  - Format: `https://your-n8n-instance/webhook/ai-chat-handler`
  - Used for: Processing AI chat messages
  - Where to get: n8n Dashboard → Workflows → Webhook URL
  - Default: If not set, AI chat will not work

**Note:** These webhook URLs are placeholders until n8n workflows are deployed. Update with actual webhook URLs after workflow deployment.

### External Integrations
- **`CALENDLY_URL`** (Optional)
  - Description: Calendly scheduling URL for booking appointments
  - Format: `https://calendly.com/...`
  - Used for: Links in emails or UI for scheduling follow-up calls
  - Default: If not set, scheduling links may not work

### PDF Generation (Development Only)
- **`CHROME_EXECUTABLE_PATH`** (Optional, Dev only)
  - Description: Path to Chrome/Edge executable for local PDF generation
  - Format: 
    - Windows: `C:\Program Files\Google\Chrome\Application\chrome.exe`
    - Mac: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
    - Linux: `/usr/bin/google-chrome`
  - Used for: Local development PDF generation with Puppeteer
  - ⚠️ **Note**: Not needed in Vercel production (uses `@sparticuz/chromium`)

- **`DEBUG_PDF`** (Optional)
  - Description: Enable debug logging for PDF generation
  - Format: `true` or `false`
  - Used for: Debugging PDF generation issues
  - Default: `false` (or not set)

---

## 📋 Quick Setup Checklist for Vercel

### Step 1: Go to Vercel Project Settings
1. Navigate to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**

### Step 2: Add Required Variables
Add each of these with their actual values:

```
✅ RESEND_API_KEY=sk-proj-...
✅ SUPABASE_URL=https://[project-id].supabase.co
✅ SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ NEXT_PUBLIC_URL=https://your-domain.com
```

### Step 3: Add Optional Variables (Recommended)
```
🟡 SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
🟡 CALENDLY_URL=https://calendly.com/...
🟡 N8N_QUESTIONNAIRE_WEBHOOK_URL=https://your-n8n-instance/webhook/questionnaire
🟡 N8N_SERVICE_LEAD_WEBHOOK_URL=https://your-n8n-instance/webhook/service-lead
🟡 N8N_LEAD_SCORING_WEBHOOK_URL=https://your-n8n-instance/webhook/lead-scoring
🟡 N8N_NURTURE_WEBHOOK_URL=https://your-n8n-instance/webhook/nurture-drip
🟡 N8N_DUPLICATE_DETECTION_WEBHOOK_URL=https://your-n8n-instance/webhook/duplicate-detection
🟡 N8N_AI_CHAT_WEBHOOK_URL=https://your-n8n-instance/webhook/ai-chat-handler
```

### Mobile Message SMS (ACMA-Approved)
```
🟡 MOBILE_MESSAGE_API_URL=https://api.mobilemessage.com.au/v1
🟡 MOBILE_MESSAGE_API_KEY=your_api_key_here
# OR use username/password (fallback):
# 🟡 MOBILE_MESSAGE_API_USERNAME=your_username
# 🟡 MOBILE_MESSAGE_API_PASSWORD=your_password
🟡 MOBILE_MESSAGE_SENDER_ID=Rocky Web
```

### Chat Widget Environment
```
🟡 NEXT_PUBLIC_CHAT_WIDGET_ENV=production
```

### OpenAI API (AI Chat)
```
🟡 OPENAI_API_KEY=sk-...
```

### Chat Widget Integration (Choose One)
```
# Drift
🟡 DRIFT_API_KEY=your_drift_api_key
🟡 DRIFT_WEBHOOK_URL=https://api.drift.com/v1/conversations/{id}/messages
🟡 DRIFT_DASHBOARD_URL=https://app.drift.com

# OR Intercom
🟡 INTERCOM_ACCESS_TOKEN=your_intercom_token
🟡 INTERCOM_WEBHOOK_URL=https://api.intercom.io/conversations/{id}/parts

# OR Crisp
🟡 CRISP_IDENTIFIER=your_identifier
🟡 CRISP_KEY=your_key
```

### Slack Integration
```
🟡 SLACK_BOT_TOKEN=xoxb-...
🟡 SLACK_SUPPORT_CHANNEL=#customer-support
```

### Step 4: Set Environment Scope
For each variable, select the appropriate environments:
- **Production**: ✅ Required for live site
- **Preview**: ✅ Recommended (for testing preview deployments)
- **Development**: ⚠️ Optional (only if you want to test locally with Vercel CLI)

### Step 5: Redeploy
After adding variables, trigger a new deployment:
- Go to **Deployments** tab
- Click **Redeploy** on the latest deployment
- Or push a new commit to trigger automatic deployment

---

## 🔒 Security Notes

1. **Never commit secrets to Git**
   - All secrets should be in Vercel Environment Variables
   - `.env.local` is git-ignored for local development

2. **Service Role Key Security**
   - `SUPABASE_SERVICE_ROLE_KEY` has admin privileges
   - Only use server-side (never in `NEXT_PUBLIC_*` variables)
   - If exposed, rotate it immediately in Supabase dashboard

3. **API Key Rotation**
   - Rotate keys periodically for security
   - Update in Vercel after rotating in service dashboards

4. **Environment-Specific Values**
   - `NEXT_PUBLIC_URL` should match your actual domain
   - Use different values for Production vs Preview if needed

---

## 🧪 Testing After Setup

After adding all variables, verify the deployment:

1. **Check Build Logs**
   - Go to Vercel deployment logs
   - Ensure no "Missing environment variable" errors

2. **Test Questionnaire Submission**
   - Submit a test questionnaire form
   - Verify email is sent with PDF attachment
   - Check Supabase database for stored response

3. **Check Function Logs**
   - Go to Vercel → Functions → `/api/questionnaire/submit`
   - Verify no environment variable errors in logs

---

## 📝 Variable Reference by Feature

### Questionnaire Workflow
- `RESEND_API_KEY` - Email sending
- `SUPABASE_URL` - Database connection
- `SUPABASE_SERVICE_ROLE_KEY` - Database writes
- `NEXT_PUBLIC_URL` - PDF image URLs
- `N8N_QUESTIONNAIRE_WEBHOOK_URL` - n8n workflow trigger

### Service Lead Workflow
- `SUPABASE_URL` - Database connection
- `SUPABASE_SERVICE_ROLE_KEY` - Database writes
- `N8N_SERVICE_LEAD_WEBHOOK_URL` - n8n workflow trigger

### Automation & Workflows
- `N8N_LEAD_SCORING_WEBHOOK_URL` - Lead scoring automation
- `N8N_NURTURE_WEBHOOK_URL` - Nurture drip campaigns

### Logging & Monitoring
- `SLACK_WEBHOOK_URL` - Error notifications

### Client-Side Features
- `NEXT_PUBLIC_SUPABASE_URL` - Client Supabase connection
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Client authentication

---

## 🆘 Troubleshooting

### "Missing required environment variables" Error
- Check that all required variables are set in Vercel
- Verify variable names match exactly (case-sensitive)
- Ensure variables are set for the correct environment (Production/Preview)

### PDF Generation Fails
- Verify `NEXT_PUBLIC_URL` is set correctly
- Check that `@sparticuz/chromium` is in `package.json` (for Vercel)
- Review function logs for Puppeteer errors

### Email Not Sending
- Verify `RESEND_API_KEY` is valid and active
- Check Resend dashboard for API key status
- Review function logs for Resend API errors

### Database Connection Fails
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check Supabase project is active
- Verify service role key hasn't been rotated
