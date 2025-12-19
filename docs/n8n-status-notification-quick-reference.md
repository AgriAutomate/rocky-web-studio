# Status Notification Workflow - Quick Reference

## 🎯 Workflow Summary

**Name:** Service Status Updates - SMS & Email

**Trigger:** Supabase Database Webhook (booking_status changes)

**Purpose:** Automatically send SMS and email notifications on booking status changes

---

## 📱 Status Transitions & Notifications

| Transition | SMS Message | Email Subject | Actions |
|------------|------------|---------------|---------|
| **scheduled → assigned** | "Your tech is [name], arriving [date] [time]" | "Your technician is on the way" | Update `customer_notification_sent`, HubSpot "Assigned" |
| **assigned → en-route** | "We're [X] minutes away, vehicle is [color] [model]" | "Almost there! ETA: [X] minutes" | Calculate ETA, update `eta_minutes` |
| **en-route → completed** | "Service complete! Invoice: [payment link]" | "Service Complete - Invoice & Receipt" | HubSpot "Pending Approval", schedule reminders |
| **completed → paid** | "Thanks for your payment! See you next time" | "Thank You for Your Payment!" | HubSpot "Won", add to loyalty program |

---

## 🔌 Integrations

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **Mobile Message** | SMS delivery | API username/password, Sender ID: "Rocky Web" |
| **Resend** | Email delivery | API key, verified domain |
| **Stripe** | Payment webhooks | Webhook secret, API key |
| **Google Maps** | ETA calculation | API key, Directions API enabled |
| **HubSpot** | Deal updates | API key, deal pipeline |
| **Slack** | Alerts | Bot token, channels |

---

## 📊 Database Updates

**Fields Updated:**
- `customer_notification_sent` - Timestamp of last notification
- `eta_minutes` - Calculated arrival time
- `internal_notes` - Log of status changes
- `booking_status` - Current status

**HubSpot Deal Stages:**
- `scheduled` → "Scheduled"
- `assigned` → "Assigned"
- `en-route` → "En Route"
- `completed` → "Pending Approval"
- `paid` → "Won"
- `cancelled` → "Lost"

---

## 🚨 Error Handling

| Error Type | Action |
|------------|--------|
| **SMS Failure** | Log error, send email instead |
| **Email Failure** | Retry after 1 hour, alert if persists |
| **Invalid Phone** | Alert manager, email only |
| **Google Maps API Failure** | Use default ETA (30 min), continue |
| **Webhook Failure** | Queue for manual review, retry after 5 min |

---

## 📝 SMS Message Templates

**Assigned:**
```
Your tech is [technician_name], arriving [scheduled_date] [time_window]
```

**En Route:**
```
We're [eta_minutes] minutes away! Vehicle is [vehicle_id]
```

**Completed:**
```
Service complete! View invoice and pay: [payment_link]
```

**Paid:**
```
Thanks for your payment! See you next time. Join our loyalty program: [link]
```

---

## 🚀 Setup Checklist

- [ ] Supabase webhook configured
- [ ] Mobile Message API credentials set up (see `docs/N8N_MOBILE_MESSAGE_SETUP.md`)
- [ ] Resend API key configured
- [ ] Stripe webhook endpoint created
- [ ] Google Maps API key added
- [ ] HubSpot integration configured
- [ ] Slack channels created
- [ ] Test all status transitions
- [ ] Verify error handling
- [ ] Workflow activated

---

## 📚 Full Documentation

See `docs/n8n-status-notification-workflow.md` for complete setup instructions.
