# Smart Merge: audit_results.techStack → currentStack - Design

## Current State Analysis

### Existing `deriveCurrentStack()` Function

**Location:** `app/api/discovery-tree/route.ts` (lines 28-81)

**Current Behavior:**
- Input: `sectorSpecificData` (JSONB), `sector` (Sector type)
- Output: `{ systems?: string[]; integrations?: string[]; notes?: string }`
- Logic: Regex extraction from sector-specific text fields
- Examples:
  - Hospitality: Extracts "Square", "ResDiary" from `h9` textarea
  - Retail: Uses `r7` channels array directly
  - Construction: Extracts "Jobber", "ServiceM8" from `t8` textarea
- Current limitation: Only populates `systems` and `notes` (not `integrations`)

### Current Type Definition

**Location:** `lib/types/discovery.ts` (lines 208-212)

```typescript
currentStack: {
  systems?: string[];
  integrations?: string[];
  notes?: string;
}
```

### Audit Tech Stack Structure

**Location:** `lib/types/audit.ts` (lines 60-70)

```typescript
TechStackInfo {
  cms?: DetectedTechnology;              // Single: WordPress, Shopify
  ecommerce?: DetectedTechnology;        // Single: WooCommerce, Shopify
  analytics?: DetectedTechnology[];       // Array: Google Analytics, Facebook Pixel
  paymentProcessors?: DetectedTechnology[]; // Array: Stripe, PayPal, Square
  hosting?: DetectedTechnology;          // Single: Vercel, AWS
  cdn?: DetectedTechnology;              // Single: Cloudflare
  frameworks?: DetectedTechnology[];     // Array: React, Next.js
  languages?: string[];                  // Array: JavaScript, PHP
  otherTechnologies?: DetectedTechnology[];
}

DetectedTechnology {
  name: string;                          // e.g., "WordPress", "Stripe"
  version?: string;                      // e.g., "6.4"
  confidence: "high" | "medium" | "low";
  detectionMethod: string;
}
```

---

## Smart Merge Algorithm Design

### Algorithm Overview

**Goal:** Merge audit-detected technologies into `currentStack` while preserving sector-derived data and avoiding duplicates.

**High-Level Flow:**
```
1. Start with sector-derived currentStack (existing logic)
2. Extract technologies from audit_results.techStack
3. Normalize all system/integration names (case-insensitive, common variations)
4. Merge arrays (deduplicate, preserve sector precedence)
5. Optionally track sources
6. Enhance notes with audit context
```

---

## Step-by-Step Algorithm

### Step 1: Extract Sector-Derived Data (Existing Logic)

**Input:** `sectorSpecificData`, `sector`

**Process:**
- Run existing `deriveCurrentStack()` logic
- Extract systems from sector-specific text fields using regex
- Extract notes from sector-specific text fields
- Result: `sectorStack = { systems: [...], integrations: [...], notes: "..." }`

**Output:**
- `sectorSystems: string[]` - Systems extracted from sector data
- `sectorIntegrations: string[]` - Currently empty (not populated)
- `sectorNotes: string` - Notes from sector data

**Example:**
- Sector: Hospitality
- Sector Data: `{ h9: "Using Square POS and ResDiary for bookings" }`
- Result: `{ systems: ["square", "resdiary"], integrations: [], notes: "Using Square POS and ResDiary for bookings" }`

---

### Step 2: Extract Audit-Derived Technologies

**Input:** `auditResults?.techStack` (optional)

**Process:**
- If `auditResults` is null/undefined → Skip (return sector-only data)
- Extract technologies from `TechStackInfo`:

**Systems Extraction:**
- `cms.name` → Add to `auditSystems[]` (if confidence ≥ "medium")
- `ecommerce.name` → Add to `auditSystems[]` (if confidence ≥ "medium")
- Skip `hosting.name` (too technical, less relevant)
- Skip `frameworks[].name` (too technical, less relevant)

**Integrations Extraction:**
- `paymentProcessors[].name` → Add to `auditIntegrations[]` (all confidence levels)
- `analytics[].name` → Add to `auditIntegrations[]` (all confidence levels)

**Output:**
- `auditSystems: string[]` - Systems detected from audit
- `auditIntegrations: string[]` - Integrations detected from audit
- `auditTechnologies: string[]` - All detected technologies (for notes)

