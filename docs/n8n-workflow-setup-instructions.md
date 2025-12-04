# n8n Client Discovery Form Automation - Setup Instructions

This document provides step-by-step instructions for setting up the automated client discovery form workflow in n8n.

## Overview

The workflow automates the following when a discovery form is submitted:
1. ✅ Parse form data
2. ✅ Send Slack notification to #projects channel
3. ✅ Append row to Google Sheets
4. ✅ Send auto-response email with PDF summary
5. ✅ Create Notion database entry (optional)
6. ✅ Schedule follow-up reminder emails

## Prerequisites

- n8n instance (cloud or self-hosted)
- Typeform or Tally account (or any form service with webhook support)
- Slack workspace with API access
- Google account with Sheets API access
- Email service (SMTP or Gmail API)
- Notion account with API access (optional)

---

## Step 1: Import Workflow

1. Open your n8n instance
2. Click **"Workflows"** → **"Import from File"**
3. Upload `n8n-discovery-form-workflow.json`
4. The workflow will appear with all nodes configured

---

## Step 2: Configure Webhook Trigger

### For Typeform:
1. Open the **"Webhook Trigger"** node
2. Copy the webhook URL (e.g., `https://your-n8n-instance.com/webhook/discovery-form`)
3. In Typeform:
   - Go to your form → **Connect** → **Webhooks**
   - Click **"Add webhook"**
   - Paste the n8n webhook URL
   - Select event: **"Form response"**
   - Save

### For Tally:
1. Copy the webhook URL from n8n
2. In Tally:
   - Go to your form → **Settings** → **Integrations**
   - Click **"Webhooks"** → **"Add webhook"**
   - Paste the URL
   - Save

### For Custom Forms:
- Ensure your form sends a POST request to the webhook URL
- Payload should include all form fields in JSON format

**Test the webhook:**
- Submit a test form
- Check n8n execution logs to verify data is received

---

## Step 3: Configure Slack Notification

1. **Create Slack App:**
   - Go to https://api.slack.com/apps
   - Click **"Create New App"** → **"From scratch"**
   - Name: "n8n Discovery Form Bot"
   - Select your workspace

2. **Add Bot Token Scopes:**
   - Go to **"OAuth & Permissions"**
   - Under **"Bot Token Scopes"**, add:
     - `chat:write`
     - `chat:write.public`
   - Click **"Install to Workspace"**
   - Copy the **Bot User OAuth Token** (starts with `xoxb-`)

3. **Configure n8n:**
   - Open **"Slack Notification"** node
   - Click **"Create New Credential"**
   - Select **"Slack API"**
   - Paste your Bot Token
   - Test connection
   - Save

4. **Update Channel:**
   - In the node, set channel to `#projects` (or your preferred channel)
   - Ensure the bot is invited to the channel

**Test:** Submit a form and check Slack for notification

---

## Step 4: Configure Google Sheets

1. **Create Google Sheet:**
   - Create a new Google Sheet
   - Name it "Client Discovery Leads"
   - Create a sheet named **"Leads"**
   - Add headers in Row 1:
     ```
     Date | Company | Contact | Email | Budget | Features | AI Interests | Form Link | Status
     ```

2. **Enable Google Sheets API:**
   - Go to https://console.cloud.google.com/
   - Create a new project (or use existing)
   - Enable **"Google Sheets API"**
   - Go to **"Credentials"** → **"Create Credentials"** → **"OAuth client ID"**
   - Application type: **"Web application"**
   - Add authorized redirect URI: `https://your-n8n-instance.com/rest/oauth2-credential/callback`
   - Copy **Client ID** and **Client Secret**

3. **Configure n8n:**
   - Open **"Append to Google Sheets"** node
   - Click **"Create New Credential"**
   - Select **"Google Sheets OAuth2 API"**
   - Paste Client ID and Client Secret
   - Authorize and grant permissions
   - Save

