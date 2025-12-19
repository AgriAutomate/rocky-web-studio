# n8n Workflow: Post-Service NPS Survey

## 📋 Workflow Overview

**Workflow Name:** Post-Service NPS Survey

**Purpose:** Automatically send NPS surveys after service completion, analyze responses, trigger follow-ups based on scores, and generate monthly NPS reports.

**Trigger:** Booking status changes to `'completed'`

**Expected Behavior:**
- Send survey link via SMS and email 1 day after completion
- Track survey opens and responses
- Categorize responses (Promoters, Passives, Detractors)
- Trigger appropriate follow-up actions
- Generate monthly NPS dashboard

---

## 🔄 Survey Flow

### Step 1: Survey Trigger (Day 1 After Completion)

**Trigger:** `booking_status = 'completed'` (from status notification workflow)

**Actions:**
1. **Create Survey Record:**
   ```sql
   INSERT INTO customer_surveys (
     lead_id,
     booking_id,
     survey_type,
     survey_sent_date,
     follow_up_status
   ) VALUES ($1, $2, 'combined', NOW(), 'sent')
   RETURNING id;
   ```

2. **Generate Survey Link:**
   - Typeform survey URL with embedded customer data
   - Include: Customer name, service type, booking ID
   - Track: Survey ID for response matching

3. **Send SMS:**
   - Message: "How was your service? Rate us: [survey_link]"
   - Track: Click tracking

4. **Send Email:**
   - Subject: "How was your service experience?"
   - Include: Survey link, customer name, service type
   - Track: Opens and clicks

---

### Step 2: Survey Questions

**Typeform Survey Structure:**

1. **NPS Question:**
   - "How likely are you to recommend Rocky Web Studio to a friend or colleague?"
   - Scale: 0-10
   - Required

2. **CSAT Question:**
   - "Overall, how satisfied were you with our service?"
   - Scale: 1-5 stars
   - Required

3. **Effort Score:**
   - "How easy was it to book and receive our service?"
   - Scale: 1-7 (1 = very easy, 7 = very difficult)
   - Required

4. **Feedback:**
   - "Any additional feedback or comments?"
   - Text field (optional)

**Embedded Data:**
- `customer_name`: First name + Last name
- `service_type`: Service type
- `booking_id`: Booking ID
- `survey_id`: Survey record ID

---

### Step 3: On Survey Response

**Webhook:** Typeform webhook on survey completion

**Payload Processing:**
```javascript
const response = $input.first().json;
const npsScore = parseInt(response.answers.find(a => a.field.id === 'nps_question').number);
const csatScore = parseInt(response.answers.find(a => a.field.id === 'csat_question').number);
const effortScore = parseInt(response.answers.find(a => a.field.id === 'effort_question').number);
const feedback = response.answers.find(a => a.field.id === 'feedback_question')?.text || '';

// Categorize NPS
let category = 'detractor';
if (npsScore >= 9) category = 'promoter';
else if (npsScore >= 7) category = 'passive';

return [{
  json: {
    survey_id: response.hidden.survey_id,
    booking_id: response.hidden.booking_id,
    nps_score: npsScore,
    csat_score: csatScore,
    effort_score: effortScore,
    feedback_text: feedback,
    category: category,
    response_date: new Date().toISOString()
  }
}];
```

---

### Step 4: Route by NPS Category

#### A. Promoters (NPS 9-10)

**Actions:**
1. **Update Survey Record:**
   ```sql
   UPDATE customer_surveys
   SET 
     nps_score = $1,
     csat_score = $2,
     effort_score = $3,
     feedback_text = $4,
     survey_response_date = NOW(),
     survey_completed = true,
     sentiment = 'positive',
     follow_up_status = 'responded'
   WHERE id = $5;
   ```

2. **Send Thank You Email:**
   - Subject: "Thank you for your feedback!"
   - Include: Appreciation message
   - Offer: $50 credit for referral
   - CTA: "Refer a Friend" link

3. **Add to Promoters List:**
   - Tag in HubSpot: "Promoter"
   - Add to case study candidate list
   - Ask permission for testimonial

4. **Update Sentiment:**
   - Set `sentiment = 'positive'`

---

#### B. Passives (NPS 7-8)

