# Slack Slash Commands Setup Guide

Complete guide for setting up custom slash commands for the discovery workflow.

---

## Overview

Slash commands allow team members to quickly interact with the discovery workflow directly from Slack.

**Commands:**
- `/form-summary [company-name]` - View form summary
- `/schedule-call [company-name] [date] [time]` - Schedule consultation
- `/add-task [company-name] [task] [owner] [deadline]` - Create task
- `/update-status [company-name] [status]` - Update pipeline status
- `/generate-proposal [company-name]` - Generate proposal

---

## Setup Method 1: Using n8n (Recommended)

### Step 1: Create Webhook Endpoints

Create webhook endpoints in n8n for each command:

**Endpoint Structure:**
- `/slack/form-summary`
- `/slack/schedule-call`
- `/slack/add-task`
- `/slack/update-status`
- `/generate-proposal`

### Step 2: Configure Slack Slash Commands

1. Go to https://api.slack.com/apps
2. Select your app
3. Go to **"Slash Commands"**
4. Click **"Create New Command"**

**For each command:**

**Command 1: /form-summary**
- **Command:** `/form-summary`
- **Request URL:** `https://your-n8n-instance.com/webhook/slack/form-summary`
- **Short Description:** Get form summary for a company
- **Usage Hint:** `[company-name]`

**Command 2: /schedule-call**
- **Command:** `/schedule-call`
- **Request URL:** `https://your-n8n-instance.com/webhook/slack/schedule-call`
- **Short Description:** Schedule consultation call
- **Usage Hint:** `[company-name] [date] [time]`

**Command 3: /add-task**
- **Command:** `/add-task`
- **Request URL:** `https://your-n8n-instance.com/webhook/slack/add-task`
- **Short Description:** Add task to project
- **Usage Hint:** `[company-name] [task] [owner] [deadline]`

**Command 4: /update-status**
- **Command:** `/update-status`
- **Request URL:** `https://your-n8n-instance.com/webhook/slack/update-status`
- **Short Description:** Update project status
- **Usage Hint:** `[company-name] [status]`

**Command 5: /generate-proposal**
- **Command:** `/generate-proposal`
- **Request URL:** `https://your-n8n-instance.com/webhook/slack/generate-proposal`
- **Short Description:** Generate proposal document
- **Usage Hint:** `[company-name]`

### Step 3: Create n8n Workflows

#### Workflow 1: /form-summary

**Webhook Node:**
- Method: POST
- Path: `slack/form-summary`
- Response: JSON

**Code Node (Parse Command):**
```javascript
const body = $input.item.json;
const text = body.text || '';
const companyName = text.trim();

// Query form data from Notion/Sheets
// Return formatted summary

return {
  response_type: 'ephemeral', // Only visible to user
  text: `📋 Form Summary: ${companyName}\n\n...`
};
```

**Slack Response Node:**
- Respond to command
- Format message
- Return to Slack

---

#### Workflow 2: /schedule-call

**Webhook Node:**
- Method: POST
- Path: `slack/schedule-call`

**Code Node (Parse Command):**
```javascript
const body = $input.item.json;
const text = body.text || '';
const parts = text.split(' ');

const companyName = parts[0];
const date = parts[1];
const time = parts[2];

// Create calendar event
// Generate Zoom link
// Send email to client
// Update Notion/Sheets

return {
  response_type: 'in_channel', // Visible to all
  text: `✅ Consultation Scheduled\n\nCompany: ${companyName}\n...`
};
```

---

#### Workflow 3: /add-task

**Webhook Node:**
- Method: POST
- Path: `slack/add-task`

**Code Node (Parse Command):**
```javascript
const body = $input.item.json;
const text = body.text || '';

// Parse: company-name task owner deadline
const parts = text.match(/(\w+)\s+(.+?)\s+@(\w+)\s+(.+)/);

const companyName = parts[1];
const task = parts[2];
const owner = parts[3];
const deadline = parts[4];

// Create task in Notion
// Link to project
// Assign to owner

return {
  response_type: 'in_channel',
  text: `✅ Task Created\n\nProject: ${companyName}\nTask: ${task}\n...`
};
```

---

#### Workflow 4: /update-status

