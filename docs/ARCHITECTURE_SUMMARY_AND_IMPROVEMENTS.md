# Architecture Summary & Next Improvements

## Current Architecture: Intake → Discovery → Audit Flow

### Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT INTAKE FLOW                           │
└─────────────────────────────────────────────────────────────────┘

1. Questionnaire Submission
   ├─ POST /api/questionnaire/submit
   ├─ Validates form data
   ├─ Saves to questionnaire_responses table:
   │   ├─ Basic fields (name, email, sector, etc.)
   │   ├─ sector_specific_data (JSONB)
   │   ├─ goals (JSONB array)
   │   ├─ primary_offers (JSONB array)
   │   └─ website_url (TEXT) ← from q2 field
   ├─ Generates PDF report
   ├─ Sends email with PDF
   └─ Triggers audit (fire-and-forget):
       └─ POST /api/audit-website (202 Accepted)
           └─ Runs async in background
               └─ Saves to audit_results (JSONB)

2. Discovery Page Load
   ├─ GET /discovery/[id]
   ├─ Fetches discovery data:
   │   └─ GET /api/discovery-tree?questionnaireResponseId=...
   │       ├─ Returns: client, businessProfile, currentStack, goals, primaryOffers, discoveryTree
   │       └─ currentStack derived from sector_specific_data
   └─ Fetches audit data (separate):
       └─ GET /api/audit-website?questionnaireResponseId=...
           ├─ Returns: audit (if completed) or error/404
           └─ Passed to AuditCard component

3. Discovery Tree Form
   ├─ Pre-populated from GET /api/discovery-tree
   ├─ User fills out:
   │   ├─ Trunk (integrations, data migration, success metrics)
   │   ├─ Branches (sector-specific questions)
   │   └─ Priorities (must-have, nice-to-have, future)
   └─ Saves via POST /api/discovery-tree
       └─ Merges into discovery_tree (JSONB)

4. Audit Processing (Async)
   ├─ Runs in background after questionnaire submission
   ├─ Fetches website HTML
   ├─ Detects tech stack (CMS, analytics, payment processors)
   ├─ Calls PageSpeed API for performance metrics
   ├─ Analyzes SEO, metadata, content
   └─ Saves complete results to audit_results (JSONB)
