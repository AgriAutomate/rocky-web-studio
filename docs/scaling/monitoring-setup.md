# Monitoring Setup Guide

**Last Updated:** January 29, 2025  
**Status:** ✅ Utilities created, needs dashboard implementation

## Overview

This guide explains how to set up and use the capacity monitoring system for tracking resource usage and receiving alerts when approaching limits.

---

## Monitoring Components

### 1. Perplexity Usage Tracker
**File:** `lib/utils/perplexity-usage-tracker.ts`

**Features:**
- Daily usage tracking
- Usage statistics
- Alert thresholds
- Historical usage data

**Usage:**
```typescript
import { getTodayUsageStats, incrementUsage } from "@/lib/utils/perplexity-usage-tracker";

// Get today's usage
const stats = await getTodayUsageStats();
console.log(`Used: ${stats.totalSearches}/300 searches today`);

// Increment usage (called automatically in API routes)
const result = await incrementUsage();
```

---

### 2. Capacity Monitor
**File:** `lib/utils/capacity-monitor.ts`

**Features:**
- Service capacity tracking
- Utilization calculations
- Alert generation
- Capacity reports

**Usage:**
```typescript
import { generateCapacityReport, needsImmediateAttention } from "@/lib/utils/capacity-monitor";

// Generate comprehensive capacity report
const report = await generateCapacityReport();
console.log("Overall status:", report.overallStatus);
console.log("Services:", report.services);

// Check if immediate attention needed
const attention = await needsImmediateAttention();
if (attention.needsAttention) {
  console.log("Critical alerts:", attention.alerts);
}
```

---

### 3. Capacity Calculator
**File:** `lib/utils/capacity-calculator.ts`

**Features:**
- Max clients calculations
- Perplexity capacity calculations
- Cost per client
- Scaling timeline projections

**Usage:**
```typescript
import { calculatePerplexityCapacity, calculateScalingTimeline } from "@/lib/utils/capacity-calculator";

// Calculate Perplexity capacity
const capacity = calculatePerplexityCapacity(300, 1, 0);
console.log(`Max journeys/day: ${capacity.maxJourneysPerDay}`);

// Calculate scaling timeline
const timeline = calculateScalingTimeline(10, 100, 0.1); // 10% growth
console.log(`Months until warning: ${timeline.monthsUntilWarning}`);
```

---

## API Endpoints

### GET /api/admin/capacity

