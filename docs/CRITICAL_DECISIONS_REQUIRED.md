# Rocky Web Studio: 3 Critical Decisions Required
Choose Your Path Forward
Date: January 23, 2025
Status: Ready to Execute Once Decisions Made
Impact: Each decision affects next 9-10 weeks

## DECISION #1: Chatbot Route Architecture
**Context:** Project already has `/api/chat/webhook` - must decide how new AI chatbot fits

### Option A: REPLACE Existing System ❌ (High Risk)
```
Pros:
- Simplify: One chat system instead of two
- Cleaner codebase

Cons:
- Must migrate all existing chat history
- Could break production chat for users
- Requires thorough testing
- Time-consuming migration
- High risk of breaking existing feature
```

**Timeline impact:** +20-30 hours  
**Risk:** 🔴 HIGH (could break existing users)  
**Recommendation:** ❌ NOT recommended

### Option B: ENHANCE Existing Webhook ⚠️ (Medium Risk)
```
Route: /api/chat/webhook (add Claude integration)

Pros:
- Reuse existing infrastructure
- No new routes needed
- Could improve existing chat

Cons:
- Existing chat code might be complex
- Hard to integrate Claude into existing logic
- Unclear which system handles what
- Testing complex (two different systems)
- User confusion (some messages go to Claude, some don't?)
```

**Timeline impact:** +15-25 hours (audit existing code first)  
**Risk:** 🟠 MEDIUM (integration complexity)  
**Recommendation:** ⚠️ Only if existing chat system is simple and well-documented

### Option C: NEW ROUTE (Separate System) ✅ (Low Risk)
```
Route: /api/ai-assistant (dedicated AI endpoint)

Pros:
- No conflicts with existing chat
- Clear separation of concerns
- Easy to test independently
- Better for case study (shows expertise)
- Easier to feature flag and rollout
- Dedicated lead qualification tool (different from chat)

Cons:
- Two chat systems running (but with different purposes)
- Slight duplicate functionality

Architecture:
/api/chat/webhook          ← Existing chat (customer support)
/api/ai-assistant          ← NEW AI chatbot (lead qualification)
```

**Timeline impact:** 30-35 hours (realistic)  
**Risk:** 🟢 LOW (isolated system)  
**Recommendation:** ✅ STRONGLY RECOMMENDED

## DECISION #2: Case Studies Storage & Management
**Context:** Where should case study data live? (MAJOR architectural choice)

### Option A: SANITY.IO (Original Plan) ❌
```
Sanity.io Headless CMS

Pros:
- Purpose-built CMS
- Visual editing interface
- Good for showcase
- Industry standard

Cons:
- Another external service to maintain
- Another API integration
- Another set of API keys
- Cost: Free tier OK, but paid if scaling
- Team has to learn Sanity
- Duplicates data (Supabase has content too)
- More infrastructure to manage
- Migration complexity
```

**Cost:** $0 now, potential $20-50/mo later  
**Complexity:** 🔴 HIGH (new service)  
**Data fragmentation:** 🔴 HIGH (Sanity + Supabase separate)  
**Recommendation:** ❌ NOT recommended (for this project)

### Option B: SUPABASE + Custom Admin UI ✅ (Recommended)
```
PostgreSQL in Supabase + Next.js Admin UI

Pros:
- Leverage existing Supabase (already paying for it)
- Everything in one database
- No new services to manage
- Data lives with rest of app
- Easier integrations (same DB for payments, users, etc.)
- Faster implementation
- Custom admin UI fits existing pattern
- Lower maintenance burden

Cons:
- Have to build admin UI (not much code)
- No visual page builder (not needed for case studies)

Implementation:
- Create `case_studies` table in Supabase
- Build admin page in `/admin/case-studies`
- API routes: `/api/case-studies/[slug]`
- Frontend pages: `/case-studies/[slug]`
```

**Cost:** $0 (already have Supabase)  
**Complexity:** 🟢 LOW (simple database table)  
**Data fragmentation:** 🟢 NONE (everything in one place)  
**Timeline:** 25-30 hours  
**Recommendation:** ✅ STRONGLY RECOMMENDED

### Option C: HYBRID (Sanity + Supabase) ⚠️
```
Case studies in Supabase
Blog posts in Sanity (better for SEO)

Pros:
- Best of both worlds

Cons:
- More complex architecture
- Two systems to maintain
- Data fragmentation
- More integration points
- Not worth it for case studies
```

**Complexity:** 🔴 HIGH (two systems)  
**Recommendation:** ❌ Skip this

## DECISION #3: Pro Bono vs Existing Client Work
**Context:** How to get third-party validation for case study?

### Option A: TRUE PRO BONO (Original Plan) ⚠️
```
Find healthcare/non-profit client
Do accessibility work for FREE ($3K-8K value)
Get case study + testimonial

Pros:
- Real third-party client
- Strong credibility
- Looks good to government

Cons:
- 30-35 hours unpaid work
- Already busy with main platform
- Pro bono projects often have scope creep
- Non-profits can be difficult clients
- Time could go to paid work instead
```