```

### Data Flow Diagram

```
questionnaire_responses table:
├─ id (BIGSERIAL)
├─ first_name, last_name, business_name, sector
├─ website_url (TEXT) ← from q2
├─ sector_specific_data (JSONB) ← sector-specific answers
├─ goals (JSONB) ← selected goals
├─ primary_offers (JSONB) ← selected offers
├─ business_profile (JSONB) ← business profile data
├─ discovery_tree (JSONB) ← discovery form data
├─ audit_results (JSONB) ← audit data (async)
├─ audit_completed_at (TIMESTAMP)
└─ audit_error (TEXT)
```

### Current Integration Points

**1. Questionnaire → Audit**
- ✅ Triggered automatically if `website_url` provided
- ✅ Fire-and-forget (non-blocking)
- ✅ Saves to `audit_results` JSONB

**2. Discovery → Audit**
- ✅ Fetched separately on discovery page load
- ✅ Displayed in `AuditCard` component
- ⚠️ Not yet merged into `currentStack`
- ⚠️ Not yet pre-populating trunk integrations

**3. Discovery Tree API**
- ✅ GET: Pre-populates form from questionnaire data
- ✅ POST: Saves/merges discovery tree updates
- ⚠️ `deriveCurrentStack()` only uses `sector_specific_data`
- ⚠️ Does not yet use `audit_results`

---

## Top 2 Improvements (High Leverage, Low Risk)

### Improvement 1: Merge Audit Tech Stack into CurrentStack

**Goal:** Enrich `currentStack` with audit-detected technologies so it feels native, not bolted on.

**Current State:**
- `currentStack` derived only from `sector_specific_data` (regex extraction)
- Audit tech stack stored separately in `audit_results.techStack`
- Displayed separately in `AuditCard`

**Proposed Change:**
- Merge `audit_results.techStack` into `currentStack` in GET `/api/discovery-tree`
- Apply conflict resolution (sector data precedence, audit data complements)
- Track sources (optional `sources` field)

**Files to Change:**

1. **`app/api/discovery-tree/route.ts`**
   - Update `deriveCurrentStack()` function signature
   - Add `auditResults?: WebsiteAuditResult | null` parameter
   - Merge audit tech stack data:
     - `cms.name` → `systems[]` (if confidence ≥ "medium")
     - `ecommerce.name` → `systems[]` (if confidence ≥ "medium")
     - `paymentProcessors[].name` → `integrations[]`
     - `analytics[].name` → `integrations[]`
   - Update GET handler SELECT query to include `audit_results`
   - Pass `audit_results` to `deriveCurrentStack()`

2. **`lib/types/discovery.ts`**
   - Update `DiscoveryTreePrePopulateResponse.currentStack` type:
     ```typescript
     currentStack: {
       systems?: string[];
       integrations?: string[];
       notes?: string;
       sources?: {
         systems?: ("sector" | "audit")[];
         integrations?: ("sector" | "audit")[];
       };
     }
     ```

3. **`components/discovery/SummarySidebar.tsx`** (Optional)
   - Show "Detected" badge for audit-sourced items (if `sources` present)

**Data Touched:**
- `audit_results.techStack` (read)
- `sector_specific_data` (read)
- `currentStack` in API response (computed)

**Risks & Breaking Changes:**
- ⚠️ **Low Risk:** Adding optional `sources` field is backward compatible
- ⚠️ **No Breaking Changes:** Existing UI continues to work (arrays still strings)
- ✅ **Safe:** Merge logic preserves sector data precedence
- ✅ **Testable:** Can test with/without audit data

**Estimated Effort:** ~2-3 hours

**Benefits:**
- ✅ Native integration (audit feels part of discovery)
- ✅ Richer data (more complete tech stack picture)
- ✅ Better UX (one source of truth for current stack)

---

### Improvement 2: Pre-populate Trunk Integrations from Audit

**Goal:** Reduce manual input by auto-populating integrations detected from audit.

**Current State:**
- Trunk integrations manually entered by user
- Audit detects payment processors, analytics, CMS
- No connection between audit and trunk integrations

**Proposed Change:**
- Derive `IntegrationRequirement[]` from `audit_results.techStack`
- Merge with existing user-defined integrations (preserve user edits)
- Pre-populate `discoveryTree.trunk.integrations` in GET `/api/discovery-tree`

**Files to Change:**

1. **`app/api/discovery-tree/route.ts`**
   - Create `deriveIntegrationsFromAudit()` function:
     ```typescript
     function deriveIntegrationsFromAudit(
       auditResults?: WebsiteAuditResult | null
     ): IntegrationRequirement[] {
       // Map audit tech stack to IntegrationRequirement[]
       // - paymentProcessors → { systemType: "payment", ... }
       // - analytics → { systemType: "analytics", ... }
       // - cms → { systemType: "cms", ... }
     }
     ```
   - Create `mergeIntegrations()` helper:
     ```typescript
     function mergeIntegrations(
       existing: IntegrationRequirement[] | undefined,
       auditDerived: IntegrationRequirement[]
     ): IntegrationRequirement[] {
       // Smart merge: preserve user edits, add new audit findings
       // Deduplicate by systemName
     }
     ```
   - Update GET handler to:
     - Call `deriveIntegrationsFromAudit(audit_results)`
     - Merge with existing `discoveryTree.trunk.integrations`
     - Return merged result in pre-populate response

2. **`lib/types/discovery.ts`** (No changes needed)
   - `IntegrationRequirement` type already supports this

3. **`components/discovery/TrunkSection.tsx`** (No changes needed)
   - Already handles `IntegrationRequirement[]` correctly

**Data Touched:**
- `audit_results.techStack` (read)
- `discovery_tree.trunk.integrations` (read, merge, return)
- Pre-populate response (computed)

**Risks & Breaking Changes:**
- ⚠️ **Low Risk:** Merge preserves user edits (no overwrite)
- ⚠️ **No Breaking Changes:** Existing integrations preserved
- ✅ **Safe:** Only adds new integrations, doesn't remove existing
- ✅ **Testable:** Can test merge scenarios

**Estimated Effort:** ~2-3 hours

**Benefits:**
- ✅ Reduced manual input (auto-populate detected integrations)
- ✅ Increased accuracy (audit detects what user might forget)
- ✅ Better UX (less typing, more complete data)

---

## Comparison: Improvement Priority

| Aspect | Improvement 1 (Tech Stack Merge) | Improvement 2 (Integrations Pre-pop) |
|--------|--------------------------------|-------------------------------------|
| **Complexity** | Medium (merge logic) | Medium (mapping + merge) |
| **Risk** | Low (backward compatible) | Low (preserves user edits) |
| **Impact** | High (native integration) | High (reduced manual work) |
| **Effort** | 2-3 hours | 2-3 hours |
| **Dependencies** | None | None |
| **Breaking Changes** | None | None |

**Recommendation:** Implement both (can be done in parallel or sequentially)

---

## Implementation Order

### Option A: Sequential (Recommended)

1. **Week 1: Tech Stack Merge**
   - Implement `deriveCurrentStack()` enhancement
   - Update types
   - Test merge scenarios
   - Deploy

2. **Week 2: Integrations Pre-population**
   - Implement `deriveIntegrationsFromAudit()`
   - Implement `mergeIntegrations()`
   - Test merge scenarios
   - Deploy

**Rationale:** Sequential allows testing each improvement independently.

### Option B: Parallel

1. **Same Week: Both Improvements**
   - Implement both in separate branches
   - Test independently
   - Merge and test together
   - Deploy

**Rationale:** Faster delivery, but requires coordination.

---

## Testing Checklist

### Improvement 1: Tech Stack Merge

- [ ] Test with audit data only (no sector data)
- [ ] Test with sector data only (no audit)
- [ ] Test with both (merge scenario)
- [ ] Test conflict resolution (sector precedence)
- [ ] Test confidence filtering (only high/medium)
- [ ] Test UI displays merged data correctly
- [ ] Test backward compatibility (no audit data)

### Improvement 2: Integrations Pre-population

- [ ] Test with audit data only (no existing integrations)
- [ ] Test with existing integrations only (no audit)
- [ ] Test merge (preserve user edits, add audit findings)
- [ ] Test deduplication (same systemName)
- [ ] Test mapping (payment processors → payment type)
- [ ] Test UI displays pre-populated integrations
- [ ] Test user can edit/remove pre-populated items

---

## Future Enhancements (Not in Top 2)

### Enhancement 3: Overall Health Score

**Goal:** Add simple health score to sidebar for quick assessment.

**Implementation:**
- Calculate score from `audit_results` (performance, SEO, tech stack)
- Display in `SummarySidebar` or `AuditCard`
- Simple 0-100 score

**Effort:** ~1-2 hours

**Priority:** Lower (nice-to-have, less critical than merging data)

---

## Summary

### Current Architecture ✅

- **Intake:** Questionnaire → saves data → triggers audit async
- **Discovery:** Loads questionnaire + audit data → displays separately
- **Audit:** Runs async → saves to JSONB
- **Integration:** Audit displayed but not merged into discovery data

### Top 2 Improvements 🎯

1. **Merge Tech Stack into CurrentStack** (2-3 hours)
   - Files: `app/api/discovery-tree/route.ts`, `lib/types/discovery.ts`
   - Data: `audit_results.techStack` → `currentStack`
   - Risk: Low (backward compatible)

2. **Pre-populate Trunk Integrations** (2-3 hours)
   - Files: `app/api/discovery-tree/route.ts`
   - Data: `audit_results.techStack` → `discoveryTree.trunk.integrations`
   - Risk: Low (preserves user edits)

**Total Estimated Effort:** ~4-6 hours for both improvements

**Recommendation:** Implement sequentially, test thoroughly, deploy incrementally.
