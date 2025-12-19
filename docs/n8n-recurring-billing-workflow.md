# n8n Workflow: Recurring Billing & Renewals

## 📋 Workflow Overview

**Workflow Name:** Recurring Billing & Renewals

**Purpose:** Automatically process recurring subscription billing, handle payment failures, send renewal reminders, prevent churn, and track MRR (Monthly Recurring Revenue).

**Trigger:** Schedule (Cron) - Daily at 8:00 AM

**Expected Behavior:**
- Find subscriptions due for billing today
- Process payments via Stripe
- Handle payment failures with retry logic
- Send renewal reminders (7 days before)
- Prevent churn with reactivation offers
- Track MRR and generate reports

---

## 🔄 Daily Workflow Flow

### Step 1: Find Subscriptions Due Today

**Query:**
```sql
SELECT 
  ss.id,
  ss.customer_id,
  ss.service_type,
  ss.frequency,
  ss.amount,
  ss.billing_date,
  ss.next_billing_date,
  ss.status,
  ss.stripe_subscription_id,
  ss.auto_renewal,
  sl.email,
  sl.first_name,
  sl.last_name,
  sl.stripe_customer_id,
  sl.hubspot_contact_id
FROM service_subscriptions ss
INNER JOIN service_leads sl ON sl.id = ss.customer_id
WHERE ss.billing_date = CURRENT_DATE
  AND ss.status = 'active'
  AND ss.auto_renewal = true
ORDER BY ss.billing_date ASC;
```

**Output:** Array of subscriptions due for billing today

---

### Step 2: Process Each Subscription

**For each subscription:**

#### A. Create Invoice in HubSpot

**Type:** HubSpot API

**Action:** Create invoice/quote
- Associate with contact (`hubspot_contact_id`)
- Amount: `amount`
- Due date: `billing_date`
- Description: `[service_type] subscription - [frequency]`

---

#### B. Charge via Stripe

**Type:** Stripe API

**Options:**
1. **If `stripe_subscription_id` exists:**
   - Use Stripe subscription billing (automatic)
   - Webhook will handle payment confirmation

2. **If no subscription ID:**
   - Create one-time payment intent
   - Charge customer's default payment method
   - Store `stripe_subscription_id` for future

**Configuration:**
- **Amount:** `amount * 100` (convert to cents)
- **Currency:** Your currency (e.g., 'usd', 'aud')
- **Customer:** `stripe_customer_id`
- **Description:** `[service_type] subscription - [frequency]`

---

#### C. On Payment Success

**Actions:**
1. **Insert Payment Record:**
   ```sql
   INSERT INTO subscription_payments (
     subscription_id,
     payment_date,
     amount,
     status,
     stripe_charge_id,
     stripe_payment_intent_id
   ) VALUES ($1, CURRENT_DATE, $2, 'completed', $3, $4)
   RETURNING id;
   ```

2. **Update Subscription:**
   ```sql
   UPDATE service_subscriptions
   SET 
     next_billing_date = CASE
       WHEN frequency = 'monthly' THEN billing_date + INTERVAL '1 month'
       WHEN frequency = 'quarterly' THEN billing_date + INTERVAL '3 months'
       WHEN frequency = 'annual' THEN billing_date + INTERVAL '1 year'
     END,
     billing_date = CASE
       WHEN frequency = 'monthly' THEN billing_date + INTERVAL '1 month'
       WHEN frequency = 'quarterly' THEN billing_date + INTERVAL '3 months'
       WHEN frequency = 'annual' THEN billing_date + INTERVAL '1 year'
     END,
     status = 'active',
     updated_at = NOW()
   WHERE id = $1;
   ```

3. **Send Confirmation Email:**
   - Subject: "Payment received - [service_type] subscription"
   - Include: Invoice PDF, payment confirmation
   - Track: Open and click rates

4. **Update HubSpot:**
   - Mark invoice as paid
   - Add timeline entry
   - Update deal value if applicable

---

#### D. On Payment Failure

**Actions:**
1. **Insert Failed Payment Record:**
   ```sql
   INSERT INTO subscription_payments (
     subscription_id,
     payment_date,
     amount,
     status,
     stripe_charge_id,
     failure_reason,
     failure_code,
     retry_count,
     next_retry_date
   ) VALUES (
     $1, 
     CURRENT_DATE, 
     $2, 
     'failed', 
     $3, 
     $4, 
     $5,
     1,
     CURRENT_DATE + INTERVAL '3 days'
   )
   RETURNING id;
   ```

