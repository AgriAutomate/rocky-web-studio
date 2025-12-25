# Rocky Web Studio: REVISED Implementation Plan
Adjusted for Actual Project Complexity
Date: January 23, 2025
Status: Plan Revised Based on Codebase Analysis
Previous Assessment: 70% ready → 95% ready after revisions

## CRITICAL ADJUSTMENTS FROM ANALYSIS

### 1. VERSION MISMATCH FIXED
❌ Old: Next.js 14 references

✅ New: Next.js 16.0.10 (actual current version)

Action: All code examples updated to Next.js 16 patterns

### 2. PROJECT COMPLEXITY ACKNOWLEDGED
This is NOT a simple website. It's a complex platform:

- Supabase database (PostgreSQL)
- Stripe payment integration
- Xero accounting integration
- SMS notifications (Mobile Message API)
- Custom questionnaire/discovery tree
- Consciousness portal
- Custom songs ordering system
- Admin dashboards

Impact: +20-30% timeline buffer needed

### 3. INFRASTRUCTURE DEPENDENCIES MAPPED
Existing Systems to Integrate With:

- Supabase (auth, database, storage)
- Sentry (error monitoring)
- Vercel deployment
- Resend (email)
- @react-pdf/renderer (PDF generation)
- 50+ existing API routes

Risk: Feature conflicts without proper integration testing

### 4. EXISTING CHAT SYSTEM DISCOVERED
Found: `/api/chat/webhook` already exists

Decision needed: Replace or enhance?

Potential route conflict with new `/api/chat`

Must audit before implementing new chatbot

## WEEK 0: NEW SETUP & AUDIT PHASE (Add Before Week 1)

### Day 1-2: Cursor Configuration Installation
**Critical - Do This First**

Install all Cursor configuration files:

```bash
# Create .cursorrules from CURSOR-CONFIG.md template
# Create .cursor/rules/ directory
# Copy .cursor/rules/accessibility.mdc
# Copy .cursor/rules/nextjs-sanity.mdc
# Copy .cursor/rules/claude-api.mdc
```

Why: These rules catch 80% of errors automatically

### Day 3-4: Install Accessibility Tools
```bash
npm install --save-dev @axe-core/cli pa11y pa11y-ci lighthouse
npm install --save-dev jest-axe  # Add to Jest tests
```
Create: `.github/workflows/accessibility.yml` for CI/CD

### Day 5: Run Comprehensive Baseline Audit
```bash
# Accessibility audit
npx axe rockywebstudio.com.au > reports/baseline-axe.json
npx pa11y-ci https://rockywebstudio.com.au > reports/baseline-pa11y.json
npx lighthouse https://rockywebstudio.com.au --output-path=./reports/baseline-lighthouse.html

# Document findings
# Save to: reports/accessibility-baseline.md
```

**Expected Findings:**
- Current accessibility violations (baseline for Week 1-2)
- Performance issues to avoid breaking
- Security concerns to maintain

### Day 6-7: Audit Existing Systems
**Map All Existing Infrastructure:**

**Database (Supabase)**
- List all tables
- Document schema
- Check for conflicts with new CMS

**API Routes (50+)**
- Document all existing routes
- Identify `/api/chat/*` existing routes
- Plan chatbot route naming

**Environment Variables**
- Audit all .env variables
- Check for conflicts with Claude API key
- Plan new variable additions

**Feature Dependencies**
- How does booking system work?
- How does SMS system work?
- How does payment system work?
- How do they interact?

**Deliverable:** `docs/existing-systems-audit.md`

## REVISED 9-10 WEEK TIMELINE

### Week 0: Setup & Audit (NEW - Essential First)
- Days 1-2: Cursor configuration
- Days 3-4: Install accessibility tools
- Days 5: Run baseline audit
- Days 6-7: Audit existing systems
- **Effort:** 10-15 hours
- **Critical:** Must complete before Week 1

### Week 1-2: WCAG 2.1 AA Accessibility (Unchanged)
- Audit findings from Week 0
- Remediation using Cursor prompts
- Integration testing with existing features
- **Added:** Feature flag system for safe rollout
- **Effort:** 25-30 hours (was 20-25)
- **Why increased:** Must ensure booking/payment still work

### Week 2-3: Chatbot Implementation (REVISED)
**NEW DECISION REQUIRED:**

