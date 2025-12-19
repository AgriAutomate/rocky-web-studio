# n8n Workflow: Service Lead Nurture - Email Drip

## 📋 Workflow Overview

**Workflow Name:** Service Lead Nurture - Email Drip

**Purpose:** Automatically nurture warm and cold leads through a 5-email sequence over 28 days, tracking engagement and updating lead status based on behavior.

**Trigger:** Schedule (Cron) - Runs every hour to check for leads ready for next email

**Expected Behavior:**
- Email 1: Already sent in Service Lead Intake workflow (skip)
- Email 2: Day 3 - Service benefits
- Email 3: Day 7 - Customer testimonials
- Email 4: Day 14 - Special offer
- Email 5: Day 28 - Final FOMO message

---

## ⏰ Email Sequence Timing

| Email | Day | Subject | Content Focus | CTA |
|-------|-----|---------|---------------|-----|
| **Email 1** | Day 0 | (Already sent) | Initial acknowledgment | - |
| **Email 2** | Day 3 | "Here's what makes us different" | Service benefits + problem-solution | "Learn more" → Case studies |
| **Email 3** | Day 7 | "See what our customers say" | 3 testimonials + ratings | "Read customer stories" → Testimonials |
| **Email 4** | Day 14 | "Special offer ending Sunday" | 15% discount + free consultation | "Claim your offer" → Booking with coupon |
| **Email 5** | Day 28 | "One last chance for [SERVICE]" | Final FOMO + testimonials | "Schedule now" → Direct booking |

---

## 🔄 Workflow Logic Flow

### Step 1: Schedule Trigger (Cron)
- **Frequency:** Every hour
- **Purpose:** Check for leads ready for next email

### Step 2: Query Warm Leads Ready for Email
- Find leads where:
  - `qualification_status = 'warm'`
  - `created_at <= NOW() - INTERVAL '3 days'` (for Email 2)
  - `nurture_stage_1_sent = false` (or appropriate stage flag)

### Step 3: Determine Which Email to Send
- Check which emails have been sent
- Calculate days since `created_at`
- Route to appropriate email node

### Step 4: Send Email
- Use email template
- Track opens and clicks
- Update lead status

### Step 5: Update Database
- Mark email as sent
- Update `last_engagement_date`
- Increment `engagement_count` if clicked

### Step 6: Handle Conditional Exits
- Check for engagement
- Update qualification status if needed

---

## 🔗 Node 1: Schedule Trigger (Cron)

### Configuration

**Node Type:** Schedule Trigger

**Settings:**
- **Trigger Times:** Cron Expression
- **Cron Expression:** `0 * * * *` (Every hour at minute 0)
- **Timezone:** Your timezone (e.g., Australia/Sydney)

### Output

Triggers workflow every hour to check for leads.

---

## 🗄️ Node 2: Query Leads Ready for Email 2 (Day 3)

### Configuration

**Node Type:** Supabase

**Settings:**
- **Operation:** Execute Query
- **Query:**
  ```sql
  SELECT 
    id,
    first_name,
    last_name,
    email,
    service_type,
    qualification_status,
    created_at,
    nurture_stage_1_sent,
    nurture_stage_2_sent,
    nurture_stage_3_sent,
    nurture_stage_4_sent,
    last_engagement_date,
    engagement_count
  FROM service_leads
  WHERE qualification_status = 'warm'
    AND created_at <= NOW() - INTERVAL '3 days'
    AND (nurture_stage_1_sent IS NULL OR nurture_stage_1_sent = false)
    AND status != 'won'
    AND status != 'rejected'
    AND is_primary = true  -- Only send to primary records (exclude duplicates)
  ORDER BY created_at ASC
  LIMIT 50
  ```

### Output

Array of leads ready for Email 2.

---

## 🗄️ Node 3: Query Leads Ready for Email 3 (Day 7)

### Configuration

**Node Type:** Supabase

**Settings:**
- **Operation:** Execute Query
- **Query:**
  ```sql
  SELECT 
    id,
    first_name,
    last_name,
    email,
    service_type,
    qualification_status,
    created_at,
    nurture_stage_1_sent,
    nurture_stage_2_sent,
    nurture_stage_3_sent,
    nurture_stage_4_sent,
    last_engagement_date,
    engagement_count
  FROM service_leads
  WHERE qualification_status = 'warm'
    AND created_at <= NOW() - INTERVAL '7 days'
    AND nurture_stage_1_sent = true
    AND (nurture_stage_2_sent IS NULL OR nurture_stage_2_sent = false)
    AND status != 'won'
    AND status != 'rejected'
    AND is_primary = true  -- Only send to primary records (exclude duplicates)
  ORDER BY created_at ASC
  LIMIT 50
  ```

