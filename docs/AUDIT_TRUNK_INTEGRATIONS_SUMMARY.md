# Audit → Trunk Integrations Mapping - Summary

## Current State

### Trunk Integrations Type
```typescript
interface IntegrationRequirement {
  systemName: string;
  systemType: "crm" | "pos" | "accounting" | "payment" | "booking" | "inventory" | "other";
  integrationType: "api" | "webhook" | "export" | "manual" | "unknown";
  priority: "critical" | "important" | "nice-to-have";
  notes?: string;
}

interface DiscoveryTrunk {
  integrations?: IntegrationRequirement[];
  // ...
}
```

### Current UI Behavior
- Checkbox-based selection from predefined options
- Preserves existing integration data when updating
- Defaults: `integrationType: "unknown"`, `priority: "important"`

## Proposed Mapping Table

| Audit Field | Example | → IntegrationRequirement |
|-------------|---------|--------------------------|
| `cms.name` | "WordPress" | `{ systemName: "WordPress", systemType: "other", integrationType: "api", priority: "important", notes: "Detected via site analysis" }` |
| `cms.name` | "Shopify" | `{ systemName: "Shopify", systemType: "other", integrationType: "api", priority: "important", notes: "Detected via site analysis" }` |
| `ecommerce.name` | "WooCommerce" | `{ systemName: "WooCommerce", systemType: "other", integrationType: "api", priority: "important", notes: "Detected via site analysis" }` |
| `paymentProcessors[].name` | "Stripe" | `{ systemName: "Stripe", systemType: "payment", integrationType: "api", priority: "critical", notes: "Detected via site analysis" }` |
| `paymentProcessors[].name` | "PayPal" | `{ systemName: "PayPal", systemType: "payment", integrationType: "api", priority: "critical", notes: "Detected via site analysis" }` |
| `analytics[].name` | "Google Analytics" | `{ systemName: "Google Analytics", systemType: "other", integrationType: "api", priority: "nice-to-have", notes: "Detected via site analysis" }` |

### Mapping Rules

**CMS Platforms:**
- `systemType`: `"other"` (doesn't fit existing categories)
- `priority`: `"important"` (usually important but not critical)
- `confidence`: Only include if `"high"` or `"medium"`

**E-commerce Platforms:**
- `systemType`: `"other"`
- `priority`: `"important"`
- `confidence`: Only include if `"high"` or `"medium"`
- **Deduplicate:** If same as CMS (e.g., Shopify), only add once

**Payment Processors:**
- `systemType`: `"payment"` (matches existing category)
- `priority`: `"critical"` (payment integration is usually critical)
- `confidence`: Include all levels (usually detected reliably)

**Analytics Platforms:**
- `systemType`: `"other"`
- `priority`: `"nice-to-have"` (useful but not critical)
- `confidence`: Include all levels

**Skip These:**
- ❌ `hosting.name` - Infrastructure, not an integration
- ❌ `cdn.name` - Infrastructure, not an integration
- ❌ `frameworks[].name` - Technical detail, not an integration
- ❌ `languages[]` - Technical detail, not an integration

## Merge Strategy Recommendation

### Recommended: Smart Merge

**Logic:**
1. Start with existing integrations (preserve user edits)
2. Add audit-derived integrations that don't already exist
3. Deduplicate by `systemName` (case-insensitive)
4. User edits always take precedence

**Example:**
```typescript
// Existing: User added Stripe manually
[{ systemName: "Stripe", priority: "nice-to-have", notes: "User added" }]

// Audit detects: Stripe, PayPal
// Result: Keep user's Stripe, add PayPal
[
  { systemName: "Stripe", priority: "nice-to-have", notes: "User added" }, // Preserved
  { systemName: "PayPal", systemType: "payment", priority: "critical", notes: "Detected via site analysis" } // Added
]
```

**Benefits:**
- ✅ Preserves user edits completely
- ✅ Adds audit findings without overwriting
- ✅ Handles deduplication intelligently
- ✅ Respects existing merge pattern

### Current Merge Behavior

**Location:** `app/api/discovery-tree/route.ts` (line 211)

**Current:**
```typescript
integrations: body.discoveryTree.trunk?.integrations ?? mergedDiscoveryTree?.trunk?.integrations
```

**Issue:** Uses `??` operator, which replaces rather than merges arrays.

**Solution:** Implement smart merge function that combines arrays intelligently.

## Implementation

### Step 1: Create Mapping Function

**Function:** `deriveIntegrationsFromAudit(audit: WebsiteAuditResult): IntegrationRequirement[]`

**Logic:**
- Extract CMS, e-commerce, payment processors, analytics
- Map to `IntegrationRequirement` objects
- Filter by confidence (high/medium for CMS/e-commerce)
- Return array of integrations

### Step 2: Create Merge Function

**Function:** `mergeIntegrations(existing: IntegrationRequirement[], auditDerived: IntegrationRequirement[]): IntegrationRequirement[]`

**Logic:**
- Start with existing array
- For each audit integration:
  - Check if exists (by `systemName`, case-insensitive)
  - If not exists → add it
  - If exists → keep existing (user may have edited)
- Return merged array

### Step 3: Update GET Handler

**Location:** `app/api/discovery-tree/route.ts`

**Changes:**
1. Fetch `audit_results` in SELECT query
2. Derive integrations from audit
3. Merge with existing integrations
4. Include in pre-populate response

## Conflict Resolution Examples

### Scenario 1: User Already Added
**Existing:** `[{ systemName: "Stripe", notes: "User added" }]`
**Audit:** `[{ systemName: "Stripe", notes: "Detected via site analysis" }]`
**Result:** Keep existing (user's version)

### Scenario 2: User Modified Priority
**Existing:** `[{ systemName: "Google Analytics", priority: "critical" }]`
**Audit:** `[{ systemName: "Google Analytics", priority: "nice-to-have" }]`
**Result:** Keep existing (user's priority modification)

### Scenario 3: New Finding
**Existing:** `[{ systemName: "Stripe" }]`
**Audit:** Detects "PayPal"
**Result:** Add PayPal to array

### Scenario 4: Case Sensitivity
**Existing:** `[{ systemName: "stripe" }]` (lowercase)
**Audit:** `{ systemName: "Stripe" }` (capitalized)
**Result:** Treat as duplicate, keep existing

## Type Changes Needed

### ✅ No Type Changes Required

**Rationale:**
- `IntegrationRequirement` already supports all needed fields
- `DiscoveryTrunk.integrations` is already `IntegrationRequirement[]`
- Mapping uses existing `systemType` values
- `notes` field can indicate source ("Detected via site analysis")

**Optional Future Enhancement:**
- Could add `source?: "user" | "audit"` field
- Not necessary for V1

## Benefits

1. **Reduces Manual Input:** Pre-populates common integrations
2. **Increases Accuracy:** Based on actual site analysis
3. **Respects User Edits:** Never overwrites user modifications
4. **Non-Breaking:** Works with existing UI and types
5. **Smart Deduplication:** Handles case sensitivity and duplicates

## Next Steps

1. ✅ Review mapping proposal (this document)
2. ⏳ Implement `deriveIntegrationsFromAudit()` function
3. ⏳ Implement `mergeIntegrations()` helper function
4. ⏳ Update GET handler to merge audit integrations
5. ⏳ Test merge scenarios
6. ⏳ Verify UI handles pre-populated integrations correctly
