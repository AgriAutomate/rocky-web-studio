# Smart Merge: Audit → discoveryTree.trunk.integrations - Refined Design

## Current Implementation Analysis

### IntegrationRequirement Type

**Location:** `lib/types/discovery.ts` (lines 39-45)

```typescript
export interface IntegrationRequirement {
  systemName: string;
  systemType: "crm" | "pos" | "accounting" | "payment" | "booking" | "inventory" | "other";
  integrationType: "api" | "webhook" | "export" | "manual" | "unknown";
  priority: "critical" | "important" | "nice-to-have";
  notes?: string;
}
```

**Key Fields:**
- `systemName` - Used for deduplication (case-sensitive in current code)
- `notes` - Can be used to tag audit-derived entries

---

### Current UI Behavior

**Location:** `components/discovery/TrunkSection.tsx` (lines 64-83)

**Key Observations:**

1. **Checkbox-based selection** from predefined `INTEGRATION_OPTIONS`
2. **Preserves existing data** when updating:
   ```typescript
   const existing = trunk?.integrations?.find((i) => i.systemName === val);
   return existing || { /* new default */ };
   ```
3. **Deduplication:** Uses exact `systemName` match (case-sensitive)
4. **Default values:** `integrationType: "unknown"`, `priority: "important"`

**Current Merge Logic:**
- When checkbox checked → Finds existing by `systemName`
- If exists → Uses existing (preserves user edits)
- If not exists → Creates new with defaults

**Issue:** Current deduplication is case-sensitive (`i.systemName === val`)

---

### Current API Merge Behavior

**Location:** `app/api/discovery-tree/route.ts` (line 211)

**Current Code:**
```typescript
integrations: body.discoveryTree.trunk?.integrations ?? mergedDiscoveryTree?.trunk?.integrations,
```

**Behavior:**
- Uses `??` operator (nullish coalescing)
- If new data provided → replaces entire array
- If new data not provided → keeps existing array
- **Issue:** Doesn't merge arrays, replaces them

**Observation:** This is correct for POST (user submits new array), but GET handler should merge audit data.

---

## Refined Smart Merge Strategy

### Core Principles

1. **User Edits Always Preserved** - Never overwrite user-provided integrations
2. **Audit Data Complements** - Only add audit-derived integrations that don't exist
3. **Case-Insensitive Deduplication** - Handle "Stripe" vs "stripe" variations
4. **Normalization Required** - Need helper to normalize systemName for reliable deduplication

---

## Step-by-Step Merge Algorithm

### Step 1: Normalize System Names

**Goal:** Create normalized version of systemName for reliable deduplication.

**Normalization Rules:**
1. Convert to lowercase
2. Trim whitespace
3. Remove common suffixes: " POS", " CMS", " Platform", " Payments", " API"
4. Handle common variations:
   - "Google Analytics" → "google analytics"
   - "GA4" → "google analytics" (if detected as Google Analytics)
   - "Stripe" → "stripe"
   - "Stripe Payments" → "stripe"
   - "PayPal" → "paypal"
   - "Square" → "square"

**Normalization Function:**
```typescript
function normalizeSystemName(name: string): string {
  let normalized = name.toLowerCase().trim();
  
  // Remove common suffixes
  normalized = normalized.replace(/\s+(pos|cms|platform|payments|api)$/i, "");
  
  return normalized;
}
```

**Examples:**
- `"Stripe"` → `"stripe"`
- `"Stripe Payments"` → `"stripe"`
- `"Google Analytics"` → `"google analytics"`
- `"Square POS"` → `"square"`

**Rationale:** Enables reliable deduplication despite naming variations.

---

### Step 2: Extract Audit-Derived Integrations

**Input:** `auditResults?.techStack` (optional)

**Mapping Rules:**

