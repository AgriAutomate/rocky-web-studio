# Capacity Analysis

**Last Updated:** January 29, 2025  
**Status:** ✅ Based on verified subscriptions

## Overview

This document provides capacity analysis based on verified subscription limits and current usage. All calculations are based on actual subscription data verified on January 29, 2025.

---

## Current Capacity Status

### Overall Health: ✅ Healthy

All services are operating in the **Safe Zone** (< 50% utilization) with significant headroom for growth.

---

## Service-by-Service Analysis

### 1. Vercel (Hobby Plan - Free)

**Status:** ✅ Safe Zone (23% utilization)

| Resource | Limit | Current | Utilization | Status |
|----------|-------|---------|-------------|--------|
| Bandwidth | 100 GB/month | 23.07 GB | 23% | ✅ Safe |
| Fast Origin Transfer | 100 hours/month | 11.08 hours | 11% | ✅ Safe |

**Capacity Headroom:**
- **Bandwidth:** Can handle ~4.3x current traffic (77 GB remaining)
- **Fast Origin Transfer:** Can handle ~9x current usage (89 hours remaining)

**Upgrade Trigger:**
- Consider Pro plan ($20/month) when bandwidth exceeds **80 GB/month** (80% utilization)

**Max Clients Supported:**
- Based on current usage: ~4x current client base
- Based on limit: ~17x current client base (if usage scales linearly)

---

### 2. Supabase (Free Plan)

**Status:** ✅ Safe Zone (11% database utilization)

| Resource | Limit | Current | Utilization | Status |
|----------|-------|---------|-------------|--------|
| Database Size | 500 MB | 54.97 MB | 11% | ✅ Safe |
| Bandwidth | 5 GB/month | 104.53 KB | 0.002% | ✅ Safe |
| Storage | 1 GB | 1.04 KB | 0.0001% | ✅ Safe |
| Monthly Active Users | 50,000 | 1 | 0.002% | ✅ Safe |

**Capacity Headroom:**
- **Database:** Can handle ~9x current size (445 MB remaining)
- **Bandwidth:** Can handle ~48,000x current usage (4.9 GB remaining)
- **Storage:** Can handle ~960,000x current usage (1 GB remaining)
- **MAU:** Can handle ~50,000x current users (49,999 remaining)

**Upgrade Trigger:**
- Consider Pro plan ($25/month) when database exceeds **400 MB** (80% utilization) or need more than 50K MAU

**Max Clients Supported:**
- Based on current usage: ~9x current client base (database)
- Based on limit: ~50,000 clients (MAU limit)

---

### 3. Anthropic Claude API (Pay-as-you-go)

**Status:** ✅ Safe Zone (minimal usage)

| Resource | Limit | Current | Utilization | Status |
|----------|-------|---------|-------------|--------|
| Requests/Minute | 50 RPM | Low | <1% | ✅ Safe |
| Input Tokens/Min | 30K-50K | Low | <1% | ✅ Safe |
| Output Tokens/Min | 8K-10K | Low | <1% | ✅ Safe |
| Credit Balance | $23.77 | $0.02 used | 0.08% | ✅ Safe |

**Capacity Headroom:**
- **Rate Limits:** Well within limits, can handle significant growth
- **Credit Balance:** Sufficient for months of usage at current rate

**Upgrade Trigger:**
- Monitor credit balance, enable auto-reload if balance drops below $10
- Consider Enterprise tier if rate limits become a constraint

**Max Clients Supported:**
- Rate limits allow for significant scale
- Credit balance is the primary constraint (currently sufficient)

---

### 4. Perplexity PRO

**Status:** ⚠️ Critical Constraint (300/day hard limit)

| Resource | Limit | Current | Utilization | Status |
|----------|-------|---------|-------------|--------|
| Daily Searches | 300/day | [Tracked] | [Tracked] | ⚠️ **CRITICAL** |
| Monthly Searches | ~9,000/month | [Tracked] | [Tracked] | ⚠️ **CRITICAL** |

**Capacity Analysis:**
- **Current Usage Pattern:** 1 search per consciousness journey analysis
- **Max Journeys/Day:** 300 (if evenly distributed)
- **Max Journeys/Month:** ~9,000 (300 × 30 days)

**Max Clients Supported:**
- **If 1 journey/client/month:** ~9,000 clients max
- **If 2 journeys/client/month:** ~4,500 clients max
- **If 4 journeys/client/month:** ~2,250 clients max

**Critical Constraints:**
- ⚠️ **300/day is a HARD LIMIT** - resets daily at midnight UTC
- This is the **PRIMARY BOTTLENECK** for scaling
- No burst capacity - once limit reached, all requests fail until next day

**Optimization Potential:**
- **Caching:** 30-50% reduction in searches → ~13,500-18,000 journeys/month capacity
- **Prompt Optimization:** 20-40% reduction → ~11,250-15,000 journeys/month capacity
- **Combined:** 50-70% reduction → ~18,000-30,000 journeys/month capacity

**Upgrade Trigger:**
- Research if higher tiers available
- Implement optimizations before considering upgrade
- Monitor daily usage trends

---

### 5. Canva Business

**Status:** ✅ Sufficient

