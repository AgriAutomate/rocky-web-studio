# Slack Bot Automation - Complete Setup Guide

**Quick start guide for setting up Slack automation for discovery workflow.**

---

## 🚀 Quick Start (15 minutes)

### Step 1: Create Channels (2 min)

Create these 4 channels in Slack:
- `#projects` - New form submissions
- `#consultations` - Scheduled calls
- `#wins` - Closed projects
- `#alerts` - Critical deadlines

### Step 2: Create Slack App (5 min)

1. Go to https://api.slack.com/apps
2. Create new app: "Rocky Web Studio Bot"
3. Add bot token scopes:
   - `chat:write`
   - `chat:write.public`
   - `commands` (for slash commands)
4. Install to workspace
5. Copy bot token (`xoxb-...`)

### Step 3: Configure n8n (5 min)

1. Add Slack node to workflow
2. Configure credentials (use bot token)
3. Set up webhook endpoints
4. Test with sample message

### Step 4: Set Up Slash Commands (3 min)

1. In Slack app, go to "Slash Commands"
2. Create 5 commands (see below)
3. Point to n8n webhook URLs
4. Test each command

---

## 📨 Message Formats

### 1. New Form Submission → #projects

```
🎯 New Discovery Form: [Company Name]

📋 BASICS
Contact: [Name]
Email: [Email]
Industry: [Industry]
Company Size: [Company Size]

💰 BUDGET & TIMELINE
Budget: [Budget Range]
Target Launch: [Date]

⚙️ FEATURES
Needs: [Features - comma separated]
AI Interests: [AI Features]

👉 NEXT STEPS
→ [Link to form details]
→ [Calendly to book call]
```

### 2. Consultation Reminder → #consultations

```
📞 Consultation Tomorrow: [Company Name]

Time: [Time]
Contact: [Name]

🔗 Zoom: [Link]
📌 Prep: Review form responses + prepare questions
```

### 3. Project Won → #wins

```
🎉 NEW PROJECT: [Company Name]

Value: $[Amount]
Timeline: [Weeks]
Lead: [Team member name]
Start Date: [Date]

🚀 Design Kickoff: [Date/Time]
```

### 4. Deadline Alert → #alerts

```
🚨 Deadline Alert: [Company Name]

Issue: [Alert Type]
Deadline: [Date] ([X] days)
Status: [Status]

Action Required: [Action]

📋 Project: [Link]
👥 Owner: @[owner]
```

**Alert Types:**
- Contract not signed by deadline
- Design review overdue
- Payment pending
- Launch date approaching

---

## ⚡ Slash Commands

### /form-summary [company-name]

**Returns:** Quick summary of form answers

**Example:**
```
/form-summary Acme Corporation
```

**Response:**
```
📋 Form Summary: Acme Corporation

Contact: John Doe | john@acme.com
Industry: Technology | Size: 6-20 employees
Budget: $10,000 - $25,000

Goals:
• Increase online sales by 30%
• Automate customer inquiries

Features: E-commerce, Blog, Analytics
AI Interests: Chatbot, Automation

Timeline: March 15, 2024
Status: Discovery

📋 Full Details: https://form.typeform.com/to/abc123
```

---

### /schedule-call [company-name] [date] [time]

**Creates:** Calendar event + sends client email automatically

**Example:**
```
/schedule-call Acme Corporation 2024-02-05 14:00
```

**Response:**
```
✅ Consultation Scheduled

Company: Acme Corporation
Date: February 5, 2024 at 2:00 PM
Duration: 30-45 minutes

📅 Calendar event created
📧 Confirmation email sent to john@acme.com
🔗 Zoom link: https://zoom.us/j/123456789

Next: Review call script and prepare questions
```

---

### /add-task [company-name] [task] [owner] [deadline]

**Creates:** Task in project management tool

**Example:**
```
/add-task Acme Corporation Create mockups @sarah.johnson 2024-02-10
```

**Response:**
```
✅ Task Created

Project: Acme Corporation
Task: Create mockups
Owner: @sarah.johnson
Deadline: February 10, 2024

📋 View in Notion: https://notion.so/project/acme
```

---

### /update-status [company-name] [status]

**Updates:** Pipeline status in Sheets + Notion

**Example:**
```
/update-status Acme Corporation Proposal
```

**Response:**
```
✅ Status Updated

Company: Acme Corporation
Old Status: Discovery
New Status: Proposal

📋 Updated in:
• Google Sheets
• Notion Database
• Slack channels

Next steps: Send proposal, schedule follow-up
```