**Example:**
- Audit: `{ cms: { name: "WordPress", confidence: "high" }, paymentProcessors: [{ name: "Stripe", confidence: "high" }] }`
- Result: `{ systems: ["wordpress"], integrations: ["stripe"], technologies: ["WordPress", "Stripe"] }`

---

### Step 3: Normalize System Names

**Goal:** Standardize names for deduplication (case-insensitive, common variations)

**Normalization Rules:**
1. Convert to lowercase
2. Remove common suffixes: " POS", " CMS", " Platform"
3. Handle common variations:
   - "Google Analytics" → "google analytics"
   - "GA4" → "google analytics" (if detected as Google Analytics)
   - "Stripe" → "stripe"
   - "WordPress" → "wordpress"
   - "Shopify" → "shopify"

**Process:**
- Normalize `sectorSystems` → `normalizedSectorSystems`
- Normalize `auditSystems` → `normalizedAuditSystems`
- Normalize `sectorIntegrations` → `normalizedSectorIntegrations`
- Normalize `auditIntegrations` → `normalizedAuditIntegrations`

**Example:**
- Sector: `["Square", "ResDiary"]` → `["square", "resdiary"]`
- Audit: `["WordPress", "Stripe"]` → `["wordpress", "stripe"]`

**Note:** Keep original names for display, use normalized for deduplication.

---

### Step 4: Merge Systems Array

**Goal:** Combine sector and audit systems, deduplicate, preserve sector precedence.

**Merge Logic:**
```
1. Start with sectorSystems (preserve order)
2. For each auditSystem:
   - Normalize name
   - Check if normalized name exists in normalizedSectorSystems
   - IF exists: Skip (sector data takes precedence)
   - IF not exists: Add to mergedSystems
3. Remove duplicates (case-insensitive)
4. Return merged array
```

**Example:**
- Sector: `["square", "resdiary"]`
- Audit: `["wordpress", "stripe", "square"]` (note: "square" duplicate)
- Result: `["square", "resdiary", "wordpress", "stripe"]`
  - "square" appears once (from sector, audit duplicate skipped)
  - "resdiary" from sector
  - "wordpress" from audit (new)
  - "stripe" from audit (new)

**Source Tracking (Optional):**
- If tracking sources: `["sector", "sector", "audit", "audit"]`
- If duplicate found: `["sector", "sector", "audit", "audit"]` (sector takes precedence)

---

### Step 5: Merge Integrations Array

**Goal:** Combine sector and audit integrations, deduplicate.

**Merge Logic:**
```
1. Start with sectorIntegrations (currently empty, but future-proof)
2. For each auditIntegration:
   - Normalize name
   - Check if normalized name exists in normalizedSectorIntegrations
   - IF exists: Skip (sector data takes precedence)
   - IF not exists: Add to mergedIntegrations
3. Remove duplicates
4. Return merged array
```

**Example:**
- Sector: `[]` (currently empty)
- Audit: `["stripe", "paypal", "google analytics"]`
- Result: `["stripe", "paypal", "google analytics"]` (all from audit)

**Source Tracking (Optional):**
- If tracking sources: `["audit", "audit", "audit"]`

---

### Step 6: Merge Notes

**Goal:** Combine sector notes with audit context.

**Merge Logic:**
```
1. Start with sectorNotes (if exists)
2. If audit detected technologies:
   - Extract technology names (for display)
   - Format: "Detected via site analysis: WordPress, Stripe"
   - Append to notes with separator
3. Return merged notes
```

**Separator Options:**
- Option A: `" | "` (pipe separator)
- Option B: `"\n\n"` (newline separator)
- **Recommendation:** Option A (single line, cleaner)

**Example:**
- Sector Notes: `"Using Square POS and ResDiary"`
- Audit Technologies: `["WordPress", "Stripe"]`
- Result: `"Using Square POS and ResDiary | Detected via site analysis: WordPress, Stripe"`

**Edge Cases:**
- No sector notes → `"Detected via site analysis: WordPress, Stripe"`
- No audit technologies → `"Using Square POS and ResDiary"` (unchanged)
- Both empty → `""` (empty string)

---

### Step 7: Build Final currentStack Object

**Goal:** Combine all merged data into final structure.

