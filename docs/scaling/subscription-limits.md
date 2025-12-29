# Subscription Limits Matrix

**Last Updated:** January 29, 2025  
**Status:** ✅ Verified - All subscriptions verified and documented

## Overview

This document provides a comprehensive matrix of all subscription limits across services. Use this as a quick reference for capacity planning and scaling decisions.

---

## Limits Matrix

| Service | Plan Tier | Limit Type | Limit Value | Current Usage | Utilization % | Status |
|---------|-----------|------------|-------------|---------------|--------------|--------|
| **Vercel** | Hobby (Free) | Bandwidth | 100 GB/month | 23.07 GB | 23% | ✅ Safe |
| | | Fast Origin Transfer | 100 hours/month | 11.08 hours | 11% | ✅ Safe |
| | | Projects | Unlimited | N/A | N/A | ✅ Unlimited |
| | | Build Minutes | Included | N/A | N/A | ✅ Included |
| **Supabase** | Free | Database Size | 500 MB | 54.97 MB | 11% | ✅ Safe |
| | | API Requests | Unlimited* | N/A | N/A | ✅ Unlimited* |
| | | Bandwidth | 5 GB/month | 104.53 KB | 0.002% | ✅ Safe |
| | | Auth Users (MAU) | 50,000 | 1 | 0.002% | ✅ Safe |
| | | Storage | 1 GB | 1.04 KB | 0.0001% | ✅ Safe |
| | | Database Connections | Included | N/A | N/A | ✅ Included |
| **Anthropic** | Pay-as-you-go (Tier 1) | Requests/Minute | 50 RPM | Low | <1% | ✅ Safe |
| | | Input Tokens/Min | 30K-50K | Low | <1% | ✅ Safe |
| | | Output Tokens/Min | 8K-10K | Low | <1% | ✅ Safe |
| | | Credit Balance | $23.77 | $0.02 used | 0.08% | ✅ Safe |
| **Perplexity PRO** | PRO | **Daily Searches** | **300/day** | [Tracked] | [Tracked] | ⚠️ **CRITICAL** |
| | | Monthly Searches | ~9,000/month | [Tracked] | [Tracked] | ⚠️ **CRITICAL** |
| **Canva Business** | Pro (Business) | Designs | Unlimited | N/A | N/A | ✅ Unlimited |
| | | Exports | Unlimited | N/A | N/A | ✅ Unlimited |
| | | Storage | Generous | N/A | N/A | ✅ Sufficient |

---

## Critical Limits (Priority Monitoring)

### 1. Perplexity PRO - Daily Search Limit
- **Limit:** 300 searches/day
- **Type:** Hard limit (resets daily)
- **Impact:** Blocks all Perplexity API calls if exceeded
- **Monitoring:** Daily tracking required
- **Alert Thresholds:**
  - Warning: 200 searches (67% utilization)
  - Critical: 250 searches (83% utilization)
  - Emergency: 290 searches (97% utilization)

### 2. Vercel Bandwidth
- **Limit:** 100 GB/month (Hobby plan)
- **Current:** 23.07 GB (23% utilization)
- **Type:** Monthly limit
- **Impact:** Bandwidth throttling if exceeded
- **Monitoring:** Track via Vercel Analytics
- **Upgrade Trigger:** 80 GB/month (80% utilization) → Pro plan ($20/month)

### 3. Supabase Database Size
- **Limit:** 500 MB (Free plan)
- **Current:** 54.97 MB (11% utilization)
- **Type:** Storage limit
- **Impact:** Database writes may fail if exceeded
- **Monitoring:** Track via Supabase Dashboard
- **Upgrade Trigger:** 400 MB (80% utilization) → Pro plan ($25/month)

### 4. Supabase API Requests
- **Limit:** Unlimited* (with rate limits on Free plan)
- **Type:** Rate-limited, not hard limit
- **Impact:** API calls may be rate-limited if exceeded
- **Monitoring:** Track via Supabase Dashboard
- **Status:** ✅ Well within limits

---

## Capacity Thresholds

### Safe Zone (< 50% utilization)
- ✅ Normal operations
- ✅ No immediate action needed
- ✅ Monitor trends

### Warning Zone (50-75% utilization)
- ⚠️ Monitor closely
- ⚠️ Plan for scaling
- ⚠️ Review optimization opportunities
- ⚠️ Document growth projections

### Critical Zone (75-90% utilization)
- 🚨 Immediate scaling planning required
- 🚨 Implement optimizations
- 🚨 Prepare upgrade path
- 🚨 Set up alerts

### Over Capacity (> 90% utilization)
- 🔴 Upgrade required immediately
- 🔴 Implement emergency optimizations
- 🔴 Consider rate limiting
- 🔴 Client prioritization may be needed

---

## Per-Client Resource Limits (Estimated)

**Note:** These are estimates based on typical usage patterns. Actual usage may vary.

| Resource | Per Client/Month | Notes |
|----------|------------------|-------|
| **Perplexity Searches** | ~1-5 searches | 1 per consciousness journey analysis |
| **Supabase Storage** | ~10-50 MB | Questionnaire responses, PDFs, audit data |
| **Supabase API Requests** | ~100-500 requests | Read/write operations |
| **Vercel Function Execution** | ~0.1-0.5 GB-hours | API route invocations |
| **Vercel Bandwidth** | ~100-500 MB | Page views, PDF downloads |
| **Claude API Calls** | ~5-20 calls | Proposal generation, AI assistant |
| **Email Sends** | ~2-10 emails | Confirmations, notifications |
| **SMS Sends** | ~0-5 SMS | If SMS features used |

---

## Upgrade Paths

### Vercel
- **Hobby → Pro:** [Cost] - [Additional limits]
- **Pro → Enterprise:** [Cost] - [Additional limits]

### Supabase
- **Free → Pro:** [Cost] - [Additional limits]
- **Pro → Team:** [Cost] - [Additional limits]
- **Team → Enterprise:** [Cost] - [Additional limits]

### Perplexity
- **PRO → [Higher Tier?]:** [Research if available]
- **Alternative:** Optimize usage, implement caching

### Anthropic
- **Pay-as-you-go → Enterprise:** [If available]
- **Cost:** [Verify pricing]

---

## Action Items

- [ ] Verify all limits in service dashboards
- [ ] Update matrix with actual current values
- [ ] Set up monitoring for all critical limits
- [ ] Create alerts for warning/critical thresholds
- [ ] Document upgrade paths and costs
- [ ] Calculate per-client resource usage
- [ ] Review quarterly or when subscriptions change

---

## Related Documentation

- [Current Subscriptions](./current-subscriptions.md) - Detailed subscription inventory
- [Capacity Analysis](./capacity-analysis.md) - Capacity calculations and thresholds
- [Scaling Thresholds](./scaling-thresholds.md) - When to scale decision matrix