### Output

Array of leads ready for Email 3.

---

## 🗄️ Node 4: Query Leads Ready for Email 4 (Day 14)

### Configuration

**Node Type:** Supabase

**Settings:**
- **Operation:** Execute Query
- **Query:**
  ```sql
  SELECT 
    id,
    first_name,
    last_name,
    email,
    service_type,
    qualification_status,
    created_at,
    nurture_stage_1_sent,
    nurture_stage_2_sent,
    nurture_stage_3_sent,
    nurture_stage_4_sent,
    last_engagement_date,
    engagement_count
  FROM service_leads
  WHERE qualification_status = 'warm'
    AND created_at <= NOW() - INTERVAL '14 days'
    AND nurture_stage_2_sent = true
    AND (nurture_stage_3_sent IS NULL OR nurture_stage_3_sent = false)
    AND status != 'won'
    AND status != 'rejected'
    AND is_primary = true  -- Only send to primary records (exclude duplicates)
  ORDER BY created_at ASC
  LIMIT 50
  ```

### Output

Array of leads ready for Email 4.

---

## 🗄️ Node 5: Query Leads Ready for Email 5 (Day 28)

### Configuration

**Node Type:** Supabase

**Settings:**
- **Operation:** Execute Query
- **Query:**
  ```sql
  SELECT 
    id,
    first_name,
    last_name,
    email,
    service_type,
    qualification_status,
    created_at,
    nurture_stage_1_sent,
    nurture_stage_2_sent,
    nurture_stage_3_sent,
    nurture_stage_4_sent,
    last_engagement_date,
    engagement_count
  FROM service_leads
  WHERE qualification_status = 'warm'
    AND created_at <= NOW() - INTERVAL '28 days'
    AND nurture_stage_3_sent = true
    AND (nurture_stage_4_sent IS NULL OR nurture_stage_4_sent = false)
    AND status != 'won'
    AND status != 'rejected'
    AND is_primary = true  -- Only send to primary records (exclude duplicates)
  ORDER BY created_at ASC
  LIMIT 50
  ```

### Output

Array of leads ready for Email 5.

---

## 📧 Node 6: Send Email 2 (Day 3)

### Configuration

**Node Type:** Email Send (Resend/SMTP)

**Settings:**
- **From:** noreply@rockywebstudio.com.au
- **To:** `{{ $json.email }}`
- **Subject:** "Here's what makes us different"
- **Email Type:** HTML

### HTML Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #134252;">Hi {{ $json.first_name }},</h1>
  
  <p>Thanks for your interest in our {{ $json.service_type }} services.</p>
  
  <h2 style="color: #134252;">Here's what makes us different:</h2>
  
  <ul>
    <li><strong>Problem-Solution Focus:</strong> We don't just build websites—we solve business challenges</li>
    <li><strong>ROI-Driven Approach:</strong> Every project is designed to deliver measurable results</li>
    <li><strong>Industry Expertise:</strong> Specialized knowledge in your sector</li>
    <li><strong>Transparent Process:</strong> Clear communication from start to finish</li>
  </ul>
  
  <p>Want to see how we've helped businesses like yours?</p>
  
  <p style="text-align: center; margin: 30px 0;">
    <a href="https://rockywebstudio.com.au/case-studies?utm_source=nurture&utm_campaign=email2&lead_id={{ $json.id }}" 
       style="background-color: #134252; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Learn More
    </a>
  </p>
  
  <p>Best regards,<br>The Rocky Web Studio Team</p>
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
  <p style="font-size: 12px; color: #666;">
    <a href="{{ $unsubscribe_url }}">Unsubscribe</a> | 
    <a href="https://rockywebstudio.com.au">Rocky Web Studio</a>
  </p>