**Actions:**
1. **Update Survey Record:**
   ```sql
   UPDATE customer_surveys
   SET 
     nps_score = $1,
     csat_score = $2,
     effort_score = $3,
     feedback_text = $4,
     survey_response_date = NOW(),
     survey_completed = true,
     sentiment = 'neutral',
     follow_up_status = 'responded'
   WHERE id = $5;
   ```

2. **Send Follow-up Email:**
   - Subject: "How can we improve?"
   - Ask: Specific feedback about weak areas
   - Schedule: Follow-up in 2 weeks

3. **Update Sentiment:**
   - Set `sentiment = 'neutral'`

---

#### C. Detractors (NPS 0-6)

**Actions:**
1. **Update Survey Record:**
   ```sql
   UPDATE customer_surveys
   SET 
     nps_score = $1,
     csat_score = $2,
     effort_score = $3,
     feedback_text = $4,
     survey_response_date = NOW(),
     survey_completed = true,
     sentiment = 'negative',
     follow_up_status = 'pending',
     follow_up_date = NOW() + INTERVAL '1 day'
   WHERE id = $5;
   ```

2. **Send Slack Alert:**
   - Channel: `#customer-feedback`
   - Message: "🚨 Detractor Alert: [Customer Name] | NPS: [score] | Booking: [booking_id]"
   - Include: Feedback text, customer contact info
   - Tag: Manager for immediate action

3. **Manager Action Required:**
   - Call customer within 24 hours
   - Offer: Free re-service or discount
   - Goal: Recover satisfaction
   - Document: What went wrong

4. **Update Sentiment:**
   - Set `sentiment = 'negative'`

---

## 🤖 AI Sentiment Analysis

### Step 1: Analyze Feedback Text

**Type:** OpenAI API or similar

**Prompt:**
```
Analyze the following customer feedback and determine:
1. Sentiment: positive, neutral, or negative
2. Confidence: 0-100
3. Key issues mentioned (if any)
4. Themes: service quality, communication, pricing, etc.

Feedback: {{ $json.feedback_text }}
```

**Response Processing:**
```javascript
const analysis = $input.first().json;
return [{
  json: {
    sentiment: analysis.sentiment,
    sentiment_confidence: analysis.confidence,
    key_issues: analysis.issues,
    themes: analysis.themes
  }
}];
```

---

### Step 2: Update Survey with Analysis

**SQL:**
```sql
UPDATE customer_surveys
SET 
  sentiment = $1,
  sentiment_confidence = $2,
  follow_up_notes = $3
WHERE id = $4;
```

---

## 📊 Monthly NPS Dashboard

### Calculate NPS Score

**Formula:**
```
NPS = (% Promoters - % Detractors) × 100
```

**Query:**
```sql
WITH nps_data AS (
  SELECT 
    COUNT(*) FILTER (WHERE nps_score >= 9) as promoters,
    COUNT(*) FILTER (WHERE nps_score BETWEEN 7 AND 8) as passives,
    COUNT(*) FILTER (WHERE nps_score <= 6) as detractors,
    COUNT(*) as total_responses
  FROM customer_surveys
  WHERE survey_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
    AND survey_date < DATE_TRUNC('month', CURRENT_DATE)
    AND nps_score IS NOT NULL
)
SELECT 
  promoters,
  passives,
  detractors,
  total_responses,
  ROUND((promoters::DECIMAL / NULLIF(total_responses, 0)) * 100, 2) as promoter_percent,
  ROUND((detractors::DECIMAL / NULLIF(total_responses, 0)) * 100, 2) as detractor_percent,
  ROUND(
    ((promoters::DECIMAL / NULLIF(total_responses, 0)) - 
     (detractors::DECIMAL / NULLIF(total_responses, 0))) * 100, 
    2
  ) as nps_score
FROM nps_data;
```

---

### Top Feedback Themes

**Query:**
```sql
SELECT 
  sentiment,
  COUNT(*) as count,
  AVG(nps_score) as avg_nps,
  STRING_AGG(DISTINCT SUBSTRING(feedback_text, 1, 100), ' | ') as sample_feedback
FROM customer_surveys
WHERE survey_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
  AND feedback_text IS NOT NULL
  AND feedback_text != ''
GROUP BY sentiment
ORDER BY count DESC;
```

---

### Response Rate

