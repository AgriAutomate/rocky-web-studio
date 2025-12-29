# Scaling & Capacity Planning - Quick Start Guide

**Last Updated:** January 29, 2025

## What's Been Completed

### ✅ Critical Infrastructure
1. **Perplexity Usage Tracking** - Daily usage tracking utilities created
2. **Perplexity Rate Limiting** - Rate limiting and queuing system implemented
3. **API Integration** - Perplexity tracking integrated into consciousness API route
4. **Database Migration** - `perplexity_usage` table migration created
5. **Capacity Calculator** - Utility for calculating capacity and scaling timelines

### ✅ Documentation
1. **Subscription Templates** - Created templates for all services (needs verification)
2. **Perplexity Analysis** - Comprehensive analysis of 300/day limit
3. **Scaling Strategies** - Detailed strategies for Perplexity optimization
4. **Comet Prompts** - Browser automation prompts for subscription verification

---

## Immediate Next Steps

### 1. Run Database Migration (5 minutes)
```bash
# Apply the Perplexity usage tracking migration
# Run this in your Supabase dashboard or via CLI
supabase migration up
```

Or manually run the SQL from:
`supabase/migrations/20250129_create_perplexity_usage_tracking.sql`

### 2. Verify Subscriptions (30-60 minutes)
Use the Comet prompts in `COMET_PROMPTS_SCALING_CAPACITY_PLANNING.md` to:
- Verify all service subscriptions
- Document actual limits and usage
- Update `docs/scaling/current-subscriptions.md`
- Update `docs/scaling/subscription-limits.md`

### 3. Test Perplexity Tracking (10 minutes)
```typescript
// Test the tracking in a development environment
import { getTodayUsageStats, incrementUsage } from "@/lib/utils/perplexity-usage-tracker";

// Check current usage
const stats = await getTodayUsageStats();
console.log("Current usage:", stats);

// Test increment (in test environment only)
const result = await incrementUsage();
console.log("Increment result:", result);
```

### 4. Set Up Alerts (15 minutes)
Configure alerts for Perplexity usage:
- Warning at 200 searches (67%)
- Critical at 250 searches (83%)
- Emergency at 290 searches (97%)

See `lib/utils/perplexity-usage-tracker.ts` for alert functions.

---

## Key Files Created

### Documentation
- `docs/scaling/README.md` - Overview and structure
- `docs/scaling/current-subscriptions.md` - Subscription inventory (needs verification)
- `docs/scaling/subscription-limits.md` - Limits matrix (needs verification)
- `docs/scaling/perplexity-usage-analysis.md` - Perplexity analysis
- `docs/scaling/perplexity-scaling-strategies.md` - Scaling strategies
- `docs/scaling/IMPLEMENTATION_STATUS.md` - Progress tracking
- `COMET_PROMPTS_SCALING_CAPACITY_PLANNING.md` - Browser automation prompts

### Utilities
- `lib/utils/perplexity-usage-tracker.ts` - Daily usage tracking
- `lib/utils/perplexity-rate-limiter.ts` - Rate limiting and queuing
- `lib/utils/capacity-calculator.ts` - Capacity calculations

### Database
- `supabase/migrations/20250129_create_perplexity_usage_tracking.sql` - Usage tracking table

### Code Integration
- `app/api/consciousness/analyze/route.ts` - Updated with Perplexity tracking

---

## Critical Information

### Perplexity 300/day Limit
- **Hard Limit:** 300 searches/day across ALL clients
- **Current Usage:** 1 search per consciousness journey analysis
- **Capacity:** ~9,000 journeys/month if evenly distributed
- **Bottleneck Risk:** HIGH - This is the primary capacity constraint

### Capacity Thresholds
- **Safe Zone:** < 50% utilization
- **Warning Zone:** 50-75% utilization
- **Critical Zone:** 75-90% utilization
- **Over Capacity:** > 90% utilization

---

## Usage Examples

### Check Perplexity Usage
```typescript
import { getTodayUsageStats } from "@/lib/utils/perplexity-usage-tracker";

const stats = await getTodayUsageStats();
console.log(`Used: ${stats.totalSearches}/300 searches today`);
console.log(`Status: ${stats.status}`);
```

### Make Perplexity Request with Rate Limiting
```typescript
import { executeWithRateLimit } from "@/lib/utils/perplexity-rate-limiter";

const result = await executeWithRateLimit(
  async () => {
    // Your Perplexity API call here
    return await fetch("https://api.perplexity.ai/chat/completions", {...});
  },
  "medium", // priority
  "consciousness-journey" // operation type
);

if (!result.success) {
  console.error("Rate limited:", result.error);
}
```

### Calculate Capacity
```typescript
import { calculatePerplexityCapacity } from "@/lib/utils/capacity-calculator";

const capacity = calculatePerplexityCapacity(
  300, // daily limit
  1,   // searches per journey
  0    // searches per proposal (if used)
);

console.log(`Max journeys/day: ${capacity.maxJourneysPerDay}`);
console.log(`Max clients/month: ${capacity.maxClientsPerMonth.journeysOnly}`);
```

---

## Testing Checklist

- [ ] Database migration applied successfully
- [ ] Perplexity usage tracking table exists
- [ ] Can query today's usage stats
- [ ] Can increment usage counter
- [ ] Rate limiting works correctly
- [ ] API route returns 429 when limit exceeded
- [ ] Alerts trigger at correct thresholds
- [ ] All subscriptions verified
- [ ] Documentation updated with actual values

---

## Troubleshooting

### Migration Fails
- Check Supabase connection
- Verify SQL syntax
- Check if table already exists

### Usage Tracking Not Working
- Verify database connection
- Check table exists: `SELECT * FROM perplexity_usage;`
- Check environment variables

### Rate Limiting Too Aggressive
- Adjust `MAX_SEARCHES_PER_HOUR` in `perplexity-rate-limiter.ts`
- Adjust `MAX_SEARCHES_PER_MINUTE` if needed
- Monitor actual usage patterns

---

## Next Phase

After completing immediate steps:
1. Implement caching for Perplexity results
2. Create monitoring dashboard
3. Set up automated alerts
4. Complete remaining documentation phases
5. Implement optimization strategies

See `docs/scaling/IMPLEMENTATION_STATUS.md` for full progress tracking.

---

## Support

- **Documentation:** `docs/scaling/README.md`
- **Status:** `docs/scaling/IMPLEMENTATION_STATUS.md`
- **Comet Prompts:** `COMET_PROMPTS_SCALING_CAPACITY_PLANNING.md`
- **Perplexity Analysis:** `docs/scaling/perplexity-usage-analysis.md`