**Status Options:**
- Discovery
- Proposal
- Consultation Scheduled
- Design
- Development
- Testing
- Launch
- Complete
- Lost

---

### /generate-proposal [company-name]

**Creates:** Proposal doc from form data

**Example:**
```
/generate-proposal Acme Corporation
```

**Response:**
```
📄 Generating Proposal...

Company: Acme Corporation
Package: Standard Package
Value: $15,000
Timeline: 8 weeks

⏳ Creating proposal document...
✅ Proposal created: https://docs.google.com/proposal/abc123

📧 Sending to: john@acme.com
```

---

## 🔗 Incoming Webhooks

### Webhook 1: Form Submission → #projects

**Source:** Typeform/Tally webhook  
**n8n Endpoint:** `/webhook/discovery-form`  
**Sends to:** #projects

**Payload:**
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

---

### Webhook 2: Consultation Scheduled → #consultations

**Source:** Calendly webhook  
**n8n Endpoint:** `/webhook/consultation-scheduled`  
**Sends to:** #consultations

**Payload:**
```json
{
  "companyName": "Acme Corp",
  "consultationDate": "2024-02-05T14:00:00Z",
  "contactName": "John Doe",
  "email": "john@acme.com",
  "timezone": "AEST",
  "zoomLink": "https://zoom.us/j/123456789"
}
```

---

### Webhook 3: Contract Signed → #wins

**Source:** HelloSign/DocuSign webhook OR manual  
**n8n Endpoint:** `/webhook/contract-signed`  
**Sends to:** #wins

**Payload:**
```json
{
  "companyName": "Acme Corp",
  "projectValue": 15000,
  "timeline": 8,
  "teamMemberName": "Sarah Johnson",
  "startDate": "2024-02-06",
  "kickoffDate": "2024-02-12T10:00:00Z"
}
```

---

### Webhook 4: Payment Received → #alerts

**Source:** Stripe webhook  
**n8n Endpoint:** `/webhook/payment-received`  
**Sends to:** #alerts

**Payload:**
```json
{
  "companyName": "Acme Corp",
  "amount": 7500,
  "paymentType": "Deposit",
  "projectValue": 15000,
  "owner": "sarah.johnson"
}
```

---

## 🧪 Testing Procedures

### Test Messages

1. **Submit test form**
   - Verify message in #projects
   - Check formatting
   - Verify links work

2. **Book test consultation**
   - Verify message in #consultations
   - Check reminder scheduled

3. **Test slash commands**
   - Run each command
   - Verify responses
   - Check error handling

4. **Test webhooks**
   - Send test payloads
   - Verify messages post
   - Check formatting

### Test Checklist

- [ ] All 4 channels created
- [ ] Bot added to all channels
- [ ] Bot permissions configured
- [ ] Test messages sent successfully
- [ ] All 5 slash commands work
- [ ] Webhooks configured correctly
- [ ] Reminders fire on schedule
- [ ] Alerts trigger correctly
- [ ] Links work correctly
- [ ] Mentions work (@here, @channel)

---

## 📚 Documentation Files

- **Main Guide:** `slack-bot-automation-setup.md` - Complete setup guide
- **Slash Commands:** `slack-slash-commands-setup.md` - Command setup
- **Webhook URLs:** `slack-webhook-urls-reference.md` - Webhook reference
- **Quick Reference:** `slack-quick-reference.md` - Quick reference card
- **Message Templates:** `slack-message-templates.js` - Code templates
- **n8n Workflow:** `n8n-slack-workflow-example.json` - Example workflow

---

## 🆘 Troubleshooting

### Bot Not Sending Messages
- Check bot token
- Verify bot in channel
- Check `chat:write` permission

### Slash Commands Not Working
- Verify command registered
- Check webhook URL
- Verify request signature

### Webhooks Not Receiving Data
- Check URL is correct
- Verify HTTPS enabled
- Check payload format

### Messages Not Formatting
- Use correct markdown syntax
- Escape special characters
- Test in Slack first

---

## ✅ Setup Complete!

Once all tests pass, your Slack automation is ready for production!

**Next Steps:**
1. Monitor first few submissions
2. Adjust message formats if needed
3. Train team on slash commands
4. Set up monitoring/alerts

---

**Setup Version:** 1.0  
**Last Updated:** 2024-01-01


