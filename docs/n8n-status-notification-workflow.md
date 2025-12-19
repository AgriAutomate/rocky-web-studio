# n8n Workflow: Service Status Updates - SMS & Email

## 📋 Workflow Overview

**Workflow Name:** Service Status Updates - SMS & Email

**Purpose:** Automatically send SMS and email notifications to customers when booking status changes, with real-time ETA updates, payment tracking, and comprehensive error handling.

**Trigger:** Supabase Database Webhook (on `booking_status` field change)

**Expected Behavior:**
- Detect status changes in `service_bookings` table
- Send appropriate SMS and email based on status transition
- Calculate and update ETA in real-time
- Track payment confirmations
- Update HubSpot deal stages
- Handle errors gracefully with retries and fallbacks

---

## 🔄 Status Transition Flow

### Status: `scheduled` → `assigned`

**Trigger:** When technician is assigned to booking

**Actions:**
1. **SMS (Twilio):**
   - Message: "Your tech is [technician_name], arriving [scheduled_date] [time_window]"
   - Send to: `service_leads.phone`
   - Track delivery status

2. **Email (Resend):**
   - Subject: "Your technician is on the way - [scheduled_date]"
   - HTML template with technician details
   - Include vehicle photo if `vehicle_id` is available
   - Include tracking link if `tracking_url` is set

3. **Database Updates:**
   - Set `customer_notification_sent = NOW()`
   - Log in `service_bookings.internal_notes`: "[TIMESTAMP] Status changed to assigned, notifications sent"

4. **HubSpot Update:**
   - Update deal stage to "Assigned"
   - Add note: "Technician [name] assigned"

---

### Status: `assigned` → `en-route`

**Trigger:** When technician starts journey to customer location

**Actions:**
1. **Calculate ETA:**
   - Use Google Maps API to calculate route
   - Get current technician location (from GPS or manual entry)
   - Calculate time to customer address
   - Update `eta_minutes` field

2. **SMS (Twilio):**
   - Message: "We're [eta_minutes] minutes away! Vehicle is [vehicle_color] [vehicle_model]"
   - Include tracking link if available

3. **Email (Resend):**
   - Subject: "Almost there! ETA: [eta_minutes] minutes"
   - HTML template with live tracking map
   - Include vehicle details

4. **Database Updates:**
   - Update `eta_minutes` with calculated value
   - Update `customer_notification_sent = NOW()`
   - Update `booking_status = 'en-route'`

5. **Slack Notification (Optional):**
   - Post to `#bookings` channel: "Tech [name] en-route to [customer_name], ETA [minutes]"

---

### Status: `en-route` → `completed`

**Trigger:** When technician marks job as complete in system

**Actions:**
1. **SMS (Twilio):**
   - Message: "Service complete! View invoice and pay: [payment_link]"
   - Include invoice amount if available

2. **Email (Resend):**
   - Subject: "Service Complete - Invoice & Receipt"
   - HTML template with:
     - Full invoice details
     - Receipt PDF attachment
     - Payment link (Stripe checkout)
     - NPS survey link
   - Track opens and clicks

3. **Database Updates:**
   - Update `booking_status = 'completed'`
   - Set `actual_cost` if different from `estimated_cost`
   - Log completion timestamp

4. **HubSpot Update:**
   - Update deal stage to "Pending Approval"
   - Add note: "Service completed, awaiting payment"
   - Set deal amount to `actual_cost`
   - Update `service_notes` with completion details
   - Add timeline entry with completion notes

5. **Trigger NPS Survey:**
   - Call NPS survey webhook (with 1-day delay)
   - Pass: `bookingId`, `leadId`, `status = 'completed'`
   - Survey will be sent automatically after delay

5. **Payment Reminder Workflow:**
   - Schedule automatic reminders (3, 7, 14 days) if not paid

---

### Status: `completed` → `paid`

**Trigger:** Stripe webhook on successful payment

**Actions:**
1. **SMS (Twilio):**
   - Message: "Thanks for your payment! See you next time. Join our loyalty program: [link]"

2. **Email (Resend):**
   - Subject: "Thank You for Your Payment!"
   - HTML template with:
     - Payment confirmation
     - Receipt PDF
     - Loyalty program information
     - Special offers for next service