**Output Structure:**
```typescript
{
  systems: string[];           // Merged systems array
  integrations: string[];      // Merged integrations array
  notes: string;               // Merged notes
  sources?: {                   // Optional: source tracking
    systems?: ("sector" | "audit")[];
    integrations?: ("sector" | "audit")[];
  };
}
```

**Example Output:**
```typescript
{
  systems: ["square", "resdiary", "wordpress"],
  integrations: ["stripe", "google analytics"],
  notes: "Using Square POS and ResDiary | Detected via site analysis: WordPress, Stripe",
  sources: {
    systems: ["sector", "sector", "audit"],
    integrations: ["audit", "audit"]
  }
}
```

---

## Detailed Merge Rules

### Rule 1: Sector Data Precedence

**When:** Same technology detected in both sector and audit data

**Behavior:**
- Keep sector version (client explicitly stated)
- Skip audit version (avoid duplicate)
- Mark source as "sector" (if tracking)

**Example:**
- Sector: `["square"]`
- Audit: `["Square"]` (same, different case)
- Result: `["square"]` (from sector, audit duplicate skipped)

**Rationale:** Client knows their systems better than automated detection.

---

### Rule 2: Audit Data Complements

**When:** Technology detected only in audit (not in sector)

**Behavior:**
- Add audit version to merged array
- Mark source as "audit" (if tracking)

**Example:**
- Sector: `["square"]`
- Audit: `["wordpress"]` (new)
- Result: `["square", "wordpress"]` (both included)

**Rationale:** Audit fills gaps in client-provided information.

---

### Rule 3: Confidence Filtering

**When:** Audit technology has low confidence

**Behavior:**
- Systems: Only include if confidence ≥ "medium" (filter out "low")
- Integrations: Include all confidence levels (payment/analytics are usually reliable)
- Exception: If no other data exists, include low confidence (better than nothing)

**Example:**
- Audit: `{ cms: { name: "WordPress", confidence: "low" } }`
- Sector: `[]` (empty)
- Result: Include "WordPress" (no other data, accept low confidence)

**Rationale:** Avoid false positives, but don't leave empty if no other data.

---

### Rule 4: Deduplication

**When:** Same technology appears multiple times (case variations, duplicates)

**Behavior:**
- Normalize names (lowercase, remove suffixes)
- Keep first occurrence (preserve sector order)
- Remove subsequent duplicates

**Example:**
- Sector: `["Square", "square"]` (duplicate)
- Audit: `["Square", "Stripe"]`
- Result: `["square", "stripe"]` (deduplicated)

**Rationale:** Clean data, avoid confusion.

---

### Rule 5: Array Ordering

**When:** Merging arrays from different sources

**Behavior:**
- Sector systems first (preserve order)
- Audit systems second (preserve order)
- Same for integrations

**Example:**
- Sector: `["square", "resdiary"]`
- Audit: `["wordpress", "stripe"]`
- Result: `["square", "resdiary", "wordpress", "stripe"]`

**Rationale:** Sector data is primary, audit data is supplementary.

---

## Source Tracking Design

### Option A: Simple Source Array (Recommended)

**Structure:**
```typescript
sources?: {
  systems?: ("sector" | "audit")[];
  integrations?: ("sector" | "audit")[];
}
```

**Mapping:**
- `sources.systems[0]` corresponds to `systems[0]`
- `sources.systems[1]` corresponds to `systems[1]`
- Same for integrations

**Example:**
```typescript
{
  systems: ["square", "wordpress"],
  sources: {
    systems: ["sector", "audit"]
  }
}
```

**Benefits:**
- ✅ Simple to implement
- ✅ Easy to consume in UI
- ✅ Backward compatible (optional field)

**Limitations:**
- ⚠️ Can't track "merged" (duplicate resolved)
- ⚠️ Array indices must match (must be careful)

---

### Option B: Rich Source Tracking (Future Enhancement)

**Structure:**
```typescript
systems?: Array<{
  name: string;
  source: "sector" | "audit" | "merged";
  confidence?: "high" | "medium" | "low"; // Only if from audit
}>;
```

**Benefits:**
- ✅ More detailed tracking
- ✅ Can track "merged" state
- ✅ Includes confidence for audit items

**Limitations:**
- ⚠️ Breaking change (requires UI updates)
- ⚠️ More complex to implement
- ⚠️ More complex to consume

**Recommendation:** Start with Option A, enhance to Option B later if needed.

---

