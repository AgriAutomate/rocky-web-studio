# Smart Merge Algorithm: audit_results.techStack → currentStack

## Algorithm Design (Plain English)

### Overview

**Goal:** Merge audit-detected technologies into `currentStack` while preserving sector-derived data and avoiding duplicates.

**Principle:** Sector data is primary (client explicitly stated), audit data complements (fills gaps).

---

## Step-by-Step Algorithm

### Step 1: Extract Sector Data (Existing)

- Run existing `deriveCurrentStack()` logic
- Extract systems from sector-specific text fields (regex patterns)
- Result: `sectorSystems: string[]`, `sectorIntegrations: string[]`, `sectorNotes: string`

### Step 2: Extract Audit Data (New)

- If `auditResults?.techStack` exists:
  - **Systems:** Extract `cms.name` and `ecommerce.name` (if confidence ≥ "medium")
  - **Integrations:** Extract `paymentProcessors[].name` and `analytics[].name` (all confidence levels)
  - Skip `hosting`, `cdn`, `frameworks` (too technical)
- Result: `auditSystems: string[]`, `auditIntegrations: string[]`

### Step 3: Normalize Names

- Convert all names to lowercase
- Remove common suffixes (" POS", " CMS", " Platform")
- Handle variations (e.g., "GA4" → "google analytics")
- Purpose: Enable case-insensitive deduplication

### Step 4: Merge Systems Array

**Logic:**
1. Start with `sectorSystems` (preserve order)
2. For each `auditSystem`:
   - Normalize name
   - Check if normalized name exists in normalized `sectorSystems`
   - **IF exists:** Skip (sector takes precedence)
   - **IF not exists:** Add to merged array
3. Remove duplicates
4. Return merged array

**Example:**
- Sector: `["square", "resdiary"]`
- Audit: `["wordpress", "stripe", "square"]`
- Result: `["square", "resdiary", "wordpress", "stripe"]`
  - "square" appears once (from sector, audit duplicate skipped)

### Step 5: Merge Integrations Array

**Logic:** Same as systems merge
- Start with `sectorIntegrations` (currently empty, but future-proof)
- Add audit integrations that don't conflict
- Deduplicate

**Example:**
- Sector: `[]` (empty)
- Audit: `["stripe", "google analytics"]`
- Result: `["stripe", "google analytics"]` (all from audit)

### Step 6: Merge Notes

**Logic:**
1. Start with `sectorNotes` (if exists)
2. If audit detected technologies:
   - Format: `"Detected via site analysis: WordPress, Stripe"`
   - Append with separator: `" | "`
3. Return merged notes

**Example:**
- Sector: `"Using Square POS"`
- Audit: `["WordPress", "Stripe"]`
- Result: `"Using Square POS | Detected via site analysis: WordPress, Stripe"`

### Step 7: Build Final Object

**Output:**
```typescript
{
  systems: string[];           // Merged systems
  integrations: string[];      // Merged integrations
  notes: string;               // Merged notes
  sources?: {                  // Optional: source tracking
    systems?: ("sector" | "audit")[];
    integrations?: ("sector" | "audit")[];
  };
}
```

---

## Deduplication Strategy

### Normalization Key

**Use:** Normalized system name (lowercase, no suffixes)

**Examples:**
- `"Square POS"` → `"square"`
- `"WordPress"` → `"wordpress"`
- `"Google Analytics"` → `"google analytics"`
- `"Stripe"` → `"stripe"`

### Deduplication Rules

1. **Case Variations:** `"Square"` and `"square"` → Same (normalize both, keep first)
2. **Suffix Variations:** `"Square POS"` and `"Square"` → Same (normalize both, keep first)
3. **Exact Duplicates:** Remove subsequent occurrences
4. **Sector Precedence:** If sector and audit have same normalized name → Keep sector version

---

## Source Tracking

### Option A: Simple Array (Recommended)

**Structure:**
```typescript
sources?: {
  systems?: ("sector" | "audit")[];
  integrations?: ("sector" | "audit")[];
}
```

**Mapping:**
- `sources.systems[0]` → `systems[0]`
- `sources.systems[1]` → `systems[1]`
- Parallel arrays (indices match)

**Example:**
```typescript
{
  systems: ["square", "wordpress"],
  sources: { systems: ["sector", "audit"] }
}
```

**Benefits:**
- ✅ Simple to implement
- ✅ Backward compatible (optional field)
- ✅ Easy to consume in UI

---

## Type Changes Needed

### Current Type

```typescript
currentStack: {
  systems?: string[];
  integrations?: string[];
  notes?: string;
}
```

### Updated Type (Minimal Change)

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

**Change:** Add optional `sources` field

**Benefits:**
- ✅ Backward compatible (optional field)
- ✅ No breaking changes
- ✅ UI can ignore sources if not needed

---

## Backward Compatibility

### UI Compatibility ✅

**Current UI Code:**
```typescript
{currentStack.systems.map((system, index) => (
  <span key={index}>{system}</span>
))}
```

**Analysis:**
- ✅ Accesses `systems` as `string[]` (unchanged)
- ✅ No dependency on `sources` field
- ✅ Will continue to work without modifications

**Conclusion:** ✅ **Fully backward compatible** - No UI changes needed.

### API Compatibility ✅

**Current API:**
- Returns `currentStack` with `systems`, `integrations`, `notes`
- New version adds optional `sources` field

**Analysis:**
- ✅ Existing clients ignore `sources` field
- ✅ Return type compatible (optional field)
- ✅ No breaking changes

**Conclusion:** ✅ **Backward compatible** - Existing clients continue to work.

---

## Confirmation

### ✅ Type Changes

**Question:** Does `currentStack` need additional source or confidence field?

**Answer:** 
- **Minimal:** Add optional `sources` object (parallel arrays)
- **Future:** Could enhance to `CurrentStackItem[]` with richer tracking
- **Recommendation:** Start with minimal change (optional `sources`)

### ✅ Backward Compatibility

**Question:** Is this backward compatible with existing UI?

**Answer:** 
- ✅ **Yes** - UI accesses `systems`/`integrations` as `string[]` (unchanged)
- ✅ **Yes** - `sources` field is optional (UI can ignore)
- ✅ **Yes** - No UI changes required
- ✅ **Yes** - Existing API contracts preserved

---

## Summary

### Algorithm ✅

1. Extract sector data (existing)
2. Extract audit data (new)
3. Normalize names (deduplication)
4. Merge systems (sector precedence, audit complements)
5. Merge integrations (same logic)
6. Merge notes (combine with separator)
7. Build final object (with optional sources)

### Type Changes ✅

- Add optional `sources` field to `currentStack`
- Keep arrays as `string[]` (backward compatible)

### Backward Compatibility ✅

- ✅ UI: No changes needed
- ✅ API: Optional field, no breaking changes
- ✅ Database: Uses existing columns

**Status:** Ready for implementation!
