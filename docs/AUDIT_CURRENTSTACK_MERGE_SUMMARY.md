# Audit Tech Stack Merge - Executive Summary

## Current State

**`deriveCurrentStack()` Function:**
- Location: `app/api/discovery-tree/route.ts` (lines 28-81)
- Input: `sectorSpecificData` (JSONB) + `sector` (Sector type)
- Output: `{ systems?: string[]; integrations?: string[]; notes?: string }`
- Current behavior: Extracts system names from sector-specific text fields using regex

**Current Type:**
```typescript
currentStack: {
  systems?: string[];
  integrations?: string[];
  notes?: string;
}
```

## Proposed Merge Strategy

### Fields to Merge from Audit

**Systems Array:**
- ✅ `cms.name` → Add to `systems` (if confidence ≥ "medium")
- ✅ `ecommerce.name` → Add to `systems` (if confidence ≥ "medium")
- ❌ Skip `hosting.name` (too technical, less relevant)
- ❌ Skip `frameworks[].name` (too technical, less relevant)

**Integrations Array:**
- ✅ `paymentProcessors[].name` → Add to `integrations` (all confidence levels)
- ✅ `analytics[].name` → Add to `integrations` (all confidence levels)

**Notes:**
- ✅ Append: "Detected via site analysis: [technologies]"

### Conflict Resolution Rules

1. **Sector Data Takes Precedence**
   - If client explicitly stated a system, prefer that over audit detection
   - Rationale: Client knows their own systems better

2. **Audit Data Complements**
   - If sector data is missing, use audit data to fill gaps
   - Rationale: Audit fills in what client didn't mention

3. **Merge Arrays (Combine Unique Values)**
   - Sector: `["Square", "ResDiary"]`
   - Audit: `["WordPress", "Stripe"]`
   - Result: `["Square", "ResDiary", "WordPress", "Stripe"]`
   - Rationale: Both sources are valid, combine them

4. **Confidence Filtering**
   - Only include audit systems with `confidence: "high"` or `"medium"`
   - Filter out `confidence: "low"` unless no other data exists
   - Rationale: Avoid false positives

### Source Tracking (Optional)

**Proposed Structure:**
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

**Rationale:**
- ✅ Backward compatible (sources is optional)
- ✅ Simple to implement and consume
- ✅ UI can show "Detected" badge if needed
- ✅ Can enhance later if needed

## Type Changes Needed

### Minimal Change (Recommended)

**Update `DiscoveryTreePrePopulateResponse.currentStack`:**
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

**Benefits:**
- ✅ Backward compatible
- ✅ Simple to implement
- ✅ Easy to consume in UI
- ✅ No breaking changes

## Implementation Steps

1. **Update `deriveCurrentStack()` function:**
   - Add `auditResults?: WebsiteAuditResult | null` parameter
   - Extract tech stack from audit
   - Merge with sector-derived data
   - Track sources

2. **Update GET handler:**
   - Add `audit_results` to SELECT query
   - Pass `audit_results` to `deriveCurrentStack()`

3. **Update type definition:**
   - Add optional `sources` object to `currentStack`

4. **Update UI (optional):**
   - Show "Detected" badge for audit-sourced items

## Example Outputs

### Scenario 1: Sector Only
```typescript
{
  systems: ["square", "resdiary"],
  integrations: [],
  notes: "Using Square POS and ResDiary",
  sources: { systems: ["sector", "sector"] }
}
```

### Scenario 2: Audit Only
```typescript
{
  systems: ["shopify"],
  integrations: ["stripe"],
  notes: "Detected via site analysis: Shopify, Stripe",
  sources: { systems: ["audit"], integrations: ["audit"] }
}
```

### Scenario 3: Merged
```typescript
{
  systems: ["square", "wordpress"],
  integrations: ["stripe"],
  notes: "Using Square POS | Detected via site analysis: WordPress, Stripe",
  sources: { systems: ["sector", "audit"], integrations: ["audit"] }
}
```

## Key Decisions

### ✅ What to Include
- CMS and ecommerce platforms → `systems`
- Payment processors and analytics → `integrations`
- High/medium confidence detections only

### ❌ What to Skip
- Hosting/CDN (too technical)
- Frameworks (too technical)
- Low confidence detections (unless no other data)

### 🎯 Precedence
- Sector data > Audit data (if conflict)
- Merge unique values (no conflict)
- Audit fills gaps (complementary)

## Benefits

1. **Native Integration:** Audit feels part of discovery, not bolted on
2. **Richer Data:** More complete picture of client's tech stack
3. **Backward Compatible:** Existing UI continues to work
4. **Future-Proof:** Can enhance source tracking later
5. **Simple:** Minimal type changes, easy to maintain

## Next Steps

1. ✅ Review proposal (this document)
2. ⏳ Implement `deriveCurrentStack()` enhancement
3. ⏳ Update GET handler to fetch `audit_results`
4. ⏳ Update type definition
5. ⏳ Test merge scenarios
6. ⏳ Optional: Update UI to show source badges
