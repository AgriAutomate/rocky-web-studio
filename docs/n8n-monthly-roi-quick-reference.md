# Monthly ROI Workflow - Quick Reference

## 🎯 Workflow Summary

**Name:** Monthly Lead ROI Dashboard

**Trigger:** Schedule (Cron) - 1st of each month at 8:00 AM

**Purpose:** Generate and distribute monthly ROI reports comparing lead source performance

---

## 📊 Key Metrics Calculated

| Metric | Calculation |
|--------|-------------|
| **Leads Generated** | COUNT(*) by lead_source |
| **Leads Qualified** | COUNT(*) WHERE qualification_status IN ('hot','warm') |
| **Leads Converted** | COUNT(*) WHERE conversion_date IS NOT NULL |
| **Conversion Rate** | (converted / generated) × 100 |
| **Avg Deal Value** | AVG(conversion_value) WHERE converted |
| **Total Revenue** | SUM(conversion_value) WHERE converted |
| **ROI** | (total_revenue / marketing_cost) × 100 |

---

## 📧 Deliverables

1. **HTML Email Report**
   - Summary cards (totals)
   - Detailed table by lead source
   - Recommendations
   - Sent to: martin@rockywebstudio.com.au

2. **CSV Export**
   - All metrics in spreadsheet format
   - Attached to email

3. **Slack Notification**
   - Posted to: #metrics
   - Summary of best/worst channels
   - Key insights

4. **Database Updates**
   - Flags for review (paid_ad ROI < 100%)
   - Flags for expansion (organic ROI > 200%)

---

## 🔄 Workflow Steps

1. **Query Current Month** - Aggregate by lead_source
2. **Query Previous Month** - For comparison
3. **Lookup Marketing Costs** - From budget table
4. **Calculate ROI & Comparisons** - Rankings and trends
5. **Generate HTML Report** - Formatted with tables
6. **Send Email** - With HTML and CSV attachment
7. **Post to Slack** - Summary notification
8. **Update Database** - Flag leads for review/expansion

---

## 📝 SQL Query Patterns

### Current Month Metrics
```sql
SELECT 
  COALESCE(lead_source, 'unknown') as lead_source,
  COUNT(*) as leads_generated,
  COUNT(*) FILTER (WHERE qualification_status IN ('hot', 'warm')) as leads_qualified,
  COUNT(*) FILTER (WHERE conversion_date IS NOT NULL) as leads_converted,
  ROUND(SUM(conversion_value) FILTER (WHERE conversion_date IS NOT NULL), 2) as total_revenue
FROM service_leads
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
  AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
GROUP BY lead_source
```

### Previous Month (for comparison)
```sql
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
  AND created_at < DATE_TRUNC('month', CURRENT_DATE)
```

### Marketing Costs Lookup
```sql
SELECT lead_source, monthly_budget as marketing_cost
FROM marketing_budgets
WHERE is_active = true
```

---

## 🎯 Recommendations Logic

| Condition | Action |
|-----------|--------|
| **ROI > 200%** | Consider increasing budget |
| **ROI < 100%** | Review strategy or reduce spend |
| **Conversion Rate < 10%** | Focus on qualification |
| **Revenue Trend Down** | Investigate channel performance |

---

## 🚀 Setup Checklist

- [ ] Schedule trigger configured (`0 8 1 * *`)
- [ ] Marketing budgets table created
- [ ] Budget values set for each lead source
- [ ] Email service configured (Resend)
- [ ] Slack integration set up (#metrics channel)
- [ ] All query nodes tested
- [ ] HTML report template verified
- [ ] CSV generation tested
- [ ] Workflow activated

---

## 📚 Full Documentation

See `docs/n8n-monthly-roi-workflow.md` for complete setup instructions.
