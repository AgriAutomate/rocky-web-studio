# n8n Workflow: Monthly Lead ROI Dashboard

## 📋 Workflow Overview

**Workflow Name:** Monthly Lead ROI Dashboard

**Purpose:** Automatically generate and distribute monthly ROI reports for lead sources, comparing performance across channels and providing actionable insights.

**Trigger:** Schedule (Cron) - 1st of each month at 8:00 AM

**Expected Behavior:**
- Query current month metrics grouped by lead source
- Compare to previous month
- Identify best/worst performing channels
- Generate HTML report with charts
- Email report to management
- Post summary to Slack
- Update service_leads with insights

---

## ⏰ Schedule Configuration

**Trigger:** Schedule (Cron)

**Settings:**
- **Cron Expression:** `0 8 1 * *` (8:00 AM on the 1st of every month)
- **Timezone:** Australia/Sydney (or your timezone)

**Note:** Runs automatically on the 1st of each month to report on the previous month's data.

---

## 🔄 Workflow Logic Flow

### Step 1: Query Current Month Metrics
- Aggregate `service_leads` by `lead_source`
- Calculate: leads generated, qualified, converted, conversion rate, avg deal value, total revenue
- Lookup marketing costs from budget table

### Step 2: Query Previous Month Metrics
- Same aggregation for previous month
- Calculate % change for comparison

### Step 3: Calculate ROI
- ROI = total_revenue / marketing_cost
- Sort by ROI DESC to identify best/worst

### Step 4: Generate HTML Report
- Create formatted HTML with tables and charts
- Include recommendations

### Step 5: Send Email Report
- Attach HTML report
- Include CSV export

### Step 6: Post to Slack
- Summary of best/worst channels
- Key insights and recommendations

### Step 7: Update Database
- Flag leads for review/expansion based on ROI thresholds

---

## 🗄️ Node 1: Schedule Trigger (Cron)

### Configuration

**Node Type:** Schedule Trigger

**Settings:**
- **Trigger Times:** Cron Expression
- **Cron Expression:** `0 8 1 * *`
- **Timezone:** Australia/Sydney

### Output

Triggers workflow on the 1st of each month at 8:00 AM.

---

## 🗄️ Node 2: Query Current Month Metrics

### Configuration

**Node Type:** Supabase

**Settings:**
- **Operation:** Execute Query
- **Query:**
  ```sql
  SELECT 
    COALESCE(lead_source, 'unknown') as lead_source,
    COUNT(*) as leads_generated,
    COUNT(*) FILTER (WHERE qualification_status IN ('hot', 'warm')) as leads_qualified,
    COUNT(*) FILTER (WHERE conversion_date IS NOT NULL) as leads_converted,
    CASE 
      WHEN COUNT(*) > 0 
      THEN ROUND(
        (COUNT(*) FILTER (WHERE conversion_date IS NOT NULL)::DECIMAL / COUNT(*)::DECIMAL) * 100, 
        2
      )
      ELSE 0 
    END as conversion_rate,
    ROUND(AVG(conversion_value) FILTER (WHERE conversion_date IS NOT NULL), 2) as avg_deal_value,
    ROUND(SUM(conversion_value) FILTER (WHERE conversion_date IS NOT NULL), 2) as total_revenue
  FROM service_leads
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
  GROUP BY lead_source
  ORDER BY total_revenue DESC NULLS LAST
  ```

### Output

Array of lead sources with current month metrics.

---

## 🗄️ Node 3: Query Previous Month Metrics

### Configuration

**Node Type:** Supabase