</body>
</html>
```

### Tracking Links

- **CTA Link:** Include UTM parameters and lead ID for tracking
- **Open Tracking:** Enable email open tracking
- **Click Tracking:** Track CTA clicks

---

## 📧 Node 7: Send Email 3 (Day 7)

### Configuration

**Node Type:** Email Send

**Settings:**
- **Subject:** "See what our customers say"
- **To:** `{{ $json.email }}`

### HTML Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #134252;">Hi {{ $json.first_name }},</h1>
  
  <p>Don't just take our word for it—here's what our customers say:</p>
  
  <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-left: 4px solid #134252;">
    <p style="font-style: italic;">"Rocky Web Studio transformed our online presence. Our leads increased by 40% in just 3 months."</p>
    <p style="text-align: right; margin-top: 10px;"><strong>— Sarah M., Healthcare Practice</strong> ⭐⭐⭐⭐⭐</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-left: 4px solid #134252;">
    <p style="font-style: italic;">"Professional, responsive, and results-driven. They understood our business from day one."</p>
    <p style="text-align: right; margin-top: 10px;"><strong>— James T., Manufacturing Co.</strong> ⭐⭐⭐⭐⭐</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-left: 4px solid #134252;">
    <p style="font-style: italic;">"The best investment we've made. ROI was clear within the first quarter."</p>
    <p style="text-align: right; margin-top: 10px;"><strong>— Lisa K., Retail Business</strong> ⭐⭐⭐⭐⭐</p>
  </div>
  
  <p style="text-align: center; margin: 30px 0;">
    <a href="https://rockywebstudio.com.au/testimonials?utm_source=nurture&utm_campaign=email3&lead_id={{ $json.id }}" 
       style="background-color: #134252; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Read Customer Stories
    </a>
  </p>
  
  <p>Best regards,<br>The Rocky Web Studio Team</p>
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
  <p style="font-size: 12px; color: #666;">
    <a href="{{ $unsubscribe_url }}">Unsubscribe</a> | 
    <a href="https://rockywebstudio.com.au">Rocky Web Studio</a>
  </p>
</body>
</html>
```

---

## 📧 Node 8: Send Email 4 (Day 14)

### Configuration

**Node Type:** Email Send

**Settings:**
- **Subject:** "Special offer ending Sunday"
- **To:** `{{ $json.email }}`

### HTML Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #134252;">Hi {{ $json.first_name }},</h1>
  
  <p>We'd love to help you get started with {{ $json.service_type }} services.</p>
  
  <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 20px; margin: 20px 0; text-align: center; border-radius: 5px;">
    <h2 style="color: #134252; margin-top: 0;">🎉 Special Offer</h2>
    <p style="font-size: 24px; font-weight: bold; color: #134252;">15% OFF</p>
    <p>Plus a <strong>FREE consultation</strong> to discuss your needs</p>
    <p style="font-size: 14px; color: #666;">Offer ends this Sunday at midnight</p>
  </div>
  
  <p>This is a limited-time opportunity to get started with our proven approach at a special rate.</p>
  
  <p style="text-align: center; margin: 30px 0;">
    <a href="https://rockywebstudio.com.au/book?coupon=NURTURE15&utm_source=nurture&utm_campaign=email4&lead_id={{ $json.id }}" 
       style="background-color: #134252; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
      Claim Your Offer
    </a>
  </p>
  
  <p>Best regards,<br>The Rocky Web Studio Team</p>
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
  <p style="font-size: 12px; color: #666;">
    <a href="{{ $unsubscribe_url }}">Unsubscribe</a> | 
    <a href="https://rockywebstudio.com.au">Rocky Web Studio</a>
  </p>
</body>
</html>
```

---

## 📧 Node 9: Send Email 5 (Day 28 - Final)

### Configuration

**Node Type:** Email Send

**Settings:**
- **Subject:** "One last chance for {{ $json.service_type }}"
- **To:** `{{ $json.email }}`

### HTML Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #134252;">Hi {{ $json.first_name }},</h1>
  
  <p>This is our final email about {{ $json.service_type }} services.</p>
  
  <p>We've shared how we can help, what our customers say, and even offered a special discount. If you're still interested, now's the time to take action.</p>
  
  <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-left: 4px solid #134252;">
    <p style="font-style: italic; margin: 0;">"Working with Rocky Web Studio was the best decision we made this year."</p>
    <p style="text-align: right; margin-top: 10px; margin-bottom: 0;"><strong>— Customer Review</strong> ⭐⭐⭐⭐⭐</p>
  </div>
  
  <p>If you're ready to get started, we're here to help. If not, we understand—just let us know if your needs change in the future.</p>
  
  <p style="text-align: center; margin: 30px 0;">
    <a href="https://rockywebstudio.com.au/book?utm_source=nurture&utm_campaign=email5&lead_id={{ $json.id }}" 
       style="background-color: #134252; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
      Schedule Now
    </a>
  </p>
  
  <p>Best regards,<br>The Rocky Web Studio Team</p>
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
  <p style="font-size: 12px; color: #666;">
    <a href="{{ $unsubscribe_url }}">Unsubscribe</a> | 
    <a href="https://rockywebstudio.com.au">Rocky Web Studio</a>
  </p>
</body>
</html>
```

