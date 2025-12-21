# 🔧 Questionnaire Email Webhook - Complete Setup Guide

## 🔍 Current Status

**Issue:** `N8N_QUESTIONNAIRE_WEBHOOK_URL not set - skipping webhook trigger`

**Impact:**
- ✅ Form saves to database successfully
- ❌ No email sent
- ❌ No PDF generated
- ❌ `email_sent_at` and `pdf_generated_at` remain NULL

## 📋 Current Implementation

### API Route: `/app/api/questionnaire/submit/route.ts`

**Webhook Trigger Function:**
```typescript
async function triggerN8nWebhook(responseId: string, formData: any): Promise<void> {
  const webhookUrl = process.env.N8N_QUESTIONNAIRE_WEBHOOK_URL;
  
  if (!webhookUrl) {
    // Logs: "N8N_QUESTIONNAIRE_WEBHOOK_URL not set - skipping webhook trigger"
    return;
  }

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      responseId,      // Database ID of saved response
      formData,       // Full form data object
      timestamp: new Date().toISOString(),
    }),
  });
}
```

**Webhook Payload Structure:**
```json
{
  "responseId": "24",
  "formData": {
    "firstName": "John",
    "lastName": "Doe",
    "businessName": "Acme Corp",
    "businessEmail": "john@acme.com",
    "businessPhone": "+61400000000",
    "sector": "healthcare",
    "selectedPainPoints": ["p1", "p2"],
    "additionalContext": "..."
  },
  "timestamp": "2025-12-20T02:30:29.252Z"
}
```

---

## 🚀 Setup Steps

### Step 1: Get n8n Webhook URL

**Option A: Local n8n (Development)**
1. Start n8n: `http://localhost:5678`
2. Open workflow: `http://localhost:5678/workflow/jp6cf9EVjimtbhWZ`
3. Find the **Webhook** trigger node
4. Click on it → Copy the **Production URL**
5. Format: `http://localhost:5678/webhook/questionnaire` (or similar)

**Option B: Production n8n (Cloud/Server)**
1. Go to your n8n instance: `https://n8n.yourserver.com`
2. Open the questionnaire workflow
3. Find the **Webhook** trigger node
4. Copy the **Production URL**
5. Format: `https://n8n.yourserver.com/webhook/questionnaire`

**Note:** The workflow ID `jp6cf9EVjimtbhWZ` suggests it's a specific workflow. Make sure you're using the correct webhook URL from that workflow.

---

### Step 2: Add to Vercel Environment Variables

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select project: **rocky-web-studio**

2. **Navigate to Settings:**
   - Click **Settings** → **Environment Variables**

3. **Add New Variable:**
   - **Key:** `N8N_QUESTIONNAIRE_WEBHOOK_URL`
   - **Value:** `[your-webhook-url-from-step-1]`
   - **Environments:** Check all:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

4. **Save** the variable

5. **Redeploy:**
   - Go to **Deployments** tab
   - Click **...** on latest deployment → **Redeploy**
   - OR wait for next git push (auto-redeploy)

---

### Step 3: Verify n8n Workflow Configuration

**The n8n workflow should:**

1. **Receive Webhook** (Trigger Node)
   - Method: POST
   - Path: `/webhook/questionnaire` (or your configured path)
   - Accepts: JSON payload

2. **Extract Data:**
   - `responseId` - Use to fetch full data from Supabase
   - `formData` - Contains all form fields

3. **Fetch from Supabase** (Optional - if you want latest data)
   - Query: `SELECT * FROM questionnaire_responses WHERE id = $responseId`

4. **Generate PDF:**
   - Use PDF generation node or API
   - Include: business name, sector, challenges, etc.

5. **Send Email via Resend:**
   - To: `formData.businessEmail`
   - Subject: "Your Custom Deep-Dive Report – {businessName}"
   - Attach: Generated PDF
   - Use Resend API node

6. **Update Database:**
   - Update `questionnaire_responses` table:
     - `email_sent_at = NOW()`
     - `pdf_generated_at = NOW()`
     - `pdf_url = [storage-url]` (if storing PDF)

