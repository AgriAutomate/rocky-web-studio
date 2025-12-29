# Perplexity Scaling Strategies

**Last Updated:** January 2025  
**Status:** Implementation Guide

## Overview

This document provides detailed strategies for scaling Perplexity API usage while respecting the 300 searches/day hard limit. These strategies should be implemented before considering an upgrade.

---

## Strategy 1: Aggressive Caching

### Implementation

**Cache Consciousness Journey Analyses:**
- Cache results for similar consciousness level transitions
- Key: `consciousness-${currentLevel}-${desiredLevel}-${contextHash}`
- TTL: 30 days (consciousness journeys are relatively stable)

**Cache Proposal Research:**
- Cache industry/sector research results
- Key: `proposal-${industry}-${sector}-${keywordsHash}`
- TTL: 7 days (research may change over time)

**Storage Options:**
- **Supabase:** Use `perplexity_cache` table
- **Redis/Vercel KV:** Faster, but additional cost
- **In-Memory:** Fastest, but lost on restart

### Expected Savings
- **30-50% reduction** in Perplexity searches
- **Cost:** Minimal (storage only)
- **Complexity:** Low

### Code Example

```typescript
// Check cache before making Perplexity request
const cacheKey = `consciousness-${currentLevel}-${desiredLevel}-${hashContext(context)}`;
const cached = await getFromCache(cacheKey);

if (cached) {
  return cached;
}

// Make Perplexity request
const result = await makePerplexityRequest(...);
await setCache(cacheKey, result, { ttl: 30 * 24 * 60 * 60 }); // 30 days
return result;
```

---

## Strategy 2: Prompt Optimization

### Implementation

**Combine Multiple Queries:**
- Instead of 3 separate searches, combine into 1 comprehensive search
- Use structured prompts that request all needed information at once

**Reduce Follow-up Searches:**
- Make initial prompts more specific
- Request all needed data in first search
- Use output contracts to get structured data

### Expected Savings
- **20-40% reduction** in searches per operation
- **Cost:** Development time only
- **Complexity:** Medium

### Code Example

```typescript
// BEFORE: Multiple searches
const industryResearch = await perplexity.search("industry trends");
const competitorAnalysis = await perplexity.search("competitors");
const marketSize = await perplexity.search("market size");

// AFTER: Single comprehensive search
const comprehensiveResearch = await perplexity.search(`
  Provide comprehensive research on:
  1. Industry trends
  2. Competitor analysis
  3. Market size
  
  Return as structured JSON.
`);
```

---

## Strategy 3: Queue System

### Implementation

**Request Queue:**
- Queue Perplexity requests when approaching limit
- Process queue with rate limiting (e.g., 15 searches/hour)
- Return queued status to users

**Priority Levels:**
- **High:** Enterprise clients, critical operations
- **Medium:** Standard operations
- **Low:** Non-urgent operations

**Fair Distribution:**
- Distribute searches throughout the day
- Prevent early-day exhaustion
- Ensure capacity available for later requests

### Expected Benefits
- **Prevents exceeding daily limit**
- **Fair distribution** of searches
- **Better user experience** (queued vs. failed)

### Code Example

```typescript
// Check if request can be made immediately
const rateLimitCheck = await checkRateLimit(priority, operation);

if (!rateLimitCheck.allowed) {
  // Add to queue
  const { queueId, position } = await queueRequest(priority, operation, clientId);
  return { queued: true, queueId, position };
}

// Execute immediately
const result = await executeWithRateLimit(() => makePerplexityRequest(...));
return result;
```

---

## Strategy 4: Fallback to Claude API

### Implementation

**When to Use:**
- Perplexity limit reached or approaching
- Queue is full
- Non-critical operations

**Prompt Adaptation:**
- Adjust prompts for Claude API (may need different structure)
- Claude can provide similar research capabilities
- May require different output format

**Cost Comparison:**
- Compare Claude API costs vs. Perplexity upgrade
- May be more cost-effective for overflow

### Expected Benefits
- **No service interruption** when Perplexity limit reached
- **Flexible capacity** scaling
- **Cost optimization** (use cheaper option when appropriate)

### Code Example

