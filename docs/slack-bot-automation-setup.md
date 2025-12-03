# Slack Bot Automation Setup - Discovery Workflow

Complete guide for setting up Slack bot automation to track and manage client discovery form submissions.

---

## Table of Contents

1. [Slack Channels Setup](#slack-channels-setup)
2. [Message Formats](#message-formats)
3. [Bot Configuration](#bot-configuration)
4. [n8n Integration](#n8n-integration)
5. [Message Templates](#message-templates)
6. [Automation Triggers](#automation-triggers)

---

## Slack Channels Setup

### Channel 1: #projects

**Purpose:** New form submissions and project pipeline  
**Description:** "New discovery form submissions and active projects"  
**Privacy:** Public (all team members)  
**Notifications:** @here for new submissions

**Members:**
- All team members
- Rocky Web Studio bot
- n8n webhook integration

---

### Channel 2: #consultations

**Purpose:** Scheduled consultation calls and reminders  
**Description:** "Upcoming consultation calls and meeting reminders"  
**Privacy:** Public  
**Notifications:** @channel for same-day reminders

**Members:**
- Sales/consultation team
- Rocky Web Studio bot
- Calendar integration

---

### Channel 3: #wins

**Purpose:** Closed deals and project wins  
**Description:** "Celebrate closed deals and successful project launches"  
**Privacy:** Public  
**Notifications:** @here for wins

**Members:**
- All team members
- Rocky Web Studio bot

---

### Channel 4: #alerts

**Purpose:** Critical deadlines and urgent items  
**Description:** "Critical deadlines, urgent follow-ups, and time-sensitive alerts"  
**Privacy:** Public  
**Notifications:** @channel for all alerts

**Members:**
- All team members
- Rocky Web Studio bot
- Project managers

---

## Message Formats

### Message 1: New Form Submission (#projects)

**Trigger:** When discovery form is submitted  
**Channel:** #projects  
**Format:**

```
🎯 New Discovery Form: {{companyName}}

📋 BASICS
Contact: {{contactName}}
Email: {{email}}
Industry: {{industry}}
Company Size: {{companySize}}

💰 BUDGET & TIMELINE
Budget: {{budget}}
Target Launch: {{launchDate}}

⚙️ FEATURES
Needs: {{featuresList}}
AI Interests: {{aiInterestsList}}

👉 NEXT STEPS
→ {{formLink}}
→ {{calendlyLink}}
```

**Example:**

```
🎯 New Discovery Form: Acme Corporation

📋 BASICS
Contact: John Doe
Email: john@acme.com
Industry: Technology / SaaS
Company Size: 6-20 employees

💰 BUDGET & TIMELINE
Budget: $10,000 - $25,000
Target Launch: March 15, 2024

⚙️ FEATURES
Needs: E-commerce, Blog, Analytics, Booking System
AI Interests: Chatbot, Automation, Content Gen

👉 NEXT STEPS
→ https://form.typeform.com/to/abc123
→ https://calendly.com/rockywebstudio/consultation
```

---

### Message 2: Consultation Scheduled (#consultations)

**Trigger:** When consultation is booked  
**Channel:** #consultations  
**Format:**

```
📅 Consultation Scheduled: {{companyName}}

Date & Time: {{consultationDate}} at {{consultationTime}} ({{timezone}})
Contact: {{contactName}} ({{email}})

Project Summary:
• Budget: {{budget}}
• Features: {{featuresList}}
• Industry: {{industry}}

🔗 Zoom: {{zoomLink}}
📋 Details: {{notionLink}}
📝 Script: {{scriptLink}}
```

**Example:**

```
📅 Consultation Scheduled: Acme Corporation

Date & Time: February 5, 2024 at 2:00 PM (AEST)
Contact: John Doe (john@acme.com)

Project Summary:
• Budget: $10,000 - $25,000
• Features: E-commerce, Blog, Analytics, AI Chatbot
• Industry: Technology / SaaS

🔗 Zoom: https://zoom.us/j/123456789
📋 Details: https://notion.so/project/acme-corp
📝 Script: https://docs.google.com/consultation-script
```

---

### Message 3: Consultation Reminder - 24 Hours (#consultations)

**Trigger:** 24 hours before consultation  
**Channel:** #consultations  
**Format:**

```
📞 Consultation Tomorrow: {{companyName}}

Time: {{consultationTime}}
Contact: {{contactName}}

🔗 Zoom: {{zoomLink}}
📌 Prep: Review form responses + prepare questions
```

**Example:**

```
📞 Consultation Tomorrow: Acme Corporation

Time: 2:00 PM (AEST)
Contact: John Doe

🔗 Zoom: https://zoom.us/j/123456789
📌 Prep: Review form responses + prepare questions
```

---

### Message 4: Consultation Reminder - Same Day (#consultations)

**Trigger:** 2 hours before consultation  
**Channel:** #consultations  
**Format:**

```
🔔 *Consultation Starting Soon*

*Company:* {{companyName}}
*Time:* {{consultationTime}} ({{timeRemaining}})

*Quick Links:*
🔗 *Zoom:* {{zoomLink}}
📋 *Project:* {{notionLink}}
📝 *Script:* {{scriptLink}}

*Don't forget:*
• Screen share ready
• Contract template ready
• Case studies prepared

---
*Starting in:* {{timeRemaining}}
```

---

### Message 5: Consultation Completed (#projects)

**Trigger:** After consultation call ends  
**Channel:** #projects  
**Format:**

```
✅ *Consultation Completed*

*Company:* {{companyName}}
*Date:* {{consultationDate}}
*Duration:* {{callDuration}}

*Outcome:* {{outcome}}
*Next Steps:* {{nextSteps}}

*Key Decisions:*
• Package: {{packageName}} at ${{price}}
• Timeline: {{timeline}}
• Features: {{confirmedFeatures}}

*Action Items:*
{{actionItems}}

📋 *Update Status:* {{notionLink}}
📄 *Contract Sent:* {{contractLink}}

---
*Completed:* {{completionDate}} | *Status:* {{newStatus}}
```

**Outcome Options:**
- ✅ **Won** - Contract sent, deposit received
- 🤔 **Needs Time** - Follow-up scheduled
- ❌ **Lost** - Not a fit / budget mismatch
- 📅 **Rescheduled** - New date: {{newDate}}

**Example:**

```
✅ *Consultation Completed*

*Company:* Acme Corporation
*Date:* February 5, 2024
*Duration:* 35 minutes

*Outcome:* ✅ Won
*Next Steps:* Contract sent, awaiting signature

*Key Decisions:*
• Package: Standard Package at $15,000
• Timeline: 8 weeks, launching April 1
• Features: E-commerce, Blog, AI Chatbot, Analytics

*Action Items:*
• [ ] Send contract (done)
• [ ] Schedule design kickoff after deposit
• [ ] Set up project workspace

📋 *Update Status:* https://notion.so/project/acme-corp
📄 *Contract Sent:* https://hello-sign.com/contract/abc123

---
*Completed:* February 5, 2024 2:35 PM | *Status:* 🟢 Proposal
```

---

### Message 6: Project Won (#wins)

**Trigger:** When contract is signed and deposit received  
**Channel:** #wins  
**Format:**

```
🎉 NEW PROJECT: {{companyName}}

Value: ${{projectValue}}
Timeline: {{timeline}} weeks
Lead: {{teamMemberName}}
Start Date: {{startDate}}

🚀 Design Kickoff: {{kickoffDate}} at {{kickoffTime}}
```

**Example:**

```
🎉 NEW PROJECT: Acme Corporation

Value: $15,000
Timeline: 8 weeks
Lead: Sarah Johnson
Start Date: February 6, 2024

🚀 Design Kickoff: February 12, 2024 at 10:00 AM
```

---

### Message 7: Follow-Up Needed (#alerts)

**Trigger:** When lead hasn't responded in 3+ days  
**Channel:** #alerts  
**Format:**

```
⚠️ *Follow-Up Needed*

*Company:* {{companyName}}
*Contact:* {{contactName}} | {{email}}
*Last Contact:* {{lastContactDate}} ({{daysSinceContact}} days ago)
*Status:* {{status}}

*Action Required:*
• Send follow-up email
• Schedule reminder call
• Update status if lost

📋 *Project:* {{notionLink}}
📧 *Email:* {{email}}

---
*Alert:* {{alertDate}} | *Priority:* {{priority}}
```

**Priority Levels:**
- 🔴 **High** - Consultation completed, awaiting contract
- 🟡 **Medium** - Proposal sent, no response
- 🟢 **Low** - Discovery form submitted, no consultation

---

### Message 8: Deadline Alert (#alerts)

**Trigger:** When deadline alert conditions are met  
**Channel:** #alerts  
**Alert Conditions:**
- Contract not signed by deadline
- Design review overdue
- Payment pending
- Launch date approaching

**Format:**

```
🚨 Deadline Alert: {{companyName}}

Issue: {{alertType}}
Deadline: {{deadlineDate}} ({{daysUntilDeadline}} days)
Status: {{status}}

Action Required: {{actionRequired}}

📋 Project: {{notionLink}}
👥 Owner: @{{owner}}
```

**Alert Types:**
- Contract not signed by deadline
- Design review overdue
- Payment pending
- Launch date approaching (< 7 days)

**Example:**

```
🚨 Deadline Alert: Acme Corporation

Issue: Contract not signed by deadline
Deadline: February 10, 2024 (2 days)
Status: Proposal Sent

Action Required: Follow up with client, send reminder email

📋 Project: https://notion.so/project/acme-corp
👥 Owner: @sarah.johnson
```

---

### Message 9: Daily Summary (#projects)

**Trigger:** End of each business day  
**Channel:** #projects  
**Format:**

```
📊 *Daily Summary - {{date}}*

*New Submissions:* {{newSubmissions}}
*Consultations Scheduled:* {{consultationsScheduled}}
*Consultations Completed:* {{consultationsCompleted}}
*Projects Won:* {{projectsWon}}
*Total Pipeline Value:* ${{pipelineValue}}

*Today's Highlights:*
{{highlights}}

*Tomorrow's Consultations:*
{{tomorrowConsultations}}

---
*Generated:* {{summaryDate}}
```

---

### Message 10: Weekly Report (#projects)

**Trigger:** Every Monday morning  
**Channel:** #projects  
**Format:**

```
📈 *Weekly Report - Week of {{weekStart}}*

*This Week:*
• New Submissions: {{weeklySubmissions}}
• Consultations: {{weeklyConsultations}}
• Projects Won: {{weeklyWins}}
• Pipeline Value: ${{weeklyValue}}

*Conversion Rates:*
• Submissions → Consultations: {{conversionRate1}}%
• Consultations → Wins: {{conversionRate2}}%

*Top Industries:*
{{topIndustries}}

*Top Features Requested:*
{{topFeatures}}

*Goals for This Week:*
• {{goal1}}
• {{goal2}}

---
*Report Generated:* {{reportDate}}
```

---

## Bot Configuration

### Step 1: Create Slack App

1. Go to https://api.slack.com/apps
2. Click **"Create New App"** → **"From scratch"**
3. Name: **"Rocky Web Studio Bot"**
4. Select workspace: **Rocky Web Studio**

### Step 2: Configure Bot Permissions

**Bot Token Scopes (OAuth & Permissions):**
- `chat:write` - Send messages
- `chat:write.public` - Send messages to channels bot isn't in
- `channels:read` - View channel information
- `channels:join` - Join channels
- `users:read` - View user information
- `files:write` - Upload files
- `reactions:add` - Add reactions

**User Token Scopes (if needed):**
- `channels:history` - View message history
- `channels:write` - Create channels

### Step 3: Install Bot to Workspace

1. Go to **"OAuth & Permissions"**
2. Click **"Install to Workspace"**
3. Authorize permissions
4. Copy **Bot User OAuth Token** (starts with `xoxb-`)

### Step 4: Invite Bot to Channels

**Add bot to each channel:**
1. Open channel
2. Type: `/invite @Rocky Web Studio Bot`
3. Or: Channel settings → Integrations → Add apps → Rocky Web Studio Bot

**Channels to add bot to:**
- #projects
- #consultations
- #wins
- #alerts

### Step 5: Configure Bot Profile

**Bot Profile:**
- **Display Name:** Rocky Web Studio Bot
- **Default Username:** rockywebstudio-bot
- **Icon:** Upload Rocky Web Studio logo
- **Description:** "Automated notifications for discovery workflow"

---

## n8n Integration

### Step 1: Add Slack Node to n8n

1. Add **"Slack"** node to workflow
2. Select **"Send Message"** operation
3. Configure credentials (use Bot Token)

### Step 2: Configure Message Node

**Node Settings:**
- **Credential:** Slack API (Bot Token)
- **Resource:** Message
- **Operation:** Post Message
- **Channel:** #projects (or appropriate channel)
- **Text:** Use message templates below

### Step 3: Message Template Variables

**In n8n, use expressions:**
```javascript
// Example: New Form Submission Message
const message = `🎯 *New Discovery Form Submission*

*Company:* ${$json.companyName}
*Contact:* ${$json.contactName} | ${$json.email}
*Industry:* ${$json.industry} | *Size:* ${$json.companySize}
*Budget Range:* ${$json.budget}

*Main Goals:*
• ${$json.goal1}
• ${$json.goal2}

*Key Features Requested:*
${$json.features.join(', ')}

📋 *Full Details:* ${$json.formLink}
📅 *Schedule Consultation:* ${$json.calendlyLink}

---
*Submitted:* ${new Date($json.submittedAt).toLocaleString()} | *Status:* 🟡 Discovery`;
```

### Step 4: Complete n8n Workflow

**Workflow Structure:**
```
Webhook Trigger (Form Submission)
  ↓
Parse Form Data
  ↓
Send Slack Message (#projects)
  ↓
Create Notion Entry
  ↓
Send Email Confirmation
```

**For Consultation Scheduled:**
```
Calendly Webhook (Booking Created)
  ↓
Parse Booking Data
  ↓
Send Slack Message (#consultations)
  ↓
Create Timeline Event (Notion)
  ↓
Send Confirmation Email
```

**For Consultation Reminder:**
```
Schedule Trigger (24h before)
  ↓
Query Upcoming Consultations
  ↓
Send Slack Message (#consultations)
  ↓
Send Email Reminder
```

---

## Message Templates

### Template 1: New Form Submission

**n8n Code Node:**
```javascript
const data = $input.item.json;

const message = `🎯 *New Discovery Form Submission*

*Company:* ${data.companyName}
*Contact:* ${data.contactName || 'Not provided'} | ${data.email}
*Industry:* ${data.industry} | *Size:* ${data.companySize}
*Budget Range:* ${data.budget}

*Main Goals:*
• ${data.mainProblem || 'Not specified'}
• ${data.successMetric || 'Not specified'}

*Key Features Requested:*
${data.features ? data.features.join(', ') : 'None specified'}

*AI Interests:* ${data.aiFeatures ? data.aiFeatures.join(', ') : 'None'}

*Timeline:* ${data.launchDate || 'Not specified'}

📋 *Full Details:* ${data.formLink || 'N/A'}
📅 *Schedule Consultation:* ${data.calendlyLink || 'https://calendly.com/rockywebstudio/consultation'}
📊 *View in Notion:* ${data.notionLink || 'N/A'}

---
*Submitted:* ${new Date(data.submittedAt).toLocaleString()} | *Status:* 🟡 Discovery`;

return { message };
```

### Template 2: Consultation Scheduled

```javascript
const data = $input.item.json;

const message = `📅 *Consultation Scheduled*

*Company:* ${data.companyName}
*Date & Time:* ${new Date(data.consultationDate).toLocaleDateString()} at ${new Date(data.consultationDate).toLocaleTimeString()} (${data.timezone || 'AEST'})
*Duration:* 30-45 minutes
*Attendees:* ${data.contactName} (${data.email})

*Project Summary:*
• Budget: ${data.budget}
• Features: ${data.features.join(', ')}
• Industry: ${data.industry}

🔗 *Zoom Link:* ${data.zoomLink || 'TBD'}
📋 *Project Details:* ${data.notionLink}
📝 *Call Script:* https://docs.google.com/consultation-script

---
*Booked:* ${new Date().toLocaleString()} | *Reminder:* 24h before call`;

return { message };
```

### Template 3: Project Won

```javascript
const data = $input.item.json;

const message = `🎉 *NEW PROJECT WON!*

*Company:* ${data.companyName}
*Value:* $${data.projectValue.toLocaleString()}
*Package:* ${data.packageName}
*Timeline:* ${data.timeline}

*Key Features:*
${data.features.map(f => `• ${f}`).join('\n')}

*Team:*
• PM: ${data.projectManager || 'TBD'}
• Designer: ${data.designer || 'TBD'}
• Developer: ${data.developer || 'TBD'}

*Next Steps:*
• Design kickoff: ${new Date(data.kickoffDate).toLocaleDateString()}
• Launch target: ${new Date(data.launchDate).toLocaleDateString()}

📋 *Project Details:* ${data.notionLink}

---
*Won:* ${new Date().toLocaleString()} | *Status:* 🟢 Design Phase`;

return { message };
```

---

## Automation Triggers

### Trigger 1: Form Submission → #projects

**Source:** Typeform/Tally webhook  
**n8n Workflow:**
1. Webhook receives form data
2. Parse and format data
3. Send message to #projects
4. Use @here for new submissions

**Schedule:** Immediate

---

### Trigger 2: Consultation Booked → #consultations

**Source:** Calendly webhook  
**n8n Workflow:**
1. Calendly webhook fires
2. Extract booking details
3. Link to discovery form data
4. Send message to #consultations

**Schedule:** Immediate

---

### Trigger 3: 24h Reminder → #consultations

**Source:** Scheduled trigger  
**n8n Workflow:**
1. Daily check at 9 AM
2. Query consultations tomorrow
3. Send reminder message
4. Use @channel for same-day reminders

**Schedule:** Daily at 9 AM

---

### Trigger 4: 2h Reminder → #consultations

**Source:** Scheduled trigger  
**n8n Workflow:**
1. Check every hour
2. Find consultations in next 2 hours
3. Send "starting soon" message
4. Use @channel

**Schedule:** Every hour

---

### Trigger 5: Follow-Up Alert → #alerts

**Source:** Scheduled trigger  
**n8n Workflow:**
1. Daily check at 10 AM
2. Query leads with no activity in 3+ days
3. Send alert message
4. Use @here

**Schedule:** Daily at 10 AM

---

### Trigger 6: Deadline Alert → #alerts

**Source:** Scheduled trigger  
**n8n Workflow:**
1. Daily check at 8 AM
2. Query projects with deadlines < 7 days
3. Send alert message
4. Use @channel for critical (< 3 days)

**Schedule:** Daily at 8 AM

---

### Trigger 7: Daily Summary → #projects

**Source:** Scheduled trigger  
**n8n Workflow:**
1. End of day (5 PM)
2. Query today's metrics
3. Format summary message
4. Send to #projects

**Schedule:** Daily at 5 PM

---

### Trigger 8: Weekly Report → #projects

**Source:** Scheduled trigger  
**n8n Workflow:**
1. Monday morning (9 AM)
2. Query last week's metrics
3. Calculate conversion rates
4. Format report message
5. Send to #projects

**Schedule:** Every Monday at 9 AM

---

## Advanced Features

### Thread Replies

**Use threads for follow-up:**
- Reply to original message with updates
- Keep conversation organized
- Use for status updates

**Example:**
```
Original: New Form Submission
Reply: Consultation Scheduled (in thread)
Reply: Consultation Completed (in thread)
Reply: Project Won (in thread)
```

### Message Buttons (Interactive)

**Add action buttons:**
- "Schedule Consultation" → Opens Calendly
- "View in Notion" → Opens Notion page
- "Mark as Won" → Updates status

**Requires:** Slack Block Kit or Slack API

### Rich Formatting

**Use Block Kit for rich messages:**
- Sections with images
- Divider blocks
- Context blocks for metadata
- Button actions

### Mentions

**Use mentions strategically:**
- @here for new submissions
- @channel for urgent alerts
- @specific-user for assignments
- @project-manager for deadlines

---

## Incoming Webhooks Configuration

### Setting Up Incoming Webhooks

**Method 1: Slack Incoming Webhooks (Simple)**

1. Go to https://api.slack.com/apps
2. Select your app
3. Navigate to **"Incoming Webhooks"**
4. Activate incoming webhooks
5. Click **"Add New Webhook to Workspace"**
6. Select channel: `#projects` (or appropriate channel)
7. Copy webhook URL (starts with `https://hooks.slack.com/services/...`)
8. Use in n8n to send messages

**Method 2: Slack API with Bot Token (Advanced)**

- More control and features
- Supports rich formatting (Block Kit)
- Can use interactive components
- Better for complex workflows

### Webhook URLs for n8n

**Webhook 1: Form Submission → #projects**

**n8n Configuration:**
- **Webhook URL:** `https://your-n8n-instance.com/webhook/discovery-form`
- **Method:** POST
- **Response:** Format message and send to Slack #projects

**Payload Example:**
```json
{
  "companyName": "Acme Corp",
  "contactName": "John Doe",
  "email": "john@acme.com",
  "industry": "Technology",
  "companySize": "6-20 employees",
  "budget": "$10,000 - $25,000",
  "features": ["E-commerce", "Blog", "Analytics"],
  "aiFeatures": ["Chatbot", "Automation"],
  "launchDate": "2024-03-15",
  "formLink": "https://form.typeform.com/to/abc123",
  "calendlyLink": "https://calendly.com/rockywebstudio/consultation"
}
```

**Slack Message Format:**
Use Message Format 1 (New Form Submission)

---

**Webhook 2: Consultation Scheduled → #consultations**

**n8n Configuration:**
- **Trigger:** Calendly webhook (booking created)
- **Action:** Format and send to Slack #consultations

**Payload Example:**
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

**Slack Message Format:**
Use Message Format 2 (Consultation Scheduled)

---

**Webhook 3: Contract Signed → #wins**

**n8n Configuration:**
- **Trigger:** HelloSign/DocuSign webhook OR manual trigger
- **Action:** Format and send to Slack #wins

**Payload Example:**
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

**Slack Message Format:**
Use Message Format 6 (Project Won)

---

**Webhook 4: Payment Received → #alerts**

**n8n Configuration:**
- **Trigger:** Stripe webhook (`payment_intent.succeeded`)
- **Action:** Format and send to Slack #alerts

**Payload Example:**
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

**Slack Message Format:**
```
✅ Payment Received: {{companyName}}

Amount: ${{amount}} ({{paymentType}})
Project Value: ${{projectValue}}
Status: {{status}}

📋 Project: {{notionLink}}
👥 Owner: @{{owner}}
```

---

## Testing

### Test Each Message Type

1. **New Form Submission:**
   - Submit test form
   - Verify message appears in #projects
   - Check formatting and links

2. **Consultation Scheduled:**
   - Book test consultation
   - Verify message in #consultations
   - Check reminder scheduling

3. **Reminders:**
   - Set test consultation for tomorrow
   - Verify 24h reminder fires
   - Verify 2h reminder fires

4. **Alerts:**
   - Create test lead with old date
   - Verify follow-up alert fires
   - Create test project with deadline
   - Verify deadline alert fires

5. **Slash Commands:**
   - Test each command in Slack
   - Verify responses are correct
   - Check error handling

6. **Webhooks:**
   - Test webhook endpoints
   - Verify messages post correctly
   - Check formatting

### Test Checklist

- [ ] All channels created
- [ ] Bot added to all channels
- [ ] Bot permissions configured
- [ ] Test messages sent successfully
- [ ] Links work correctly
- [ ] Mentions work (@here, @channel)
- [ ] Reminders fire on schedule
- [ ] Alerts trigger correctly
- [ ] Daily/weekly summaries work
- [ ] Slash commands work
- [ ] Webhooks configured correctly

---

## Troubleshooting

### Bot Not Sending Messages

**Check:**
1. Bot token is correct
2. Bot is invited to channel
3. Bot has `chat:write` permission
4. Channel name is correct (include #)

### Messages Not Formatting

**Check:**
1. Using correct markdown syntax
2. Escaping special characters
3. Using Block Kit for rich formatting

### Reminders Not Firing

**Check:**
1. Scheduled trigger is active
2. Timezone is correct
3. Query logic is correct
4. Data exists to query

### Links Not Working

**Check:**
1. URLs are complete (include https://)
2. Links are accessible
3. Notion/Calendly links are correct

---

## Best Practices

### Message Frequency

- **New submissions:** Immediate
- **Reminders:** 24h and 2h before
- **Alerts:** Daily check
- **Summaries:** Daily end of day, weekly Monday

### Channel Usage

- **#projects:** Active pipeline, updates
- **#consultations:** Meeting-focused
- **#wins:** Celebrations only
- **#alerts:** Urgent items only

### Message Clarity

- Use clear formatting
- Include all relevant links
- Add emoji for visual scanning
- Keep messages concise
- Use threads for follow-ups

---

## Support

- **Slack API Docs:** https://api.slack.com
- **n8n Slack Node:** https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.slack/
- **Slack Block Kit:** https://api.slack.com/block-kit

---

**Setup Version:** 1.0  
**Last Updated:** 2024-01-01  
**Compatible with:** Slack, n8n