2. **Send Payment Failed Email:**
   - Subject: "Payment failed - Action required"
   - Include: Failure reason, update payment method link
   - CTA: "Update Payment Method"

3. **Schedule Retry:**
   - Set `next_retry_date = billing_date + 3 days`
   - Increment `retry_count`

4. **After 3 Failures:**
   ```sql
   UPDATE service_subscriptions
   SET 
     status = 'paused',
     updated_at = NOW()
   WHERE id = $1
     AND (SELECT COUNT(*) FROM subscription_payments 
          WHERE subscription_id = $1 
            AND status = 'failed' 
            AND retry_count >= 3) >= 3;
   ```

---

### Step 3: 7-Day Pre-Renewal Reminders

**Query:**
```sql
SELECT 
  ss.id,
  ss.customer_id,
  ss.service_type,
  ss.amount,
  ss.next_billing_date,
  sl.email,
  sl.phone,
  sl.first_name,
  sl.last_name
FROM service_subscriptions ss
INNER JOIN service_leads sl ON sl.id = ss.customer_id
WHERE ss.next_billing_date = CURRENT_DATE + INTERVAL '7 days'
  AND ss.status = 'active'
  AND ss.auto_renewal = true;
```

**Actions:**
1. **Send SMS:**
   - Message: "Your [service_type] subscription renews on [next_billing_date]. Amount: $[amount]"

2. **Send Email:**
   - Subject: "Your subscription renews in 7 days"
   - Include: Service details, amount, renewal date
   - CTA: "Update Payment Method" (if needed)
   - Track: Open and click rates

3. **Update Tracking:**
   - Log reminder sent in `service_subscriptions.internal_notes` (if column exists)
   - Track in HubSpot timeline

---

### Step 4: Churn Prevention

**Query:**
```sql
SELECT 
  ss.id,
  ss.customer_id,
  ss.service_type,
  ss.amount,
  ss.created_at,
  sl.email,
  sl.first_name,
  sl.last_name
FROM service_subscriptions ss
INNER JOIN service_leads sl ON sl.id = ss.customer_id
WHERE ss.status = 'paused'
  AND ss.cancellation_date IS NULL
  AND ss.created_at < NOW() - INTERVAL '30 days'
  AND (SELECT COUNT(*) FROM subscription_payments 
       WHERE subscription_id = ss.id 
         AND status = 'failed') >= 3;
```

**Actions:**
1. **Send Reactivation Email:**
   - Subject: "We miss you! Reactivate for 20% off"
   - Offer: 20% discount on next billing cycle
   - CTA: "Reactivate Subscription" (direct link)
   - Track: Open, click, and reactivation rates

2. **Update Tracking:**
   - Log reactivation offer sent
   - Track in HubSpot

---

### Step 5: Cancellation Handling

**Query:**
```sql
SELECT 
  ss.id,
  ss.customer_id,
  ss.service_type,
  ss.amount,
  ss.cancellation_date,
  ss.cancellation_reason,
  sl.email,
  sl.first_name,
  sl.last_name
FROM service_subscriptions ss
INNER JOIN service_leads sl ON sl.id = ss.customer_id
WHERE ss.cancellation_date IS NOT NULL
  AND ss.status = 'cancelled'
  AND ss.cancellation_date >= CURRENT_DATE - INTERVAL '1 day';
```

**Actions:**
1. **Process Refunds (if applicable):**
   - Check if payment was made in last 30 days
   - Process partial refund if needed
   - Update payment status to 'refunded'

2. **Remove from Renewal Queue:**
   - Already handled by `status = 'cancelled'`
   - No further billing attempts

3. **Send Goodbye Email:**
   - Subject: "We're sorry to see you go"
   - Include: Cancellation confirmation
   - Ask for feedback via survey link

4. **Update HubSpot:**
   - Mark subscription as cancelled
   - Add cancellation reason to notes
   - Update deal stage if applicable

---

## 💰 MRR Tracking

### Calculate Monthly Recurring Revenue