## Type Changes Needed

### Minimal Change (Recommended)

**File:** `lib/types/discovery.ts`

**Update:**
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
- ✅ Backward compatible (sources is optional)
- ✅ Simple to implement
- ✅ Easy to consume in UI

---

### Enhanced Change (Future)

**If we want richer tracking:**
```typescript
interface CurrentStackItem {
  name: string;
  source: "sector" | "audit" | "merged";
  confidence?: "high" | "medium" | "low";
}

currentStack: {
  systems?: CurrentStackItem[];
  integrations?: CurrentStackItem[];
  notes?: string;
}
```

**Trade-off:**
- More detailed but requires UI changes
- Better for future features (filtering, sorting)

---

## Backward Compatibility Analysis

### Current UI Usage

**File:** `components/discovery/SummarySidebar.tsx` (lines 90-117)

**Current Code:**
```typescript
{currentStack.systems.map((system, index) => (
  <span key={index}>{system}</span>
))}
```

**Analysis:**
- ✅ Accesses `currentStack.systems` as `string[]`
- ✅ Maps over array
- ✅ No dependency on `sources` field
- ✅ Will continue to work after merge

**Conclusion:** ✅ **Fully backward compatible** - UI doesn't need changes.

---

### Current API Usage

**File:** `app/api/discovery-tree/route.ts` (lines 135-138)

**Current Code:**
```typescript
currentStack: deriveCurrentStack(
  response.sector_specific_data,
  response.sector as Sector
),
```

**Analysis:**
- ✅ Function signature will change (add `auditResults` parameter)
- ✅ Return type stays same (optional `sources` field)
- ✅ Existing callers continue to work

**Conclusion:** ✅ **Backward compatible** - Function signature change is internal.

---

### Database Schema

**Current:**
- `sector_specific_data` (JSONB) - unchanged
- `audit_results` (JSONB) - unchanged

**Analysis:**
- ✅ No database changes needed
- ✅ Uses existing columns
- ✅ No migration required

**Conclusion:** ✅ **No database changes** - Uses existing data.

---

## Implementation Considerations

### Normalization Function

**Need:** Helper function to normalize system/integration names

**Location:** `lib/utils/audit-utils.ts` (or new `lib/utils/current-stack-utils.ts`)

**Function:**
```typescript
function normalizeSystemName(name: string): string {
  // Convert to lowercase
  // Remove common suffixes
  // Handle variations
  // Return normalized name
}
```

**Examples:**
- `"Square POS"` → `"square"`
- `"WordPress"` → `"wordpress"`
- `"Google Analytics"` → `"google analytics"`
- `"Stripe"` → `"stripe"`

---

### Deduplication Function

**Need:** Helper function to deduplicate arrays while preserving order

**Location:** Same utility file

**Function:**
```typescript
function deduplicateSystems(
  systems: string[],
  normalizedSystems: string[]
): string[] {
  // Keep first occurrence of each normalized name
  // Preserve original order
  // Return deduplicated array
}
```

---

### Source Tracking Helper

**Need:** Helper function to build sources array

**Location:** Same utility file

**Function:**
```typescript
function buildSourcesArray(
  sectorItems: string[],
  auditItems: string[],
  mergedItems: string[]
): ("sector" | "audit")[] {
  // Map each merged item to its source
  // Return sources array matching mergedItems order
}
```

---

## Edge Cases & Error Handling

### Edge Case 1: No Audit Data

**Scenario:** `auditResults` is null or undefined

**Behavior:**
- Return sector-derived data only (existing behavior)
- No sources tracking (or all "sector")

**Example:**
- Sector: `{ systems: ["square"], notes: "..." }`
- Audit: `null`
- Result: `{ systems: ["square"], notes: "...", sources: { systems: ["sector"] } }`

---

### Edge Case 2: Empty Sector Data

**Scenario:** No sector-specific data, but audit data exists

**Behavior:**
- Return audit-derived data only
- All sources marked as "audit"

**Example:**
- Sector: `{}` (empty)
- Audit: `{ cms: { name: "WordPress" } }`
- Result: `{ systems: ["wordpress"], sources: { systems: ["audit"] } }`

---

### Edge Case 3: Conflicting Names (Case Variations)

**Scenario:** Same system with different casing

**Behavior:**
- Normalize both
- Keep sector version (precedence)
- Skip audit duplicate

