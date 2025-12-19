# n8n Workflow: Service Lead Scoring & Qualification

## 📋 Workflow Overview

**Workflow Name:** Service Lead Scoring & Qualification

**Purpose:** Automatically score and qualify service leads based on urgency, source, and service value, then route them to appropriate channels.

**Trigger:** Webhook from `/api/service/lead-submit` endpoint

**Expected Behavior:**
- Hot leads (score ≥ 70) → `#hot-leads` Slack channel (immediate notification)
- Warm leads (score 40-69) → `#leads` Slack channel
- Cold leads (score < 40) → `#nurture` Slack channel (triggers nurture sequence)

---

## 🔗 Node 1: Webhook Trigger

### Configuration

**Node Type:** Webhook

**Settings:**
- **HTTP Method:** POST
- **Path:** `/webhook/service-lead-scoring`
- **Response Mode:** Respond to Webhook
- **Response Code:** 200

### Expected Payload

```json
{
  "leadId": "uuid-here",
  "formData": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+61400000000",
    "serviceType": "emergency",
    "urgency": "today",
    "location": "Sydney, NSW",
    "description": "Need urgent help",
    "utm_source": "paid_ad",
    "utm_campaign": "summer-2025"
  },
  "timestamp": "2025-12-19T04:00:00.000Z"
}
```

### Output

Passes entire payload to next node.

---

## 🗄️ Node 2: Query Lead from Supabase

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
    phone,
    service_type,
    urgency,
    location,
    description,
    utm_source,
    utm_campaign,
    created_at,
    status,
    is_urgent
  FROM service_leads
  WHERE id = $1
  ```
- **Parameters:**
  - `$1`: `{{ $json.leadId }}`

### Output

Full lead record from database.

**Example Output:**
```json
{
  "id": "uuid-here",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+61400000000",
  "service_type": "emergency",
  "urgency": "today",
  "location": "Sydney, NSW",
  "description": "Need urgent help",
  "utm_source": "paid_ad",
  "utm_campaign": "summer-2025",
  "created_at": "2025-12-19T04:00:00.000Z",
  "status": "new",
  "is_urgent": true
}
```

---

## 💰 Node 3: Look Up Service Type Price

### Configuration

**Node Type:** Supabase

**Settings:**
- **Operation:** Execute Query
- **Query:**
  ```sql
  SELECT 
    id,
    service_name,
    service_key,
    base_price,
    category
  FROM service_types
  WHERE service_key = $1
  AND is_active = true
  ```
- **Parameters:**
  - `$1`: `{{ $json.service_type }}`

### Output

Service type details including `base_price` for margin calculation.

**Example Output:**
```json
{
  "id": 1,
  "service_name": "Emergency Service",
  "service_key": "emergency",
  "base_price": 150.00,
  "category": "urgent"
}
```

**Note:** If service type not found, `base_price` will be `null`. Handle this in scoring logic.

---

## 🧮 Node 4: Calculate Scoring (Function Node)

### Configuration

**Node Type:** Code (Function)

**Language:** JavaScript

### Code

// Get data from previous nodes
// Node 2 output is in $input.all()[0]
// Node 3 output is in $input.all()[1] (if exists)
const allInputs = $input.all();
const lead = allInputs[0].json; // From Node 2 (Supabase query)
const serviceType = allInputs[1]?.json || {}; // From Node 3 (service_types query)

// Initialize scores
let engagementScore = 0;
let urgencyScore = 0;

// Calculate urgency score
if (lead.urgency === 'today') {
  urgencyScore = 30;
  engagementScore += 30;
} else if (lead.urgency === 'next_48h') {
  urgencyScore = 20;
  engagementScore += 20;
} else if (lead.urgency === 'next_48h') {
  urgencyScore = 10;
  engagementScore += 10;
}

// Calculate source score
if (lead.utm_source === 'paid_ad') {
  engagementScore += 25;
} else if (lead.utm_source === 'referral') {
  engagementScore += 20;
} else if (lead.utm_source === 'organic') {
  engagementScore += 10;
}

// Calculate service value score
const basePrice = serviceType?.base_price || 0;
if (basePrice > 100) {
  engagementScore += 15; // High-margin service
} else if (basePrice > 0) {
  engagementScore += 5; // Low-margin service
}

// Determine qualification status
let qualificationStatus;
if (engagementScore >= 70) {
  qualificationStatus = 'hot';
} else if (engagementScore >= 40) {
  qualificationStatus = 'warm';
} else {
  qualificationStatus = 'cold';
}

// Return scoring results
return {
  leadId: lead.id,
  firstName: lead.first_name,
  lastName: lead.last_name,
  email: lead.email,
  phone: lead.phone,
  serviceType: lead.service_type,
  urgency: lead.urgency,
  utmSource: lead.utm_source,
  engagementScore: engagementScore,
  urgencyScore: urgencyScore,
  qualificationStatus: qualificationStatus,
  basePrice: basePrice,
  serviceName: serviceType?.service_name || 'Unknown',
  // Keep original lead data for reference
  originalLead: lead
};
```

