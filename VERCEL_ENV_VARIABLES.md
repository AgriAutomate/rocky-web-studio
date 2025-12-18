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
