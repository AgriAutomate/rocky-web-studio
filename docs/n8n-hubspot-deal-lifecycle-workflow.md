# n8n Workflow: HubSpot Deal Lifecycle Management

## 📋 Workflow Overview

**Workflow Name:** HubSpot Deal Lifecycle Management

**Purpose:** Automatically create and manage HubSpot deals based on service bookings, track deal stages through the sales pipeline, and provide analytics on deal performance.

**Triggers:**
- Service booking created (deal creation)
- Booking status changes (deal stage transitions)
- Payment confirmations (deal won)
- Payment overdue (deal lost)

**Expected Behavior:**
- Create HubSpot deal when booking is confirmed
- Update deal stages based on booking status
- Track deal value and close dates
- Provide analytics on pipeline performance

---

## 🔄 Deal Lifecycle Flow

### Stage 1: Deal Creation

**Trigger:** `service_bookings` record created with `booking_status = 'scheduled'`

**Actions:**
1. **Query Lead Information:**
   ```sql
   SELECT 
     sl.id,
     sl.first_name,
     sl.last_name,
     sl.email,
     sl.hubspot_contact_id,
     sl.engagement_score,
     sl.qualification_status,
     sl.lead_source,
     sl.utm_source,
     sb.id as booking_id,
     sb.scheduled_date,
     sb.estimated_cost,
     sb.service_type,
     sb.description,
     sb.technician_name
   FROM service_leads sl
   INNER JOIN service_bookings sb ON sb.lead_id = sl.id
   WHERE sb.id = $1
   ```

2. **Create HubSpot Deal:**
   - **Deal Name:** `[firstName] [lastName] - [service_type]`
   - **Pipeline:** "Service Pipeline"
   - **Deal Stage:** "Scheduled"
   - **Deal Value:** `estimated_cost`
   - **Close Date:** `scheduled_date`
   - **Associated Contact:** `hubspot_contact_id`
   - **Custom Properties:**
     - `lead_score`: `engagement_score`
     - `service_type`: `service_type`
     - `lead_source`: `utm_source` or `lead_source`
     - `scheduled_date`: `scheduled_date`
     - `technician_assigned`: `technician_name`
     - `service_notes`: `description`

3. **Update Database:**
   ```sql
   UPDATE service_leads
   SET hubspot_deal_id = $1
   WHERE id = $2
   ```

---

### Stage 2: Scheduled → Pending Approval

**Trigger:** `booking_status` changes from `'scheduled'` or `'assigned'` to `'completed'`

**Actions:**
1. **Query Deal Information:**
   ```sql
   SELECT 
     sl.hubspot_deal_id,
     sb.id as booking_id,
     sb.actual_cost,
     sb.completed_date,
     sb.description
   FROM service_leads sl
   INNER JOIN service_bookings sb ON sb.lead_id = sl.id
   WHERE sb.id = $1
   ```

2. **Update HubSpot Deal:**
   - **Deal Stage:** "Pending Approval"
   - **Deal Value:** Update to `actual_cost` if different from `estimated_cost`
   - **Note:** "Service completed on [date], awaiting payment approval"
   - **Timeline Entry:** Add completion notes

3. **Update Database:**
   - Log status change in `service_bookings.internal_notes`

---

### Stage 3: Pending Approval → Won

**Trigger:** Payment received via Stripe webhook

**Actions:**
1. **Query Deal Information:**
   ```sql
   SELECT 
     sl.hubspot_deal_id,
     sl.id as lead_id,
     sb.id as booking_id,
     sb.actual_cost,
     sb.scheduled_date
   FROM service_leads sl
   INNER JOIN service_bookings sb ON sb.lead_id = sl.id
   WHERE sb.id = $1
   ```

2. **Update HubSpot Deal:**
   - **Deal Stage:** "Won"
   - **Deal Value:** `actual_cost`
   - **Close Date:** Payment date
   - **Note:** "Payment received on [date]"
   - **Deal Close Notes:** Include payment confirmation details

3. **Update Database:**
   ```sql
   UPDATE service_leads
   SET 
     conversion_date = NOW(),
     conversion_value = $1,
     status = 'won',
     qualification_status = 'won'
   WHERE id = $2
   ```

---

### Stage 4: Pending Approval → Lost

**Trigger:** 30 days overdue without payment (scheduled job)