**Query:**
```sql
-- Current MRR (all active subscriptions normalized to monthly)
SELECT 
  SUM(
    CASE 
      WHEN frequency = 'monthly' THEN amount
      WHEN frequency = 'quarterly' THEN amount / 3
      WHEN frequency = 'annual' THEN amount / 12
    END
  ) as current_mrr
FROM service_subscriptions
WHERE status = 'active'
  AND billing_date <= CURRENT_DATE + INTERVAL '1 month';
```

---

### New MRR (This Month)

**Query:**
```sql
SELECT 
  SUM(
    CASE 
      WHEN frequency = 'monthly' THEN amount
      WHEN frequency = 'quarterly' THEN amount / 3
      WHEN frequency = 'annual' THEN amount / 12
    END
  ) as new_mrr
FROM service_subscriptions
WHERE status = 'active'
  AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
  AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
```

---

### Churn MRR (This Month)

**Query:**
```sql
SELECT 
  SUM(
    CASE 
      WHEN frequency = 'monthly' THEN amount
      WHEN frequency = 'quarterly' THEN amount / 3
      WHEN frequency = 'annual' THEN amount / 12
    END
  ) as churn_mrr
FROM service_subscriptions
WHERE status = 'cancelled'
  AND cancellation_date >= DATE_TRUNC('month', CURRENT_DATE)
  AND cancellation_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
```

---

### Net MRR Growth

**Calculation:**
```
Net MRR Growth = New MRR - Churn MRR
```

**Query:**
```sql
WITH new_mrr AS (
  SELECT SUM(
    CASE 
      WHEN frequency = 'monthly' THEN amount
      WHEN frequency = 'quarterly' THEN amount / 3
      WHEN frequency = 'annual' THEN amount / 12
    END
  ) as value
  FROM service_subscriptions
  WHERE status = 'active'
    AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
),
churn_mrr AS (
  SELECT SUM(
    CASE 
      WHEN frequency = 'monthly' THEN amount
      WHEN frequency = 'quarterly' THEN amount / 3
      WHEN frequency = 'annual' THEN amount / 12
    END
  ) as value
  FROM service_subscriptions
  WHERE status = 'cancelled'
    AND cancellation_date >= DATE_TRUNC('month', CURRENT_DATE)
)
SELECT 
  COALESCE(new_mrr.value, 0) as new_mrr,
  COALESCE(churn_mrr.value, 0) as churn_mrr,
  COALESCE(new_mrr.value, 0) - COALESCE(churn_mrr.value, 0) as net_mrr_growth
FROM new_mrr, churn_mrr;
```

---

## 📊 Monthly MRR Report

**Generated:** 1st of each month at 9:00 AM

**Includes:**
- Current MRR
- New MRR (previous month)
- Churn MRR (previous month)
- Net MRR Growth
- MRR by service type
- MRR by frequency
- Growth rate percentage
- Projected annual revenue

**Delivery:** Email to martin@rockywebstudio.com.au

