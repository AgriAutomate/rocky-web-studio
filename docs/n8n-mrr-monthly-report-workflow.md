# n8n Workflow: Monthly MRR Report

## 📋 Workflow Overview

**Workflow Name:** Monthly MRR Report

**Purpose:** Generate and email monthly recurring revenue report to management

**Trigger:** Schedule (Cron) - 1st of each month at 9:00 AM

**Expected Behavior:**
- Calculate current MRR
- Calculate new MRR (previous month)
- Calculate churn MRR (previous month)
- Calculate net MRR growth
- Generate HTML report
- Email to martin@rockywebstudio.com.au

---

## 🔄 Workflow Flow

### Step 1: Calculate MRR Metrics

**Query Current MRR:**
```sql
SELECT 
  SUM(
    CASE 
      WHEN frequency = 'monthly' THEN amount
      WHEN frequency = 'quarterly' THEN amount / 3
      WHEN frequency = 'annual' THEN amount / 12
    END
  ) as current_mrr,
  COUNT(*) as active_subscriptions
FROM service_subscriptions
WHERE status = 'active'
  AND billing_date <= CURRENT_DATE + INTERVAL '1 month';
```

**Query New MRR (Previous Month):**
```sql
SELECT 
  SUM(
    CASE 
      WHEN frequency = 'monthly' THEN amount
      WHEN frequency = 'quarterly' THEN amount / 3
      WHEN frequency = 'annual' THEN amount / 12
    END
  ) as new_mrr,
  COUNT(*) as new_subscriptions
FROM service_subscriptions
WHERE status = 'active'
  AND created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
  AND created_at < DATE_TRUNC('month', CURRENT_DATE);
```

**Query Churn MRR (Previous Month):**
```sql
SELECT 
  SUM(
    CASE 
      WHEN frequency = 'monthly' THEN amount
      WHEN frequency = 'quarterly' THEN amount / 3
      WHEN frequency = 'annual' THEN amount / 12
    END
  ) as churn_mrr,
  COUNT(*) as churned_subscriptions
FROM service_subscriptions
WHERE status = 'cancelled'
  AND cancellation_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
  AND cancellation_date < DATE_TRUNC('month', CURRENT_DATE);
```

**Query MRR by Service Type:**
```sql
SELECT 
  service_type,
  SUM(
    CASE 
      WHEN frequency = 'monthly' THEN amount
      WHEN frequency = 'quarterly' THEN amount / 3
      WHEN frequency = 'annual' THEN amount / 12
    END
  ) as mrr,
  COUNT(*) as subscription_count
FROM service_subscriptions
WHERE status = 'active'
  AND billing_date <= CURRENT_DATE + INTERVAL '1 month'
GROUP BY service_type
ORDER BY mrr DESC;
```

**Query Projected Annual Revenue:**
```sql
SELECT 
  SUM(
    CASE 
      WHEN frequency = 'monthly' THEN amount * 12
      WHEN frequency = 'quarterly' THEN amount * 4
      WHEN frequency = 'annual' THEN amount
    END
  ) as projected_annual_revenue
FROM service_subscriptions
WHERE status = 'active'
  AND billing_date <= CURRENT_DATE + INTERVAL '1 month';
```

---

### Step 2: Generate HTML Report

**Template:** See workflow documentation for full HTML template

**Includes:**
- Current MRR
- New MRR (previous month)
- Churn MRR (previous month)
- Net MRR Growth
- Growth rate percentage
- MRR by service type table
- Projected annual revenue

---

### Step 3: Send Email Report

**To:** martin@rockywebstudio.com.au

**Subject:** "Monthly MRR Report - [Month]"

**Body:** HTML report from Step 2

---

## 📊 Report Metrics

| Metric | Description |
|--------|-------------|
| **Current MRR** | All active subscriptions normalized to monthly |
| **New MRR** | MRR from subscriptions created last month |
| **Churn MRR** | MRR lost from cancellations last month |
| **Net MRR Growth** | New MRR - Churn MRR |
| **Growth Rate** | (Net MRR Growth / Previous MRR) × 100 |
| **Projected Annual** | Current MRR × 12 |

---

## 🚀 Setup

1. **Create Schedule Trigger:**
   - Cron: `0 9 1 * *` (9 AM on 1st of month)

2. **Configure Queries:**
   - Set up all MRR calculation queries
   - Test queries return expected results

3. **Generate Report:**
   - Create HTML template
   - Format all metrics

4. **Send Email:**
   - Configure Resend/SMTP
   - Test email delivery

5. **Activate Workflow:**
   - Toggle to "Active"
   - Monitor first execution

---

## 📚 Related Documentation

- **MRR Queries:** `docs/MRR_TRACKING_QUERIES.sql`
- **Recurring Billing:** `docs/n8n-recurring-billing-workflow.md`

---

## 🎯 Expected Results

After workflow is active:

✅ **Monthly Reports:** Generated automatically on 1st of each month
✅ **Email Delivery:** Report sent to martin@rockywebstudio.com.au
✅ **Accurate Metrics:** All MRR calculations correct
✅ **Trend Analysis:** Growth trends visible over time

The monthly MRR report provides visibility into recurring revenue performance and growth trends.