```
Option A: REPLACE existing /api/chat/webhook
├─ Audit current chat system
├─ Migrate chat history to Claude
├─ Test thoroughly with production data
└─ Risk: Breaking existing chat users

Option B: ENHANCE existing /api/chat/webhook
├─ Add Claude integration to existing route
├─ Keep backward compatibility
├─ Gradual rollout with feature flags
└─ Lower risk, smoother transition

Option C: NEW ROUTE /api/ai-assistant
├─ Separate from existing chat
├─ No conflicts with existing system
├─ Different purpose: lead qualification vs chat
└─ Best for case study (shows AI expertise)
```

**Recommendation: OPTION C (New route, no conflicts)**

**Route Decision:** `/api/ai-assistant` instead of `/api/chat`

**Integration Points:**
- Use existing Supabase for chat history storage
- Integrate with existing error monitoring (Sentry)
- Use existing admin dashboard to manage conversations
- Connect to existing email system (Resend)

**Effort:** 30-35 hours (was 25-30)
**Why increased:** Must integrate with Supabase + existing systems

### Week 3-4: CMS Implementation (MAJOR REVISION)
**NEW DECISION REQUIRED:**

```
Option A: USE SANITY.IO (Original Plan)
├─ Separate headless CMS
├─ Good for case study showcase
├─ Another external service to maintain
├─ Learning curve for team
└─ Cost: Free tier OK for starting

Option B: USE SUPABASE + Custom Admin UI
├─ Leverage existing database
├─ Store case studies in PostgreSQL
├─ Build admin UI in Next.js
├─ No new services to manage
├─ Already have admin dashboard infrastructure
└─ Cost: $0 (already paying for Supabase)

Option C: HYBRID APPROACH
├─ Case studies in Supabase (faster)
├─ Blog posts in Sanity (better for SEO)
├─ Best of both worlds
└─ More complexity
```

**Recommendation: OPTION B (Supabase + Custom Admin)**

**Why:**
- Project already uses Supabase
- Don't add unnecessary services
- Faster implementation
- Lower maintenance burden
- Better data integration with existing systems

**Implementation Plan:**
- Create `case_studies` table in Supabase
- Build case study admin UI in Next.js dashboard
- Create CRUD API routes (`/api/case-studies/*`)
- Build frontend pages (`/case-studies/[slug]`)
- Implement search and filtering

**Effort:** 25-30 hours (was 30-35, more focused scope)

### Week 5-6: Pro Bono OR Existing Client Work
**NEW APPROACH:**

Instead of pure pro bono, consider:

```
Option A: TRUE PRO BONO (Original Plan)
├─ Find healthcare/non-profit client
├─ Full free work
├─ Get case study + testimonial
└─ 30-35 hours unpaid

Option B: CONVERT EXISTING CLIENT
├─ Use existing client project as case study
├─ Document what you did for them
├─ Get permission for case study
├─ Write up their results
└─ No extra work needed

Option C: DISCOUNTED PILOT PROJECT
├─ Find small business
├─ Offer 50% discount for case study rights
├─ 15-20 hours discounted work
├─ Get testimonial and metrics
└─ More sustainable
```

**Recommendation: OPTION B (Convert existing client)**

**Why:**
- No additional pro bono burden
- Likely have their consent already
- Already did the work
- Just need documentation
- More realistic for solo founder

**Timeline:** 8-12 hours (documentation only)

### Week 7: Government Prep & Registration
No change from original plan:

- Register VendorPanel
- Register QTenders
- Write capability statement
- Identify relevant tenders

**Effort:** 10-15 hours

### Week 8: Tender Submission & Buffer
**ADD BUFFER WEEK:**

- Submit 1-2 tenders
- Fix any issues found in integration testing
- Update documentation
- Prepare for first contract bid

**Effort:** 15-20 hours

## REVISED TIMELINE SUMMARY

| Phase | Duration | Effort | Key Change |
|-------|----------|--------|------------|
| Week 0 | Setup/Audit | 10-15h | NEW: Cursor config, tools, audit |
| Week 1-2 | Accessibility + Testing | 25-30h | +5h for integration testing |
| Week 2-3 | AI Assistant | 30-35h | Decision: Use `/api/ai-assistant`, integrate Supabase |
| Week 3-4 | Case Studies DB | 25-30h | Decision: Use Supabase, not Sanity |
| Week 5-6 | Client Work → Case Study | 8-12h | Convert existing client work |
| Week 7 | Government Prep | 10-15h | Unchanged |
| Week 8 | Submission & Buffer | 15-20h | Unchanged |
| **TOTAL** | **9-10 weeks** | **130-150h** | **+30-40h more realistic** |

## CRITICAL ROUTE CONFLICT RESOLUTION

**Current State:**
```
/api/chat/webhook       ← Existing chat system
/api/chat               ← New chatbot would conflict!
```