**Settings:**
- **Operation:** Execute Query
- **Query:**
  ```sql
  SELECT 
    COALESCE(lead_source, 'unknown') as lead_source,
    COUNT(*) as leads_generated,
    COUNT(*) FILTER (WHERE qualification_status IN ('hot', 'warm')) as leads_qualified,
    COUNT(*) FILTER (WHERE conversion_date IS NOT NULL) as leads_converted,
    CASE 
      WHEN COUNT(*) > 0 
      THEN ROUND(
        (COUNT(*) FILTER (WHERE conversion_date IS NOT NULL)::DECIMAL / COUNT(*)::DECIMAL) * 100, 
        2
      )
      ELSE 0 
    END as conversion_rate,
    ROUND(AVG(conversion_value) FILTER (WHERE conversion_date IS NOT NULL), 2) as avg_deal_value,
    ROUND(SUM(conversion_value) FILTER (WHERE conversion_date IS NOT NULL), 2) as total_revenue
  FROM service_leads
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
    AND created_at < DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY lead_source
  ORDER BY total_revenue DESC NULLS LAST
  ```

### Output

Array of lead sources with previous month metrics.

---

## 💰 Node 4: Lookup Marketing Costs

### Configuration

**Node Type:** Supabase

**Settings:**
- **Operation:** Execute Query
- **Query:**
  ```sql
  SELECT 
    lead_source,
    monthly_budget as marketing_cost
  FROM marketing_budgets
  WHERE is_active = true
  ORDER BY lead_source
  ```

**Note:** If `marketing_budgets` table doesn't exist, use a Function node to map costs manually or create the table (see schema below).

### Alternative: Function Node (If No Budget Table)

**Node Type:** Code (Function)

**JavaScript:**
```javascript
// Map lead sources to marketing costs
const budgetMap = {
  'organic': 500,      // SEO/content marketing
  'paid_ad': 2000,     // Google Ads, Facebook Ads
  'referral': 0,        // No direct cost
  'direct': 0,          // No direct cost
  'partnership': 300,   // Partnership costs
  'unknown': 0
};

const items = $input.all();
const currentMonth = items[0].json; // From Node 2
const previousMonth = items[1]?.json || []; // From Node 3

// Add marketing_cost to each lead source
const currentWithCosts = currentMonth.map(source => ({
  ...source,
  marketing_cost: budgetMap[source.lead_source] || 0,
  roi: source.total_revenue && budgetMap[source.lead_source] > 0
    ? ((source.total_revenue / budgetMap[source.lead_source]) * 100).toFixed(2)
    : source.total_revenue > 0 ? '∞' : '0.00'
}));

return currentWithCosts.map(item => ({ json: item }));
```

### Output

Current month metrics with marketing costs and ROI calculated.

---

## 📊 Node 5: Calculate Comparisons & Rankings

### Configuration

**Node Type:** Code (Function)

**JavaScript:**
```javascript
const allInputs = $input.all();
const currentMonth = allInputs[0].json; // Current month with costs
const previousMonth = allInputs[1]?.json || []; // Previous month data

// Create lookup map for previous month
const prevMap = {};
previousMonth.forEach(item => {
  prevMap[item.lead_source] = item;
});

// Calculate comparisons and rankings
const enriched = currentMonth.map(source => {
  const prev = prevMap[source.lead_source] || {};
  
  // Calculate % changes
  const leadsChange = prev.leads_generated 
    ? (((source.leads_generated - prev.leads_generated) / prev.leads_generated) * 100).toFixed(1)
    : 'N/A';
  
  const revenueChange = prev.total_revenue 
    ? (((source.total_revenue - prev.total_revenue) / prev.total_revenue) * 100).toFixed(1)
    : 'N/A';
  
  const conversionChange = prev.conversion_rate 
    ? ((source.conversion_rate - prev.conversion_rate)).toFixed(2)
    : 'N/A';
  
  return {
    ...source,
    prev_leads_generated: prev.leads_generated || 0,
    prev_total_revenue: prev.total_revenue || 0,
    prev_conversion_rate: prev.conversion_rate || 0,
    leads_change_pct: leadsChange,
    revenue_change_pct: revenueChange,
    conversion_change_pct: conversionChange,
    trend: revenueChange !== 'N/A' && parseFloat(revenueChange) > 0 ? 'up' : 
           revenueChange !== 'N/A' && parseFloat(revenueChange) < 0 ? 'down' : 'stable'
  };
});

// Sort by ROI (descending)
enriched.sort((a, b) => {
  const roiA = parseFloat(a.roi) || 0;
  const roiB = parseFloat(b.roi) || 0;
  return roiB - roiA;
});

// Add rankings
enriched.forEach((item, index) => {
  item.rank = index + 1;
});

// Identify best and worst
const best = enriched[0];
const worst = enriched[enriched.length - 1];

return enriched.map(item => ({ 
  json: {
    ...item,
    is_best: item.lead_source === best.lead_source,
    is_worst: item.lead_source === worst.lead_source
  }
}));
```

