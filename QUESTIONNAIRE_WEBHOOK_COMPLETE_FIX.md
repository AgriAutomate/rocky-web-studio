# ✅ Questionnaire Webhook - Complete Fix Guide

## 🔍 Current Situation

**Status:** Form saves to database ✅, but email/PDF not sending ❌

**Root Cause:** `N8N_QUESTIONNAIRE_WEBHOOK_URL` environment variable not set in Vercel

**Evidence from Vercel Logs:**
```
"N8N_QUESTIONNAIRE_WEBHOOK_URL not set - skipping webhook trigger"
```

---

## 📋 Current Code Implementation

### File: `app/api/questionnaire/submit/route.ts`

**Webhook Trigger Function (Lines 22-69):**
```typescript
async function triggerN8nWebhook(responseId: string, formData: any): Promise<void> {
  const webhookUrl = process.env.N8N_QUESTIONNAIRE_WEBHOOK_URL;
  
  if (!webhookUrl) {
    // ⚠️ THIS IS WHERE IT STOPS - Variable not set!
    await logger.info("N8N_QUESTIONNAIRE_WEBHOOK_URL not set - skipping webhook trigger");
    return;
  }

  // Sends POST request to n8n webhook
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      responseId,      // Database ID (e.g., "24")
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
    "additionalContext": "Additional notes..."
  },
  "timestamp": "2025-12-20T02:30:29.252Z"
}
```

**Called After Database Save (Line 212):**
```typescript
// STEP 3: TRIGGER N8N WEBHOOK (non-blocking)
void triggerN8nWebhook(responseId, formData).catch((err) => {
  console.error('[Questionnaire] n8n webhook trigger failed (non-blocking)', err);
});
```

---

## 🚀 Solution: Configure n8n Webhook

### Step 1: Get n8n Webhook URL

**Option A: Local n8n (Development)**
1. Open: `http://localhost:5678`
2. Navigate to workflow: `http://localhost:5678/workflow/jp6cf9EVjimtbhWZ`
3. Find the **Webhook** trigger node (first node)
4. Click on it
5. Ensure **Production** toggle is ON
6. Copy the **Production URL**
   - Example: `http://localhost:5678/webhook/questionnaire`

**Option B: Production n8n**
1. Go to your n8n instance
2. Open the questionnaire workflow
3. Find Webhook node → Copy Production URL
   - Example: `https://n8n.yourserver.com/webhook/questionnaire`

**See:** `N8N_WEBHOOK_URL_FINDER.md` for detailed instructions

---

### Step 2: Add to Vercel Environment Variables

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select project: **rocky-web-studio**

2. **Navigate:**
   - Click **Settings** → **Environment Variables**

3. **Add Variable:**
   - **Key:** `N8N_QUESTIONNAIRE_WEBHOOK_URL`
   - **Value:** `[your-webhook-url-from-step-1]`
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development

4. **Save**

5. **Redeploy:**
   - Go to **Deployments** tab
   - Click **...** on latest → **Redeploy**
   - OR push to git (auto-redeploy)

---

### Step 3: Verify n8n Workflow

**The n8n workflow should handle:**

1. **Receive Webhook** (Trigger)
   - Method: POST
   - Path: `/webhook/questionnaire`
   - Accepts JSON payload

2. **Extract Data:**
   - `responseId` - Use to fetch from Supabase (optional)
   - `formData.businessEmail` - Email recipient
   - `formData.businessName` - For email subject
   - `formData.sector` - For report generation

3. **Generate PDF:**
   - Use PDF generation node/API
   - Include: business name, sector, challenges, etc.

4. **Send Email via Resend:**
   - To: `formData.businessEmail`
   - Subject: "Your Custom Deep-Dive Report – {businessName}"
   - Attach: Generated PDF
   - Use Resend API node

5. **Update Database:**
   - Update `questionnaire_responses`:
     ```sql
     UPDATE questionnaire_responses
     SET 
       email_sent_at = NOW(),
       pdf_generated_at = NOW(),
       pdf_url = '[storage-url]'
     WHERE id = $responseId;
     ```

