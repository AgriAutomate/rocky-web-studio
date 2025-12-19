# NPS Survey Workflow - Quick Reference

## 🎯 Workflow Summary

**Name:** Post-Service NPS Survey

**Trigger:** Booking status = 'completed' (1 day delay)

**Purpose:** Automatically send NPS surveys, analyze responses, and trigger follow-ups

---

## 📊 NPS Categories

| Score | Category | Action |
|-------|----------|--------|
| **9-10** | Promoter | Thank you email, referral offer, testimonial request |
| **7-8** | Passive | Follow-up email, improvement feedback request |
| **0-6** | Detractor | Slack alert, manager call within 24h, recovery offer |

---

## 📋 Survey Questions

1. **NPS:** "How likely to recommend? (0-10)"
2. **CSAT:** "Overall satisfaction? (1-5 stars)"
3. **Effort:** "How easy was booking? (1-7)"
4. **Feedback:** "Additional comments? (text)"

---

## 🔄 Survey Flow

1. **Day 1:** Send survey via SMS + Email
2. **On Response:** Categorize (Promoter/Passive/Detractor)
3. **AI Analysis:** Sentiment analysis on feedback
4. **Follow-up:** Trigger appropriate action based on category

---

## 📈 NPS Calculation

**Formula:**
```
NPS = (% Promoters - % Detractors) × 100
```

**Goal:** NPS > 50

---

## 📊 Monthly Metrics

- **NPS Score:** Current and trend
- **Response Rate:** Goal > 60%
- **Promoter Retention:** Goal > 90%
- **Detractor Recovery:** Recovery rate
- **Referral Revenue:** Revenue from promoter referrals

---

## 🚀 Setup Checklist

- [ ] Run database migration (`customer_surveys.sql`)
- [ ] Create Typeform survey
- [ ] Configure Typeform webhook
- [ ] Set up OpenAI API (for sentiment analysis)
- [ ] Configure Slack channel (#customer-feedback)
- [ ] Test survey sending
- [ ] Test response processing
- [ ] Set up monthly NPS report
- [ ] Workflow activated

---

## 📚 Full Documentation

See `docs/n8n-nps-survey-workflow.md` for complete setup instructions.