---

## 💾 Node 10: Update Database After Email Sent

### Configuration

**Node Type:** Supabase

**Settings:**
- **Operation:** Execute Query
- **Query:**
  ```sql
  UPDATE service_leads
  SET 
    nurture_stage_1_sent = $1,
    nurture_stage_2_sent = $2,
    nurture_stage_3_sent = $3,
    nurture_stage_4_sent = $4,
    last_engagement_date = NOW(),
    updated_at = NOW()
  WHERE id = $5
  RETURNING id
  ```
- **Parameters:**
  - `$1`: `true` if Email 2 sent, else `{{ $json.nurture_stage_1_sent }}`
  - `$2`: `true` if Email 3 sent, else `{{ $json.nurture_stage_2_sent }}`
  - `$3`: `true` if Email 4 sent, else `{{ $json.nurture_stage_3_sent }}`
  - `$4`: `true` if Email 5 sent, else `{{ $json.nurture_stage_4_sent }}`
  - `$5`: `{{ $json.id }}`

---

## 🔀 Conditional Exits & Status Updates

### Exit 1: Email Clicked (Engagement Detected)

**Trigger:** Webhook from email tracking (click event)

**Action:**
```sql
UPDATE service_leads
SET 
  engagement_count = engagement_count + 1,
  last_engagement_date = NOW(),
  qualification_status = 'hot',  -- Move to hot for immediate follow-up
  updated_at = NOW()
WHERE id = $1
```

**Route to:** Sales team notification (Slack)

---

### Exit 2: Unsubscribed

**Trigger:** Unsubscribe webhook from email service

**Action:**
```sql
UPDATE service_leads
SET 
  status = 'rejected',
  qualification_status = 'rejected',
  updated_at = NOW()
WHERE id = $1
```

**Route to:** Stop all future emails

---

### Exit 3: No Engagement by Day 28

**Trigger:** After Email 5 sent, check engagement

**Action:**
```sql
UPDATE service_leads
SET 
  qualification_status = 'cold',
  status = 'cold',
  updated_at = NOW()
WHERE id = $1
  AND engagement_count = 0
  AND last_engagement_date IS NULL
```

**Route to:** Archive/remove from active nurture

---

### Exit 4: Booking Confirmed

**Trigger:** Webhook from booking system

**Action:**
```sql
UPDATE service_leads
SET 
  status = 'won',
  qualification_status = 'won',
  conversion_date = NOW(),
  updated_at = NOW()
WHERE id = $1
```

**Route to:** Success notification + stop nurture

---

### Exit 5: Lead Becomes "Hot"

**Trigger:** Engagement score increases to ≥ 70

**Action:**
```sql
UPDATE service_leads
SET 
  qualification_status = 'hot',
  updated_at = NOW()
WHERE id = $1
```

**Route to:** Immediate sales follow-up + stop nurture

---

## 📊 Tracking & Analytics

### Email Tracking Fields

Add these columns to `service_leads` table (if not already present):

```sql
ALTER TABLE service_leads
ADD COLUMN IF NOT EXISTS nurture_stage_1_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nurture_stage_2_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nurture_stage_3_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nurture_stage_4_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nurture_stage_5_sent BOOLEAN DEFAULT false;
```

### Engagement Tracking

**Open Tracking:**
- Use email service's built-in open tracking
- Update `last_engagement_date` on open

**Click Tracking:**
- Use UTM parameters in links
- Track via webhook when link clicked
- Increment `engagement_count`

**Conversion Tracking:**
- Track booking form submissions
- Update `conversion_date` and `conversion_value`

---

## 🔧 Setup Instructions

### Prerequisites

1. **Email Service**
   - Resend API key configured
   - Email domain verified
   - Unsubscribe handling set up

2. **Database Schema**
   - Run `add_lead_scoring_fields.sql` migration
   - Add nurture stage tracking columns (see above)

3. **Webhook Endpoints**
   - Email click tracking webhook
   - Unsubscribe webhook
   - Booking confirmation webhook

### Step-by-Step Setup

1. **Create Schedule Trigger**
   - Set to run every hour
   - Configure timezone

2. **Add Query Nodes**
   - Configure 4 query nodes (one for each email stage)
   - Test queries return expected results

3. **Add Email Nodes**
   - Configure Resend/SMTP connection
   - Set up HTML templates
   - Enable tracking

4. **Add Update Nodes**
   - Configure database update queries
   - Test updates work correctly

5. **Add Conditional Logic**
   - Set up IF nodes for exits
   - Configure status update queries