### Output

Scoring results with qualification status.

**Example Output:**
```json
{
  "leadId": "uuid-here",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+61400000000",
  "serviceType": "emergency",
  "urgency": "today",
  "utmSource": "paid_ad",
  "engagementScore": 70,
  "urgencyScore": 30,
  "qualificationStatus": "hot",
  "basePrice": 150.00,
  "serviceName": "Emergency Service",
  "originalLead": { ... }
}
```

---

## 💾 Node 5: Update Supabase with Scores

### Configuration

**Node Type:** Supabase

**Settings:**
- **Operation:** Execute Query
- **Query:**
  ```sql
  UPDATE service_leads
  SET 
    engagement_score = $1,
    urgency_score = $2,
    qualification_status = $3,
    last_engagement_date = NOW(),
    engagement_count = engagement_count + 1,
    updated_at = NOW()
  WHERE id = $4
  RETURNING id, engagement_score, qualification_status
  ```
- **Parameters:**
  - `$1`: `{{ $json.engagementScore }}`
  - `$2`: `{{ $json.urgencyScore }}`
  - `$3`: `{{ $json.qualificationStatus }}`
  - `$4`: `{{ $json.leadId }}`

### Output

Updated lead record confirmation.

**Example Output:**
```json
{
  "id": "uuid-here",
  "engagement_score": 70,
  "qualification_status": "hot"
}
```

---

## 🔀 Node 6: Route by Qualification Status

### Configuration

**Node Type:** IF (Conditional)

**Settings:**
- **Condition 1:** `{{ $json.qualificationStatus }}` equals `"hot"`
  - **Route to:** Node 7 (Hot Leads Slack)
- **Condition 2:** `{{ $json.qualificationStatus }}` equals `"warm"`
  - **Route to:** Node 8 (Warm Leads Slack)
- **Default/Else:** Route to Node 9 (Cold Leads Slack)

### Logic

```
IF qualificationStatus === "hot" → Node 7
ELSE IF qualificationStatus === "warm" → Node 8
ELSE → Node 9
```

---

## 🔥 Node 7: Slack Notification (Hot Leads)

### Configuration

**Node Type:** Slack

**Settings:**
- **Resource:** Message
- **Operation:** Post Message
- **Channel:** `#hot-leads`
- **Text:**
  ```
  🔥 **HOT LEAD** | {{ $json.firstName }} {{ $json.lastName }} | Score: {{ $json.engagementScore }}

  📧 Email: {{ $json.email }}
  📞 Phone: {{ $json.phone }}
  🎯 Service: {{ $json.serviceName }} ({{ $json.serviceType }})
  ⚡ Urgency: {{ $json.urgency }}
  📊 Source: {{ $json.utmSource || 'Unknown' }}

  Lead ID: {{ $json.leadId }}
  ```

### Alternative: Rich Formatting

For better formatting, use Slack blocks:

```json
[
  {
    "type": "header",
    "text": {
      "type": "plain_text",
      "text": "🔥 HOT LEAD"
    }
  },
  {
    "type": "section",
    "fields": [
      {
        "type": "mrkdwn",
        "text": "*Name:*\n{{ $json.firstName }} {{ $json.lastName }}"
      },
      {
        "type": "mrkdwn",
        "text": "*Score:*\n{{ $json.engagementScore }}/100"
      },
      {
        "type": "mrkdwn",
        "text": "*Email:*\n{{ $json.email }}"
      },
      {
        "type": "mrkdwn",
        "text": "*Phone:*\n{{ $json.phone }}"
      },
      {
        "type": "mrkdwn",
        "text": "*Service:*\n{{ $json.serviceName }}"
      },
      {
        "type": "mrkdwn",
        "text": "*Urgency:*\n{{ $json.urgency }}"
      }
    ]
  },
  {
    "type": "context",
    "elements": [
      {
        "type": "mrkdwn",
        "text": "Lead ID: {{ $json.leadId }}"
      }
    ]
  }
]
```

---

## 🟡 Node 8: Slack Notification (Warm Leads)

### Configuration

**Node Type:** Slack