3. **Database Updates:**
   - Update `booking_status = 'paid'`
   - Update `service_leads.conversion_date = NOW()`
   - Update `service_leads.conversion_value = actual_cost`
   - Mark as successful conversion

4. **HubSpot Update:**
   - Update deal stage to "Won"
   - Mark deal as closed-won
   - Set close date to payment date
   - Update deal amount to `actual_cost`
   - Add note: "Payment received on [date]"
   - Add deal close notes with payment confirmation

5. **Loyalty Program:**
   - Add customer to loyalty/subscription offer list
   - Update customer segment

6. **Archive:**
   - Mark booking as archived
   - Update lead status to "completed"

---

## 🔀 Conditional Flows

### Payment Failure Handling

**Condition:** Payment fails or times out

**Actions:**
1. **Retry Logic:**
   - Attempt 1: Wait 1 hour, resend payment link
   - Attempt 2: Wait 24 hours, resend with discount offer
   - Attempt 3: Wait 7 days, final reminder with late fee notice

2. **Notifications:**
   - SMS: "Payment reminder: [invoice_link]"
   - Email: Payment reminder with updated invoice

3. **Escalation:**
   - After 3 attempts: Alert manager via Slack
   - After 14 days: Mark as "payment-pending" and flag for collection

---

### No Response Handling

**Condition:** Customer doesn't respond to notifications

**Actions:**
1. **Follow-up Reminders:**
   - Day 3: "We haven't heard from you - need help?"
   - Day 7: "Final reminder - invoice due soon"
   - Day 14: "Account flagged for review"

2. **Communication Channels:**
   - Try SMS first
   - If SMS fails, try email
   - If both fail, log for manual follow-up

---

### Dispute Escalation

**Condition:** Customer disputes service or payment

**Actions:**
1. **Slack Alert:**
   - Post to `#disputes` channel
   - Include: Customer name, booking ID, dispute reason
   - Tag manager for immediate review

2. **Database Update:**
   - Flag booking with dispute status
   - Log dispute details in `internal_notes`

3. **Hold Payment:**
   - Pause payment reminders
   - Wait for manager resolution

---

### Cancellation Handling

**Condition:** Booking is cancelled

**Actions:**
1. **SMS (Twilio):**
   - Message: "Your booking for [date] has been cancelled. Reason: [reason]"

2. **Email (Resend):**
   - Subject: "Booking Cancellation Confirmation"
   - Include cancellation reason
   - Offer rescheduling link

3. **Database Updates:**
   - Update `booking_status = 'cancelled'`
   - Log cancellation reason
   - Archive booking

4. **HubSpot Update:**
   - Update deal stage to "Lost"
   - Add note with cancellation reason

---

## 🔌 Integrations

### Mobile Message (SMS)

**Configuration:**
- **API URL:** `https://api.mobilemessage.com.au/v1`
- **Username:** From Mobile Message dashboard
- **Password:** From Mobile Message dashboard
- **Sender ID:** "Rocky Web" (ACMA-approved)

**Usage:**
- Send SMS notifications via Mobile Message API
- Track delivery status
- Handle delivery failures

**Error Handling:**
- Invalid phone number: Log and email instead
- Delivery failure: Retry once, then email
- Rate limit: Queue and retry later
- Authentication error: Check credentials and retry

**Setup:**
- See `docs/N8N_MOBILE_MESSAGE_SETUP.md` for detailed configuration

---

### Resend (Email)

**Configuration:**
- **API Key:** From Resend dashboard
- **From Email:** noreply@rockywebstudio.com.au
- **Domain:** Verified in Resend

**Usage:**
- Send HTML email templates
- Track opens and clicks
- Handle bounces and unsubscribes

**Error Handling:**
- Bounce: Mark email as invalid
- Unsubscribe: Update customer preferences
- Rate limit: Queue and retry

---

### Stripe (Payments)

**Configuration:**
- **Webhook Secret:** From Stripe dashboard
- **API Key:** From Stripe dashboard

**Usage:**
- Listen for payment confirmations
- Update booking status to "paid"
- Track payment amounts

**Webhook Events:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

---

### Google Maps API (ETA)

