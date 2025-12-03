# Slack Bot Automation - Quick Reference

## Channels

| Channel | Purpose | Notifications |
|---------|---------|---------------|
| `#projects` | New submissions, pipeline updates | @here for new submissions |
| `#consultations` | Scheduled calls, reminders | @channel for same-day |
| `#wins` | Closed deals, celebrations | @here for wins |
| `#alerts` | Critical deadlines, follow-ups | @channel for all alerts |

## Message Types

### 1. New Form Submission → `#projects`
**Trigger:** Form submitted  
**Template:** `newFormSubmission()`  
**Includes:** Company, contact, budget, features, links

### 2. Consultation Scheduled → `#consultations`
**Trigger:** Calendly booking  
**Template:** `consultationScheduled()`  
**Includes:** Date, time, Zoom link, project summary

### 3. 24h Reminder → `#consultations`
**Trigger:** 24 hours before consultation  
**Template:** `consultationReminder24h()`  
**Includes:** Prep checklist, key points, Zoom link

### 4. Same-Day Reminder → `#consultations`
**Trigger:** 2 hours before consultation  
**Template:** `consultationReminderSameDay()`  
**Includes:** Quick links, prep checklist

### 5. Consultation Completed → `#projects`
**Trigger:** After call ends  
**Template:** `consultationCompleted()`  
**Includes:** Outcome, decisions, action items

### 6. Project Won → `#wins`
**Trigger:** Contract signed  
**Template:** `projectWon()`  
**Includes:** Value, team, timeline, next steps

### 7. Follow-Up Needed → `#alerts`
**Trigger:** No activity in 3+ days  
**Template:** `followUpNeeded()`  
**Includes:** Last contact, action required

### 8. Deadline Alert → `#alerts`
**Trigger:** Deadline < 7 days  
**Template:** `deadlineAlert()`  
**Includes:** Days until deadline, at-risk items

### 9. Daily Summary → `#projects`
**Trigger:** End of day (5 PM)  
**Template:** `dailySummary()`  
**Includes:** Daily metrics, highlights, tomorrow's calls

### 10. Weekly Report → `#projects`
**Trigger:** Monday 9 AM  
**Template:** `weeklyReport()`  
**Includes:** Weekly metrics, conversion rates, top industries

## Setup Checklist

- [ ] Create 4 Slack channels
- [ ] Create Slack app at api.slack.com
- [ ] Configure bot permissions
- [ ] Install bot to workspace
- [ ] Invite bot to all channels
- [ ] Get bot token (xoxb-...)
- [ ] Configure n8n Slack node
- [ ] Test each message type
- [ ] Set up scheduled triggers
- [ ] Verify reminders fire correctly

## n8n Quick Setup

1. **Add Slack Node**
   - Resource: Message
   - Operation: Post Message
   - Channel: `#projects` (or appropriate)
   - Credential: Slack API (Bot Token)

2. **Use Code Node for Formatting**
   - Import templates from `slack-message-templates.js`
   - Format message before sending
   - Return `{ message, channel }`

3. **Set Up Triggers**
   - Webhook for form submissions
   - Schedule for reminders (daily 9 AM)
   - Schedule for alerts (daily 10 AM)
   - Schedule for summaries (daily 5 PM)

## Common Issues

**Bot not sending:**
- Check bot token
- Verify bot in channel
- Check `chat:write` permission

**Formatting issues:**
- Use markdown syntax
- Escape special characters
- Test in Slack first

**Reminders not firing:**
- Check scheduled trigger
- Verify timezone
- Check query logic

## Message Formatting

**Bold:** `*text*`  
**Italic:** `_text_`  
**Code:** `` `code` ``  
**Link:** `<https://example.com|Link Text>`  
**Mention:** `<@user>` or `@channel`  
**Emoji:** `:rocket:` or use Unicode 🚀

## Best Practices

✅ Use @here for new submissions  
✅ Use @channel for urgent alerts  
✅ Keep messages concise  
✅ Include all relevant links  
✅ Use emoji for visual scanning  
✅ Use threads for follow-ups  
✅ Format consistently  
✅ Test before production

## Support

- **Slack API:** https://api.slack.com
- **n8n Docs:** https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.slack/
- **Templates:** See `slack-message-templates.js`

---

**Quick Start:** Import `n8n-slack-workflow-example.json` into n8n, update credentials, test!