4. **Update Sheet ID:**
   - In the node, click **"Document ID"**
   - Paste your Google Sheet ID (from the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`)
   - Set sheet name to **"Leads"**

**Test:** Submit a form and check Google Sheets for new row

---

## Step 5: Configure Email (Auto-Response)

### Option A: SMTP (Recommended)
1. **Get SMTP Credentials:**
   - Use your email provider's SMTP settings
   - Common providers:
     - **Gmail:** smtp.gmail.com:587
     - **Outlook:** smtp-mail.outlook.com:587
     - **Resend:** smtp.resend.com:587

2. **Configure n8n:**
   - Open **"Send Auto-Response Email"** node
   - Click **"Create New Credential"**
   - Select **"SMTP"**
   - Enter:
     - **User:** your-email@domain.com
     - **Password:** your-app-password (not regular password)
     - **Host:** smtp.your-provider.com
     - **Port:** 587 (TLS) or 465 (SSL)
     - **Secure:** TLS or SSL
   - Test connection
   - Save

3. **Update Email Content:**
   - Update `fromEmail` to your sending address
   - Update Calendly link in email body
   - Customize email template as needed

### Option B: Gmail API
- Use Gmail OAuth2 credentials instead
- Requires Google Cloud Console setup

**Test:** Submit a form and check email inbox

---

## Step 6: Configure Notion (Optional)

1. **Create Notion Integration:**
   - Go to https://www.notion.so/my-integrations
   - Click **"New integration"**
   - Name: "n8n Discovery Form"
   - Select workspace
   - Copy **Internal Integration Token**

2. **Create Notion Database:**
   - Create a new database in Notion
   - Add properties:
     - **Title** (Title type)
     - **Contact** (Text)
     - **Email** (Email)
     - **Budget** (Select)
     - **Features** (Multi-select)
     - **Submission Date** (Date)
   - Share database with your integration (click **"..."** → **"Add connections"**)

3. **Configure n8n:**
   - Open **"Create Notion Entry"** node
   - Click **"Create New Credential"**
   - Select **"Notion API"**
   - Paste Integration Token
   - Save

4. **Update Database ID:**
   - In Notion, open your database
   - Copy the database ID from URL: `https://notion.so/YOUR_WORKSPACE/DATABASE_ID_HERE`
   - Paste in node's **"Database ID"** field

**Test:** Submit a form and check Notion database

---

## Step 7: Configure Follow-Up Emails (Scheduled)

The workflow includes scheduled reminder nodes, but they need to be connected to email sending logic:

1. **Create Follow-Up Email Workflow:**
   - Create a separate workflow or extend this one
   - Use **"Schedule Trigger"** nodes
   - Filter for consultations happening in 24h/48h
   - Send reminder emails

2. **Alternative: Use Calendly Webhooks:**
   - Connect Calendly webhook to n8n
   - When consultation is booked, schedule reminders
   - More accurate than fixed intervals

---

## Step 8: Customize Form Data Parsing

The **"Parse Form Data"** node extracts fields from the webhook payload. Update it based on your form structure:

1. Open **"Parse Form Data"** node
2. Check your form's webhook payload structure
3. Update field mappings:
   ```javascript
   companyName: body.companyName || body['Company Name'] || '',
   ```
4. Adjust for your form's field names

**Test:** Submit a form and check execution data at each node

---

## Step 9: Test Complete Workflow

1. **Submit Test Form:**
   - Fill out and submit your discovery form
   - Watch n8n execution in real-time

2. **Verify Each Step:**
   - ✅ Webhook receives data
   - ✅ Slack notification sent
   - ✅ Google Sheets row added
   - ✅ Email sent with PDF
   - ✅ Notion entry created (if enabled)

3. **Check for Errors:**
   - Review execution logs
   - Fix any credential or mapping issues
   - Re-test

---

## Troubleshooting

### Webhook Not Receiving Data
- Check webhook URL is correct
- Verify form is sending POST requests
- Check n8n webhook is active
- Review form webhook settings

### Slack Notification Fails
- Verify bot token is valid
- Check bot is invited to channel
- Verify channel name is correct (include `#`)

### Google Sheets Not Updating
- Check OAuth credentials are valid
- Verify sheet ID is correct
- Ensure sheet name matches exactly
- Check API is enabled in Google Cloud Console

### Email Not Sending
- Verify SMTP credentials
- Check email provider allows SMTP
- Use app password (not regular password) for Gmail
- Check spam folder

### PDF Not Generating
- Verify HTML to PDF node is working
- Check HTML content is valid
- Review execution logs for errors

### Notion Entry Not Created
- Verify integration token is valid
- Check database is shared with integration
- Verify database ID is correct
- Check property names match exactly

---

## Advanced Customization

### Add More Integrations
- **CRM Integration:** Add HubSpot, Salesforce, or Pipedrive nodes
- **Calendar:** Auto-create calendar events
- **Task Management:** Create tasks in Asana, Trello, etc.

### Conditional Logic
- Add **"IF"** nodes to route based on:
  - Budget range
  - Industry
  - Feature requirements

### Data Enrichment
- Add company data lookup (Clearbit, etc.)
- Verify email addresses
- Check domain information

### Multiple Form Sources
- Add multiple webhook triggers
- Route to same processing logic
- Tag source in data

---

## Security Best Practices

1. **Use Environment Variables:**
   - Store sensitive data in n8n environment variables
   - Reference with `{{ $env.VARIABLE_NAME }}`

2. **Webhook Security:**
   - Use webhook authentication if available
   - Validate webhook signatures

3. **Credential Management:**
   - Use n8n's credential system
   - Never hardcode credentials
   - Rotate tokens regularly

4. **Data Privacy:**
   - Ensure GDPR compliance
   - Encrypt sensitive data
   - Set data retention policies

---

## Support

For issues or questions:
- Check n8n documentation: https://docs.n8n.io/
- Review execution logs in n8n
- Test each node individually
- Check credential connections

---

## Workflow Summary

```
Webhook Trigger
    ↓
Parse Form Data
    ↓
    ├─→ Slack Notification
    ├─→ Google Sheets Append
    ├─→ Generate PDF Content
    │       ↓
    │   Convert to PDF
    │       ↓
    │   Send Auto-Response Email
    └─→ Create Notion Entry
```

**Status:** Ready for production after testing ✅



