# AI Customer Chat - Quick Reference

## 🎯 Overview

AI-powered customer support chat using OpenAI, FAQ database, and Slack escalation.

---

## 🔄 Workflow Summary

1. **User sends message** → Chat widget webhook
2. **Extract intent** → OpenAI GPT-4 analysis
3. **Match FAQ** → Query knowledge base
4. **Generate response** → FAQ match or AI generation
5. **Send response** → Back to chat widget
6. **Escalate if needed** → Slack + human agent

---

## 📊 Intent Categories

| Intent | Keywords | Response Type |
|--------|----------|--------------|
| **scheduling** | schedule, book, appointment | FAQ + booking link |
| **pricing** | price, cost, how much | FAQ + price list |
| **locations** | where, location, area | FAQ + service area |
| **reschedule** | reschedule, change time | FAQ + calendar link |
| **cancellation** | cancel, refund | FAQ + cancellation policy |
| **payment** | payment, pay, invoice | FAQ + payment link |
| **contact** | phone, email, contact | FAQ + contact info |
| **general** | unclear questions | AI generated |

---

## 🚨 Escalation Triggers

- Customer frustration/anger detected
- Complex question (> 0.5 complexity)
- Low intent confidence (< 0.5)
- Explicit request for human
- Billing/legal questions

---

## 📈 Success Metrics

| Metric | Goal |
|--------|------|
| **FAQ Match Rate** | 80%+ |
| **Escalation Rate** | < 20% |
| **Response Time** | < 2 seconds |
| **Customer Satisfaction** | 4.0+ / 5.0 |

---

## 🔧 Setup Checklist

- [ ] Database schema created (`ai_chat_support.sql`)
- [ ] FAQ knowledge base populated
- [ ] n8n workflow imported
- [ ] OpenAI API key configured
- [ ] Chat widget webhook set up
- [ ] Slack channel configured (#customer-support)
- [ ] Environment variables set
- [ ] Test conversation completed

---

## 📚 Related Documentation

- **Workflow:** `docs/n8n-ai-chat-workflow.md`
- **Prompts:** `docs/OPENAI_CHAT_PROMPTS.md`
- **Database:** `database/schema/ai_chat_support.sql`

---

**Last Updated:** December 2024
