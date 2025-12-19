# n8n Workflow: Monthly NPS Dashboard

## 📋 Workflow Overview

**Workflow Name:** Monthly NPS Dashboard

**Purpose:** Generate and distribute monthly NPS report with trends, feedback analysis, and recommendations

**Trigger:** Schedule (Cron) - 1st of each month at 10:00 AM

**Expected Behavior:**
- Calculate NPS score for previous month
- Analyze feedback themes
- Generate HTML report
- Email to martin@rockywebstudio.com.au
- Post summary to Slack

---

## 🔄 Workflow Flow

### Step 1: Calculate NPS Metrics

**Query NPS Score:**
```sql
-- See NPS_CALCULATION_QUERIES.sql for full query
-- Returns: promoters, passives, detractors, total, NPS score
```

**Query Response Rate:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE survey_completed = true) as completed,
  COUNT(*) FILTER (WHERE survey_sent_date IS NOT NULL) as sent,
  ROUND((completed::DECIMAL / NULLIF(sent, 0)) * 100, 2) as response_rate_percent
FROM customer_surveys
WHERE survey_sent_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month';
```

**Query Top Feedback Themes:**
```sql
SELECT 
  sentiment,
  COUNT(*) as count,
  ROUND(AVG(nps_score), 2) as avg_nps,
  STRING_AGG(DISTINCT SUBSTRING(feedback_text, 1, 100), ' | ') as sample_feedback
FROM customer_surveys
WHERE survey_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
  AND feedback_text IS NOT NULL
GROUP BY sentiment
ORDER BY count DESC;
```

**Query NPS Trend:**
```sql
-- Last 6 months NPS trend
SELECT 
  DATE_TRUNC('month', survey_date) as month,
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

### Step 2: Generate HTML Report

**Template:** See workflow documentation for full HTML

**Includes:**
- Current NPS score
- Month-over-month trend
- Promoter/Passive/Detractor breakdown
- Response rate
- Top feedback themes
- Common complaints
- Recommendations
- Industry benchmark comparison

---

### Step 3: Send Email Report

**To:** martin@rockywebstudio.com.au

**Subject:** "Monthly NPS Report - [Month]"

**Body:** HTML report

---

### Step 4: Post to Slack

**Channel:** `#metrics`

**Message:**
```
📊 Monthly NPS Report - [Month]

NPS Score: [score] (Goal: >50)
Response Rate: [rate]% (Goal: >60%)
Promoters: [count] | Passives: [count] | Detractors: [count]

Trend: [up/down/stable] from last month

Top Issues: [list]

Full report sent via email.
```

---

## 📊 Report Metrics

| Metric | Description | Goal |
|--------|-------------|------|
| **NPS Score** | (% Promoters - % Detractors) × 100 | > 50 |
| **Response Rate** | Completed / Sent × 100 | > 60% |
| **Promoter %** | Promoters / Total × 100 | Increase |
| **Detractor %** | Detractors / Total × 100 | Decrease |
| **Recovery Rate** | Recovered / Detractors × 100 | > 50% |

---

## 🚀 Setup

1. **Create Schedule Trigger:**
   - Cron: `0 10 1 * *` (10 AM on 1st of month)

2. **Configure Queries:**
   - Set up all NPS calculation queries
   - Test queries return expected results

3. **Generate Report:**
   - Create HTML template
   - Format all metrics

4. **Send Email & Slack:**
   - Configure Resend/SMTP
   - Configure Slack integration

5. **Activate Workflow:**
   - Toggle to "Active"
   - Monitor first execution

---

## 📚 Related Documentation

- **NPS Queries:** `docs/NPS_CALCULATION_QUERIES.sql`
- **NPS Survey Workflow:** `docs/n8n-nps-survey-workflow.md`

---

## 🎯 Expected Results

After workflow is active:

✅ **Monthly Reports:** Generated automatically on 1st of each month
✅ **Email Delivery:** Report sent to martin@rockywebstudio.com.au
✅ **Slack Summary:** Posted to #metrics
✅ **Trend Analysis:** Month-over-month NPS tracking
✅ **Actionable Insights:** Recommendations for improvement

The monthly NPS report provides visibility into customer satisfaction trends and actionable insights for improvement.