**Query:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE survey_completed = true) as completed,
  COUNT(*) FILTER (WHERE survey_sent_date IS NOT NULL) as sent,
  ROUND(
    (COUNT(*) FILTER (WHERE survey_completed = true)::DECIMAL / 
     NULLIF(COUNT(*) FILTER (WHERE survey_sent_date IS NOT NULL), 0)) * 100, 
    2
  ) as response_rate_percent
FROM customer_surveys
WHERE survey_sent_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month';
```

---

### NPS Trend (Month-over-Month)

**Query:**
```sql
SELECT 
  DATE_TRUNC('month', survey_date) as month,
  COUNT(*) FILTER (WHERE nps_score >= 9) as promoters,
  COUNT(*) FILTER (WHERE nps_score <= 6) as detractors,
  COUNT(*) as total,
  ROUND(
    ((COUNT(*) FILTER (WHERE nps_score >= 9)::DECIMAL / NULLIF(COUNT(*), 0)) - 
     (COUNT(*) FILTER (WHERE nps_score <= 6)::DECIMAL / NULLIF(COUNT(*), 0))) * 100, 
    2
  ) as nps_score
FROM customer_surveys
WHERE survey_date >= CURRENT_DATE - INTERVAL '6 months'
  AND nps_score IS NOT NULL
GROUP BY DATE_TRUNC('month', survey_date)
ORDER BY month DESC;
```

---

## 📧 Email Templates

### Survey Invitation

**Subject:** "How was your service experience?"

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
    .button { background: #134252; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
  </style>
</head>
<body>
  <div class="header">
    <h1>We'd Love Your Feedback!</h1>
  </div>
  <div class="content">
    <p>Hi {{ first_name }},</p>
    <p>Thank you for choosing Rocky Web Studio for your {{ service_type }} service.</p>
    <p>We'd love to hear about your experience. Your feedback helps us improve!</p>
    <p><a href="{{ survey_link }}" class="button">Take 2-Minute Survey</a></p>
    <p>Thank you for your time!</p>
  </div>
</body>
</html>
```

---

### Promoter Thank You

