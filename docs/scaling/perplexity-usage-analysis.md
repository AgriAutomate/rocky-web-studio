# Perplexity Usage Analysis & Capacity Planning

**Last Updated:** January 2025  
**Status:** Critical - Perplexity 300/day limit is primary bottleneck risk

## Overview

Perplexity PRO has a hard daily limit of 300 searches/day across ALL clients. This document analyzes current usage patterns, calculates capacity, and provides strategies for managing this critical constraint.

---

## Current Usage Pattern

### API Integration
- **Endpoint:** `https://api.perplexity.ai/chat/completions`
- **Usage Location:** `app/api/consciousness/analyze/route.ts`
- **Model:** `sonar-reasoning` (default, configurable via `PERPLEXITY_MODEL`)
- **Calls per Operation:** 1 search per consciousness journey analysis

### Current Implementation
```typescript
// From app/api/consciousness/analyze/route.ts
const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${perplexityApiKey}`,
  },
  body: JSON.stringify({
    model: perplexityModel,
    messages: [...],
    temperature: 0.2,
  }),
});
```

**Key Finding:** Each consciousness journey analysis = 1 Perplexity search

---

## Capacity Calculations

### Scenario 1: Consciousness Journey Only
- **Searches per Journey:** 1
- **Daily Limit:** 300 searches/day
- **Maximum Journeys/Day:** 300
- **Maximum Journeys/Month:** ~9,000 (300 × 30)

**If each client generates:**
- **1 journey/month:** ~9,000 clients max
- **2 journeys/month:** ~4,500 clients max
- **4 journeys/month:** ~2,250 clients max
- **10 journeys/month:** ~900 clients max

### Scenario 2: If Used in Proposal Generation
**Note:** Currently not used in proposal generation, but if added:

- **Searches per Proposal:** [Estimate: 3-5 searches]
- **Daily Limit:** 300 searches/day
- **Maximum Proposals/Day:** 60-100 proposals (300 ÷ 3-5)
- **Maximum Proposals/Month:** ~1,800-3,000 proposals

**If each client generates:**
- **1 proposal/month:** ~1,800-3,000 clients max
- **2 proposals/month:** ~900-1,500 clients max

### Scenario 3: Mixed Usage
If Perplexity is used for both consciousness journeys and proposals:

- **Consciousness Journeys:** 1 search each
- **Proposals:** 3-5 searches each
- **Daily Limit:** 300 searches/day

**Example Calculation:**
- 100 consciousness journeys/day = 100 searches
- Remaining: 200 searches/day
- 200 ÷ 4 (avg searches per proposal) = 50 proposals/day max

---

## Critical Constraints

### Hard Daily Limit
- ⚠️ **300 searches/day is a HARD LIMIT**
- Resets daily (not monthly)
- Applies across ALL clients and operations
- No burst capacity - once limit is reached, all requests fail until next day

### Impact of Exceeding Limit
- All Perplexity API calls will fail
- Consciousness journey analysis will fail
- Any proposal generation using Perplexity will fail
- User experience degradation
- Potential client churn

### No Current Rate Limiting
- **Current Status:** No rate limiting implemented
- **Risk:** Sudden spike could exhaust daily limit early in the day
- **Action Required:** Implement rate limiting and queue system

---

## Usage Tracking Requirements

### Daily Tracking
- **Metric:** Total Perplexity searches per day
- **Reset Time:** Midnight UTC (verify with Perplexity)
- **Tracking Method:** Database table or Redis counter
- **Alert Thresholds:**
  - **Warning (67%):** 200 searches/day
  - **Critical (83%):** 250 searches/day
  - **Emergency (97%):** 290 searches/day

### Per-Operation Tracking
- Track searches per consciousness journey
- Track searches per proposal (if used)
- Track searches per client
- Identify high-usage clients

### Monthly Tracking
- Total searches per month
- Average searches per day
- Peak usage days
- Growth trends

---

## Optimization Strategies

### 1. Caching Results
**Strategy:** Cache Perplexity responses for similar requests

**Implementation:**
- Cache consciousness journey analyses for similar consciousness level transitions
- Cache proposal research for similar industries/sectors
- Use Redis or Supabase for caching
- Cache TTL: 7-30 days (depending on data freshness needs)

**Potential Savings:** 30-50% reduction in searches

### 2. Reduce Searches per Operation
**Strategy:** Optimize prompts to get more information in fewer searches

**Implementation:**
- Combine multiple research queries into single search
- Use more specific prompts to reduce need for follow-up searches
- Batch related queries

**Potential Savings:** 20-40% reduction in searches per operation

### 3. Queue System
**Strategy:** Implement request queue to respect daily limit

**Implementation:**
- Queue Perplexity requests when approaching limit
- Process queue with rate limiting (e.g., max 10 searches/hour)
- Return queued status to users
- Process queue as capacity becomes available

**Benefits:**
- Prevents exceeding daily limit
- Fair distribution of searches throughout day
- Better user experience (queued vs. failed)

### 4. Fallback to Claude API
**Strategy:** Use Claude API when Perplexity limit reached

**Implementation:**
- Monitor Perplexity usage
- When limit approached, route requests to Claude API
- Claude API can provide similar research capabilities
- May require prompt adjustments

**Trade-offs:**
- Claude API may have different cost structure
- May require different prompt engineering
- May have different quality/results

### 5. Client Prioritization
**Strategy:** Prioritize high-value clients when limit approached

**Implementation:**
- Tier clients (e.g., Enterprise, Pro, Basic)
- Allocate daily search budget per tier
- Enterprise clients get guaranteed access
- Basic clients may be queued or use fallback

**Use Case:** Only if consistently hitting limit

---

## Scaling Strategies

### Option 1: Upgrade Perplexity Plan
**Action:** Research if higher tiers available

**Questions to Answer:**
- Does Perplexity offer higher tiers?
- What are the limits for higher tiers?
- What is the cost?
- Is it cost-effective vs. optimization?

**If Available:**
- Calculate cost per additional search
- Compare to optimization costs
- Make cost-benefit decision

### Option 2: Reduce Perplexity Dependency
**Action:** Use Perplexity only for high-value operations

**Implementation:**
- Use Perplexity for complex research only
- Use Claude API for simpler operations
- Use cached results where possible
- Use internal knowledge base where possible

### Option 3: Hybrid Approach
**Action:** Combine multiple strategies

**Implementation:**
- Cache aggressively (30-50% reduction)
- Optimize prompts (20-40% reduction)
- Queue system for fair distribution
- Fallback to Claude when needed
- Upgrade plan only if still needed

**Expected Result:** 50-70% reduction in Perplexity usage

---

## Implementation Priority

### Immediate (Week 1)
1. ✅ Document current usage patterns
2. ⚠️ Implement daily usage tracking
3. ⚠️ Set up alerts at 200, 250, 290 searches/day
4. ⚠️ Research Perplexity upgrade options

### Short-term (Month 1)
1. Implement caching for consciousness journey analyses
2. Implement queue system for Perplexity requests
3. Optimize prompts to reduce searches per operation
4. Test fallback to Claude API

### Long-term (Month 2-3)
1. Evaluate upgrade vs. optimization cost-benefit
2. Implement client prioritization (if needed)
3. Monitor and adjust strategies
4. Document best practices

---

## Monitoring Dashboard Requirements

### Daily Metrics
- Total searches today
- Searches remaining today
- Searches per hour (rate)
- Projected daily total
- Alert status

### Per-Operation Metrics
- Searches per consciousness journey (average)
- Searches per proposal (if used)
- Searches per client (average)
- Top clients by usage

### Historical Metrics
- Daily usage trends (last 30 days)
- Monthly usage trends
- Peak usage days
- Growth rate

### Alerts
- Warning at 200 searches (67%)
- Critical at 250 searches (83%)
- Emergency at 290 searches (97%)
- Limit exceeded (300+)

---

## Cost Analysis

### Current Cost
- **Perplexity PRO:** $20/month ($339/year pre-paid)
- **Cost per Search:** ~$0.0022/search ($20 ÷ 9,000 searches/month)

### If Upgrading
- **Higher Tier Cost:** [Research required]
- **Additional Searches:** [Research required]
- **Cost per Additional Search:** [Calculate]

### Optimization Cost
- **Caching Infrastructure:** Minimal (Redis or Supabase)
- **Development Time:** 1-2 weeks
- **Maintenance:** Low
- **ROI:** High (reduces need for upgrade)

---

## Action Items

- [ ] Verify Perplexity PRO subscription status
- [ ] Research if higher Perplexity tiers available
- [ ] Implement daily usage tracking
- [ ] Set up alerts at 200, 250, 290 searches/day
- [ ] Implement caching for consciousness journey analyses
- [ ] Implement queue system for Perplexity requests
- [ ] Optimize prompts to reduce searches per operation
- [ ] Test fallback to Claude API
- [ ] Create monitoring dashboard
- [ ] Document best practices

---

## Related Documentation

- [Subscription Limits](./subscription-limits.md) - All service limits
- [Perplexity Scaling Strategies](./perplexity-scaling-strategies.md) - Detailed scaling options
- [Capacity Analysis](./capacity-analysis.md) - Overall capacity planning
- [Resource Usage Model](./resource-usage-model.md) - Per-client resource calculations