| Audit Field | systemName | systemType | integrationType | priority | Confidence Filter |
|-------------|------------|------------|-----------------|---------|-------------------|
| `cms.name` | Use `cms.name` | `"other"` | `"api"` | `"important"` | high/medium only |
| `ecommerce.name` | Use `ecommerce.name` | `"other"` | `"api"` | `"important"` | high/medium only |
| `paymentProcessors[].name` | Use `processor.name` | `"payment"` | `"api"` | `"critical"` | all levels |
| `analytics[].name` | Use `analytics.name` | `"other"` | `"api"` | `"nice-to-have"` | all levels |

**Notes Field:**
- Always set: `notes: "Detected from website audit"`

**Deduplication:**
- If `cms.name` === `ecommerce.name` (e.g., both "Shopify") → Only add once

**Output:** `auditIntegrations: IntegrationRequirement[]`

---

### Step 3: Merge with Existing Integrations

**Input:**
- `existingIntegrations: IntegrationRequirement[]` (from `discovery_tree.trunk.integrations`)
- `auditIntegrations: IntegrationRequirement[]` (from audit)

**Merge Logic:**

```
1. Start with existingIntegrations (preserve all user edits)
2. For each auditIntegration:
   - Normalize auditIntegration.systemName
   - Check if normalized name exists in existingIntegrations:
     - Normalize each existing.systemName
     - Compare normalized names
   - IF normalized name exists:
     - Skip auditIntegration (user already has it, preserve user version)
   - IF normalized name does NOT exist:
     - Add auditIntegration to merged array
3. Return merged array
```

**Key Behavior:**
- ✅ Preserves all existing integrations (user edits intact)
- ✅ Adds only new audit integrations (no duplicates)
- ✅ Case-insensitive matching (handles "Stripe" vs "stripe")
- ✅ Handles naming variations ("Stripe Payments" vs "Stripe")

---

### Step 4: Build Final Integrations Array

**Output:** `mergedIntegrations: IntegrationRequirement[]`

**Order:**
- Existing integrations first (preserve user order)
- Audit integrations second (new additions)

**Example:**
- Existing: `[{ systemName: "Stripe", priority: "critical" }]`
- Audit: `[{ systemName: "PayPal", ... }, { systemName: "Stripe", ... }]`
- Result: `[{ systemName: "Stripe", priority: "critical" }, { systemName: "PayPal", ... }]`
  - "Stripe" from existing (preserved)
  - "PayPal" from audit (added, duplicate "Stripe" skipped)

---

## Edge Cases & Handling

### Edge Case 1: Case Variations

**Scenario:**
- Existing: `[{ systemName: "stripe" }]` (lowercase)
- Audit: `{ systemName: "Stripe" }` (capitalized)

**Handling:**
- Normalize both: `"stripe"` === `"stripe"`
- Match found → Skip audit version
- Keep existing: `[{ systemName: "stripe" }]`

**Rationale:** Case-insensitive matching prevents false duplicates.

---

### Edge Case 2: Suffix Variations

**Scenario:**
- Existing: `[{ systemName: "Square POS" }]`
- Audit: `{ systemName: "Square" }`

**Handling:**
- Normalize: `"square pos"` → `"square"` (remove "pos" suffix)
- Normalize: `"square"` → `"square"`
- Match found → Skip audit version
- Keep existing: `[{ systemName: "Square POS" }]`

**Rationale:** Handles common naming variations.

---

### Edge Case 3: User Modified Priority

**Scenario:**
- Existing: `[{ systemName: "Stripe", priority: "nice-to-have", notes: "User changed" }]`
- Audit: `{ systemName: "Stripe", priority: "critical", notes: "Detected from website audit" }`

**Handling:**
- Normalize: `"stripe"` === `"stripe"`
- Match found → Skip audit version
- Keep existing: `[{ systemName: "Stripe", priority: "nice-to-have", notes: "User changed" }]`

**Rationale:** User edits always preserved.

---

### Edge Case 4: User Added Custom Notes

**Scenario:**
- Existing: `[{ systemName: "Stripe", notes: "Needs custom integration" }]`
- Audit: `{ systemName: "Stripe", notes: "Detected from website audit" }`

**Handling:**
- Match found → Skip audit version
- Keep existing: `[{ systemName: "Stripe", notes: "Needs custom integration" }]`