### Output

Enriched metrics with comparisons, rankings, and best/worst flags.

---

## 📄 Node 6: Generate HTML Report

### Configuration

**Node Type:** Code (Function)

**JavaScript:**
```javascript
const items = $input.all();
const metrics = items.map(item => item.json);

// Get current month name
const now = new Date();
const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const monthName = lastMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

// Find best and worst
const best = metrics.find(m => m.is_best);
const worst = metrics.find(m => m.is_worst);

// Calculate totals
const totals = {
  leads_generated: metrics.reduce((sum, m) => sum + (m.leads_generated || 0), 0),
  leads_qualified: metrics.reduce((sum, m) => sum + (m.leads_qualified || 0), 0),
  leads_converted: metrics.reduce((sum, m) => sum + (m.leads_converted || 0), 0),
  total_revenue: metrics.reduce((sum, m) => sum + (parseFloat(m.total_revenue) || 0), 0),
  marketing_cost: metrics.reduce((sum, m) => sum + (parseFloat(m.marketing_cost) || 0), 0)
};

const overallROI = totals.marketing_cost > 0 
  ? ((totals.total_revenue / totals.marketing_cost) * 100).toFixed(2)
  : 'N/A';

// Generate HTML
const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monthly ROI Report - ${monthName}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: #134252;
      color: white;
      padding: 30px;
      border-radius: 5px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-card h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
    }
    .summary-card .value {
      font-size: 32px;
      font-weight: bold;
      color: #134252;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    th {
      background: #134252;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }
    tr:hover {
      background: #f9f9f9;
    }
    .trend-up {
      color: #28a745;
      font-weight: bold;
    }
    .trend-down {
      color: #dc3545;
      font-weight: bold;
    }
    .trend-stable {
      color: #666;
    }
    .best {
      background: #d4edda !important;
    }
    .worst {
      background: #f8d7da !important;
    }
    .recommendations {
      background: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    .recommendations h2 {
      color: #134252;
      margin-top: 0;
    }
    .recommendation {
      padding: 15px;
      margin: 10px 0;
      border-left: 4px solid #134252;
      background: #f9f9f9;
    }
    .recommendation strong {
      color: #134252;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Monthly ROI Summary - ${monthName}</h1>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>

  <div class="summary">
    <div class="summary-card">
      <h3>Total Leads</h3>
      <div class="value">${totals.leads_generated}</div>
    </div>
    <div class="summary-card">
      <h3>Qualified Leads</h3>
      <div class="value">${totals.leads_qualified}</div>
    </div>
    <div class="summary-card">
      <h3>Converted</h3>
      <div class="value">${totals.leads_converted}</div>
    </div>
    <div class="summary-card">
      <h3>Total Revenue</h3>
      <div class="value">$${totals.total_revenue.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
    </div>
    <div class="summary-card">
      <h3>Marketing Cost</h3>
      <div class="value">$${totals.marketing_cost.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
    </div>
    <div class="summary-card">
      <h3>Overall ROI</h3>
      <div class="value">${overallROI}%</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Rank</th>
        <th>Lead Source</th>
        <th>Leads</th>
        <th>Qualified</th>
        <th>Converted</th>
        <th>Conv. Rate</th>
        <th>Avg Deal</th>
        <th>Revenue</th>
        <th>Cost</th>
        <th>ROI</th>
        <th>Trend</th>
      </tr>
    </thead>
    <tbody>
      ${metrics.map(m => `
        <tr class="${m.is_best ? 'best' : ''} ${m.is_worst ? 'worst' : ''}">
          <td><strong>#${m.rank}</strong></td>
          <td><strong>${m.lead_source}</strong></td>
          <td>${m.leads_generated || 0}</td>
          <td>${m.leads_qualified || 0}</td>
          <td>${m.leads_converted || 0}</td>
          <td>${m.conversion_rate || 0}%</td>
          <td>$${parseFloat(m.avg_deal_value || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
          <td>$${parseFloat(m.total_revenue || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
          <td>$${parseFloat(m.marketing_cost || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
          <td><strong>${m.roi}%</strong></td>
          <td class="trend-${m.trend}">
            ${m.revenue_change_pct !== 'N/A' ? `${m.revenue_change_pct}%` : 'N/A'}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="recommendations">
    <h2>📊 Key Insights & Recommendations</h2>
    ${best ? `
      <div class="recommendation">
        <strong>🏆 Best Performer:</strong> ${best.lead_source} with ${best.roi}% ROI
        ${parseFloat(best.roi) > 200 ? '— Consider increasing budget allocation' : ''}
      </div>
    ` : ''}
    ${worst ? `
      <div class="recommendation">
        <strong>⚠️ Underperformer:</strong> ${worst.lead_source} with ${worst.roi}% ROI
        ${parseFloat(worst.roi) < 100 ? '— Review strategy or reduce spend' : ''}
      </div>
    ` : ''}
    ${totals.leads_converted > 0 ? `
      <div class="recommendation">
        <strong>📈 Conversion Rate:</strong> ${((totals.leads_converted / totals.leads_generated) * 100).toFixed(2)}%
        ${((totals.leads_converted / totals.leads_generated) * 100) < 10 ? '— Focus on qualification and follow-up' : '— Good conversion performance'}
      </div>
    ` : ''}
    ${overallROI !== 'N/A' ? `
      <div class="recommendation">
        <strong>💰 Overall ROI:</strong> ${overallROI}%
        ${parseFloat(overallROI) > 200 ? '— Excellent return on investment' : parseFloat(overallROI) < 100 ? '— Below break-even, review strategy' : '— Healthy ROI'}
      </div>
    ` : ''}
  </div>
</body>
</html>
`;

return [{ json: { html, monthName, metrics, totals, overallROI, best, worst } }];
```

### Output

HTML report string with all metrics and recommendations.

---

## 📧 Node 7: Send Email Report

### Configuration

**Node Type:** Email Send (Resend)

**Settings:**
- **From:** noreply@rockywebstudio.com.au
- **To:** martin@rockywebstudio.com.au
- **Subject:** `Monthly ROI Report - {{ $json.monthName }}`
- **Email Type:** HTML
- **Message:** `{{ $json.html }}`

### Attachments

**Node Type:** Code (Function) - Generate CSV

**JavaScript:**
```javascript
const items = $input.all();
const data = items[0].json;

// Generate CSV
const headers = ['Rank', 'Lead Source', 'Leads Generated', 'Qualified', 'Converted', 'Conversion Rate %', 'Avg Deal Value', 'Total Revenue', 'Marketing Cost', 'ROI %', 'Revenue Change %'];
const rows = data.metrics.map(m => [
  m.rank,
  m.lead_source,
  m.leads_generated || 0,
  m.leads_qualified || 0,
  m.leads_converted || 0,
  m.conversion_rate || 0,
  parseFloat(m.avg_deal_value || 0).toFixed(2),
  parseFloat(m.total_revenue || 0).toFixed(2),
  parseFloat(m.marketing_cost || 0).toFixed(2),
  m.roi,
  m.revenue_change_pct !== 'N/A' ? m.revenue_change_pct : ''
]);

const csv = [
  headers.join(','),
  ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
].join('\n');

return [{ 
  json: { 
    csv,
    filename: `roi-report-${data.monthName.toLowerCase().replace(' ', '-')}.csv`
  } 
}];
```

**Attach CSV to email** using email node's attachment feature.

---

## 💬 Node 8: Post to Slack

### Configuration

**Node Type:** Slack

**Settings:**
- **Resource:** Message
- **Operation:** Post Message
- **Channel:** #metrics
- **Text:**
```
📊 *Monthly ROI Report - {{ $json.monthName }}*

*Summary:*
• Total Leads: {{ $json.totals.leads_generated }}
• Converted: {{ $json.totals.leads_converted }}
• Total Revenue: ${{ $json.totals.total_revenue.toLocaleString() }}
• Overall ROI: {{ $json.overallROI }}%

*🏆 Best Performer:*
{{ $json.best.lead_source }} - {{ $json.best.roi }}% ROI
{{ $json.best.total_revenue ? `Revenue: $${$json.best.total_revenue.toLocaleString()}` : '' }}

*⚠️ Needs Review:*
{{ $json.worst.lead_source }} - {{ $json.worst.roi }}% ROI

*💡 Recommendation:*
{{ $json.best.roi > 200 ? `Consider increasing budget for ${$json.best.lead_source}` : '' }}
{{ $json.worst.roi < 100 ? `Review strategy for ${$json.worst.lead_source}` : '' }}

Full report sent via email.
```

---

## 🗄️ Node 9: Update Service Leads with Insights

### Configuration

**Node Type:** Supabase

**Settings:**
- **Operation:** Execute Query
- **Query:**
  ```sql
  -- Flag paid_ad leads for review if ROI < 1.0
  UPDATE service_leads
  SET internal_notes = COALESCE(internal_notes, '') || E'\n[ROI Report ' || TO_CHAR(CURRENT_DATE, 'YYYY-MM') || '] Paid ad ROI below threshold - review needed'
  WHERE lead_source = 'paid_ad'
    AND conversion_date IS NULL
    AND created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
    AND EXISTS (
      SELECT 1 FROM marketing_budgets mb
      WHERE mb.lead_source = 'paid_ad'
        AND mb.monthly_budget > 0
        AND (
          SELECT COALESCE(SUM(conversion_value), 0) 
          FROM service_leads sl2
          WHERE sl2.lead_source = 'paid_ad'
            AND sl2.created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
        ) / mb.monthly_budget < 1.0
    );

  -- Flag organic leads for expansion if ROI > 2.0
  UPDATE service_leads
  SET internal_notes = COALESCE(internal_notes, '') || E'\n[ROI Report ' || TO_CHAR(CURRENT_DATE, 'YYYY-MM') || '] Organic ROI exceeds 200% - expansion opportunity'
  WHERE lead_source = 'organic'
    AND conversion_date IS NULL
    AND created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
    AND EXISTS (
      SELECT 1 FROM marketing_budgets mb
      WHERE mb.lead_source = 'organic'
        AND mb.monthly_budget > 0
        AND (
          SELECT COALESCE(SUM(conversion_value), 0) 
          FROM service_leads sl2
          WHERE sl2.lead_source = 'organic'
            AND sl2.created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
        ) / mb.monthly_budget > 2.0
    );
  ```

**Note:** This is a simplified version. Adjust based on your actual ROI calculations.

---

## 📊 Marketing Budgets Table Schema

If you need to create the `marketing_budgets` table:

```sql
CREATE TABLE IF NOT EXISTS public.marketing_budgets (
  id SERIAL PRIMARY KEY,
  lead_source VARCHAR(50) NOT NULL UNIQUE,
  monthly_budget DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT marketing_budgets_lead_source_values
    CHECK (lead_source IN ('organic', 'paid_ad', 'referral', 'direct', 'partnership'))
);

-- Sample data
INSERT INTO public.marketing_budgets (lead_source, monthly_budget, is_active)
VALUES 
  ('organic', 500.00, true),
  ('paid_ad', 2000.00, true),
  ('referral', 0.00, true),
  ('direct', 0.00, true),
  ('partnership', 300.00, true)
ON CONFLICT (lead_source) DO UPDATE SET
  monthly_budget = EXCLUDED.monthly_budget,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
```

---

## 🔧 Setup Instructions

### Prerequisites

1. **Database Schema**
   - `service_leads` table with `lead_source`, `conversion_date`, `conversion_value`, `qualification_status`
   - `marketing_budgets` table (or use Function node for cost mapping)

2. **Email Service**
   - Resend API key configured
   - Email domain verified

3. **Slack Integration**
   - Slack app configured
   - `#metrics` channel exists
   - Bot token with permissions

### Step-by-Step Setup

1. **Create Schedule Trigger**
   - Set cron to `0 8 1 * *`
   - Configure timezone

2. **Add Query Nodes**
   - Configure current month query
   - Configure previous month query
   - Test queries return expected results

3. **Add Budget Lookup**
   - Use Supabase query if budget table exists
   - Or use Function node with cost mapping

4. **Add Calculation Node**
   - Configure Function node for comparisons
   - Test calculations are correct

5. **Add Report Generation**
   - Configure HTML generation Function node
   - Test HTML renders correctly

6. **Add Email Node**
   - Configure Resend/SMTP
   - Set up CSV attachment
   - Test email sends

7. **Add Slack Node**
   - Configure Slack credentials
   - Test message posts

8. **Add Update Node**
   - Configure database update query
   - Test updates work correctly

9. **Test Workflow**
   - Manually trigger workflow
   - Verify all nodes execute
   - Check email and Slack

10. **Activate Workflow**
    - Toggle to "Active"
    - Monitor first execution on 1st of month

---

## 🧪 Testing

### Test Case 1: Manual Trigger

**Setup:**
1. Manually trigger workflow
2. Check all nodes execute successfully

**Expected:**
- Queries return data
- Calculations are correct
- HTML report generates
- Email sends
- Slack posts

### Test Case 2: Data Validation

**Setup:**
1. Create test leads with known values
2. Run workflow

**Expected:**
- Metrics match manual calculations
- ROI calculations are accurate
- Comparisons show correct % changes

### Test Case 3: Edge Cases

**Test:**
- No leads in current month
- No previous month data
- Zero marketing costs
- Missing lead_source values

**Expected:**
- Workflow handles gracefully
- Reports show "N/A" or 0 where appropriate
- No errors in execution

---

## 📈 Monitoring

### Key Metrics to Track

1. **Report Generation**
   - Execution time
   - Success rate
   - Error logs

2. **Data Accuracy**
   - Compare to manual audits
   - Verify calculations
   - Check for missing data

3. **Delivery**
   - Email delivery rate
   - Slack post success
   - Attachment size

### Query Examples

**Verify Report Data:**
```sql
SELECT 
  lead_source,
  COUNT(*) as leads,
  SUM(conversion_value) as revenue
FROM service_leads
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
  AND created_at < DATE_TRUNC('month', CURRENT_DATE)
GROUP BY lead_source;
```

---

## ✅ Success Criteria

- [ ] Report generates without errors
- [ ] Email sends by 8:30 AM on 1st of month
- [ ] Slack notification posted to #metrics
- [ ] Data matches manual audit
- [ ] HTML report renders correctly
- [ ] CSV attachment included
- [ ] Database updates applied
- [ ] All lead sources included

---

## 📚 Related Documentation

- **Database Schema:** `database/schema/service_leads.sql`
- **Lead Scoring:** `docs/n8n-lead-scoring-workflow.md`
- **Service Leads API:** `app/api/service/lead-submit/route.ts`

---

## 🎯 Expected Results

After workflow is active:

✅ **Monthly Reports:** Generated automatically on 1st of each month
✅ **Email Delivery:** Report sent to martin@rockywebstudio.com.au
✅ **Slack Notifications:** Summary posted to #metrics
✅ **Data Insights:** Best/worst channels identified
✅ **Recommendations:** Actionable insights provided
✅ **Database Updates:** Leads flagged for review/expansion

The workflow provides comprehensive ROI analysis and actionable insights for optimizing marketing spend.
