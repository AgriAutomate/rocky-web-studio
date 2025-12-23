# Architecture Summary & Next Improvements - Executive Summary

## Current Architecture Flow

```
1. Questionnaire Submission
   POST /api/questionnaire/submit
   ├─ Saves: sector_specific_data, goals, primary_offers, website_url
   └─ Triggers: POST /api/audit-website (fire-and-forget)

2. Discovery Page Load
   GET /discovery/[id]
   ├─ Fetches: GET /api/discovery-tree (client, currentStack, discoveryTree)
   └─ Fetches: GET /api/audit-website (audit results)

3. Discovery Form
   ├─ Pre-populated from questionnaire data
   └─ Saves: POST /api/discovery-tree → discovery_tree (JSONB)

4. Audit (Async)
   └─ Saves: audit_results (JSONB) with tech stack, performance, SEO
```

**Current Gap:** Audit data displayed separately, not merged into discovery data.

---

## Top 2 Improvements

### Improvement 1: Merge Audit Tech Stack into CurrentStack

**What:** Enrich `currentStack` with audit-detected technologies.

**Files:**
- `app/api/discovery-tree/route.ts` - Update `deriveCurrentStack()` to accept `auditResults`
- `lib/types/discovery.ts` - Add optional `sources` field to `currentStack`

**Data:**
- Reads: `audit_results.techStack`, `sector_specific_data`
- Computes: Merged `currentStack` with sources

**Risk:** ✅ Low - Backward compatible, optional `sources` field

**Effort:** 2-3 hours

---

### Improvement 2: Pre-populate Trunk Integrations from Audit

**What:** Auto-populate integrations detected from audit.

**Files:**
- `app/api/discovery-tree/route.ts` - Add `deriveIntegrationsFromAudit()` and `mergeIntegrations()`

**Data:**
- Reads: `audit_results.techStack`, `discovery_tree.trunk.integrations`
- Computes: Merged integrations array

**Risk:** ✅ Low - Preserves user edits, only adds new findings

**Effort:** 2-3 hours

---

## Implementation Plan

**Sequential (Recommended):**
1. Week 1: Tech Stack Merge → Test → Deploy
2. Week 2: Integrations Pre-pop → Test → Deploy

**Total Effort:** 4-6 hours

**Benefits:**
- ✅ Native integration (audit feels part of discovery)
- ✅ Reduced manual input
- ✅ Richer, more complete data