**Configuration:**
- **API Key:** From Google Cloud Console
- **Enable:** Directions API, Distance Matrix API

**Usage:**
- Calculate route from technician to customer
- Get estimated travel time
- Update `eta_minutes` field

**Error Handling:**
- API failure: Use default ETA (30 minutes)
- No route found: Alert technician manually
- Rate limit: Cache results and retry

---

### HubSpot (CRM)

**Configuration:**
- **API Key:** From HubSpot account
- **Portal ID:** Your HubSpot portal ID

**Usage:**
- Update deal stages
- Add notes and activities
- Track customer interactions

**Deal Stages:**
- `scheduled` → "Scheduled"
- `assigned` → "Assigned"
- `en-route` → "En Route"
- `completed` → "Pending Approval"
- `paid` → "Won"
- `cancelled` → "Lost"

---

### Slack (Alerts)

**Configuration:**
- **Bot Token:** From Slack app
- **Channels:**
  - `#bookings` - Booking updates
  - `#disputes` - Dispute escalations
  - `#alerts` - System errors

**Usage:**
- Post status updates
- Alert managers on issues
- Notify team of important events

---

## 🗄️ Node Configuration

### Node 1: Supabase Database Webhook

**Type:** Supabase Trigger

**Configuration:**
- **Table:** `service_bookings`
- **Event:** `UPDATE`
- **Filter:** `booking_status` changed

**Output:**
```json
{
  "old": {
    "id": "uuid",
    "booking_status": "scheduled",
    ...
  },
  "new": {
    "id": "uuid",
    "booking_status": "assigned",
    "technician_name": "Jane Smith",
    "scheduled_date": "2025-01-15",
    ...
  }
}
```

---

### Node 2: Determine Status Transition

**Type:** Code (Function)

**JavaScript:**
```javascript
const items = $input.all();
const webhookData = items[0].json;

const oldStatus = webhookData.old?.booking_status;
const newStatus = webhookData.new?.booking_status;

// Determine transition type
let transitionType = null;
if (oldStatus === 'scheduled' && newStatus === 'assigned') {
  transitionType = 'assigned';
} else if (oldStatus === 'assigned' && newStatus === 'en-route') {
  transitionType = 'en-route';
} else if (oldStatus === 'en-route' && newStatus === 'completed') {
  transitionType = 'completed';
} else if (oldStatus === 'completed' && newStatus === 'paid') {
  transitionType = 'paid';
} else if (newStatus === 'cancelled') {
  transitionType = 'cancelled';
}

return [{
  json: {
    transitionType,
    booking: webhookData.new,
    oldStatus,
    newStatus
  }
}];
```

---

### Node 3: Query Customer Details

**Type:** Supabase Query

**SQL:**
```sql
SELECT 
  sl.id,
  sl.first_name,
  sl.last_name,
  sl.email,
  sl.phone,
  sl.location,
  sb.id as booking_id,
  sb.scheduled_date,
  sb.time_window,
  sb.technician_name,
  sb.technician_id,
  sb.vehicle_id,
  sb.tracking_url,
  sb.eta_minutes,
  sb.actual_cost,
  sb.estimated_cost
FROM service_leads sl
INNER JOIN service_bookings sb ON sb.lead_id = sl.id
WHERE sb.id = $1
```

**Parameters:**
- `$1`: `{{ $json.booking.id }}`

---

### Node 4: Send SMS - Assigned

**Type:** Twilio

**Configuration:**
- **Operation:** Send SMS
- **From:** Your Twilio number
- **To:** `{{ $json.phone }}`
- **Message:** `Your tech is {{ $json.technician_name }}, arriving {{ $json.scheduled_date }} {{ $json.time_window }}`

**Error Handling:**
- If SMS fails: Route to email node
- Log error in database

---

### Node 5: Send Email - Assigned

**Type:** Resend

**Configuration:**
- **From:** noreply@rockywebstudio.com.au
- **To:** `{{ $json.email }}`
- **Subject:** `Your technician is on the way - {{ $json.scheduled_date }}`
- **HTML Template:** (See template section below)

---

### Node 6: Calculate ETA (Google Maps)

**Type:** HTTP Request

