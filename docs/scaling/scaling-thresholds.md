# Scaling Thresholds - Decision Matrix

**Last Updated:** January 29, 2025  
**Status:** ✅ Based on verified subscriptions

## Overview

This document provides a decision matrix for when to scale (upgrade plans or implement optimizations) based on capacity utilization thresholds.

---

## Decision Framework

### When to Optimize vs. When to Scale Up

**Optimize First:**
- Perplexity: Always optimize before upgrading (caching, prompt optimization)
- Vercel: Optimize if bandwidth < 80 GB/month
- Supabase: Optimize if database < 400 MB

**Scale Up:**
- Vercel: Upgrade to Pro when bandwidth > 80 GB/month
- Supabase: Upgrade to Pro when database > 400 MB
- Perplexity: Research upgrade only after optimization

---

## Service-Specific Thresholds

### Vercel (Hobby Plan)

| Utilization | Status | Action Required | Timeline |
|-------------|--------|----------------|----------|
| < 50% | ✅ Safe | Monitor trends | No action |
| 50-75% | ⚠️ Warning | Plan for scaling | 1-2 months |
| 75-80% | 🚨 Critical | Prepare upgrade | 1 month |
| > 80% | 🔴 Upgrade | Upgrade to Pro ($20/month) | Immediate |

**Current:** 23% bandwidth utilization - ✅ Safe

**Upgrade Path:**
- **Hobby → Pro:** $20/month
- **Features:** Increased bandwidth, team collaboration, advanced analytics
- **Trigger:** 80 GB/month bandwidth (80% utilization)

---

### Supabase (Free Plan)

| Utilization | Status | Action Required | Timeline |
|-------------|--------|----------------|----------|
| < 50% | ✅ Safe | Monitor trends | No action |
| 50-75% | ⚠️ Warning | Plan for scaling | 1-2 months |
| 75-80% | 🚨 Critical | Prepare upgrade | 1 month |
| > 80% | 🔴 Upgrade | Upgrade to Pro ($25/month) | Immediate |

**Current:** 11% database utilization - ✅ Safe

**Upgrade Path:**
- **Free → Pro:** $25/month
- **Features:** 8 GB database, 50 GB bandwidth, daily backups, point-in-time recovery
- **Trigger:** 400 MB database (80% utilization) or 40K+ MAU

---

### Perplexity PRO

| Utilization | Status | Action Required | Timeline |
|-------------|--------|----------------|----------|
| < 67% (200/day) | ✅ Safe | Monitor daily | No action |
| 67-83% (200-250/day) | ⚠️ Warning | Implement optimizations | 1 week |
| 83-97% (250-290/day) | 🚨 Critical | Aggressive optimization | Immediate |
| > 97% (290+/day) | 🔴 Emergency | Queue system, fallback to Claude | Immediate |
| 100% (300/day) | 🔴 Exceeded | All requests fail until next day | Blocked |

**Current:** [Tracked daily] - ⚠️ **CRITICAL CONSTRAINT**

**Optimization Path (Before Upgrade):**
1. **Caching:** 30-50% reduction (Week 1)
2. **Prompt Optimization:** 20-40% reduction (Month 1)
3. **Queue System:** Fair distribution (Month 1)
4. **Fallback to Claude:** When limit reached (Month 2)

**Upgrade Path:**
- Research if higher tiers available
- Only consider after optimization implemented
- Cost-benefit analysis required

---

### Anthropic Claude API

| Utilization | Status | Action Required | Timeline |
|-------------|--------|----------------|----------|
| < 50% | ✅ Safe | Monitor credit balance | No action |
| 50-75% | ⚠️ Warning | Monitor usage trends | No action |
| 75-90% | 🚨 Critical | Enable auto-reload | 1 week |
| Credit < $10 | 🔴 Low Balance | Enable auto-reload immediately | Immediate |

**Current:** $23.77 credit balance, <1% rate limit utilization - ✅ Safe

**Action:**
- Monitor credit balance monthly
- Enable auto-reload if balance drops below $10
- Consider Enterprise tier if rate limits become constraint