**Rationale:** User notes are more valuable than audit notes.

---

### Edge Case 5: Partial Name Matches

**Scenario:**
- Existing: `[{ systemName: "Stripe" }]`
- Audit: `{ systemName: "Stripe Payments" }`

**Handling:**
- Normalize: `"stripe"` === `"stripe"` (after removing "payments" suffix)
- Match found → Skip audit version
- Keep existing: `[{ systemName: "Stripe" }]`

**Rationale:** Normalization handles common variations.

---

### Edge Case 6: No Existing Integrations

**Scenario:**
- Existing: `[]` (empty)
- Audit: `[{ systemName: "Stripe" }, { systemName: "PayPal" }]`

**Handling:**
- No matches → Add all audit integrations
- Result: `[{ systemName: "Stripe", ... }, { systemName: "PayPal", ... }]`

**Rationale:** Pre-populate when empty.

---

### Edge Case 7: CMS and E-commerce Duplicate

**Scenario:**
- Audit: `{ cms: { name: "Shopify" }, ecommerce: { name: "Shopify" } }`

**Handling:**
- Extract CMS: `{ systemName: "Shopify", ... }`
- Extract E-commerce: `{ systemName: "Shopify", ... }` (duplicate)
- Deduplicate before merging: Only add once
- Result: `[{ systemName: "Shopify", ... }]` (single entry)

**Rationale:** Avoid duplicate entries from same platform.

---

## Normalization Helper Design

### Function Signature

```typescript
/**
 * Normalize system name for deduplication
 * Handles case variations, suffixes, and common naming patterns
 */
function normalizeSystemName(name: string): string
```

### Normalization Rules

1. **Case Normalization:**
   - Convert to lowercase

2. **Whitespace Normalization:**
   - Trim leading/trailing whitespace
   - Normalize internal whitespace (multiple spaces → single space)

3. **Suffix Removal:**
   - Remove: " POS", " CMS", " Platform", " Payments", " API", " Gateway"
   - Case-insensitive removal

4. **Common Variations:**
   - "GA4" → "google analytics" (if context indicates Google Analytics)
   - "G.A." → "google analytics"
   - Keep as-is for most cases (let normalization handle suffixes)

### Implementation Considerations

**Option A: Simple Normalization (Recommended)**
- Lowercase + trim + remove suffixes
- Fast, predictable
- Handles 90% of cases

**Option B: Advanced Normalization**
- Include synonym mapping (GA4 → Google Analytics)
- More complex, harder to maintain
- May introduce false positives

**Recommendation:** Start with Option A, enhance later if needed.

---

## Merge Function Design

### Function Signature

```typescript
/**
 * Merge audit-derived integrations with existing integrations
 * Preserves user edits, adds new audit findings
 * Deduplicates by normalized systemName
 */
function mergeIntegrations(
  existing: IntegrationRequirement[],
  auditDerived: IntegrationRequirement[]
): IntegrationRequirement[]
```

### Algorithm

```
1. Start with existingIntegrations (copy array)
2. Normalize all existing systemNames (for comparison)
3. For each auditIntegration:
   a. Normalize auditIntegration.systemName
   b. Check if normalized name exists in normalized existing names
   c. IF exists:
      - Skip (user already has it, preserve user version)
   d. IF not exists:
      - Add auditIntegration to merged array
4. Return merged array
```

### Implementation Details

**Normalization Cache:**
- Pre-normalize all existing systemNames once
- Store in Map for O(1) lookup: `Map<normalizedName, originalIndex>`

**Benefits:**
- Fast lookup (O(1) vs O(n))
- Preserves original systemName (no modification)
- Handles case-insensitive matching

---

## Integration with GET Handler

### Current GET Handler Flow

**Location:** `app/api/discovery-tree/route.ts` (lines 89-158)

**Current:**
1. Fetch questionnaire response
2. Build `prePopulateData` with `currentStack` from sector data
3. Return `discoveryTree` as-is (no audit merge)