**Example:**
- Sector: `["Square"]`
- Audit: `["square"]` (same, different case)
- Result: `["Square"]` (from sector, normalized to "square" for comparison)

---

### Edge Case 4: Low Confidence Audit Data

**Scenario:** Audit has low confidence detections, sector has no data

**Behavior:**
- Include low confidence (better than nothing)
- Mark in notes: "Low confidence detection"

**Example:**
- Sector: `[]` (empty)
- Audit: `{ cms: { name: "WordPress", confidence: "low" } }`
- Result: `{ systems: ["wordpress"], notes: "Detected via site analysis (low confidence): WordPress" }`

---

## Testing Scenarios

### Scenario 1: Sector Only

**Input:**
- Sector: `{ h9: "Using Square POS" }`
- Audit: `null`

**Expected Output:**
```typescript
{
  systems: ["square"],
  integrations: [],
  notes: "Using Square POS",
  sources: { systems: ["sector"] }
}
```

---

### Scenario 2: Audit Only

**Input:**
- Sector: `{}` (empty)
- Audit: `{ cms: { name: "WordPress", confidence: "high" }, paymentProcessors: [{ name: "Stripe", confidence: "high" }] }`

**Expected Output:**
```typescript
{
  systems: ["wordpress"],
  integrations: ["stripe"],
  notes: "Detected via site analysis: WordPress, Stripe",
  sources: { systems: ["audit"], integrations: ["audit"] }
}
```

---

### Scenario 3: Merged (No Conflicts)

**Input:**
- Sector: `{ h9: "Using Square POS" }`
- Audit: `{ cms: { name: "WordPress", confidence: "high" }, paymentProcessors: [{ name: "Stripe", confidence: "high" }] }`

**Expected Output:**
```typescript
{
  systems: ["square", "wordpress"],
  integrations: ["stripe"],
  notes: "Using Square POS | Detected via site analysis: WordPress, Stripe",
  sources: { systems: ["sector", "audit"], integrations: ["audit"] }
}
```

---

### Scenario 4: Merged (With Conflicts)

**Input:**
- Sector: `{ h9: "Using Square POS" }`
- Audit: `{ paymentProcessors: [{ name: "Square", confidence: "high" }] }`

**Expected Output:**
```typescript
{
  systems: ["square"],
  integrations: [],
  notes: "Using Square POS | Detected via site analysis: Square",
  sources: { systems: ["sector"] }
}
```

**Note:** "Square" appears in systems (from sector) but not in integrations (audit duplicate skipped due to sector precedence).

---

### Scenario 5: Low Confidence Filtering

**Input:**
- Sector: `[]` (empty)
- Audit: `{ cms: { name: "WordPress", confidence: "low" } }`

**Expected Output:**
```typescript
{
  systems: ["wordpress"], // Included because no other data
  integrations: [],
  notes: "Detected via site analysis (low confidence): WordPress",
  sources: { systems: ["audit"] }
}
```

---

## Summary

### Algorithm Design ✅

**Smart Merge Process:**
1. Extract sector data (existing logic)
2. Extract audit data (new logic)
3. Normalize names (deduplication)
4. Merge systems (sector precedence, audit complements)
5. Merge integrations (same logic)
6. Merge notes (combine with separator)
7. Build final object (with optional sources)

### Type Changes ✅

**Minimal Change:**
- Add optional `sources` field to `currentStack`
- Keep arrays as `string[]` (backward compatible)

**Future Enhancement:**
- Could change to `CurrentStackItem[]` for richer tracking

### Backward Compatibility ✅

**UI:**
- ✅ No changes needed (still uses `string[]`)
- ✅ Sources field is optional (can ignore)

**API:**
- ✅ Function signature change is internal
- ✅ Return type compatible (optional field)

**Database:**
- ✅ No changes needed (uses existing columns)

### Implementation Files

1. **`app/api/discovery-tree/route.ts`**
   - Update `deriveCurrentStack()` signature
   - Add audit merge logic
   - Update GET handler to fetch `audit_results`

2. **`lib/types/discovery.ts`**
   - Add optional `sources` field to `currentStack`

3. **`lib/utils/audit-utils.ts`** (or new utility file)
   - Add normalization function
   - Add deduplication function
   - Add source tracking helper

**No UI changes required** - Fully backward compatible!