---

## Combined Decision Matrix

### Scenario: All Services in Safe Zone (< 50%)
**Action:** ✅ Continue monitoring, no immediate action

### Scenario: One Service in Warning Zone (50-75%)
**Action:** ⚠️ Plan for scaling, review optimization opportunities

### Scenario: One Service in Critical Zone (75-90%)
**Action:** 🚨 Immediate scaling planning, implement optimizations

### Scenario: One Service Over Capacity (> 90%)
**Action:** 🔴 Upgrade immediately or implement emergency optimizations

### Scenario: Perplexity Approaching Limit (250+ searches/day)
**Action:** 🚨 Implement queue system, aggressive caching, fallback to Claude

---

## Cost-Benefit Analysis

### Optimization vs. Upgrade

**Perplexity:**
- **Optimization Cost:** Development time (1-2 weeks)
- **Optimization Savings:** 50-70% reduction in searches
- **Upgrade Cost:** [Research required]
- **Recommendation:** Optimize first, then evaluate upgrade

**Vercel:**
- **Upgrade Cost:** $20/month
- **Upgrade Benefit:** Increased bandwidth, team features
- **Trigger:** 80 GB/month bandwidth
- **Recommendation:** Upgrade when threshold reached

**Supabase:**
- **Upgrade Cost:** $25/month
- **Upgrade Benefit:** 8 GB database, daily backups
- **Trigger:** 400 MB database
- **Recommendation:** Upgrade when threshold reached

---

## Growth-Based Scaling Triggers

### Conservative Growth (10% per month)
- **Vercel:** Upgrade in ~12 months (if growth continues)
- **Supabase:** Upgrade in ~18+ months (if growth continues)
- **Perplexity:** Monitor daily, optimize as needed

### Moderate Growth (25% per month)
- **Vercel:** Upgrade in ~6 months (if growth continues)
- **Supabase:** Upgrade in ~12 months (if growth continues)
- **Perplexity:** Optimize immediately, monitor closely

### Aggressive Growth (50% per month)
- **Vercel:** Upgrade in ~3 months (if growth continues)
- **Supabase:** Upgrade in ~6 months (if growth continues)
- **Perplexity:** Optimize immediately, consider upgrade research

---

## Monitoring Schedule

### Daily
- **Perplexity:** Check daily usage (automated tracking)
- **Alerts:** Monitor for threshold breaches

### Weekly
- **All Services:** Review usage trends
- **Capacity Report:** Generate weekly capacity report

### Monthly
- **All Services:** Update usage data
- **Growth Projections:** Calculate scaling timelines
- **Cost Review:** Review subscription costs

### Quarterly
- **Comprehensive Review:** Full capacity analysis
- **Upgrade Evaluation:** Evaluate upgrade needs
- **Optimization Review:** Review optimization effectiveness

---

## Action Checklist

### When Service Reaches 50% Utilization
- [ ] Document current usage
- [ ] Calculate growth projections
- [ ] Review optimization opportunities
- [ ] Plan for scaling (1-2 months)

### When Service Reaches 75% Utilization
- [ ] Immediate scaling planning
- [ ] Implement optimizations
- [ ] Prepare upgrade path
- [ ] Set up alerts

### When Service Reaches 90% Utilization
- [ ] Upgrade immediately or implement emergency optimizations
- [ ] Consider rate limiting
- [ ] Client prioritization (if needed)
- [ ] Monitor closely

### When Perplexity Reaches 250+ Searches/Day
- [ ] Implement queue system
- [ ] Aggressive caching
- [ ] Fallback to Claude API
- [ ] Research upgrade options

---

## Related Documentation

- [Capacity Analysis](./capacity-analysis.md) - Current capacity calculations
- [Current Subscriptions](./current-subscriptions.md) - Subscription details
- [Scaling Strategies](./scaling-strategies.md) - Comprehensive scaling options
- [Perplexity Scaling Strategies](./perplexity-scaling-strategies.md) - Perplexity-specific strategies