---

### Step 4: Test the Webhook

**Option A: Test via Form Submission**
1. Fill out questionnaire form
2. Submit
3. Check Vercel logs for: "n8n webhook triggered successfully"
4. Check n8n workflow executions
5. Verify email received

**Option B: Test via curl**
```bash
curl -X POST https://your-domain.com/api/questionnaire/submit \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "businessName": "Test Company",
    "businessEmail": "test@example.com",
    "businessPhone": "+61400000000",
    "sector": "healthcare",
    "selectedPainPoints": []
  }'
```

---

## 🔍 Troubleshooting

### Issue: Webhook still not triggering

**Check:**
1. ✅ Environment variable set in Vercel
2. ✅ Variable set for correct environment (Production/Preview)
3. ✅ Redeployed after adding variable
4. ✅ Webhook URL is correct (no typos)
5. ✅ n8n workflow is **Active** (not paused)

**Verify in Vercel Logs:**
- Look for: "N8N_QUESTIONNAIRE_WEBHOOK_URL not set" → Variable missing
- Look for: "n8n webhook triggered successfully" → Working!
- Look for: "n8n webhook request failed" → Check webhook URL

---

### Issue: n8n workflow not receiving data

**Check:**
1. ✅ Webhook node is first node in workflow
2. ✅ Webhook is set to **Production** mode (not Test)
3. ✅ Workflow is **Active**
4. ✅ Check n8n Executions tab for incoming requests

**Test webhook directly:**
```bash
curl -X POST http://localhost:5678/webhook/questionnaire \
  -H "Content-Type: application/json" \
  -d '{
    "responseId": "24",
    "formData": {
      "businessEmail": "test@example.com",
      "businessName": "Test"
    },
    "timestamp": "2025-12-20T02:30:29.252Z"
  }'
```

---

### Issue: Email not sending

**Check:**
1. ✅ Resend API key configured in n8n
2. ✅ Email template configured correctly
3. ✅ PDF generation working
4. ✅ Check n8n workflow execution logs for errors

---

## 📝 Alternative: Direct Email Implementation

If n8n is not ready, you can implement email sending directly in the API route:

**File:** `app/api/questionnaire/submit/route.ts`

**Add after database save:**
```typescript
// STEP 3: SEND EMAIL DIRECTLY (if n8n not configured)
if (!process.env.N8N_QUESTIONNAIRE_WEBHOOK_URL) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "noreply@rockywebstudio.com.au",
    to: formData.businessEmail,
    subject: `Your Custom Deep-Dive Report – ${formData.businessName}`,
    react: React.createElement(ClientAcknowledgementEmail, {
      clientFirstName: formData.firstName,
      businessName: formData.businessName,
      sector: formData.sector,
    }),
  });
  
  // Update timestamp
  await updateEmailSentTimestamp(responseId, new Date().toISOString());
}
```

**Note:** This bypasses PDF generation. For full functionality, use n8n workflow.

---

## ✅ Success Checklist

- [ ] n8n webhook URL obtained
- [ ] `N8N_QUESTIONNAIRE_WEBHOOK_URL` added to Vercel
- [ ] Vercel project redeployed
- [ ] n8n workflow is Active
- [ ] Test form submission
- [ ] Check Vercel logs: "n8n webhook triggered successfully"
- [ ] Check n8n executions: Workflow ran
- [ ] Email received with PDF
- [ ] Database timestamps updated

---

## 📊 Expected Flow

```
1. User submits form
   ↓
2. API saves to Supabase (responseId = 24)
   ↓
3. API triggers n8n webhook (POST with responseId + formData)
   ↓
4. n8n workflow:
   - Receives webhook
   - Fetches data from Supabase (optional)
   - Generates PDF
   - Sends email via Resend with PDF
   - Updates database timestamps
   ↓
5. User receives email ✅
```

---

**Next Step:** Get the webhook URL from n8n and add it to Vercel environment variables!
