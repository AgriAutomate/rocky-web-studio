# Lead Scoring Workflow - Quick Reference

## 🎯 Workflow Summary

**Name:** Service Lead Scoring & Qualification

**Trigger:** Webhook at `/webhook/service-lead-scoring`

**Purpose:** Automatically score leads and route to appropriate Slack channels

---

## 📊 Scoring Logic

### Score Calculation

| Factor | Points | Condition |
|--------|--------|-----------|
| **Urgency: Today** | +30 | `urgency === 'today'` |
| **Urgency: Next 48h** | +20 | `urgency === 'next_48h'` |
| **Urgency: Next Week** | +10 | `urgency === 'next_week'` |
| **Source: Paid Ad** | +25 | `utm_source === 'paid_ad'` |
| **Source: Referral** | +20 | `utm_source === 'referral'` |
| **Source: Organic** | +10 | `utm_source === 'organic'` |
| **High-Margin Service** | +15 | `base_price > 100` |
| **Low-Margin Service** | +5 | `base_price > 0 && base_price <= 100` |

### Qualification Thresholds

- **Hot:** Score ≥ 70 → `#hot-leads` channel
- **Warm:** Score 40-69 → `#leads` channel  
- **Cold:** Score < 40 → `#nurture` channel

---

## 🔗 Webhook Payload

**Endpoint:** `POST /webhook/service-lead-scoring`

**Payload:**
```json
{
  "leadId": "uuid-here",
  "email": "john@example.com",
  "firstName": "John",
  "serviceType": "emergency",
  "urgency": "today",
  "utm_source": "paid_ad",
  "timestamp": "2025-12-19T04:00:00.000Z"
}
```

**Note:** The workflow queries the database using `leadId` to get the full lead record. Other fields in the payload are for reference/logging.

---

## 📝 Node Configuration Quick Reference

### Node 1: Webhook Trigger
- Path: `/webhook/service-lead-scoring`
- Method: POST

### Node 2: Query Lead
```sql
SELECT * FROM service_leads WHERE id = $1
```
Parameter: `{{ $json.leadId }}`

### Node 3: Look Up Service Type
```sql
SELECT base_price FROM service_types 
WHERE service_key = $1 AND is_active = true
```
Parameter: `{{ $json.service_type }}`

### Node 4: Calculate Scoring
- Type: Code (Function)
- See full code in `docs/n8n-lead-scoring-workflow.md`

### Node 5: Update Supabase
```sql
UPDATE service_leads
SET engagement_score = $1,
    urgency_score = $2,
    qualification_status = $3,
    last_engagement_date = NOW(),
    engagement_count = engagement_count + 1
WHERE id = $4
```

### Node 6: Route by Qualification
- IF `qualificationStatus === "hot"` → Node 7
- IF `qualificationStatus === "warm"` → Node 8
- ELSE → Node 9

### Nodes 7, 8, 9: Slack Notifications
- Node 7: `#hot-leads` channel
- Node 8: `#leads` channel
- Node 9: `#nurture` channel

---

## 🚀 Setup Steps

1. **Import Workflow**
   - Import `docs/n8n-lead-scoring-workflow.json` into n8n

2. **Configure Credentials**
   - Add Supabase credentials
   - Add Slack credentials

3. **Update Webhook URL**
   - Copy webhook URL from Node 1
   - Update `N8N_LEAD_SCORING_WEBHOOK_URL` in Vercel

4. **Test Workflow**
   - Submit test lead via API
   - Verify scoring calculation
   - Check Slack notifications
   - Verify database updates

5. **Activate Workflow**
   - Toggle workflow to "Active"

---

## ✅ Expected Results

**Hot Leads (Score ≥ 70):**
- ✅ Notification in `#hot-leads`
- ✅ Database updated with scores
- ✅ Immediate sales team alert

**Warm Leads (Score 40-69):**
- ✅ Notification in `#leads`
- ✅ Database updated with scores
- ✅ Standard follow-up process

**Cold Leads (Score < 40):**
- ✅ Notification in `#nurture`
- ✅ Database updated with scores
- ✅ Added to nurture sequence

---

## 📚 Full Documentation

See `docs/n8n-lead-scoring-workflow.md` for complete setup instructions and troubleshooting.