**Settings:**
- **Resource:** Message
- **Operation:** Post Message
- **Channel:** `#leads`
- **Text:**
  ```
  🟡 **WARM LEAD** | {{ $json.firstName }} {{ $json.lastName }} | Score: {{ $json.engagementScore }}

  📧 Email: {{ $json.email }}
  📞 Phone: {{ $json.phone }}
  🎯 Service: {{ $json.serviceName }} ({{ $json.serviceType }})
  ⚡ Urgency: {{ $json.urgency }}

  Lead ID: {{ $json.leadId }}
  ```

---

## ❄️ Node 9: Slack Notification (Cold Leads)

### Configuration

**Node Type:** Slack

**Settings:**
- **Resource:** Message
- **Operation:** Post Message
- **Channel:** `#nurture`
- **Text:**
  ```
  ❄️ **COLD LEAD** | {{ $json.firstName }} {{ $json.lastName }} | Score: {{ $json.engagementScore }}

  📧 Email: {{ $json.email }}
  🎯 Service: {{ $json.serviceName }}

  Added to nurture sequence. First email will be sent on Day 3.

  Lead ID: {{ $json.leadId }}
  ```

**Note:** This node can also trigger a separate nurture workflow or schedule a delayed email.

---

## 📊 Scoring Logic Reference

### Engagement Score Calculation

| Factor | Points | Condition |
|--------|--------|-----------|
| Urgency: Today | +30 | `urgency === 'today'` |
| Urgency: Next 48h | +20 | `urgency === 'next_48h'` |
| Urgency: Next Week | +10 | `urgency === 'next_week'` |
| Source: Paid Ad | +25 | `utm_source === 'paid_ad'` |
| Source: Referral | +20 | `utm_source === 'referral'` |
| Source: Organic | +10 | `utm_source === 'organic'` |
| High-Margin Service | +15 | `base_price > 100` |
| Low-Margin Service | +5 | `base_price > 0 && base_price <= 100` |

### Qualification Thresholds

| Status | Score Range | Action |
|--------|-------------|--------|
| **Hot** | 70-100 | Immediate notification to `#hot-leads` |
| **Warm** | 40-69 | Notification to `#leads` |
| **Cold** | 0-39 | Add to nurture sequence |

### Example Scores

**Hot Lead Example:**
- Urgency: Today (+30)
- Source: Paid Ad (+25)
- High-Margin Service (+15)
- **Total: 70** → **HOT**

**Warm Lead Example:**
- Urgency: Next 48h (+20)
- Source: Organic (+10)
- High-Margin Service (+15)
- **Total: 45** → **WARM**

**Cold Lead Example:**
- Urgency: Next Week (+10)
- Source: Organic (+10)
- Low-Margin Service (+5)
- **Total: 25** → **COLD**

---

## 🔧 Setup Instructions

### Prerequisites

1. **Supabase Connection**
   - Create Supabase credentials in n8n
   - Test connection to `service_leads` and `service_types` tables

2. **Slack Connection**
   - Create Slack app credentials in n8n
   - Ensure bot has access to channels:
     - `#hot-leads`
     - `#leads`
     - `#nurture`

3. **Webhook URL**
   - Copy webhook URL from Node 1
   - Update `N8N_LEAD_SCORING_WEBHOOK_URL` in Vercel environment variables

### Step-by-Step Setup

1. **Create New Workflow**
   - Name: "Service Lead Scoring & Qualification"
   - Activate workflow (toggle ON)

2. **Add Node 1: Webhook Trigger**
   - Configure webhook settings
   - Copy webhook URL
   - Test with sample payload

3. **Add Node 2: Query Lead**
   - Connect to Supabase
   - Configure query with parameter
   - Test query execution

4. **Add Node 3: Look Up Service Type**
   - Connect to Supabase
   - Configure query
   - Handle null results

5. **Add Node 4: Calculate Scoring**
   - Add Code node
   - Paste scoring logic
   - Test with sample data

6. **Add Node 5: Update Supabase**
   - Connect to Supabase
   - Configure UPDATE query
   - Test update operation

7. **Add Node 6: Route by Qualification**
   - Add IF node
   - Configure conditions
   - Connect to Nodes 7, 8, 9

8. **Add Nodes 7, 8, 9: Slack Notifications**
   - Configure each Slack node
   - Set appropriate channels
   - Format messages

9. **Test Workflow**
   - Submit test lead via API
   - Verify scoring calculation
   - Check Slack notifications
   - Verify database updates

---

## 🧪 Testing

### Test Case 1: Hot Lead

**Input:**
```json
{
  "leadId": "test-hot-001",
  "formData": {
    "urgency": "today",
    "serviceType": "emergency",
    "utm_source": "paid_ad"
  }
}
```

**Expected:**
- Engagement Score: 70
- Qualification: "hot"
- Slack: `#hot-leads` channel
- Database: Updated with scores