---

### Step 4: Test

**Test Form Submission:**
1. Fill out questionnaire: https://www.rockywebstudio.com.au/questionnaire
2. Submit
3. Check Vercel logs: Should see "n8n webhook triggered successfully"
4. Check n8n Executions: Workflow should run
5. Verify email received

**Check Vercel Logs:**
- ✅ Success: "n8n webhook triggered successfully"
- ❌ Still failing: "N8N_QUESTIONNAIRE_WEBHOOK_URL not set" → Variable not set correctly

---

## 🔄 Alternative: Direct Email (If n8n Not Ready)

If n8n workflow isn't ready, you can send emails directly from the API route.

**Modify:** `app/api/questionnaire/submit/route.ts`

**Add after line 208 (after database save):**
```typescript
// STEP 3A: SEND EMAIL DIRECTLY (if n8n not configured)
if (!process.env.N8N_QUESTIONNAIRE_WEBHOOK_URL) {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Import email template
    const ClientAcknowledgementEmail = (await import("@/lib/email/ClientAcknowledgementEmail")).default;
    const React = await import("react");
    
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
    const { updateEmailSentTimestamp } = await import("@/lib/utils/supabase-client");
    await updateEmailSentTimestamp(responseId, new Date().toISOString());
    
    await logger.info("Email sent directly (n8n not configured)", {
      responseId,
      businessEmail: formData.businessEmail,
    });
  } catch (emailError) {
    await logger.error("Direct email send failed", {
      error: String(emailError),
      responseId,
    });
    // Don't fail the request - email is non-critical
  }
}
```

**Note:** This sends email but doesn't generate PDF. For full functionality, use n8n.

---

## ✅ Success Checklist

- [ ] n8n webhook URL obtained
- [ ] `N8N_QUESTIONNAIRE_WEBHOOK_URL` added to Vercel
- [ ] Vercel project redeployed
- [ ] n8n workflow is **Active**
- [ ] Test form submission
- [ ] Check Vercel logs: "n8n webhook triggered successfully"
- [ ] Check n8n executions: Workflow ran
- [ ] Email received (with PDF if configured)
- [ ] Database timestamps updated (`email_sent_at`, `pdf_generated_at`)

---

## 📊 Expected Flow After Fix

```
1. User submits form
   ↓
2. API saves to Supabase (responseId = 24) ✅
   ↓
3. API triggers n8n webhook ✅
   POST to: N8N_QUESTIONNAIRE_WEBHOOK_URL
   Payload: { responseId, formData, timestamp }
   ↓
4. n8n workflow executes:
   - Receives webhook ✅
   - Generates PDF ✅
   - Sends email via Resend ✅
   - Updates database timestamps ✅
   ↓
5. User receives email with PDF ✅
```

---

## 🔍 Troubleshooting

### Webhook still not triggering?

1. ✅ Check Vercel environment variable is set
2. ✅ Check variable is set for correct environment (Production)
3. ✅ Redeploy after adding variable
4. ✅ Verify webhook URL is correct (no typos)
5. ✅ Check n8n workflow is **Active** (not paused)

### n8n workflow not receiving data?

1. ✅ Webhook node is first node
2. ✅ Webhook is set to **Production** mode
3. ✅ Workflow is **Active**
4. ✅ Check n8n Executions tab

### Email not sending?

1. ✅ Resend API key configured in n8n
2. ✅ Email template configured
3. ✅ PDF generation working
4. ✅ Check n8n workflow execution logs

---

## 📝 Files Reference

- **API Route:** `app/api/questionnaire/submit/route.ts`
- **Webhook Function:** Lines 22-69
- **Webhook Call:** Line 212
- **Setup Guide:** `QUESTIONNAIRE_WEBHOOK_SETUP_GUIDE.md`
- **URL Finder:** `N8N_WEBHOOK_URL_FINDER.md`

---

**Next Action:** Get the webhook URL from n8n and add it to Vercel environment variables!
