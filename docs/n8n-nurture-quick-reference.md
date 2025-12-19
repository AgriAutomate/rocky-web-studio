# Nurture Workflow - Quick Reference

## 🎯 Workflow Summary

**Name:** Service Lead Nurture - Email Drip

**Trigger:** Schedule (Cron) - Every hour

**Purpose:** Automatically nurture warm leads through 5-email sequence over 28 days

---

## 📧 Email Sequence

| Email | Day | Subject | CTA |
|-------|-----|---------|-----|
| Email 1 | Day 0 | (Already sent) | - |
| Email 2 | Day 3 | "Here's what makes us different" | "Learn more" → Case studies |
| Email 3 | Day 7 | "See what our customers say" | "Read customer stories" → Testimonials |
| Email 4 | Day 14 | "Special offer ending Sunday" | "Claim your offer" → Booking (15% off) |
| Email 5 | Day 28 | "One last chance for [SERVICE]" | "Schedule now" → Direct booking |

---

## 🔄 Conditional Exits

| Condition | Action | Status Update |
|-----------|--------|---------------|
| **Email Clicked** | Move to sales | `qualification_status = 'hot'` |
| **Unsubscribed** | Stop emails | `status = 'rejected'` |
| **No Engagement (Day 28)** | Mark cold | `qualification_status = 'cold'` |
| **Booking Confirmed** | Mark won | `status = 'won'` |
| **Becomes Hot** | Immediate follow-up | `qualification_status = 'hot'` |

---

## 🗄️ Database Tracking Columns

**Nurture Stage Flags:**
- `nurture_stage_1_sent` (Email 2)
- `nurture_stage_2_sent` (Email 3)
- `nurture_stage_3_sent` (Email 4)
- `nurture_stage_4_sent` (Email 5)

**Engagement Tracking:**
- `last_engagement_date` - Updated on email open/click
- `engagement_count` - Incremented on clicks

---

## 📝 Query Patterns

### Find Leads Ready for Email 2 (Day 3)
```sql
SELECT * FROM service_leads
WHERE qualification_status = 'warm'
  AND created_at <= NOW() - INTERVAL '3 days'
  AND (nurture_stage_1_sent IS NULL OR nurture_stage_1_sent = false)
  AND status != 'won'
  AND status != 'rejected'
```

### Find Leads Ready for Email 3 (Day 7)
```sql
SELECT * FROM service_leads
WHERE qualification_status = 'warm'
  AND created_at <= NOW() - INTERVAL '7 days'
  AND nurture_stage_1_sent = true
  AND (nurture_stage_2_sent IS NULL OR nurture_stage_2_sent = false)
  AND status != 'won'
  AND status != 'rejected'
```

### Mark Email Sent
```sql
UPDATE service_leads
SET nurture_stage_1_sent = true,
    last_engagement_date = NOW()
WHERE id = $1
```

### Mark Cold (No Engagement)
```sql
UPDATE service_leads
SET qualification_status = 'cold',
    status = 'cold'
WHERE id = $1
  AND engagement_count = 0
  AND last_engagement_date IS NULL
```

---

## 🚀 Setup Checklist

- [ ] Schedule trigger configured (every hour)
- [ ] All query nodes configured
- [ ] Email templates created
- [ ] Resend/SMTP credentials set
- [ ] Database columns added (nurture_stage_*)
- [ ] Tracking webhooks configured
- [ ] Conditional exits tested
- [ ] Workflow activated

---

## 📚 Full Documentation

See `docs/n8n-nurture-workflow.md` for complete setup instructions.