### Test Case 2: Warm Lead

**Input:**
```json
{
  "leadId": "test-warm-001",
  "formData": {
    "urgency": "next_48h",
    "serviceType": "standard",
    "utm_source": "organic"
  }
}
```

**Expected:**
- Engagement Score: 45
- Qualification: "warm"
- Slack: `#leads` channel
- Database: Updated with scores

### Test Case 3: Cold Lead

**Input:**
```json
{
  "leadId": "test-cold-001",
  "formData": {
    "urgency": "next_week",
    "serviceType": "consultation",
    "utm_source": "organic"
  }
}
```

**Expected:**
- Engagement Score: 25
- Qualification: "cold"
- Slack: `#nurture` channel
- Database: Updated with scores

---

## 🔍 Troubleshooting

### Scoring Not Calculating

**Issue:** Engagement score is 0 or incorrect

**Solutions:**
1. Check Node 4 (Function) code for syntax errors
2. Verify data is passed correctly from previous nodes
3. Check urgency and utm_source values match expected strings
4. Verify service_type lookup returns base_price

### Database Update Fails

**Issue:** Supabase update doesn't work

**Solutions:**
1. Verify Supabase credentials are correct
2. Check table permissions (RLS policies)
3. Verify column names match schema
4. Check for constraint violations

### Slack Notifications Not Sending

**Issue:** Messages don't appear in Slack

**Solutions:**
1. Verify Slack bot token is valid
2. Check bot is invited to channels
3. Verify channel names are correct (include #)
4. Check Slack node configuration

### Wrong Qualification Status

**Issue:** Leads routed to wrong channel

**Solutions:**
1. Review scoring logic in Node 4
2. Check threshold values (70, 40)
3. Verify IF node conditions
4. Test with known score values

---

## 📈 Monitoring & Analytics

### Key Metrics to Track

1. **Lead Distribution**
   - % Hot leads
   - % Warm leads
   - % Cold leads

2. **Score Distribution**
   - Average engagement score
   - Score by source
   - Score by service type

3. **Conversion Rates**
   - Hot → Won conversion rate
   - Warm → Won conversion rate
   - Cold → Won conversion rate

### Query Examples

**Get Lead Distribution:**
```sql
SELECT 
  qualification_status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM service_leads
GROUP BY qualification_status;
```

**Get Average Scores by Source:**
```sql
SELECT 
  utm_source,
  AVG(engagement_score) as avg_score,
  COUNT(*) as lead_count
FROM service_leads
WHERE utm_source IS NOT NULL
GROUP BY utm_source
ORDER BY avg_score DESC;
```

---

## 🔄 Workflow Updates

### Adding New Scoring Factors

To add new scoring factors:

1. **Update Node 4 (Function)**
   - Add new scoring logic
   - Adjust thresholds if needed

2. **Update Database Schema** (if needed)
   - Add new columns if tracking new data

3. **Test Thoroughly**
   - Test with various scenarios
   - Verify score calculations
   - Check routing logic

### Adjusting Thresholds

To change qualification thresholds:

1. **Update Node 4 (Function)**
   - Modify threshold values:
     ```javascript
     if (engagementScore >= 80) { // Changed from 70
       qualificationStatus = 'hot';
     }
     ```

2. **Update Node 6 (IF)**
   - Ensure conditions match new thresholds

3. **Test Impact**
   - Review how many leads change categories
   - Adjust if needed

---

## 📚 Related Documentation

- **Database Schema:** `database/schema/service_leads.sql`
- **Lead Scoring Migration:** `database/schema/add_lead_scoring_fields.sql`
- **API Route:** `app/api/service/lead-submit/route.ts`
- **Environment Variables:** `docs/N8N_ENVIRONMENT_VARIABLES_SETUP.md`

---

## ✅ Workflow Checklist

Before activating workflow:

- [ ] All nodes configured correctly
- [ ] Supabase connection tested
- [ ] Slack connection tested
- [ ] Webhook URL copied to environment variables
- [ ] Scoring logic tested with sample data
- [ ] Database update verified
- [ ] Slack notifications working in all channels
- [ ] Error handling configured
- [ ] Workflow activated (toggle ON)

---

## 🎯 Expected Results

After workflow is active:

✅ **Hot Leads (Score ≥ 70)**
- Appear in `#hot-leads` immediately
- High priority for sales team
- Fast response expected

✅ **Warm Leads (Score 40-69)**
- Appear in `#leads` channel
- Standard follow-up process
- Nurture if no response

✅ **Cold Leads (Score < 40)**
- Appear in `#nurture` channel
- Added to automated nurture sequence
- First email sent on Day 3

All leads are scored, qualified, and routed automatically based on engagement potential.