- **Plan:** Canva Pro (Business tier)
- **Cost:** $119.99/year (~$10/month)
- **Limits:** Unlimited designs, exports, downloads
- **Assessment:** Sufficient for current needs

---

## Capacity Thresholds

### Safe Zone (< 50% utilization)
- ✅ **Vercel:** 23% bandwidth, 11% Fast Origin Transfer
- ✅ **Supabase:** 11% database, 0.002% bandwidth, 0.0001% storage
- ✅ **Anthropic:** <1% rate limit utilization
- ⚠️ **Perplexity:** Must track daily (300/day limit)

### Warning Zone (50-75% utilization)
- **None currently** - All services in safe zone

### Critical Zone (75-90% utilization)
- **None currently** - All services in safe zone

### Over Capacity (> 90% utilization)
- **None currently** - All services in safe zone

---

## Growth Projections

### Scenario 1: Conservative Growth (10% per month)

**Current State:**
- Vercel: 23 GB bandwidth/month
- Supabase: 55 MB database
- Perplexity: [Track usage]

**6 Months:**
- Vercel: ~41 GB bandwidth (41% utilization) - ✅ Safe
- Supabase: ~97 MB database (19% utilization) - ✅ Safe
- Perplexity: Monitor daily usage trends

**12 Months:**
- Vercel: ~72 GB bandwidth (72% utilization) - ⚠️ Warning zone
- Supabase: ~172 MB database (34% utilization) - ✅ Safe
- Perplexity: Monitor daily usage trends

### Scenario 2: Moderate Growth (25% per month)

**6 Months:**
- Vercel: ~88 GB bandwidth (88% utilization) - 🚨 Critical zone
- Supabase: ~210 MB database (42% utilization) - ✅ Safe
- Perplexity: Monitor daily usage trends

**12 Months:**
- Vercel: Would exceed limit - **Upgrade to Pro required**
- Supabase: ~375 MB database (75% utilization) - ⚠️ Warning zone
- Perplexity: Monitor daily usage trends

### Scenario 3: Aggressive Growth (50% per month)

**6 Months:**
- Vercel: Would exceed limit - **Upgrade to Pro required**
- Supabase: ~417 MB database (83% utilization) - 🚨 Critical zone
- Perplexity: Monitor daily usage trends

---

## Bottleneck Analysis

### Primary Bottleneck: Perplexity PRO

**Why:**
- Hard daily limit of 300 searches/day
- No burst capacity
- Resets daily (not monthly)
- Applies across ALL clients

**Impact:**
- Limits maximum clients to ~9,000/month (if 1 journey/client)
- Requires careful daily monitoring
- May require optimization or upgrade

**Mitigation:**
- ✅ Daily usage tracking implemented
- ✅ Rate limiting implemented
- ⚠️ Caching (to be implemented)
- ⚠️ Prompt optimization (to be implemented)

### Secondary Bottlenecks: None Currently

**Vercel:**
- 23% utilization - plenty of headroom
- Upgrade path clear (Pro plan available)

**Supabase:**
- 11% utilization - excellent headroom
- Upgrade path clear (Pro plan available)

**Anthropic:**
- Minimal usage - well within limits
- Credit balance sufficient

---

## Recommendations

### Immediate (This Week)
1. ✅ **Monitor Perplexity Daily:** Track usage daily via implemented system
2. ✅ **Set Up Alerts:** Configure alerts at 200, 250, 290 searches/day
3. ⚠️ **Update Usage Data:** Periodically update Vercel/Supabase usage in monitoring system

### Short-term (This Month)
1. **Implement Caching:** Reduce Perplexity searches by 30-50%
2. **Optimize Prompts:** Reduce searches per operation by 20-40%
3. **Monitor Trends:** Track daily usage patterns and growth trends
4. **Create Dashboard:** Build admin dashboard for capacity visualization

### Long-term (3-6 Months)
1. **Evaluate Upgrades:** Consider Vercel Pro if bandwidth exceeds 80 GB/month
2. **Evaluate Upgrades:** Consider Supabase Pro if database exceeds 400 MB
3. **Research Perplexity:** Investigate higher tiers or alternatives
4. **Review Quarterly:** Update capacity analysis quarterly

---

## Capacity Calculator Usage

Use the `capacity-calculator.ts` utility to:
- Calculate max clients based on resource limits
- Project scaling timelines based on growth rates
- Determine when upgrades are needed
- Calculate cost per client

Example:
```typescript
import { calculatePerplexityCapacity } from "@/lib/utils/capacity-calculator";

const capacity = calculatePerplexityCapacity(300, 1, 0);
console.log(`Max journeys/day: ${capacity.maxJourneysPerDay}`);
console.log(`Max clients/month: ${capacity.maxClientsPerMonth.journeysOnly}`);
```

---

## Related Documentation

- [Current Subscriptions](./current-subscriptions.md) - Verified subscription details
- [Subscription Limits](./subscription-limits.md) - Limits matrix
- [Perplexity Usage Analysis](./perplexity-usage-analysis.md) - Detailed Perplexity analysis
- [Scaling Thresholds](./scaling-thresholds.md) - When to scale decision matrix

