# Slack Webhook URLs Reference

Quick reference for webhook URLs and configuration for n8n integration.

---

## Incoming Webhook URLs

### Get Webhook URL from Slack

1. Go to https://api.slack.com/apps
2. Select your app
3. Navigate to **"Incoming Webhooks"**
4. Activate if not already active
5. Click **"Add New Webhook to Workspace"**
6. Select channel
7. Copy webhook URL

**Format:** `https://hooks.slack.com/services/T00000000/B00000000/YOUR_WEBHOOK_TOKEN_HERE`

---

## n8n Webhook Endpoints

### Endpoint 1: Form Submission

**URL:** `https://your-n8n-instance.com/webhook/discovery-form`

**Method:** POST

**Expected Payload:**
```json
{
  "companyName": "Acme Corp",
  "contactName": "John Doe",
  "email": "john@acme.com",
  "industry": "Technology",
  "companySize": "6-20 employees",
  "budget": "$10,000 - $25,000",
  "features": ["E-commerce", "Blog"],
  "aiFeatures": ["Chatbot"],
  "launchDate": "2024-03-15",
  "formLink": "https://form.typeform.com/to/abc123",
  "calendlyLink": "https://calendly.com/rockywebstudio/consultation"
}
```

**Sends to:** #projects

---

### Endpoint 2: Consultation Scheduled

**URL:** `https://your-n8n-instance.com/webhook/consultation-scheduled`

**Method:** POST

**Expected Payload:**
```json
{
  "companyName": "Acme Corp",
  "consultationDate": "2024-02-05T14:00:00Z",
  "contactName": "John Doe",
  "email": "john@acme.com",
  "timezone": "AEST",
  "zoomLink": "https://zoom.us/j/123456789",
  "notionLink": "https://notion.so/project/acme",
  "budget": "$10,000 - $25,000",
  "features": ["E-commerce", "Blog"],
  "industry": "Technology"
}
```

**Sends to:** #consultations

---

### Endpoint 3: Contract Signed

**URL:** `https://your-n8n-instance.com/webhook/contract-signed`

**Method:** POST

**Expected Payload:**
```json
{
  "companyName": "Acme Corp",
  "projectValue": 15000,
  "timeline": 8,
  "teamMemberName": "Sarah Johnson",
  "startDate": "2024-02-06",
  "kickoffDate": "2024-02-12T10:00:00Z",
  "packageName": "Standard Package"
}
```

**Sends to:** #wins

---

### Endpoint 4: Payment Received

**URL:** `https://your-n8n-instance.com/webhook/payment-received`

**Method:** POST

**Expected Payload:**
```json
{
  "companyName": "Acme Corp",
  "amount": 7500,
  "paymentType": "Deposit",
  "projectValue": 15000,
  "notionLink": "https://notion.so/project/acme",
  "owner": "sarah.johnson"
}
```

**Sends to:** #alerts

---

## Slash Command Webhooks

### /form-summary

**URL:** `https://your-n8n-instance.com/webhook/slack/form-summary`

**Method:** POST

**Payload from Slack:**
```json
{
  "token": "verification_token",
  "team_id": "T00000000",
  "team_domain": "rockywebstudio",
  "channel_id": "C00000000",
  "channel_name": "projects",
  "user_id": "U00000000",
  "user_name": "sarah.johnson",
  "command": "/form-summary",
  "text": "Acme Corporation",
  "response_url": "https://hooks.slack.com/commands/...",
  "trigger_id": "trigger_id"
}
```

---

### /schedule-call

**URL:** `https://your-n8n-instance.com/webhook/slack/schedule-call`

**Method:** POST

**Payload from Slack:**
```json
{
  "command": "/schedule-call",
  "text": "Acme Corporation 2024-02-05 14:00",
  "user_name": "sarah.johnson",
  "response_url": "https://hooks.slack.com/commands/..."
}
```

---

### /add-task

**URL:** `https://your-n8n-instance.com/webhook/slack/add-task`

**Method:** POST

**Payload from Slack:**
```json
{
  "command": "/add-task",
  "text": "Acme Corporation Create mockups @sarah.johnson 2024-02-10",
  "user_name": "sarah.johnson",
  "response_url": "https://hooks.slack.com/commands/..."
}
```

---

### /update-status

**URL:** `https://your-n8n-instance.com/webhook/slack/update-status`

**Method:** POST

**Payload from Slack:**
```json
{
  "command": "/update-status",
  "text": "Acme Corporation Proposal",
  "user_name": "sarah.johnson",
  "response_url": "https://hooks.slack.com/commands/..."
}
```

---

### /generate-proposal

**URL:** `https://your-n8n-instance.com/webhook/slack/generate-proposal`

**Method:** POST

**Payload from Slack:**
```json
{
  "command": "/generate-proposal",
  "text": "Acme Corporation",
  "user_name": "sarah.johnson",
  "response_url": "https://hooks.slack.com/commands/..."
}
```

---

## Testing Webhooks

### Test with curl

**Form Submission:**
```bash
curl -X POST https://your-n8n-instance.com/webhook/discovery-form \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "email": "test@example.com",
    "industry": "Technology",
    "budget": "$10,000 - $25,000"
  }'
```

**Consultation Scheduled:**
```bash
curl -X POST https://your-n8n-instance.com/webhook/consultation-scheduled \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "consultationDate": "2024-02-05T14:00:00Z",
    "contactName": "Test User",
    "email": "test@example.com"
  }'
```

---

## Security

### Verify Slack Signatures

**For Slash Commands:**
- Verify `x-slack-signature` header
- Use Slack signing secret
- Prevent unauthorized requests

**For Incoming Webhooks:**
- Keep webhook URLs secret
- Use HTTPS only
- Rotate URLs if compromised

---

## Troubleshooting

### Webhook Not Receiving Data

- Check URL is correct
- Verify HTTPS is enabled
- Check firewall/network settings
- Verify payload format

### Messages Not Posting

- Check webhook URL is correct
- Verify channel name (include #)
- Check bot permissions
- Verify message format

### Slash Commands Not Working

- Verify command is registered
- Check webhook URL in Slack app
- Verify request signature
- Check response format

---

**Reference Version:** 1.0  
**Last Updated:** 2024-01-01


