# Recurring Billing Workflow - Quick Reference

## 🎯 Workflow Summary

**Name:** Recurring Billing & Renewals

**Trigger:** Schedule (Cron) - Daily at 8:00 AM

**Purpose:** Automatically process subscription billing, handle failures, send reminders, and prevent churn

---

## 🔄 Daily Tasks

| Task | Query | Action |
|------|-------|--------|
| **Bill Due Subscriptions** | `billing_date = TODAY()` | Charge via Stripe, update dates |
| **7-Day Reminders** | `next_billing_date = TODAY() + 7 days` | Send SMS + Email |
| **Churn Prevention** | `status = 'paused' AND created_at > 30 days` | Send reactivation offer |
| **Cancellation Handling** | `cancellation_date IS NOT NULL` | Process refunds, send goodbye email |

---

## 💳 Payment Processing

### Success Flow
1. Charge via Stripe
2. Insert payment record (`status = 'completed'`)
3. Update `next_billing_date` based on frequency
4. Send confirmation email
5. Update HubSpot

### Failure Flow
1. Insert failed payment (`status = 'failed'`)
2. Schedule retry in 3 days
3. Send failure email
4. After 3 failures: `status = 'paused'`

---

## 📊 MRR Calculation

**Current MRR:**
```sql
SUM(
  CASE 
    WHEN frequency = 'monthly' THEN amount
    WHEN frequency = 'quarterly' THEN amount / 3
    WHEN frequency = 'annual' THEN amount / 12
  END
)
```

**Net MRR Growth:**
```
New MRR - Churn MRR
```

---

## 📧 Email Templates

**Payment Success:**
- Subject: "Payment received - [service_type] subscription"
- Includes: Amount, next billing date

**Payment Failed:**
- Subject: "Payment failed - Action required"
- Includes: Failure reason, update payment link

**Renewal Reminder:**
- Subject: "Your subscription renews in 7 days"
- Includes: Amount, renewal date, update payment link

**Churn Prevention:**
- Subject: "We miss you! Reactivate for 20% off"
- Includes: Discount offer, reactivation link

---

## 🚀 Setup Checklist

- [ ] Run database migration (`service_subscriptions.sql`)
- [ ] Configure Stripe API credentials
- [ ] Set up Stripe webhooks
- [ ] Create customer portal
- [ ] Configure email templates
- [ ] Test payment processing
- [ ] Test failure handling
- [ ] Set up MRR reporting
- [ ] Workflow activated

---

## 📚 Full Documentation

See `docs/n8n-recurring-billing-workflow.md` for complete setup instructions.
