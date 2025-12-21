# 🔍 How to Find Your n8n Webhook URL

## Quick Steps

### 1. Access n8n

**Local Development:**
- URL: `http://localhost:5678`
- Workflow ID: `jp6cf9EVjimtbhWZ`
- Direct link: `http://localhost:5678/workflow/jp6cf9EVjimtbhWZ`

**Production/Cloud:**
- URL: `https://your-n8n-instance.com`
- Navigate to the questionnaire workflow

---

### 2. Find the Webhook Node

1. Open the workflow in n8n
2. Look for the **first node** (usually a **Webhook** node)
3. Click on the Webhook node to open its settings

---

### 3. Get the Production URL

**In the Webhook node settings:**

1. **Check "Production" toggle** - Make sure it's ON
2. **Look for "Production URL"** field
3. **Copy the URL** - It will look like:
   - Local: `http://localhost:5678/webhook/questionnaire`
   - Production: `https://n8n.yourserver.com/webhook/questionnaire`

**Important:** Use the **Production URL**, not the Test URL!

---

### 4. Verify Webhook Path

The webhook path is usually:
- `/webhook/questionnaire` (default)
- `/webhook/[workflow-name]`
- Custom path you configured

**Check the "Path" field in the Webhook node settings.**

---

## Example Webhook URLs

**Local Development:**
```
http://localhost:5678/webhook/questionnaire
```

**Production (n8n Cloud):**
```
https://your-instance.app.n8n.cloud/webhook/questionnaire
```

**Production (Self-hosted):**
```
https://n8n.yourserver.com/webhook/questionnaire
```

---

## Troubleshooting

### Can't find the Webhook node?

1. Check if workflow is using a different trigger (Cron, Manual, etc.)
2. You may need to add a Webhook node as the first node
3. Set it to "Production" mode

### Webhook URL not showing?

1. Make sure the workflow is **saved**
2. Toggle "Production" mode ON
3. The URL should appear in the node settings

### Need to create a new webhook?

1. Add a **Webhook** node to your workflow
2. Set **HTTP Method** to `POST`
3. Set **Path** to `/webhook/questionnaire` (or your choice)
4. Toggle **Production** mode ON
5. Copy the **Production URL**

---

## Next Step

Once you have the webhook URL:
1. Add it to Vercel as `N8N_QUESTIONNAIRE_WEBHOOK_URL`
2. Redeploy
3. Test!

See `QUESTIONNAIRE_WEBHOOK_SETUP_GUIDE.md` for complete setup instructions.