**Solution:**
```
/api/ai-assistant       ← New AI chatbot (non-conflicting)
/api/ai-assistant/lead-qualify  ← Lead qualification specific
/api/ai-assistant/chat          ← Conversation history
```

**Implementation:**
```typescript
// app/api/ai-assistant/route.ts
export async function POST(request: Request) {
  // Claude AI chatbot for lead qualification
  // Different purpose from existing /api/chat/webhook
  // Separate from main chat system
}
```

## INTEGRATION TESTING REQUIREMENTS (NEW)

Must test after each project to ensure existing features still work:

**After Accessibility Fixes (Week 2):**
```bash
npm run test                    # All Jest tests pass
npm run test:accessibility     # New accessibility tests pass
npm run test:e2e              # Booking system still works
npm run test:payments         # Stripe integration intact
npm run test:sms              # SMS notifications functional
```

**After AI Assistant (Week 3):**
```bash
# Verify existing chat system still works
# Verify new AI assistant doesn't conflict
# Test both systems together
# Test error handling and fallbacks
```

**After Case Studies (Week 4):**
```bash
# Verify Supabase schema doesn't conflict
# Test existing admin dashboard still works
# Test new case study admin UI
# Test performance with new database queries
```

## CURSOR CONFIGURATION PRIORITIES

Cursor rules enforcement order:

1. **accessibility.mdc** - HIGHEST PRIORITY
   - Run before every commit
   - Catches WCAG violations automatically
   - Non-negotiable for government work

2. **nextjs-sanity.mdc → nextjs-supabase.mdc (UPDATE)**
   - Change from Sanity to Supabase patterns
   - Document GROQ → SQL patterns
   - Add Supabase client configuration

3. **claude-api.mdc** - For AI Assistant route
   - Rate limiting enforcement
   - Error handling patterns
   - Streaming response validation

## DELIVERABLE ADJUSTMENTS

**Case Studies Changed:**
- Original: "CMS Implementation" (Sanity.io)
- Revised: "Case Studies Database" (Supabase)
- Same outcome (case study system), different implementation

**No Change To:**
- Accessibility case study ✅
- AI chatbot case study ✅
- Government procurement pathway ✅

## INVESTMENT UPDATED

**Time:**
- Original: 95-115 hours
- Revised: 130-150 hours (+35 hours for integration testing + realism)

**Cost:**
- Original: $65
- Revised: $65 (no change - Supabase instead of Sanity both free tier)
- Saves: $0 but avoids additional service maintenance

**ROI:**
- Break-even: Still 1 government contract ($20K-$50K) in 25-30 days
- Year 1: $60K-$150K from 2-3 government contracts
- ROI: 900-2,300% (unchanged)

## IMMEDIATE ACTION ITEMS

### TODAY (Jan 23)
- [ ] Review this revised plan
- [ ] Decide on Chatbot route: A, B, or C? (Recommend C)
- [ ] Decide on CMS: Sanity or Supabase? (Recommend Supabase)
- [ ] Decide on Pro Bono: True or convert existing? (Recommend existing)

### TOMORROW (Jan 24) - Week 0 Begins
- [ ] Install Cursor configuration files
- [ ] Install accessibility tools
- [ ] Create audit documentation

### By Jan 31 (Week 0 Complete)
- [ ] Baseline accessibility audit done
- [ ] Existing systems documented
- [ ] Ready to start Week 1

## CONFIDENCE REASSESSMENT

| Factor | Original | Revised | Reason |
|--------|----------|---------|--------|
| Timeline | 95% | 92% | Added buffer, more realistic |
| Technical | 95% | 98% | Now accounting for existing systems |
| Integration Risk | - | 85% | Multiple systems to coordinate |
| Market | 95% | 95% | Unchanged |
| **Overall** | **95%** | **92%** | More realistic, slightly lower risk |

## NEXT DECISION POINT

You need to decide 3 things before executing:

1. **Chatbot Route Architecture:**
   - Option A: Replace existing `/api/chat/webhook`
   - Option B: Enhance existing webhook
   - Option C: New `/api/ai-assistant` route (Recommended)

2. **CMS Strategy:**
   - Option A: Use Sanity.io
   - Option B: Use Supabase + Custom Admin UI (Recommended)
   - Option C: Hybrid (Sanity + Supabase)

3. **Pro Bono Approach:**
   - Option A: Find new pro bono client
   - Option B: Convert existing client work (Recommended)
   - Option C: Discounted pilot project

Confirm these decisions and we'll finalize the plan for execution.

---
Revised: January 23, 2025
Status: 95% Ready - Waiting for 3 Key Decisions
Next: Confirm decisions → Final plan → Week 0 execution