**Subject:** "Thank you for being a promoter!"

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .offer { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; margin: 20px 0; text-align: center; }
    .button { background: #134252; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
  </style>
</head>
<body>
  <div class="content">
    <h1>Thank You!</h1>
    <p>Hi {{ first_name }},</p>
    <p>We're thrilled you had a great experience!</p>
    <div class="offer">
      <h2>Refer a Friend, Get $50 Credit</h2>
      <p>Share the love and earn $50 credit for each referral!</p>
    </div>
    <p><a href="{{ referral_link }}" class="button">Refer a Friend</a></p>
    <p>Would you be willing to share your experience as a testimonial?</p>
  </div>
</body>
</html>
```

---

### Detractor Follow-up

**Subject:** "We want to make this right"

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .button { background: #134252; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
  </style>
</head>
<body>
  <div class="content">
    <h1>We're Sorry</h1>
    <p>Hi {{ first_name }},</p>
    <p>We see your experience wasn't what we hoped for. We want to make it right.</p>
    <p>Our manager will call you within 24 hours to discuss how we can improve.</p>
    <p>In the meantime, we'd like to offer you a free re-service or discount on your next booking.</p>
    <p><a href="{{ contact_link }}" class="button">Schedule a Call</a></p>
  </div>
</body>
</html>
```

---

## 🗄️ Node Configuration

### Node 1: Booking Completed Webhook

**Type:** Webhook (from status notification workflow)

**Configuration:**
- **Path:** `nps-survey-trigger`
- **Method:** POST
- **Payload:**
  ```json
  {
    "bookingId": "uuid",
    "leadId": "uuid",
    "status": "completed"
  }
  ```

---

### Node 2: Wait 1 Day

**Type:** Wait

**Configuration:**
- **Wait Time:** 1 day
- **Resume:** After delay

---

### Node 3: Create Survey Record

**Type:** Supabase (PostgreSQL)

**Configuration:**
- **Operation:** Execute Query
- **Query:** (See Step 1 above)

---

### Node 4: Generate Survey Link

**Type:** Code (Function)

**JavaScript:**
```javascript
const items = $input.all();
const survey = items[0].json;
const booking = items[1]?.json || {};

// Generate Typeform survey link with embedded data
const baseUrl = 'https://form.typeform.com/to/YOUR_FORM_ID';
const params = new URLSearchParams({
  customer_name: booking.first_name + ' ' + booking.last_name,
  service_type: booking.service_type,
  booking_id: booking.booking_id,
  survey_id: survey.id
});

const surveyLink = `${baseUrl}?${params.toString()}`;

return [{
  json: {
    ...survey,
    survey_link: surveyLink
  }
}];
```

---

### Node 5: Send Survey SMS

**Type:** HTTP Request (Mobile Message API)

**Configuration:**
- **Method:** POST
- **URL:** `https://api.mobilemessage.com.au/v1/messages`
- **Authentication:** Basic Auth
- **Sender:** "Rocky Web" (ACMA-approved)
- **To:** `{{ $json.phone }}`
- **Message:** "How was your service? Rate us: {{ $json.survey_link }}"

---

### Node 6: Send Survey Email

**Type:** Resend

**Configuration:**
- **From:** noreply@rockywebstudio.com.au
- **To:** `{{ $json.email }}`
- **Subject:** "How was your service experience?"
- **HTML:** Survey invitation template

---

### Node 7: Typeform Webhook Handler

**Type:** Webhook

**Configuration:**
- **Path:** `typeform-survey-response`
- **Method:** POST
- **Verify:** Typeform webhook signature

---

### Node 8: Route by NPS Category

**Type:** IF Node

**Configuration:**
- **Condition 1:** `nps_score >= 9` → Promoter
- **Condition 2:** `nps_score BETWEEN 7 AND 8` → Passive
- **Condition 3:** `nps_score <= 6` → Detractor

---

### Node 9: AI Sentiment Analysis

**Type:** OpenAI API

**Configuration:**
- **Model:** `gpt-3.5-turbo` or `gpt-4`
- **Prompt:** (See AI Sentiment Analysis section)
- **Temperature:** 0.3 (for consistent results)

---

## 📊 Monthly NPS Report

**Generated:** 1st of each month at 10:00 AM

**Includes:**
- NPS score (current and trend)
- Promoter/Passive/Detractor breakdown
- Response rate
- Top feedback themes
- Common complaints
- Recommendations for improvement
- Industry benchmark comparison

**Delivery:**
- Email to martin@rockywebstudio.com.au
- Slack summary to #metrics

---

## 📈 Impact Metrics

### Track NPS Trend

**Goal:** NPS > 50

**Query:** (See Monthly NPS Dashboard section)

---

### Monitor Response Rate

**Goal:** Response rate > 60%

**Query:** (See Response Rate section)

---

### Measure Churn Prevention

**Goal:** Promoter retention > 90%

**Query:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE status = 'active') as active_promoters,
  COUNT(*) as total_promoters,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'active')::DECIMAL / 
     NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as retention_rate
FROM service_leads sl
INNER JOIN customer_surveys cs ON cs.lead_id = sl.id
WHERE cs.nps_score >= 9
  AND cs.survey_date >= CURRENT_DATE - INTERVAL '90 days';
```

---

### Calculate Revenue from Referrals

**Query:**
```sql
SELECT 
  COUNT(*) as referrals,
  SUM(sb.actual_cost) as referral_revenue
FROM service_leads sl
INNER JOIN service_bookings sb ON sb.lead_id = sl.id
WHERE sl.utm_source = 'referral'
  AND sl.created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month';
```

---

## ✅ Success Criteria

- [ ] Surveys sent 1 day after service completion
- [ ] Response rate > 60%
- [ ] NPS score > 50
- [ ] Detractors contacted within 24 hours
- [ ] Monthly reports generated automatically
- [ ] Sentiment analysis working
- [ ] Promoter referrals tracked

---

## 📚 Related Documentation

- **Database Schema:** `database/schema/customer_surveys.sql`
- **Status Notifications:** `docs/n8n-status-notification-workflow.md`
- **Typeform Setup:** Typeform documentation

---

## 🎯 Expected Results

After workflow is active:

✅ **Surveys Sent:** Automatically 1 day after completion
✅ **Response Tracking:** Opens, clicks, and completions tracked
✅ **Categorization:** Promoters, Passives, Detractors identified
✅ **Follow-ups:** Appropriate actions triggered based on score
✅ **NPS Tracking:** Monthly NPS score calculated and reported
✅ **Sentiment Analysis:** Feedback automatically analyzed
✅ **Churn Prevention:** Detractors recovered proactively

The NPS survey system provides comprehensive customer feedback tracking with automated follow-up and reporting.
