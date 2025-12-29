# Optimization Checklist

**Last Updated:** January 29, 2025  
**Purpose:** Checklist of optimizations to try before scaling up

## Overview

Before upgrading plans, always try optimizations first. This checklist provides actionable items to reduce resource usage and increase effective capacity.

---

## Perplexity Optimizations (Priority: HIGH)

### ✅ Completed
- [x] Daily usage tracking implemented
- [x] Rate limiting implemented
- [x] Alerts configured (200, 250, 290 searches/day)

### ⚠️ To Implement

#### Caching (Expected: 30-50% reduction)
- [ ] Implement caching for consciousness journey analyses
- [ ] Cache key: `consciousness-${currentLevel}-${desiredLevel}-${contextHash}`
- [ ] Cache TTL: 30 days
- [ ] Storage: Supabase or Redis
- [ ] Expected savings: 30-50% reduction in searches

#### Prompt Optimization (Expected: 20-40% reduction)
- [ ] Combine multiple queries into single search
- [ ] Make prompts more specific to reduce follow-ups
- [ ] Use structured output contracts
- [ ] Expected savings: 20-40% reduction per operation

#### Queue System (Expected: Fair distribution)
- [ ] Implement request queue for Perplexity
- [ ] Priority levels: High, Medium, Low
- [ ] Rate limiting: Max 15 searches/hour
- [ ] Expected benefit: Prevents exceeding daily limit

#### Fallback to Claude (Expected: No service interruption)
- [ ] Monitor Perplexity usage
- [ ] Route to Claude API when limit approached
- [ ] Adjust prompts for Claude API
- [ ] Expected benefit: No service interruption

**Combined Expected Savings:** 50-70% reduction in Perplexity searches

---

## Vercel Optimizations

### Image Optimization
- [ ] Ensure all images use Next.js Image component
- [ ] Use WebP/AVIF formats where possible
- [ ] Implement lazy loading
- [ ] Expected savings: 20-30% bandwidth reduction

### Caching
- [ ] Configure cache headers for API responses
- [ ] Use ISR (Incremental Static Regeneration) for dynamic content
- [ ] Implement edge caching strategies
- [ ] Expected savings: 30-50% bandwidth reduction

### Code Optimization
- [ ] Monitor bundle sizes with `@next/bundle-analyzer`
- [ ] Remove unused dependencies
- [ ] Use dynamic imports for heavy libraries
- [ ] Expected savings: 10-20% bandwidth reduction

### Build Optimization
- [ ] Optimize build process
- [ ] Reduce build frequency
- [ ] Use build caching
- [ ] Expected savings: Reduced build minutes

**Combined Expected Savings:** 40-60% bandwidth reduction

---

## Supabase Optimizations

### Database Optimization
- [ ] Optimize database queries
- [ ] Add indexes for common queries
- [ ] Use database functions for complex operations
- [ ] Expected savings: Reduced API requests

### Storage Optimization
- [ ] Compress stored files
- [ ] Archive old data
- [ ] Clean up unused files
- [ ] Expected savings: Reduced storage usage

### API Optimization
- [ ] Implement query result caching
- [ ] Use prepared statements
- [ ] Batch operations where possible
- [ ] Expected savings: Reduced API requests

### Data Retention
- [ ] Archive old questionnaire responses
- [ ] Archive old PDFs/documents
- [ ] Archive old audit data
- [ ] Expected savings: Reduced database size

**Combined Expected Savings:** 30-50% resource reduction

---

## Anthropic API Optimizations

### Prompt Optimization
- [ ] Optimize prompts to reduce token usage
- [ ] Use appropriate model for task (Haiku for simple, Sonnet for complex)
- [ ] Batch requests where possible
- [ ] Expected savings: 20-30% token reduction

### Caching
- [ ] Cache API responses for similar requests
- [ ] Reuse responses where appropriate
- [ ] Expected savings: 30-50% API call reduction

### Model Selection
- [ ] Use Haiku for simple tasks (lower cost)
- [ ] Use Sonnet for complex tasks (better quality)
- [ ] Use Opus only when necessary (highest cost)
- [ ] Expected savings: 40-60% cost reduction

**Combined Expected Savings:** 50-70% cost reduction

---

## General Optimizations

### Code Optimization
- [ ] Remove unused dependencies
- [ ] Optimize bundle sizes
- [ ] Use code splitting
- [ ] Lazy load components

### Performance Optimization
- [ ] Optimize database queries
- [ ] Implement caching strategies
- [ ] Use CDN for static assets
- [ ] Optimize API responses

### Cost Optimization
- [ ] Review all subscriptions quarterly
- [ ] Identify unused services
- [ ] Optimize high-cost operations
- [ ] Monitor usage trends

---

## Implementation Priority

### Week 1 (High Priority)
1. ✅ Perplexity daily tracking (Done)
2. ⚠️ Perplexity caching (Implement)
3. ⚠️ Perplexity rate limiting (Done, verify)

### Month 1 (Medium Priority)
1. Perplexity prompt optimization
2. Perplexity queue system
3. Vercel image optimization
4. Supabase query optimization

### Month 2-3 (Lower Priority)
1. Perplexity fallback to Claude
2. Vercel caching strategies
3. Supabase data retention
4. Anthropic API optimizations

---

## Success Metrics

### Perplexity
- **Target:** 50-70% reduction in searches
- **Measure:** Daily usage tracking
- **Baseline:** Current daily usage
- **Goal:** Stay under 200 searches/day (67% utilization)

### Vercel
- **Target:** 40-60% bandwidth reduction
- **Measure:** Monthly bandwidth usage
- **Baseline:** 23.07 GB/month
- **Goal:** Stay under 80 GB/month (80% utilization)

### Supabase
- **Target:** 30-50% resource reduction
- **Measure:** Database size, API requests
- **Baseline:** 54.97 MB database
- **Goal:** Stay under 400 MB (80% utilization)

### Anthropic
- **Target:** 50-70% cost reduction
- **Measure:** Monthly API costs
- **Baseline:** $0.02/month
- **Goal:** Maintain low costs

---

## Review Schedule

### Weekly
- Review optimization progress
- Check if targets are being met
- Adjust strategies as needed

### Monthly
- Measure optimization effectiveness
- Calculate actual savings
- Update baseline metrics

### Quarterly
- Comprehensive optimization review
- Identify new optimization opportunities
- Evaluate upgrade needs

---

## Related Documentation

- [Scaling Strategies](./scaling-strategies.md) - Comprehensive scaling options
- [Perplexity Scaling Strategies](./perplexity-scaling-strategies.md) - Perplexity-specific optimizations
- [Capacity Analysis](./capacity-analysis.md) - Current capacity status
- [Scaling Thresholds](./scaling-thresholds.md) - When to scale decision matrix

