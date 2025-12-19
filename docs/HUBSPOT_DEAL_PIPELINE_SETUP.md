# HubSpot Deal Pipeline Setup Guide

## 📋 Overview

This guide covers setting up the HubSpot Deal Pipeline for Rocky Web Studio's service booking system. The pipeline automatically creates and manages deals based on service bookings.

---

## 🔧 HubSpot Configuration

### Step 1: Create Service Pipeline

1. **Navigate to HubSpot:**
   - Go to: Settings → Deals → Pipelines
   - Click "Create pipeline"

2. **Pipeline Settings:**
   - **Name:** "Service Pipeline"
   - **Type:** Deal pipeline
   - **Currency:** Your currency (e.g., USD, AUD)

3. **Create Deal Stages:**
   - **Scheduled** (First stage)
     - Probability: 75%
     - Description: "Service booking confirmed"
   
   - **Pending Approval**
     - Probability: 90%
     - Description: "Service completed, awaiting payment"
   
   - **Won**
     - Probability: 100%
     - Description: "Payment received, deal closed"
     - Mark as: Closed-won
   
   - **Lost**
     - Probability: 0%
     - Description: "Payment overdue or cancelled"
     - Mark as: Closed-lost

---

### Step 2: Create Custom Deal Properties

Navigate to: Settings → Properties → Deal properties

Create the following custom properties:

#### 1. Lead Score
- **Internal Name:** `lead_score`
- **Field Type:** Number
- **Label:** Lead Score
- **Description:** Engagement score from lead scoring workflow

#### 2. Service Type
- **Internal Name:** `service_type`
- **Field Type:** Single-select
- **Label:** Service Type
- **Options:** Emergency, Standard, Premium, Consultation
- **Description:** Type of service being provided

#### 3. Lead Source
- **Internal Name:** `lead_source`
- **Field Type:** Single-select
- **Label:** Lead Source
- **Options:** organic, paid_ad, referral, direct, partnership
- **Description:** Marketing source of the lead

#### 4. Lead Quality
- **Internal Name:** `lead_quality`
- **Field Type:** Single-select
- **Label:** Lead Quality
- **Options:** new, hot, warm, cold, won, rejected
- **Description:** Lead qualification status

#### 5. Scheduled Date
- **Internal Name:** `scheduled_date`
- **Field Type:** Date
- **Label:** Scheduled Date
- **Description:** Date when service is scheduled

#### 6. Technician Assigned
- **Internal Name:** `technician_assigned`
- **Field Type:** Single-line text
- **Label:** Technician Assigned
- **Description:** Name of technician assigned to service

#### 7. Service Notes
- **Internal Name:** `service_notes`
- **Field Type:** Long text
- **Label:** Service Notes
- **Description:** Service description and notes

#### 8. Customer Feedback
- **Internal Name:** `customer_feedback`
- **Field Type:** Long text
- **Label:** Customer Feedback
- **Description:** Customer feedback after service completion

---

### Step 3: Configure API Access

1. **Get API Key:**
   - Go to: Settings → Integrations → Private Apps
   - Create new private app or use existing
   - Grant permissions:
     - Deals: Read, Write
     - Contacts: Read (for association)
     - Timeline: Write (for notes)

2. **Add to Environment Variables:**
   ```bash
   HUBSPOT_API_KEY=your-api-key-here
   ```

---

## 🔗 Integration Points

### 1. Booking Creation → Deal Creation

**Trigger:** When `service_bookings` record is created with `booking_status = 'scheduled'`

**Webhook:** `/api/service/booking-created` (to be created)

**Payload:**
```json
{
  "bookingId": "uuid",
  "leadId": "uuid",
  "status": "scheduled"
}
```

**Action:** Create HubSpot deal with all properties populated

---

### 2. Booking Status Change → Deal Stage Update

**Trigger:** When `booking_status` changes

**Webhook:** From status notification workflow

**Actions:**
- `completed` → Deal stage: "Pending Approval"
- `paid` → Deal stage: "Won"
- Overdue → Deal stage: "Lost"

---

### 3. Payment Confirmation → Deal Won

**Trigger:** Stripe webhook `payment_intent.succeeded`

**Action:** Update deal to "Won" stage, set close date

---

## 📊 Analytics Setup

### Create Custom Reports in HubSpot

1. **Pipeline Velocity Report:**
   - Report Type: Deal
   - Group by: Deal stage
   - Metric: Average days in stage
   - Filter: Pipeline = "Service Pipeline"

2. **Win Rate Report:**
   - Report Type: Deal
   - Metric: Win rate percentage
   - Filter: Pipeline = "Service Pipeline"
   - Time period: Last 30 days

3. **Revenue Forecast:**
   - Report Type: Deal
   - Metric: Sum of deal amount
   - Group by: Close date (month)
   - Filter: Deal stage IN ("Scheduled", "Pending Approval")

4. **Service Type Performance:**
   - Report Type: Deal
   - Group by: Service type
   - Metrics: Count, Average deal value, Win rate
   - Filter: Pipeline = "Service Pipeline"

---

## ✅ Verification Checklist

- [ ] Service Pipeline created with all stages
- [ ] All custom properties created
- [ ] API key configured
- [ ] Webhook endpoints set up
- [ ] Test deal creation works
- [ ] Test stage transitions work
- [ ] Test payment confirmation updates deal
- [ ] Test overdue check moves deals to "Lost"
- [ ] Analytics reports configured
- [ ] Team trained on pipeline usage

---

## 🚨 Troubleshooting

### Deal Not Created

**Check:**
- Webhook is being called
- HubSpot API key is valid
- Contact exists in HubSpot (for association)
- Pipeline name matches exactly: "Service Pipeline"

### Deal Stage Not Updating

**Check:**
- Deal ID is stored in `service_leads.hubspot_deal_id`
- Status change webhook is triggered
- Deal stage name matches exactly (case-sensitive)

### Properties Not Populating

**Check:**
- Custom property internal names match exactly
- Property types match (Number, Text, Date, etc.)
- Values are in correct format

---

## 📚 Related Documentation

- **Workflow Documentation:** `docs/n8n-hubspot-deal-lifecycle-workflow.md`
- **Quick Reference:** `docs/n8n-hubspot-deal-quick-reference.md`
- **Status Notifications:** `docs/n8n-status-notification-workflow.md`

---

## 🎯 Expected Results

After setup:

✅ **Automatic Deal Creation:** All confirmed bookings create HubSpot deals
✅ **Stage Synchronization:** Deal stages match booking status
✅ **Payment Tracking:** Deals move to "Won" on payment
✅ **Overdue Handling:** Deals move to "Lost" after 30 days
✅ **Analytics:** Full visibility into pipeline performance
✅ **Reporting:** Automated reports on deal performance

The HubSpot integration provides complete deal lifecycle management with full CRM visibility.