```typescript
// Try Perplexity first
const canUsePerplexity = await canMakeRequest();

if (canUsePerplexity) {
  try {
    return await makePerplexityRequest(...);
  } catch (error) {
    // Fallback to Claude
    return await makeClaudeRequest(...);
  }
} else {
  // Use Claude directly
  return await makeClaudeRequest(...);
}
```

---

## Strategy 5: Client Prioritization

### Implementation

**Tier System:**
- **Enterprise:** Guaranteed access, higher priority
- **Pro:** Standard priority, may be queued
- **Basic:** Lower priority, may use fallback

**Daily Budget Allocation:**
- Enterprise: 50% of daily limit (150 searches)
- Pro: 30% of daily limit (90 searches)
- Basic: 20% of daily limit (60 searches)

**Use Case:**
- Only implement if consistently hitting limit
- Requires client tier tracking
- May need to communicate limits to clients

### Expected Benefits
- **Guaranteed service** for high-value clients
- **Fair resource allocation**
- **Revenue protection**

---

## Strategy 6: Reduce Perplexity Dependency

### Implementation

**Use Perplexity Only for:**
- Complex research requiring real-time data
- Industry-specific research
- Competitor analysis

**Use Alternatives for:**
- Simple queries → Claude API
- Cached data → Internal knowledge base
- Static content → Pre-generated content
- Common questions → FAQ/knowledge base

### Expected Savings
- **40-60% reduction** in Perplexity usage
- **Cost:** Development time
- **Complexity:** Medium-High

---

## Hybrid Approach (Recommended)

### Implementation Plan

**Phase 1: Quick Wins (Week 1)**
1. ✅ Implement caching for consciousness journeys (30-50% reduction)
2. ✅ Set up daily usage tracking and alerts
3. ✅ Implement basic rate limiting

**Phase 2: Optimization (Month 1)**
1. Optimize prompts to reduce searches per operation (20-40% reduction)
2. Implement queue system for fair distribution
3. Test fallback to Claude API

**Phase 3: Advanced (Month 2-3)**
1. Implement client prioritization (if needed)
2. Reduce Perplexity dependency where possible
3. Monitor and adjust strategies

### Expected Combined Savings
- **50-70% reduction** in Perplexity usage
- **Capacity Increase:** From ~300 searches/day to ~900-1,500 effective capacity
- **Cost:** Development time + minimal infrastructure

---

## Cost-Benefit Analysis

### Optimization Costs
- **Development Time:** 2-4 weeks
- **Infrastructure:** Minimal (caching storage)
- **Maintenance:** Low

### Upgrade Costs
- **Perplexity Higher Tier:** [Research required]
- **Additional Searches:** [Research required]
- **Monthly Cost:** [Research required]

### Recommendation
- **Start with optimization** (caching + rate limiting)
- **Monitor results** for 1-2 months
- **Evaluate upgrade** only if optimization insufficient
- **Hybrid approach** likely most cost-effective

---

## Implementation Checklist

### Immediate (Week 1)
- [x] Document current usage patterns
- [x] Create usage tracking utilities
- [x] Create rate limiting utilities
- [ ] Set up database table for usage tracking
- [ ] Implement daily usage tracking
- [ ] Set up alerts at 200, 250, 290 searches/day

### Short-term (Month 1)
- [ ] Implement caching for consciousness journeys
- [ ] Implement queue system
- [ ] Optimize prompts to reduce searches
- [ ] Test fallback to Claude API
- [ ] Create monitoring dashboard

### Long-term (Month 2-3)
- [ ] Evaluate optimization results
- [ ] Research Perplexity upgrade options
- [ ] Implement client prioritization (if needed)
- [ ] Reduce Perplexity dependency
- [ ] Document best practices

---

## Monitoring & Metrics

### Key Metrics
- Daily Perplexity usage
- Cache hit rate
- Queue length and wait times
- Fallback usage (Claude API)
- Cost per search
- Client satisfaction

### Alerts
- Warning at 200 searches (67%)
- Critical at 250 searches (83%)
- Emergency at 290 searches (97%)
- Limit exceeded (300+)

---

## Related Documentation

- [Perplexity Usage Analysis](./perplexity-usage-analysis.md) - Detailed usage analysis
- [Capacity Analysis](./capacity-analysis.md) - Overall capacity planning
- [Resource Usage Model](./resource-usage-model.md) - Per-client calculations