**Actions:**
1. **Query Overdue Deals:**
   ```sql
   SELECT 
     sl.hubspot_deal_id,
     sl.id as lead_id,
     sb.id as booking_id,
     sb.scheduled_date,
     sb.actual_cost
   FROM service_leads sl
   INNER JOIN service_bookings sb ON sb.lead_id = sl.id
   WHERE sb.booking_status = 'completed'
     AND sb.scheduled_date < NOW() - INTERVAL '30 days'
     AND sl.status != 'won'
     AND sl.status != 'paid'
   ```

2. **Update HubSpot Deal:**
   - **Deal Stage:** "Lost"
   - **Note:** "Payment overdue 30+ days, marking as lost"
   - **Follow-up Note:** "Consider retry campaign or follow-up"

3. **Update Database:**
   ```sql
   UPDATE service_leads
   SET 
     status = 'lost',
     qualification_status = 'cold'
   WHERE id = $1
   ```

---

## 🗄️ Node Configuration

### Node 1: Booking Created Webhook

**Type:** Webhook

**Configuration:**
- **Path:** `hubspot-deal-creation`
- **Method:** POST
- **Expected Payload:**
  ```json
  {
    "bookingId": "uuid",
    "leadId": "uuid",
    "status": "scheduled"
  }
  ```

---

### Node 2: Query Booking & Lead Details

**Type:** Supabase (PostgreSQL)

**Configuration:**
- **Operation:** Execute Query
- **Query:** (See Stage 1 above)
- **Parameters:**
  - `$1`: `{{ $json.bookingId }}`

---

### Node 3: Create HubSpot Deal

**Type:** HubSpot

**Configuration:**
- **Operation:** Create Deal
- **Properties:**
  ```javascript
  {
    "dealname": `${$json.first_name} ${$json.last_name} - ${$json.service_type}`,
    "pipeline": "Service Pipeline",
    "dealstage": "Scheduled",
    "amount": $json.estimated_cost,
    "closedate": $json.scheduled_date,
    "associatedcompany": null,
    "hubspot_owner_id": null,
    "lead_score": $json.engagement_score,
    "service_type": $json.service_type,
    "lead_source": $json.utm_source || $json.lead_source,
    "scheduled_date": $json.scheduled_date,
    "technician_assigned": $json.technician_name,
    "service_notes": $json.description
  }
  ```
- **Associate Contact:** `{{ $json.hubspot_contact_id }}`

---

### Node 4: Update Database with Deal ID

**Type:** Supabase (PostgreSQL)

**Configuration:**
- **Operation:** Execute Query
- **Query:**
  ```sql
  UPDATE service_leads
  SET hubspot_deal_id = $1
  WHERE id = $2
  RETURNING id
  ```
- **Parameters:**
  - `$1`: `{{ $json.dealId }}` (from HubSpot response)
  - `$2`: `{{ $json.lead_id }}`

---

### Node 5: Booking Status Change Webhook

**Type:** Webhook

**Configuration:**
- **Path:** `hubspot-deal-update`
- **Method:** POST
- **Expected Payload:**
  ```json
  {
    "bookingId": "uuid",
    "oldStatus": "scheduled",
    "newStatus": "completed"
  }
  ```

---

### Node 6: Update Deal Stage - Pending Approval

**Type:** HubSpot

**Configuration:**
- **Operation:** Update Deal
- **Deal ID:** `{{ $json.hubspot_deal_id }}`
- **Properties:**
  ```javascript
  {
    "dealstage": "Pending Approval",
    "amount": $json.actual_cost || $json.estimated_cost,
    "service_notes": $json.description
  }
  ```
- **Add Note:** "Service completed on [date], awaiting payment approval"

---

### Node 7: Payment Confirmation Webhook

**Type:** Webhook (Stripe)

**Configuration:**
- **Path:** `stripe-payment-confirmation`
- **Method:** POST
- **Verify:** Stripe webhook signature

**Expected Payload:**
```json
{
  "event": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "amount": 10000,
      "metadata": {
        "booking_id": "uuid",
        "lead_id": "uuid"
      }
    }
  }
}
```

---

### Node 8: Update Deal Stage - Won

**Type:** HubSpot

**Configuration:**
- **Operation:** Update Deal
- **Deal ID:** `{{ $json.hubspot_deal_id }}`
- **Properties:**
  ```javascript
  {
    "dealstage": "Won",
    "amount": $json.actual_cost,
    "closedate": new Date().toISOString(),
    "customer_feedback": ""
  }
  ```
