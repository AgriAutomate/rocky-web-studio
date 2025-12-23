# Audit → Trunk Integrations Smart Merge - Summary

## Current Implementation

### IntegrationRequirement Type

**Location:** `lib/types/discovery.ts` (lines 39-45)

```typescript
interface IntegrationRequirement {
  systemName: string;                    // Used for deduplication
  systemType: "crm" | "pos" | "accounting" | "payment" | "booking" | "inventory" | "other";
  integrationType: "api" | "webhook" | "export" | "manual" | "unknown";
  priority: "critical" | "important" | "nice-to-have";
  notes?: string;                         // Can tag audit-derived entries
}
```

### Current Initialization & Update

**API Route (`app/api/discovery-tree/route.ts`):**
- POST handler: Uses `??` operator (replaces array, doesn't merge)
- GET handler: Returns `discoveryTree` as-is (no audit merge)

**UI (`components/discovery/TrunkSection.tsx`):**
- Checkbox-based selection
- Preserves existing: `trunk?.integrations?.find((i) => i.systemName === val)`
- Case-sensitive matching (exact `systemName` match)

---

## Refined Smart Merge Strategy

### Core Algorithm

```
1. Normalize systemNames (lowercase, trim, remove suffixes)
2. Start with existingIntegrations (preserve all user edits)
3. For each auditIntegration:
   - Normalize auditIntegration.systemName
   - Check if normalized name exists in normalized existing names
   - IF exists: Skip (user already has it)
   - IF not exists: Add auditIntegration
4. Return merged array
```

### Key Principles

1. ✅ **User Edits Always Preserved** - Never overwrite existing integrations
2. ✅ **Audit Data Complements** - Only add new findings
3. ✅ **Case-Insensitive Deduplication** - Handle "Stripe" vs "stripe"
4. ✅ **Normalization Required** - Reliable matching despite variations

---

## Normalization Helper

### Required Function

```typescript
function normalizeSystemName(name: string): string {
  // 1. Lowercase
  // 2. Trim whitespace
  // 3. Remove suffixes: " POS", " CMS", " Platform", " Payments", " API"
  // 4. Return normalized name
}
```

### Examples

- `"Stripe"` → `"stripe"`
- `"Stripe Payments"` → `"stripe"`
- `"Square POS"` → `"square"`
- `"Google Analytics"` → `"google analytics"`

**Rationale:** Enables reliable deduplication despite naming variations.

---

## Edge Cases & Handling

### Edge Case 1: Case Variations

- Existing: `"stripe"` (lowercase)
- Audit: `"Stripe"` (capitalized)
- **Handling:** Normalize both → Match found → Skip audit version

### Edge Case 2: Suffix Variations

- Existing: `"Square POS"`
- Audit: `"Square"`
- **Handling:** Normalize both → `"square"` === `"square"` → Skip audit version

### Edge Case 3: User Modified Priority

- Existing: `{ systemName: "Stripe", priority: "nice-to-have" }`
- Audit: `{ systemName: "Stripe", priority: "critical" }`
- **Handling:** Match found → Keep existing (user's priority preserved)

### Edge Case 4: Partial Name Matches

- Existing: `"Stripe"`
- Audit: `"Stripe Payments"`
- **Handling:** Normalize → `"stripe"` === `"stripe"` → Skip audit version

**Conclusion:** Normalization handles all edge cases reliably.

---

## Mapping Table

| Audit Field | systemName | systemType | integrationType | priority | Notes |
|-------------|------------|------------|-----------------|----------|-------|
| `cms.name` | Use `cms.name` | `"other"` | `"api"` | `"important"` | "Detected from website audit" |
| `ecommerce.name` | Use `ecommerce.name` | `"other"` | `"api"` | `"important"` | "Detected from website audit" |
| `paymentProcessors[].name` | Use `processor.name` | `"payment"` | `"api"` | `"critical"` | "Detected from website audit" |
| `analytics[].name` | Use `analytics.name` | `"other"` | `"api"` | `"nice-to-have"` | "Detected from website audit" |

**Skip:** `hosting`, `cdn`, `frameworks`, `languages` (too technical, not integrations)

---

## Type Changes Needed

### Question: Do we need additional source or confidence field?

**Answer:** ✅ **No type changes needed**

**Rationale:**
- ✅ `notes` field can indicate source: `"Detected from website audit"`
- ✅ User can see source without type changes
- ✅ Optional `source?: "user" | "audit"` field can be added later if needed
- ✅ Backward compatible (no breaking changes)

---

## Backward Compatibility

### UI Compatibility ✅

**Current UI:**
- Uses `trunk?.integrations?.find((i) => i.systemName === val)`
- Case-sensitive matching (fine - merge happens server-side)

**After Merge:**
- ✅ Same type (`IntegrationRequirement[]`)
- ✅ Same structure
- ✅ No changes needed

**Conclusion:** ✅ **Fully backward compatible**

### API Compatibility ✅

**GET Handler:**
- Returns merged `IntegrationRequirement[]` (same type)
- ✅ No breaking changes

**POST Handler:**
- Behavior unchanged (user submits new array, replaces existing)
- ✅ No breaking changes

**Conclusion:** ✅ **Backward compatible**

---

## Implementation Files

1. **`lib/utils/audit-utils.ts`** (or new utility file)
   - Add `normalizeSystemName()` function
   - Add `deriveIntegrationsFromAudit()` function
   - Add `mergeIntegrations()` function

2. **`app/api/discovery-tree/route.ts`**
   - Update GET handler to fetch `audit_results`
   - Call merge functions
   - Return merged integrations in `discoveryTree.trunk.integrations`

3. **No UI changes needed** ✅

---

## Summary

### Smart Merge Strategy ✅

- ✅ Preserves user edits (never overwrites)
- ✅ Adds audit findings (only new entries)
- ✅ Case-insensitive deduplication
- ✅ Normalization handles edge cases

### Normalization Required ✅

- ✅ Lowercase + trim + remove suffixes
- ✅ Handles "Stripe" vs "Stripe Payments" variations
- ✅ Simple, predictable, maintainable

### Type Changes ✅

- ✅ **No changes needed** - Use `notes` field for source indication
- ✅ Optional `source` field can be added later

### Backward Compatibility ✅

- ✅ UI: No changes needed
- ✅ API: No breaking changes
- ✅ Database: Uses existing columns

**Status:** Ready for implementation!