**Email Template:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #134252; color: white; padding: 20px; }
    .metric { background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 4px solid #134252; }
    .metric-value { font-size: 32px; font-weight: bold; color: #134252; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #134252; color: white; padding: 12px; text-align: left; }
    td { padding: 12px; border-bottom: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Monthly Recurring Revenue Report - [Month]</h1>
  </div>
  
  <div class="metric">
    <h3>Current MRR</h3>
    <div class="metric-value">${{ current_mrr }}</div>
  </div>
  
  <div class="metric">
    <h3>New MRR (This Month)</h3>
    <div class="metric-value">${{ new_mrr }}</div>
  </div>
  
  <div class="metric">
    <h3>Churn MRR (This Month)</h3>
    <div class="metric-value">-${{ churn_mrr }}</div>
  </div>
  
  <div class="metric">
    <h3>Net MRR Growth</h3>
    <div class="metric-value">${{ net_mrr_growth }}</div>
    <p>Growth Rate: {{ growth_rate }}%</p>
  </div>
  
  <h2>MRR by Service Type</h2>
  <table>
    <thead>
      <tr>
        <th>Service Type</th>
        <th>MRR</th>
        <th>Subscriptions</th>
      </tr>
    </thead>
    <tbody>
      {{#each mrr_by_service_type}}
      <tr>
        <td>{{ service_type }}</td>
        <td>${{ mrr }}</td>
        <td>{{ count }}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  
  <h2>Projected Annual Revenue</h2>
  <div class="metric">
    <div class="metric-value">${{ projected_annual_revenue }}</div>
    <p>Based on current MRR</p>
  </div>
</body>
</html>
```

---

## 🔌 Stripe Integration

### Create Stripe Subscription

**When:** New subscription created

**API Call:**
```javascript
const subscription = await stripe.subscriptions.create({
  customer: stripe_customer_id,
  items: [{
    price_data: {
      currency: 'usd',
      product: service_type_product_id,
      recurring: {
        interval: frequency, // 'month', 'quarter', 'year'
      },
      unit_amount: amount * 100, // Convert to cents
    },
  }],
  billing_cycle_anchor: billing_date,
  metadata: {
    subscription_id: id,
    customer_id: customer_id,
  },
});

// Store stripe_subscription_id
```

---

### Stripe Webhook Handlers

**Payment Success:**
- Event: `invoice.payment_succeeded`
- Action: Update `subscription_payments` status to 'completed'
- Update `next_billing_date`

**Payment Failure:**
- Event: `invoice.payment_failed`
- Action: Insert failed payment record
- Schedule retry
- Send failure notification

**Subscription Cancelled:**
- Event: `customer.subscription.deleted`
- Action: Update subscription status to 'cancelled'
- Set `cancellation_date`

---

## 🗄️ Node Configuration

### Node 1: Schedule Trigger (Daily)

**Type:** Schedule Trigger

**Configuration:**
- **Cron Expression:** `0 8 * * *` (8:00 AM daily)
- **Timezone:** Your timezone

---

### Node 2: Query Subscriptions Due Today

**Type:** Supabase (PostgreSQL)

**Configuration:**
- **Operation:** Execute Query
- **Query:** (See Step 1 above)

---

### Node 3: Process Each Subscription (Loop)

**Type:** Split In Batches

**Configuration:**
- Process each subscription individually
- Continue on error

---

### Node 4: Create Stripe Payment

**Type:** Stripe

**Configuration:**
- **Operation:** Create Payment Intent
- **Amount:** `{{ $json.amount * 100 }}`
- **Currency:** 'usd' or 'aud'
- **Customer:** `{{ $json.stripe_customer_id }}`
- **Description:** `{{ $json.service_type }} subscription`

---

### Node 5: Handle Payment Success

**Type:** Code (Function)

**Actions:**
- Insert payment record
- Update subscription billing dates
- Send confirmation email
- Update HubSpot

---

### Node 6: Handle Payment Failure

**Type:** Code (Function)

**Actions:**
- Insert failed payment record
- Schedule retry
- Send failure email
- Check retry count (pause after 3 failures)

---

### Node 7: Query 7-Day Reminders

**Type:** Supabase (PostgreSQL)

**Configuration:**
- **Query:** (See Step 3 above)

---

### Node 8: Send Renewal Reminders

**Type:** Email Send + SMS

**Configuration:**
- Send SMS and email
- Track opens/clicks

---

### Node 9: Query Churn Prevention

**Type:** Supabase (PostgreSQL)

**Configuration:**
- **Query:** (See Step 4 above)

---

### Node 10: Send Reactivation Offers

**Type:** Email Send

**Configuration:**
- Subject: "We miss you! Reactivate for 20% off"
- Include reactivation link with discount code

---

## ✅ Success Criteria

- [ ] Subscriptions billed automatically on due date
- [ ] Payment failures handled with retry logic
- [ ] Renewal reminders sent 7 days before
- [ ] Churn prevention offers sent to paused subscriptions
- [ ] MRR calculated accurately
- [ ] Monthly reports generated and emailed
- [ ] Stripe integration working
- [ ] Customer portal accessible

---

## 📚 Related Documentation

- **Database Schema:** `database/schema/service_subscriptions.sql`
- **Stripe Setup:** Stripe documentation
- **HubSpot Integration:** `docs/n8n-hubspot-deal-lifecycle-workflow.md`

---

## 🎯 Expected Impact

**Revenue Transformation:**
- Current: $2K one-time revenue
- Target: $10K+ MRR
- Growth: 5x revenue increase

**Benefits:**
- ✅ Predictable recurring revenue
- ✅ Reduced sales cycle (focus on retention)
- ✅ Higher customer lifetime value
- ✅ Better cash flow forecasting
- ✅ Automated billing reduces manual work

The recurring billing system transforms one-time transactions into predictable subscription revenue with automated management.