- **Add Note:** "Payment received on [date]"

---

### Node 9: Overdue Payment Check (Scheduled)

**Type:** Schedule Trigger

**Configuration:**
- **Cron Expression:** `0 9 * * *` (Daily at 9 AM)
- **Timezone:** Your timezone

---

### Node 10: Update Deal Stage - Lost

**Type:** HubSpot

**Configuration:**
- **Operation:** Update Deal
- **Deal ID:** `{{ $json.hubspot_deal_id }}`
- **Properties:**
  ```javascript
  {
    "dealstage": "Lost",
    "deal_lost_reason": "Payment overdue"
  }
  ```
- **Add Note:** "Payment overdue 30+ days, marking as lost"

---

## 📊 Deal Properties Configuration

### Standard Properties

| Property | Type | Source | Description |
|----------|------|--------|-------------|
| `dealname` | TEXT | Generated | `[firstName] [lastName] - [service_type]` |
| `pipeline` | ENUM | Fixed | "Service Pipeline" |
| `dealstage` | ENUM | Dynamic | Based on booking status |
| `amount` | CURRENCY | `estimated_cost` / `actual_cost` | Deal value |
| `closedate` | DATE | `scheduled_date` / payment date | Expected/actual close date |
| `probability` | PERCENT | Calculated | Based on stage and service type |

### Custom Properties

| Property | Type | Source | Description |
|----------|------|--------|-------------|
| `lead_score` | NUMBER | `engagement_score` | Lead engagement score |
| `service_type` | ENUM | `service_type` | Type of service |
| `lead_source` | ENUM | `utm_source` / `lead_source` | Marketing source |
| `lead_quality` | ENUM | `qualification_status` | Lead qualification |
| `scheduled_date` | DATE | `scheduled_date` | Service scheduled date |
| `technician_assigned` | TEXT | `technician_name` | Assigned technician |
| `service_notes` | TEXT | `description` | Service description |
| `customer_feedback` | TEXT | Empty initially | Customer feedback after completion |

---

## 📈 Analytics & Reporting

### Pipeline Velocity

**Query:**
```sql
SELECT 
  dealstage,
  AVG(EXTRACT(EPOCH FROM (closedate - createdate)) / 86400) as avg_days_in_stage
FROM deals
WHERE pipeline = 'Service Pipeline'
  AND createdate >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY dealstage
ORDER BY avg_days_in_stage;
```

**Metrics:**
- Average days in each stage
- Fastest moving deals
- Bottlenecks in pipeline

---

### Win Rate