**Purpose:** Get comprehensive capacity report for admin dashboard

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-01-29T12:00:00Z",
  "capacity": {
    "overallStatus": "healthy",
    "services": [
      {
        "service": "Vercel",
        "resource": "Bandwidth",
        "limit": 100,
        "currentUsage": 23.07,
        "utilizationPercent": 23,
        "status": "safe",
        "alertLevel": "none"
      }
    ],
    "criticalAlerts": [],
    "recommendations": []
  },
  "perplexity": {
    "today": {
      "date": "2025-01-29",
      "totalSearches": 45,
      "remainingSearches": 255,
      "utilizationPercent": 15,
      "status": "safe"
    },
    "history": [...]
  },
  "alerts": {
    "needsAttention": false,
    "criticalAlerts": []
  }
}
```

---

## Database Setup

### Perplexity Usage Table

**Migration:** `supabase/migrations/20250129_create_perplexity_usage_tracking.sql`

**Table Structure:**
```sql
CREATE TABLE perplexity_usage (
  id UUID PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  searches INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**To Apply:**
```bash
# In Supabase dashboard, run the migration SQL
# Or use Supabase CLI:
supabase migration up
```

---

## Alert Configuration

### Perplexity Alert Thresholds

**Warning (67%):** 200 searches/day
- **Action:** Monitor closely, plan optimizations

**Critical (83%):** 250 searches/day
- **Action:** Implement optimizations immediately

**Emergency (97%):** 290 searches/day
- **Action:** Queue system, fallback to Claude

**Exceeded (100%):** 300+ searches/day
- **Action:** All requests blocked until next day

### Service Alert Thresholds

**Warning (50%):** Monitor trends, plan scaling

**Critical (75%):** Immediate scaling planning

**Over Capacity (90%):** Upgrade required immediately

---

## Monitoring Dashboard (To Be Implemented)

### Recommended Features

1. **Capacity Overview**
   - Overall status (healthy/warning/critical)
   - Service utilization percentages
   - Visual indicators (green/yellow/red)

2. **Perplexity Monitoring**
   - Daily usage chart
   - Remaining searches today
   - Historical trends (30 days)
   - Alert status

3. **Service Details**
   - Vercel bandwidth usage
   - Supabase database size
   - Anthropic API usage
   - All service limits and utilization

4. **Alerts Panel**
   - Critical alerts
   - Warning alerts
   - Recommendations
   - Action items

5. **Growth Projections**
   - Scaling timeline
   - Cost projections
   - Upgrade recommendations

---

## Automated Monitoring

### Daily Checks

**Perplexity Usage:**
- Check daily usage via `getTodayUsageStats()`
- Send alerts if thresholds exceeded
- Log usage to database

**Service Capacity:**
- Generate capacity report daily
- Check for critical alerts
- Update usage data

### Weekly Reports

**Capacity Report:**
- Generate comprehensive report
- Email to admin (if configured)
- Track trends over time

### Monthly Reviews

**Cost Review:**
- Review subscription costs
- Calculate cost per client
- Identify optimization opportunities

**Usage Trends:**
- Analyze usage patterns
- Project future needs
- Plan for scaling

---

## Alert Implementation

### Email Alerts (To Be Implemented)

```typescript
// Example: Send email alert
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendCapacityAlert(alert: string) {
  await resend.emails.send({
    from: "alerts@rockywebstudio.com.au",
    to: "admin@rockywebstudio.com.au",
    subject: "Capacity Alert",
    html: `<p>${alert}</p>`,
  });
}
```

### SMS Alerts (To Be Implemented)

```typescript
// Example: Send SMS alert
// Use existing SMS service integration
```

### Slack/Discord Webhooks (To Be Implemented)

```typescript
// Example: Send webhook alert
await fetch(process.env.SLACK_WEBHOOK_URL, {
  method: "POST",
  body: JSON.stringify({ text: alert }),
});
```

---

## Usage Examples

### Check Capacity Status

```typescript
import { generateCapacityReport } from "@/lib/utils/capacity-monitor";

const report = await generateCapacityReport();

if (report.overallStatus === "critical") {
  // Send alert
  console.log("Critical alerts:", report.criticalAlerts);
}
```

### Monitor Perplexity Daily

```typescript
import { getTodayUsageStats, checkAndSendAlerts } from "@/lib/utils/perplexity-usage-tracker";

const stats = await getTodayUsageStats();
await checkAndSendAlerts(stats);

if (stats.status === "critical" || stats.status === "emergency") {
  // Take action
}
```

### Update Usage Data

```typescript
import { updateVercelUsage, updateSupabaseUsage } from "@/lib/utils/capacity-monitor";

// Update Vercel usage (call periodically with actual data)
updateVercelUsage(25.5, 12.3); // bandwidth, fastOriginTransfer

// Update Supabase usage
updateSupabaseUsage(60.2, 0.15, 0.002, 2); // databaseSize, bandwidth, storage, mau
```

---

## Best Practices

### 1. Regular Monitoring
- Check capacity daily (automated)
- Review reports weekly
- Analyze trends monthly

### 2. Proactive Alerts
- Set alerts at 50%, 75%, 90% thresholds
- Don't wait until limit reached
- Plan scaling in advance

### 3. Data Accuracy
- Update usage data regularly
- Verify subscription limits
- Track actual vs. projected usage

### 4. Documentation
- Document alert procedures
- Keep scaling plans updated
- Review and adjust thresholds

---

## Troubleshooting

### Perplexity Tracking Not Working
- Check database table exists
- Verify migration applied
- Check database connection
- Review API route integration

### Capacity Monitor Errors
- Verify usage data is updated
- Check service limits are correct
- Review calculation logic
- Check for null/undefined values

### Alerts Not Sending
- Verify alert configuration
- Check email/SMS service setup
- Review webhook URLs
- Test alert functions

---

## Next Steps

1. **Implement Admin Dashboard**
   - Create React components
   - Integrate with API endpoints
   - Add visualizations

2. **Set Up Automated Alerts**
   - Configure email alerts
   - Set up SMS alerts (if needed)
   - Configure webhook alerts

3. **Schedule Regular Reports**
   - Daily capacity checks
   - Weekly summary reports
   - Monthly comprehensive reviews

4. **Update Usage Data**
   - Integrate with service dashboards
   - Automate data collection
   - Update capacity monitor regularly

---

## Related Documentation

- [Capacity Analysis](./capacity-analysis.md) - Current capacity status
- [Scaling Thresholds](./scaling-thresholds.md) - When to scale
- [Perplexity Usage Analysis](./perplexity-usage-analysis.md) - Perplexity monitoring
- [Implementation Status](./IMPLEMENTATION_STATUS.md) - Overall progress