**Configuration:**
- **Method:** GET
- **URL:** `https://maps.googleapis.com/maps/api/directions/json`
- **Parameters:**
  - `origin`: Technician location (from GPS or manual)
  - `destination`: `{{ $json.location }}`
  - `key`: Google Maps API key
  - `mode`: `driving`

**Response Processing:**
```javascript
const response = $input.first().json;
const route = response.routes[0];
const leg = route.legs[0];
const durationMinutes = Math.ceil(leg.duration.value / 60);

return [{
  json: {
    eta_minutes: durationMinutes,
    distance_km: (leg.distance.value / 1000).toFixed(2)
  }
}];
```

---

### Node 7: Update Database

**Type:** Supabase Update

**SQL:**
```sql
UPDATE service_bookings
SET 
  customer_notification_sent = NOW(),
  eta_minutes = $1,
  internal_notes = COALESCE(internal_notes, '') || E'\n[' || NOW() || '] Status: ' || $2 || ', Notifications sent'
WHERE id = $3
```

**Parameters:**
- `$1`: `{{ $json.eta_minutes }}` (if calculated)
- `$2`: `{{ $json.newStatus }}`
- `$3`: `{{ $json.booking.id }}`

---

### Node 8: Update HubSpot Deal

**Type:** HubSpot

**Configuration:**
- **Operation:** Update Deal
- **Deal ID:** From `service_leads.hubspot_deal_id`
- **Properties:**
  - `dealstage`: Based on booking status
  - `amount`: `{{ $json.actual_cost }}`
  - `closedate`: If status is "paid"

---

### Node 9: Stripe Payment Webhook Handler

**Type:** Webhook

**Configuration:**
- **Path:** `/stripe-payment-webhook`
- **Method:** POST
- **Verify:** Stripe webhook signature

**Logic:**
```javascript
const event = $input.first().json;

if (event.type === 'payment_intent.succeeded') {
  const paymentIntent = event.data.object;
  const bookingId = paymentIntent.metadata.booking_id;
  
  return [{
    json: {
      booking_id: bookingId,
      payment_status: 'succeeded',
      amount: paymentIntent.amount / 100
    }
  }];
}
```

---

## 📧 Email Templates

### Template 1: Technician Assigned