**Time impact:** +30-35 hours unpaid  
**ROI:** 🟠 MEDIUM (credibility value is intangible)  
**Recommendation:** ⚠️ Only if you have extra capacity

### Option B: CONVERT EXISTING CLIENT ✅ (Recommended)
```
Use work you've already done for existing client
Write up their accessibility improvements
Get permission for case study
Document their results

Pros:
- No additional work needed (mostly done)
- Just documentation (8-12 hours)
- Already have metrics/results
- Already have client relationship
- More sustainable
- Client already values your work

Cons:
- Client needs permission (probably OK)
- Results may not be as dramatic
- Case study may be less detailed

Timeline:
- Interview existing client: 2 hours
- Document case study: 6-8 hours
- Get testimonial: 1-2 hours
- Total: 8-12 hours
```

**Time impact:** +8-12 hours (much better!)  
**ROI:** 🟢 HIGH (case study + testimonial + no pro bono)  
**Recommendation:** ✅ STRONGLY RECOMMENDED

### Option C: DISCOUNTED PILOT PROJECT
```
Find small business
Offer 50% discount ($2-3K instead of $5K+)
Get accessibility project + case study

Pros:
- Real new client
- Get paid (vs pro bono)
- Generate new revenue
- Good for portfolio

Cons:
- Still discounted (margin is lower)
- Takes 20-30 hours
- Client expectations on reduced budget
```

**Time impact:** +20-30 hours (paid but reduced rate)  
**ROI:** 🟠 MEDIUM (revenue + case study)  
**Recommendation:** ⚠️ Option if you want more clients, but Option B is faster

## DECISION MATRIX

| Decision | Option A | Option B | Option C | Recommended |
|----------|----------|----------|----------|-------------|
| Chatbot Route | Replace (High Risk) | Enhance (Medium Risk) | NEW Route (Low Risk) | Option C ✅ |
| CMS | Sanity.io (Complex) | Supabase (Simple) | Hybrid (Over-engineered) | Option B ✅ |
| Pro Bono | True Pro Bono (30h unpaid) | Existing Client (8-12h) | Discounted Pilot (20-30h) | Option B ✅ |

## RECOMMENDED DECISIONS (Summary)

### ✅ Use NEW AI Route
```
Route: /api/ai-assistant
Purpose: Lead qualification chatbot
Keeps existing chat system intact
Zero conflicts with existing features
Low risk, high confidence
Timeline: 30-35 hours
```

### ✅ Use SUPABASE for Case Studies
```
PostgreSQL in Supabase
Custom admin UI in Next.js
No new services to manage
Data unified with rest of app
Faster to implement
Timeline: 25-30 hours
Cost: $0 additional
```

### ✅ Convert EXISTING Client to Case Study
```
Use work already completed
Document their accessibility journey
Get client testimonial
Minimal additional work
Timeline: 8-12 hours
ROI: High (no pro bono cost)
```

## REVISED TIMELINE (With Recommended Decisions)

| Phase | Duration | Effort |
|-------|----------|--------|
| Week 0 | Setup & Audit | 10-15h |
| Week 1-2 | Accessibility (+testing) | 25-30h |
| Week 2-3 | AI Assistant (/api/ai-assistant) | 30-35h |
| Week 3-4 | Case Studies DB (Supabase) | 25-30h |
| Week 5-6 | Existing Client Docs | 8-12h |
| Week 7 | Government Prep | 10-15h |
| Week 8 | Submission & Buffer | 15-20h |
| **TOTAL** | **9-10 weeks** | **125-150h** |

**Difference from original:**
- Original: 95-115 hours, simple plan
- Recommended: 125-150 hours, realistic plan with integration testing
- Worth it: Far more reliable, fewer conflicts, better outcome

## CONFIRMATION NEEDED

Please confirm your decisions:

**Decision #1: Chatbot Architecture**
- [ ] Option A: Replace existing system
- [ ] Option B: Enhance existing webhook
- [ ] Option C: NEW `/api/ai-assistant` route ← RECOMMENDED

**Decision #2: Case Studies Storage**
- [ ] Option A: Sanity.io
- [ ] Option B: Supabase + Custom Admin ← RECOMMENDED
- [ ] Option C: Hybrid

**Decision #3: Pro Bono Strategy**
- [ ] Option A: True pro bono client
- [ ] Option B: Convert existing client ← RECOMMENDED
- [ ] Option C: Discounted pilot project

Once confirmed, the plan is 100% ready for execution.

**Next:** Week 0 begins with Cursor configuration + baseline audit

---
Created: January 23, 2025
Status: Awaiting 3 Key Decisions
Timeline to Execute: Confirmed → Week 0 Start (Jan 24)