**Updated Flow:**
1. Fetch questionnaire response (including `audit_results`)
2. Extract audit results: `auditResults = response.audit_results`
3. Derive audit integrations: `auditIntegrations = deriveIntegrationsFromAudit(auditResults)`
4. Get existing integrations: `existingIntegrations = response.discovery_tree?.trunk?.integrations || []`
5. Merge: `mergedIntegrations = mergeIntegrations(existingIntegrations, auditIntegrations)`
6. Build `prePopulateData` with merged integrations in `discoveryTree.trunk.integrations`

**Key Point:** Only merge in GET handler (pre-population). POST handler keeps existing behavior (user submits new array).

---

## Type Changes Needed

### Current Types

**IntegrationRequirement:**
```typescript
export interface IntegrationRequirement {
  systemName: string;
  systemType: "crm" | "pos" | "accounting" | "payment" | "booking" | "inventory" | "other";
  integrationType: "api" | "webhook" | "export" | "manual" | "unknown";
  priority: "critical" | "important" | "nice-to-have";
  notes?: string;
}
```

### Analysis

**Question:** Do we need additional source or confidence field?

**Answer:** 
- ✅ **No type changes needed** - `notes` field can indicate source
- ✅ **Optional enhancement:** Could add `source?: "user" | "audit"` field later
- ✅ **Recommendation:** Use `notes` field for now (simpler, backward compatible)

**Rationale:**
- `notes` field already exists and is optional
- Can set `notes: "Detected from website audit"` for audit-derived entries
- User can see source without type changes
- Can enhance later if needed

---

## Backward Compatibility

### UI Compatibility ✅

**Current UI Code:**
```typescript
const existing = trunk?.integrations?.find((i) => i.systemName === val);
```

**Analysis:**
- ✅ Accesses `integrations` as `IntegrationRequirement[]` (unchanged)
- ✅ Uses `systemName` for matching (unchanged)
- ✅ No dependency on new fields
- ✅ Will continue to work without modifications

**Note:** UI uses case-sensitive matching, but that's fine - merge happens server-side.

**Conclusion:** ✅ **Fully backward compatible** - No UI changes needed.

### API Compatibility ✅

**Current API:**
- GET returns `discoveryTree.trunk.integrations` as `IntegrationRequirement[]`
- POST accepts `discoveryTree.trunk.integrations` as `IntegrationRequirement[]`

**Updated API:**
- GET returns merged `IntegrationRequirement[]` (same type)
- POST behavior unchanged (user submits new array)

**Analysis:**
- ✅ Return type unchanged (`IntegrationRequirement[]`)
- ✅ POST behavior unchanged (replaces array as before)
- ✅ Only GET handler changes (pre-population)

**Conclusion:** ✅ **Backward compatible** - No breaking changes.

---

## Summary

### Smart Merge Strategy ✅

**Core Principles:**
1. ✅ User edits always preserved (never overwrite)
2. ✅ Audit data complements (only add new findings)
3. ✅ Case-insensitive deduplication (handles variations)
4. ✅ Normalization required (reliable matching)

### Normalization Helper ✅

**Required:** `normalizeSystemName()` function
- Lowercase + trim + remove suffixes
- Handles "Stripe" vs "Stripe Payments" variations
- Simple, predictable, maintainable

### Edge Cases Handled ✅

- ✅ Case variations ("Stripe" vs "stripe")
- ✅ Suffix variations ("Square POS" vs "Square")
- ✅ User modified priority/notes (preserved)
- ✅ Partial name matches (normalized)
- ✅ Empty existing (pre-populate)
- ✅ CMS/e-commerce duplicates (deduplicate)

### Type Changes ✅

**Answer:** No type changes needed
- ✅ `notes` field can indicate source
- ✅ Optional `source` field can be added later if needed
- ✅ Backward compatible

### Backward Compatibility ✅

**UI:** ✅ No changes needed (uses existing `systemName` matching)
**API:** ✅ No breaking changes (same types, same behavior)

**Status:** Ready for implementation!
