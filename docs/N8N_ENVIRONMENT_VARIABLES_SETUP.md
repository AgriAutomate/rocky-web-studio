# n8n Environment Variables Setup Guide

This guide covers setting up n8n webhook environment variables for Rocky Web Studio.

## 📋 Overview

The application uses n8n workflows for automated processing of:
- Questionnaire submissions
- Service lead submissions
- Lead scoring
- Duplicate detection and merging
- Nurture drip campaigns

## 🔧 Environment Variables to Add

### Development (.env.local)

Add these variables to your `.env.local` file:

```bash
# n8n Webhook Integration
# These URLs will be populated after deploying n8n workflows in Phase 1F
# For now, use placeholder URLs - they will be updated with actual webhook URLs
N8N_QUESTIONNAIRE_WEBHOOK_URL=https://your-n8n-instance/webhook/questionnaire
N8N_SERVICE_LEAD_WEBHOOK_URL=https://your-n8n-instance/webhook/service-lead
N8N_LEAD_SCORING_WEBHOOK_URL=https://your-n8n-instance/webhook/lead-scoring
N8N_DUPLICATE_DETECTION_WEBHOOK_URL=https://your-n8n-instance/webhook/duplicate-detection
N8N_NURTURE_WEBHOOK_URL=https://your-n8n-instance/webhook/nurture-drip
```

### Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/martinc343-3347s-projects/rocky-web-studio/settings/environment-variables
   - Or: Project → Settings → Environment Variables

2. **Add Each Variable**

   **Variable 1: N8N_QUESTIONNAIRE_WEBHOOK_URL**
   ```
   Name: N8N_QUESTIONNAIRE_WEBHOOK_URL
   Value: https://your-n8n-instance/webhook/questionnaire
   Environments: Production, Preview, Development
   ```

   **Variable 2: N8N_SERVICE_LEAD_WEBHOOK_URL**
   ```
   Name: N8N_SERVICE_LEAD_WEBHOOK_URL
   Value: https://your-n8n-instance/webhook/service-lead
   Environments: Production, Preview, Development
   ```

   **Variable 3: N8N_LEAD_SCORING_WEBHOOK_URL**
   ```
   Name: N8N_LEAD_SCORING_WEBHOOK_URL
   Value: https://your-n8n-instance/webhook/lead-scoring
   Environments: Production, Preview, Development
   ```

   **Variable 4: N8N_NURTURE_WEBHOOK_URL**
   ```
   Name: N8N_NURTURE_WEBHOOK_URL
   Value: https://your-n8n-instance/webhook/nurture-drip
   Environments: Production, Preview, Development
   ```

3. **Redeploy the Project**
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment
   - Or push a new commit to trigger automatic deployment

## 🔍 How These Variables Are Used

### N8N_QUESTIONNAIRE_WEBHOOK_URL
- **Used in:** `app/api/questionnaire/submit/route.ts`
- **Triggered:** When a questionnaire is submitted
- **Payload:** `{ responseId, formData, timestamp }`
- **Behavior:** Non-blocking (fire-and-forget)

### N8N_SERVICE_LEAD_WEBHOOK_URL
- **Used in:** `app/api/service/lead-submit/route.ts`
- **Triggered:** When a service lead is submitted
- **Payload:** `{ leadId, formData, timestamp }`
- **Behavior:** Non-blocking (fire-and-forget)

### N8N_LEAD_SCORING_WEBHOOK_URL
- **Used in:** Future lead scoring automation
- **Triggered:** When a lead needs scoring
- **Payload:** TBD in Phase 1F
- **Behavior:** TBD

### N8N_NURTURE_WEBHOOK_URL
- **Used in:** Future nurture drip campaigns
- **Triggered:** When a nurture sequence should start
- **Payload:** TBD in Phase 1F
- **Behavior:** TBD

## ⚠️ Important Notes

1. **Placeholder URLs**
   - Current values are placeholders
   - Actual webhook URLs will be provided after n8n workflows are deployed in Phase 1F
   - Update these values once workflows are live

2. **Non-Blocking Behavior**
   - Webhook failures do not block form submissions
   - Errors are logged but don't prevent data from being saved
   - This ensures the user experience is not impacted by webhook issues

3. **Environment Scope**
   - Set for Production, Preview, and Development
   - Use different n8n instances for different environments if needed
   - Or use the same instance with different webhook paths

## 🧪 Testing After Setup

1. **Check Build Logs**
   - Verify no "Missing environment variable" errors
   - Check that webhook URLs are being read correctly

2. **Test Questionnaire Submission**
   - Submit a test questionnaire
   - Check application logs for webhook trigger messages
   - Verify webhook is called (check n8n workflow logs)

3. **Test Service Lead Submission**
   - Submit a test service lead
   - Check application logs for webhook trigger messages
   - Verify webhook is called (check n8n workflow logs)

4. **Verify Error Handling**
   - If webhook URL is not set, check that submission still succeeds
   - Verify error messages are logged appropriately

## 🔄 Updating Webhook URLs (Phase 1F)

After deploying n8n workflows:

1. **Get Actual Webhook URLs**
   - Go to n8n Dashboard
   - Navigate to each workflow
   - Copy the webhook URL from the Webhook node

2. **Update Vercel Environment Variables**
   - Replace placeholder URLs with actual webhook URLs
   - Update for all environments (Production, Preview, Development)

3. **Update .env.local**
   - Replace placeholder URLs in your local `.env.local` file

4. **Redeploy**
   - Redeploy Vercel project to pick up new values
   - Test webhook triggers to verify they work

## 🆘 Troubleshooting

### Webhook Not Triggering
- Check that environment variable is set correctly
- Verify webhook URL is accessible
- Check application logs for webhook errors
- Verify n8n workflow is active and webhook is enabled

### "Webhook URL not set" Messages
- This is expected if variables are not set
- Submissions will still succeed (webhook is optional)
- Set the variables to enable webhook triggers

### Webhook Failures Not Blocking Submissions
- This is by design (non-blocking behavior)
- Check logs for webhook error details
- Verify n8n workflow is receiving requests
- Check n8n workflow logs for processing errors

## 📚 Related Documentation

- [Vercel Environment Variables Setup](./VERCEL_ENV_VARIABLES.md)
- [Environment Variables Quick Reference](./ENVIRONMENT_VARIABLES_QUICK_REFERENCE.md)
- n8n Workflow Documentation (Phase 1F)