**Webhook Node:**
- Method: POST
- Path: `slack/update-status`

**Code Node (Parse Command):**
```javascript
const body = $input.item.json;
const text = body.text || '';
const parts = text.split(' ');

const companyName = parts[0];
const newStatus = parts.slice(1).join(' ');

// Update Google Sheets
// Update Notion
// Post to Slack channel

return {
  response_type: 'in_channel',
  text: `✅ Status Updated\n\nCompany: ${companyName}\nNew Status: ${newStatus}`
};
```

---

#### Workflow 5: /generate-proposal

**Webhook Node:**
- Method: POST
- Path: `slack/generate-proposal`

**Code Node (Parse Command):**
```javascript
const body = $input.item.json;
const companyName = body.text.trim();

// Query form data
// Query consultation notes
// Generate proposal document
// Send to client

return {
  response_type: 'ephemeral',
  text: `📄 Generating Proposal...\n\nCompany: ${companyName}\n⏳ Creating document...`
};
```

---

## Setup Method 2: Using Slack API Directly

### Step 1: Create Slack App

1. Go to https://api.slack.com/apps
2. Create new app
3. Enable Slash Commands

### Step 2: Handle Commands

**Use Slack Events API:**
- Listen for `command` events
- Process command text
- Respond via API

**Example Response:**
```javascript
{
  "response_type": "ephemeral",
  "text": "Command response here"
}
```

---

## Command Response Types

### Ephemeral (Private)
- Only visible to user who ran command
- Use for: form-summary, generate-proposal
- `"response_type": "ephemeral"`

### In Channel (Public)
- Visible to entire channel
- Use for: schedule-call, add-task, update-status
- `"response_type": "in_channel"`

---

## Testing Commands

### Test Each Command

1. **/form-summary**
   ```
   /form-summary Acme Corporation
   ```
   Expected: Returns form summary

2. **/schedule-call**
   ```
   /schedule-call Acme Corporation 2024-02-05 14:00
   ```
   Expected: Creates calendar event, sends email

3. **/add-task**
   ```
   /add-task Acme Corporation Create mockups @sarah.johnson 2024-02-10
   ```
   Expected: Creates task in Notion

4. **/update-status**
   ```
   /update-status Acme Corporation Proposal
   ```
   Expected: Updates status in Sheets and Notion

5. **/generate-proposal**
   ```
   /generate-proposal Acme Corporation
   ```
   Expected: Generates proposal document

---

## Error Handling

### Invalid Company Name
```
❌ Company not found: [company-name]

Available companies:
• Acme Corporation
• Sample Corp
• Test Business
```

### Invalid Date Format
```
❌ Invalid date format: [date]

Please use: YYYY-MM-DD
Example: 2024-02-05
```

### Missing Parameters
```
❌ Missing required parameters

Usage: /schedule-call [company-name] [date] [time]
Example: /schedule-call Acme Corp 2024-02-05 14:00
```

---

## Security

### Verify Slack Requests

**Verify Slack signature:**
```javascript
const crypto = require('crypto');

function verifySlackRequest(req) {
  const signature = req.headers['x-slack-signature'];
  const timestamp = req.headers['x-slack-request-timestamp'];
  const body = req.body;
  
  const hmac = crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET);
  const [version, hash] = signature.split('=');
  const base = `${version}:${timestamp}:${body}`;
  
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(hmac.update(base).digest('hex'))
  );
}
```

### Rate Limiting

- Limit commands per user per hour
- Prevent abuse
- Return error if rate limited

---

## Best Practices

✅ **Clear Usage Hints:** Help users understand command format  
✅ **Error Messages:** Provide helpful error messages  
✅ **Response Types:** Use ephemeral for private, in_channel for public  
✅ **Validation:** Validate all inputs before processing  
✅ **Logging:** Log all command usage for debugging  
✅ **Documentation:** Document commands for team  

---

## Support

- **Slack Slash Commands:** https://api.slack.com/interactivity/slash-commands
- **n8n Webhooks:** https://docs.n8n.io/workflows/webhooks/
- **Slack API:** https://api.slack.com

---

**Setup Version:** 1.0  
**Last Updated:** 2024-01-01