**Subject:** Your technician is on the way - [Date]

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #134252; color: white; padding: 20px; }
    .content { padding: 20px; }
    .button { background: #134252; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Your Technician is On the Way!</h1>
  </div>
  <div class="content">
    <p>Hi {{ first_name }},</p>
    <p>Great news! Your technician <strong>{{ technician_name }}</strong> has been assigned and will arrive on <strong>{{ scheduled_date }}</strong> between <strong>{{ time_window }}</strong>.</p>
    {{#if vehicle_id}}
    <p>You'll recognize our vehicle: <strong>{{ vehicle_id }}</strong></p>
    {{/if}}
    {{#if tracking_url}}
    <p><a href="{{ tracking_url }}" class="button">Track Your Technician</a></p>
    {{/if}}
    <p>We'll send you another update when they're on their way!</p>
    <p>Best regards,<br>Rocky Web Studio</p>
  </div>
</body>
</html>
```

---

### Template 2: En Route

**Subject:** Almost there! ETA: [X] minutes

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #134252; color: white; padding: 20px; }
    .content { padding: 20px; }
    .eta { font-size: 32px; color: #134252; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>We're Almost There!</h1>
  </div>
  <div class="content">
    <p>Hi {{ first_name }},</p>
    <p class="eta">ETA: {{ eta_minutes }} minutes</p>
    <p>Your technician is on the way! Look for our vehicle: <strong>{{ vehicle_id }}</strong></p>
    {{#if tracking_url}}
    <p><a href="{{ tracking_url }}" class="button">Live Tracking</a></p>
    {{/if}}
    <p>See you soon!</p>
  </div>
</body>
</html>
```

---

### Template 3: Service Complete

**Subject:** Service Complete - Invoice & Receipt

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .invoice { background: #f9f9f9; padding: 20px; margin: 20px 0; }
    .button { background: #134252; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="content">
    <h1>Service Complete!</h1>
    <p>Hi {{ first_name }},</p>
    <p>Your service has been completed. Here's your invoice:</p>
    <div class="invoice">
      <p><strong>Amount:</strong> ${{ actual_cost }}</p>
      <p><strong>Service Date:</strong> {{ scheduled_date }}</p>
    </div>
    <p><a href="{{ payment_link }}" class="button">Pay Now</a></p>
    <p>We'd love your feedback: <a href="{{ nps_survey_link }}">Take our quick survey</a></p>
  </div>
</body>
</html>
```

---

## 🚨 Error Handling

### SMS Failure

**Condition:** Twilio returns error

**Actions:**
1. Log error in database
2. Route to email notification instead
3. Alert manager if phone number is invalid
4. Update `internal_notes` with error details

---

### Email Failure

**Condition:** Resend returns bounce or error

**Actions:**
1. Mark email as invalid in database
2. Retry after 1 hour
3. If still fails, alert manager
4. Fall back to SMS only

---

### Google Maps API Failure

**Condition:** API returns error or timeout

**Actions:**
1. Use default ETA (30 minutes)
2. Log error for manual review
3. Continue with notification using default ETA
4. Alert technician to update manually

---

### Webhook Failure

**Condition:** Supabase webhook doesn't trigger

**Actions:**
1. Queue booking for manual review
2. Log in error tracking system
3. Alert via Slack
4. Retry webhook after 5 minutes

---

## 📊 Monitoring & Logging

### Key Metrics to Track

1. **Notification Delivery:**
   - SMS delivery rate
   - Email open rate
   - Click-through rate on links

2. **Status Transitions:**
   - Time from scheduled to assigned
   - Time from assigned to en-route
   - Time from completed to paid

3. **Error Rates:**
   - Failed SMS attempts
   - Failed email deliveries
   - API failures

### Logging

All actions should be logged in:
- `service_bookings.internal_notes` - Human-readable logs
- n8n execution logs - Technical details
- Slack alerts - Critical errors

---

## 🔧 Setup Instructions

### Prerequisites

1. **Twilio Account:**
   - Phone number purchased
   - API credentials configured

2. **Resend Account:**
   - Domain verified
   - API key generated

3. **Stripe Account:**
   - Webhook endpoint configured
   - API keys set up

4. **Google Maps API:**
   - API key generated
   - Directions API enabled

5. **HubSpot Integration:**
   - API key configured
   - Deal pipeline set up

6. **Slack App:**
   - Bot token generated
   - Channels created

### Step-by-Step Setup

1. **Create Supabase Webhook:**
   - Set up database trigger
   - Configure webhook URL in n8n

2. **Configure Twilio Node:**
   - Add credentials
   - Test SMS sending

3. **Configure Resend Node:**
   - Add API key
   - Test email sending

4. **Set Up Stripe Webhook:**
   - Create webhook endpoint
   - Subscribe to payment events

5. **Configure Google Maps:**
   - Add API key
   - Test ETA calculation

6. **Test Workflow:**
   - Create test booking
   - Trigger status changes
   - Verify all notifications

7. **Activate Workflow:**
   - Toggle to "Active"
   - Monitor first few executions

---

## ✅ Success Criteria

- [ ] SMS notifications sent successfully
- [ ] Email notifications delivered
- [ ] ETA calculations accurate
- [ ] Payment confirmations tracked
- [ ] HubSpot updates working
- [ ] Error handling functional
- [ ] All status transitions covered

---

## 📚 Related Documentation

- **Database Schema:** `database/schema/add_booking_status_fields.sql`
- **Service Bookings:** `database/schema/service_leads.sql`
- **Mobile Message Setup:** See `docs/N8N_MOBILE_MESSAGE_SETUP.md`
- **Resend Setup:** See Resend documentation

---

## 🎯 Expected Results

After workflow is active:

✅ **Status Changes:** Automatically trigger notifications
✅ **SMS Delivery:** Customers receive timely SMS updates
✅ **Email Delivery:** Professional email notifications sent
✅ **ETA Updates:** Real-time arrival estimates provided
✅ **Payment Tracking:** Automatic payment confirmation
✅ **CRM Updates:** HubSpot deals updated automatically
✅ **Error Handling:** Graceful fallbacks for all failures

The workflow provides comprehensive status tracking and customer communication throughout the service booking lifecycle.
