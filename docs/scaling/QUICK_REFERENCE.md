# Scaling & Capacity Planning - Quick Reference

**Last Updated:** January 29, 2025

## Critical Limits

### Perplexity PRO ⚠️ **PRIMARY BOTTLENECK**
- **Limit:** 300 searches/day (HARD LIMIT)
- **Current:** [Tracked daily]
- **Alert Thresholds:**
  - Warning: 200 searches (67%)
  - Critical: 250 searches (83%)
  - Emergency: 290 searches (97%)
- **Action:** Implement caching + optimization before upgrade

### Vercel (Hobby)
- **Limit:** 100 GB/month bandwidth
- **Current:** 23.07 GB (23% utilization)
- **Upgrade Trigger:** 80 GB/month (80% utilization) → Pro ($20/month)

### Supabase (Free)
- **Limit:** 500 MB database
- **Current:** 54.97 MB (11% utilization)
- **Upgrade Trigger:** 400 MB (80% utilization) → Pro ($25/month)

### Anthropic API
- **Rate Limits:** 50 RPM, 30K-50K tokens/min
- **Current:** <1% utilization
- **Credit Balance:** $23.77
- **Status:** ✅ Excellent

---

## Capacity Thresholds

| Zone | Utilization | Status | Action |
|------|-------------|--------|--------|
| Safe | < 50% | ✅ | Monitor trends |
| Warning | 50-75% | ⚠️ | Plan scaling |
| Critical | 75-90% | 🚨 | Immediate planning |
| Over Capacity | > 90% | 🔴 | Upgrade required |

---

## Current Costs

**Monthly Fixed:** $30.00
- Perplexity PRO: $20.00
- Canva Business: ~$10.00
- Vercel: $0.00 (Hobby)
- Supabase: $0.00 (Free)

**Monthly Variable:** ~$0.02
- Anthropic API: ~$0.02

**Total:** ~$30.02/month

---

## Scaling Triggers

### Vercel
- **Upgrade:** Pro ($20/month) at 80 GB/month bandwidth
- **Optimize First:** Image optimization, caching

### Supabase
- **Upgrade:** Pro ($25/month) at 400 MB database
- **Optimize First:** Query optimization, data retention

### Perplexity
- **Optimize First:** Caching (30-50%), prompt optimization (20-40%)
- **Research Upgrade:** Only after optimization

---

## Optimization Targets

### Perplexity
- **Caching:** 30-50% reduction
- **Prompt Optimization:** 20-40% reduction
- **Combined:** 50-70% reduction expected

### Vercel
- **Image Optimization:** 20-30% bandwidth reduction
- **Caching:** 30-50% bandwidth reduction
- **Combined:** 40-60% reduction expected

### Supabase
- **Query Optimization:** Reduce API requests
- **Data Retention:** Archive old data
- **Combined:** 30-50% resource reduction expected

---

## API Endpoints

### GET /api/admin/capacity
Returns comprehensive capacity report

**Response:**
```json
{
  "success": true,
  "capacity": {
    "overallStatus": "healthy",
    "services": [...],
    "criticalAlerts": [],
    "recommendations": []
  },
  "perplexity": {
    "today": {...},
    "history": [...]
  }
}
```

---

## Key Utilities

### Perplexity Tracking
```typescript
import { getTodayUsageStats } from "@/lib/utils/perplexity-usage-tracker";
const stats = await getTodayUsageStats();
```

### Capacity Monitoring
```typescript
import { generateCapacityReport } from "@/lib/utils/capacity-monitor";
const report = await generateCapacityReport();
```

### Capacity Calculation
```typescript
import { calculatePerplexityCapacity } from "@/lib/utils/capacity-calculator";
const capacity = calculatePerplexityCapacity(300, 1, 0);
```

---

## Quick Actions

### Check Perplexity Usage
1. Call `getTodayUsageStats()`
2. Check `totalSearches` vs 300 limit
3. Monitor `status` (safe/warning/critical)

### Generate Capacity Report
1. Call `generateCapacityReport()`
2. Check `overallStatus`
3. Review `criticalAlerts` and `recommendations`

### Update Usage Data
```typescript
import { updateVercelUsage, updateSupabaseUsage } from "@/lib/utils/capacity-monitor";
updateVercelUsage(25.5, 12.3); // bandwidth, fastOriginTransfer
updateSupabaseUsage(60.2, 0.15, 0.002, 2); // databaseSize, bandwidth, storage, mau
```

---

## Emergency Procedures

### Perplexity Limit Exceeded
1. Queue system activates automatically
2. Fallback to Claude API (if implemented)
3. Monitor for next day reset
4. Review optimization opportunities

### Service Over Capacity
1. Check capacity report
2. Review critical alerts
3. Implement emergency optimizations
4. Consider immediate upgrade

---

## Documentation Links

- [Quick Start](./QUICK_START.md) - Get started
- [Capacity Analysis](./capacity-analysis.md) - Detailed analysis
- [Scaling Strategies](./scaling-strategies.md) - Scaling options
- [Optimization Checklist](./optimization-checklist.md) - Optimization guide
- [Monitoring Setup](./monitoring-setup.md) - Monitoring guide

---

## Contact & Support

- **Documentation:** `docs/scaling/`
- **API Endpoint:** `/api/admin/capacity`
- **Dashboard:** Use `CapacityDashboard` component
- **Status:** Production-ready ✅