**Query:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE dealstage = 'Won') as won_deals,
  COUNT(*) FILTER (WHERE dealstage = 'Lost') as lost_deals,
  COUNT(*) as total_deals,
  ROUND(
    (COUNT(*) FILTER (WHERE dealstage = 'Won')::DECIMAL / 
     NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as win_rate_percent
FROM deals
WHERE pipeline = 'Service Pipeline'
  AND createdate >= CURRENT_DATE - INTERVAL '30 days';
```

---

### Average Deal Value by Service Type

**Query:**
```sql
SELECT 
  service_type,
  COUNT(*) as deal_count,
  AVG(amount) as avg_deal_value,
  SUM(amount) as total_revenue
FROM deals
WHERE pipeline = 'Service Pipeline'
  AND dealstage = 'Won'
  AND createdate >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY service_type
ORDER BY avg_deal_value DESC;
```

---

### Revenue Forecast

**Query:**
```sql
SELECT 
  DATE_TRUNC('month', closedate) as forecast_month,
  SUM(amount) as forecasted_revenue,
  COUNT(*) as forecasted_deals
FROM deals
WHERE pipeline = 'Service Pipeline'
  AND dealstage IN ('Scheduled', 'Pending Approval')
  AND closedate >= CURRENT_DATE
GROUP BY DATE_TRUNC('month', closedate)
ORDER BY forecast_month;
```

---

### Sales Cycle Length

**Query:**
```sql
SELECT 
  AVG(EXTRACT(EPOCH FROM (closedate - createdate)) / 86400) as avg_sales_cycle_days,
  MIN(EXTRACT(EPOCH FROM (closedate - createdate)) / 86400) as min_sales_cycle_days,
  MAX(EXTRACT(EPOCH FROM (closedate - createdate)) / 86400) as max_sales_cycle_days
FROM deals
WHERE pipeline = 'Service Pipeline'
  AND dealstage = 'Won'
  AND createdate >= CURRENT_DATE - INTERVAL '90 days';
```

---

### Technician Productivity

**Query:**
```sql
SELECT 
  technician_assigned,
  COUNT(*) as deals_assigned,
  COUNT(*) FILTER (WHERE dealstage = 'Won') as deals_won,
  SUM(amount) FILTER (WHERE dealstage = 'Won') as revenue_generated,
  ROUND(
    (COUNT(*) FILTER (WHERE dealstage = 'Won')::DECIMAL / 
     NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as win_rate_percent
FROM deals
WHERE pipeline = 'Service Pipeline'
  AND createdate >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY technician_assigned
ORDER BY revenue_generated DESC;
```

---

## 📊 Reports

### Weekly Pipeline Review

**Generated:** Every Monday at 9 AM

**Includes:**
- Deals created last week
- Deals moved to "Won"
- Deals moved to "Lost"
- Pipeline velocity metrics
- Revenue forecast for next 30 days

**Delivery:** Email to sales team + Slack notification

---

### Monthly Revenue Forecast

**Generated:** 1st of each month

**Includes:**
- Forecasted revenue by month
- Deal value by service type
- Win rate trends
- Sales cycle analysis

**Delivery:** Email to management + Dashboard update

---

### Performance by Service Type

**Generated:** Weekly

**Includes:**
- Average deal value by service type
- Win rate by service type
- Sales cycle length by service type
- Revenue contribution by service type

---

### Technician Productivity Report

**Generated:** Weekly

**Includes:**
- Deals assigned per technician
- Win rate per technician
- Revenue generated per technician
- Average deal value per technician

---

## 🔧 Setup Instructions

### Prerequisites

1. **HubSpot Account:**
   - Create "Service Pipeline" if it doesn't exist
   - Configure deal stages: Scheduled, Pending Approval, Won, Lost
   - Create custom properties (see Deal Properties section)
   - Get API key with deal read/write permissions

2. **Database:**
   - Ensure `service_leads.hubspot_deal_id` column exists
   - Ensure `service_bookings` table has required fields

3. **Webhooks:**
   - Set up booking creation webhook
   - Set up booking status change webhook
   - Set up Stripe payment confirmation webhook

### Step-by-Step Setup

1. **Create HubSpot Pipeline:**
   - Go to HubSpot → Settings → Deals → Pipelines
   - Create "Service Pipeline"
   - Add stages: Scheduled, Pending Approval, Won, Lost

2. **Create Custom Properties:**
   - Go to HubSpot → Settings → Properties → Deal properties
   - Create each custom property listed above

3. **Configure Webhooks:**
   - Set up webhook endpoints in n8n
   - Configure webhook triggers in application

4. **Import Workflow:**
   - Use workflow JSON file in n8n
   - Configure HubSpot credentials
   - Test deal creation

5. **Set Up Scheduled Jobs:**
   - Configure overdue payment check (daily)
   - Configure weekly/monthly reports

6. **Test Workflow:**
   - Create test booking
   - Verify deal creation
   - Test status transitions
   - Verify analytics

---

## ✅ Success Criteria

- [ ] Deals created automatically when bookings confirmed
- [ ] Deal stages update based on booking status
- [ ] Payment confirmations move deals to "Won"
- [ ] Overdue payments move deals to "Lost"
- [ ] Analytics queries return accurate data
- [ ] Reports generated on schedule
- [ ] All custom properties populated correctly

---

## 📚 Related Documentation

- **Status Notification Workflow:** `docs/n8n-status-notification-workflow.md`
- **Service Bookings Schema:** `database/schema/service_leads.sql`
- **HubSpot Integration:** Existing HubSpot integration code

---

## 🎯 Expected Results

After workflow is active:

✅ **Deal Creation:** Automatic deal creation for all confirmed bookings
✅ **Stage Management:** Deal stages sync with booking status
✅ **Payment Tracking:** Deals move to "Won" on payment confirmation
✅ **Overdue Handling:** Deals move to "Lost" after 30 days
✅ **Analytics:** Comprehensive pipeline and revenue analytics
✅ **Reporting:** Automated weekly and monthly reports

The workflow provides complete deal lifecycle management with full visibility into sales pipeline performance.