6. **Test Workflow**
   - Create test lead with `qualification_status = 'warm'`
   - Manually trigger workflow
   - Verify emails sent
   - Check database updates

7. **Activate Workflow**
   - Toggle to "Active"
   - Monitor first few executions

---

## 🧪 Testing

### Test Case 1: Email 2 (Day 3)

**Setup:**
1. Create test lead with:
   - `qualification_status = 'warm'`
   - `created_at = NOW() - INTERVAL '3 days'`
   - `nurture_stage_1_sent = false`

**Expected:**
- Email 2 sent
- `nurture_stage_1_sent = true`
- `last_engagement_date` updated

### Test Case 2: Email Click

**Setup:**
1. Lead clicks CTA in Email 2

**Expected:**
- `engagement_count` incremented
- `last_engagement_date` updated
- `qualification_status` may change to 'hot' (if score increases)

### Test Case 3: Unsubscribe

**Setup:**
1. Lead clicks unsubscribe link

**Expected:**
- `status = 'rejected'`
- `qualification_status = 'rejected'`
- No further emails sent

### Test Case 4: No Engagement

**Setup:**
1. Lead receives all 5 emails
2. No clicks or opens

**Expected:**
- After Email 5: `qualification_status = 'cold'`
- Removed from active nurture

---

## 📈 Monitoring

### Key Metrics

1. **Email Performance**
   - Open rates by email number
   - Click rates by email number
   - Unsubscribe rates

2. **Conversion Rates**
   - Email 2 → Booking
   - Email 3 → Booking
   - Email 4 → Booking
   - Email 5 → Booking

3. **Engagement Trends**
   - Average engagement count
   - Time to first engagement
   - Days to conversion

### Query Examples

**Get Email Performance:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE nurture_stage_1_sent = true) as email2_sent,
  COUNT(*) FILTER (WHERE nurture_stage_2_sent = true) as email3_sent,
  COUNT(*) FILTER (WHERE nurture_stage_3_sent = true) as email4_sent,
  COUNT(*) FILTER (WHERE nurture_stage_4_sent = true) as email5_sent
FROM service_leads
WHERE qualification_status = 'warm';
```

**Get Conversion by Email:**
```sql
SELECT 
  CASE 
    WHEN nurture_stage_1_sent = true AND nurture_stage_2_sent = false THEN 'Email 2'
    WHEN nurture_stage_2_sent = true AND nurture_stage_3_sent = false THEN 'Email 3'
    WHEN nurture_stage_3_sent = true AND nurture_stage_4_sent = false THEN 'Email 4'
    WHEN nurture_stage_4_sent = true THEN 'Email 5'
    ELSE 'Other'
  END as conversion_email,
  COUNT(*) as conversions
FROM service_leads
WHERE status = 'won'
  AND qualification_status = 'warm'
GROUP BY conversion_email;
```

---

## 🔄 Workflow Updates

### Adjusting Email Timing

To change email timing:

1. **Update Query Nodes**
   - Change `INTERVAL 'X days'` in SQL queries
   - Update stage flags checked

2. **Update Schedule**
   - Adjust cron frequency if needed
   - Consider timezone changes

### Adding New Emails

To add Email 6:

1. **Add Query Node** for Day X
2. **Add Email Node** with template
3. **Add Database Column:** `nurture_stage_5_sent`
4. **Update Update Node** to set new flag

---

## 📚 Related Documentation

- **Database Schema:** `database/schema/add_lead_scoring_fields.sql`
- **Lead Scoring Workflow:** `docs/n8n-lead-scoring-workflow.md`
- **Service Lead API:** `app/api/service/lead-submit/route.ts`
- **Email Templates:** Create reusable templates in `lib/email-templates/`

---

## ✅ Workflow Checklist

Before activating:

- [ ] Schedule trigger configured
- [ ] All query nodes tested
- [ ] Email templates created
- [ ] Email service connected
- [ ] Database columns added
- [ ] Tracking webhooks configured
- [ ] Conditional exits tested
- [ ] Workflow activated

---

## 🎯 Expected Results

After workflow is active:

✅ **Day 3:** Email 2 sent to warm leads
✅ **Day 7:** Email 3 sent (if no conversion)
✅ **Day 14:** Email 4 sent with special offer
✅ **Day 28:** Final email sent
✅ **Engagement Tracked:** Opens and clicks logged
✅ **Status Updated:** Leads moved based on behavior
✅ **Conversions:** Bookings tracked and leads marked "won"

All warm leads are automatically nurtured through the sequence with engagement tracking and status updates.
