# Audit → Trunk Integrations Mapping Proposal

## Current State Analysis

### Trunk Integrations Type

**Location:** `lib/types/discovery.ts`

**Type Definition:**
```typescript
export interface IntegrationRequirement {
  systemName: string;
  systemType: "crm" | "pos" | "accounting" | "payment" | "booking" | "inventory" | "other";
  integrationType: "api" | "webhook" | "export" | "manual" | "unknown";
  priority: "critical" | "important" | "nice-to-have";
  notes?: string;
}

export interface DiscoveryTrunk {
  integrations?: IntegrationRequirement[];
  dataMigration?: DataMigrationRequirement;
  successMetrics?: SuccessMetric[];
}
```

### Current UI Behavior

**Location:** `components/discovery/TrunkSection.tsx`

**Key Observations:**
1. **Checkbox-based selection** from predefined `INTEGRATION_OPTIONS`
2. **Preserves existing data** when updating:
   ```typescript
   const existing = trunk?.integrations?.find((i) => i.systemName === val);
   return existing || { /* new default */ };
   ```
3. **Maps checkbox values** to `systemType` via `mapSystemType()` helper
4. **Default values** for new integrations:
   - `integrationType: "unknown"`
   - `priority: "important"`

### Audit Tech Stack Structure

**Location:** `lib/types/audit.ts`

**Available Fields:**
```typescript
TechStackInfo {
  cms?: DetectedTechnology;              // e.g., WordPress, Shopify
  ecommerce?: DetectedTechnology;       // e.g., WooCommerce, Shopify
  analytics?: DetectedTechnology[];     // e.g., Google Analytics, Facebook Pixel
  paymentProcessors?: DetectedTechnology[]; // e.g., Stripe, PayPal, Square
  hosting?: DetectedTechnology;          // e.g., Vercel, AWS
  cdn?: DetectedTechnology;              // e.g., Cloudflare
  frameworks?: DetectedTechnology[];    // e.g., React, Next.js
  languages?: string[];                 // e.g., JavaScript, PHP
  otherTechnologies?: DetectedTechnology[];
}

DetectedTechnology {
  name: string;                          // e.g., "WordPress"
  version?: string;                     // e.g., "6.4"
  confidence: "high" | "medium" | "low";
  detectionMethod: "meta-tag" | "script" | "header" | "url-pattern" | "content-analysis";
}
```

## Proposed Mapping Table

### Mapping: Audit Fields → IntegrationRequirement

| Audit Field | Audit Example | systemName | systemType | integrationType | priority | Notes |
|-------------|---------------|------------|------------|-----------------|----------|-------|
| `cms.name` | "WordPress" | "WordPress" | `"other"` | `"api"` | `"important"` | CMS platform |
| `cms.name` | "Shopify" | "Shopify" | `"other"` | `"api"` | `"important"` | E-commerce platform |
| `ecommerce.name` | "WooCommerce" | "WooCommerce" | `"other"` | `"api"` | `"important"` | E-commerce platform |
| `paymentProcessors[].name` | "Stripe" | "Stripe" | `"payment"` | `"api"` | `"critical"` | Payment processor |
| `paymentProcessors[].name` | "PayPal" | "PayPal" | `"payment"` | `"api"` | `"critical"` | Payment processor |
| `paymentProcessors[].name` | "Square" | "Square" | `"payment"` | `"api"` | `"critical"` | Payment processor |
| `analytics[].name` | "Google Analytics" | "Google Analytics" | `"other"` | `"api"` | `"nice-to-have"` | Analytics platform |
| `analytics[].name` | "Facebook Pixel" | "Facebook Pixel" | `"other"` | `"api"` | `"nice-to-have"` | Analytics platform |

### Detailed Mapping Rules

#### 1. CMS Platforms

**Audit Field:** `techStack.cms.name`

**Mapping:**
- `systemName`: Use `cms.name` directly (e.g., "WordPress", "Shopify", "Wix")
- `systemType`: `"other"` (CMS doesn't fit existing categories perfectly)
- `integrationType`: `"api"` (most CMS platforms have APIs)
- `priority`: `"important"` (CMS is usually important but not critical)
- `notes`: `"Detected via site analysis"` (optional - indicates source)

**Confidence Filter:** Only include if `confidence: "high"` or `"medium"`

**Examples:**
- WordPress → `{ systemName: "WordPress", systemType: "other", integrationType: "api", priority: "important" }`
- Shopify → `{ systemName: "Shopify", systemType: "other", integrationType: "api", priority: "important" }`

#### 2. E-commerce Platforms

**Audit Field:** `techStack.ecommerce.name`

**Mapping:**
- `systemName`: Use `ecommerce.name` directly
- `systemType`: `"other"` (e-commerce is a platform, not a category)
- `integrationType`: `"api"` (most e-commerce platforms have APIs)
- `priority`: `"important"` (e-commerce is usually important)
- `notes`: `"Detected via site analysis"`

**Confidence Filter:** Only include if `confidence: "high"` or `"medium"`

**Note:** If both `cms` and `ecommerce` detect "Shopify", deduplicate (only add once)

#### 3. Payment Processors

**Audit Field:** `techStack.paymentProcessors[].name`

**Mapping:**
- `systemName`: Use `paymentProcessor.name` directly
- `systemType`: `"payment"` (matches existing category)
- `integrationType`: `"api"` (payment processors use APIs)
- `priority`: `"critical"` (payment integration is usually critical)
- `notes`: `"Detected via site analysis"`

**Confidence Filter:** Include all confidence levels (payment processors are usually detected reliably)

**Examples:**
- Stripe → `{ systemName: "Stripe", systemType: "payment", integrationType: "api", priority: "critical" }`
- PayPal → `{ systemName: "PayPal", systemType: "payment", integrationType: "api", priority: "critical" }`
- Square → `{ systemName: "Square", systemType: "payment", integrationType: "api", priority: "critical" }`

#### 4. Analytics Platforms

**Audit Field:** `techStack.analytics[].name`

**Mapping:**
- `systemName`: Use `analytics.name` directly
- `systemType`: `"other"` (analytics doesn't fit existing categories)
- `integrationType`: `"api"` (analytics platforms use APIs)
- `priority`: `"nice-to-have"` (analytics is useful but not critical)
- `notes`: `"Detected via site analysis"`

**Confidence Filter:** Include all confidence levels

**Examples:**
- Google Analytics → `{ systemName: "Google Analytics", systemType: "other", integrationType: "api", priority: "nice-to-have" }`
- Facebook Pixel → `{ systemName: "Facebook Pixel", systemType: "other", integrationType: "api", priority: "nice-to-have" }`

#### 5. What NOT to Map

**Skip These (Too Technical or Not Integration-Relevant):**
- ❌ `hosting.name` - Infrastructure, not an integration
- ❌ `cdn.name` - Infrastructure, not an integration
- ❌ `frameworks[].name` - Technical detail, not an integration
- ❌ `languages[]` - Technical detail, not an integration
- ❌ `otherTechnologies[]` - Too vague, may not be integrations

**Rationale:** Integrations are systems that need to *connect* with the new solution. Hosting/CDN/frameworks are infrastructure, not integration targets.

## Merge Strategy Recommendation

### Current Merge Strategy (from API)

**Location:** `app/api/discovery-tree/route.ts` (lines 203-223)

**Current Behavior:**
```typescript
// Deep merge arrays
integrations: body.discoveryTree.trunk?.integrations ?? mergedDiscoveryTree?.trunk?.integrations,
```

**Observation:** Current merge uses `??` operator, which means:
- If new data provided → use new data (replaces existing)
- If new data not provided → keep existing

**Issue:** This doesn't merge arrays, it replaces them.

### Recommended Merge Strategy

**Option A: Smart Merge (Recommended)**

**Logic:**
1. **Start with existing integrations** (if any)
2. **Add audit-derived integrations** that don't already exist
3. **Deduplicate by `systemName`** (case-insensitive)
4. **Preserve user edits** (if user modified an integration, keep their version)

**Implementation:**
```typescript
// Pseudocode
function mergeIntegrations(
  existing: IntegrationRequirement[],
  auditDerived: IntegrationRequirement[]
): IntegrationRequirement[] {
  const merged = [...existing];
  
  for (const auditIntegration of auditDerived) {
    // Check if already exists (by systemName, case-insensitive)
    const exists = merged.some(
      i => i.systemName.toLowerCase() === auditIntegration.systemName.toLowerCase()
    );
    
    if (!exists) {
      merged.push(auditIntegration);
    }
    // If exists, keep existing (user may have edited it)
  }
  
  return merged;
}
```

**Benefits:**
- ✅ Preserves user edits
- ✅ Adds audit data without overwriting
- ✅ Deduplicates intelligently
- ✅ Respects existing merge pattern

**Option B: Replace on First Load Only**

**Logic:**
- On initial pre-population (GET), merge audit data
- On subsequent saves (POST), never overwrite user edits

**Implementation:**
- GET handler: Merge audit data into existing
- POST handler: Use existing merge strategy (don't touch integrations if not provided)

**Benefits:**
- ✅ Simple to implement
- ✅ Only pre-populates once
- ✅ User edits are never overwritten

**Recommendation: Option A (Smart Merge)**

**Rationale:**
- More flexible - can re-run audit and merge new findings
- Respects user edits completely
- Handles edge cases better

## Implementation Approach

### Step 1: Create Mapping Function

**Location:** `lib/utils/audit-utils.ts` (or new `lib/utils/integration-mapper.ts`)

**Function:**
```typescript
/**
 * Derive integration requirements from audit tech stack
 */
export function deriveIntegrationsFromAudit(
  audit: WebsiteAuditResult
): IntegrationRequirement[] {
  const integrations: IntegrationRequirement[] = [];
  
  // CMS
  if (audit.techStack.cms && 
      (audit.techStack.cms.confidence === "high" || audit.techStack.cms.confidence === "medium")) {
    integrations.push({
      systemName: audit.techStack.cms.name,
      systemType: "other",
      integrationType: "api",
      priority: "important",
      notes: "Detected via site analysis",
    });
  }
  
  // E-commerce (if different from CMS)
  if (audit.techStack.ecommerce && 
      audit.techStack.ecommerce.name !== audit.techStack.cms?.name &&
      (audit.techStack.ecommerce.confidence === "high" || audit.techStack.ecommerce.confidence === "medium")) {
    integrations.push({
      systemName: audit.techStack.ecommerce.name,
      systemType: "other",
      integrationType: "api",
      priority: "important",
      notes: "Detected via site analysis",
    });
  }
  
  // Payment Processors (all confidence levels)
  if (audit.techStack.paymentProcessors) {
    audit.techStack.paymentProcessors.forEach(processor => {
      integrations.push({
        systemName: processor.name,
        systemType: "payment",
        integrationType: "api",
        priority: "critical",
        notes: "Detected via site analysis",
      });
    });
  }
  
  // Analytics (all confidence levels)
  if (audit.techStack.analytics) {
    audit.techStack.analytics.forEach(analytics => {
      integrations.push({
        systemName: analytics.name,
        systemType: "other",
        integrationType: "api",
        priority: "nice-to-have",
        notes: "Detected via site analysis",
      });
    });
  }
  
  return integrations;
}
```

### Step 2: Update GET Handler

**Location:** `app/api/discovery-tree/route.ts`

**Update:**
```typescript
import { deriveIntegrationsFromAudit } from "@/lib/utils/audit-utils";

// In GET handler, after fetching audit_results:
const auditResults = response.audit_results as WebsiteAuditResult | null;

// Derive integrations from audit
const auditIntegrations = auditResults 
  ? deriveIntegrationsFromAudit(auditResults)
  : [];

// Merge with existing integrations
const existingIntegrations = response.discovery_tree?.trunk?.integrations || [];
const mergedIntegrations = mergeIntegrations(existingIntegrations, auditIntegrations);

// Update discovery_tree with merged integrations
const prePopulateData: DiscoveryTreePrePopulateResponse = {
  // ... other fields
  discoveryTree: {
    ...(response.discovery_tree || {}),
    trunk: {
      ...(response.discovery_tree?.trunk || {}),
      integrations: mergedIntegrations.length > 0 ? mergedIntegrations : undefined,
    },
  },
};
```

### Step 3: Merge Helper Function

**Location:** `lib/utils/audit-utils.ts` (or same file as deriveIntegrationsFromAudit)

**Function:**
```typescript
/**
 * Merge audit-derived integrations with existing integrations
 * Preserves user edits, adds new audit findings
 */
export function mergeIntegrations(
  existing: IntegrationRequirement[],
  auditDerived: IntegrationRequirement[]
): IntegrationRequirement[] {
  const merged = [...existing];
  
  for (const auditIntegration of auditDerived) {
    // Check if already exists (by systemName, case-insensitive)
    const existingIndex = merged.findIndex(
      i => i.systemName.toLowerCase() === auditIntegration.systemName.toLowerCase()
    );
    
    if (existingIndex === -1) {
      // Doesn't exist - add it
      merged.push(auditIntegration);
    }
    // If exists, keep existing (user may have edited priority, notes, etc.)
  }
  
  return merged;
}
```

## Conflict Resolution

### Scenario 1: User Already Added Integration

**Existing:** `{ systemName: "Stripe", systemType: "payment", priority: "critical", notes: "User added manually" }`
**Audit:** `{ systemName: "Stripe", systemType: "payment", priority: "critical", notes: "Detected via site analysis" }`

**Resolution:** Keep existing (user's version takes precedence)

### Scenario 2: User Modified Priority

**Existing:** `{ systemName: "Google Analytics", priority: "critical", notes: "User modified" }`
**Audit:** `{ systemName: "Google Analytics", priority: "nice-to-have", notes: "Detected via site analysis" }`

**Resolution:** Keep existing (user's priority modification is preserved)

### Scenario 3: New Audit Finding

**Existing:** `[{ systemName: "Stripe" }]`
**Audit:** Detects "PayPal" (not in existing)

**Resolution:** Add PayPal to integrations array

### Scenario 4: Case Sensitivity

**Existing:** `[{ systemName: "stripe" }]` (lowercase)
**Audit:** `{ systemName: "Stripe" }` (capitalized)

**Resolution:** Treat as duplicate (case-insensitive match), keep existing

## Type Changes Needed

### No Type Changes Required ✅

**Rationale:**
- `IntegrationRequirement` type already supports all needed fields
- `DiscoveryTrunk.integrations` is already `IntegrationRequirement[]`
- No new fields needed
- Mapping uses existing `systemType` values

**Optional Enhancement:**
- Could add `source?: "user" | "audit"` field to track origin
- But not necessary for V1 - `notes` field can indicate source

## Example Scenarios

### Scenario 1: Empty Integrations, Audit Detects Stripe

**Input:**
- Existing: `[]`
- Audit: `{ techStack: { paymentProcessors: [{ name: "Stripe", confidence: "high" }] } }`

**Output:**
```typescript
{
  integrations: [
    {
      systemName: "Stripe",
      systemType: "payment",
      integrationType: "api",
      priority: "critical",
      notes: "Detected via site analysis"
    }
  ]
}
```

### Scenario 2: User Added Stripe, Audit Detects PayPal

**Input:**
- Existing: `[{ systemName: "Stripe", systemType: "payment", priority: "critical" }]`
- Audit: `{ techStack: { paymentProcessors: [{ name: "PayPal", confidence: "high" }] } }`

**Output:**
```typescript
{
  integrations: [
    {
      systemName: "Stripe",
      systemType: "payment",
      priority: "critical"
    },
    {
      systemName: "PayPal",
      systemType: "payment",
      integrationType: "api",
      priority: "critical",
      notes: "Detected via site analysis"
    }
  ]
}
```

### Scenario 3: User Modified, Audit Detects Same

**Input:**
- Existing: `[{ systemName: "Stripe", systemType: "payment", priority: "nice-to-have", notes: "User changed priority" }]`
- Audit: `{ techStack: { paymentProcessors: [{ name: "Stripe", confidence: "high" }] } }`

**Output:**
```typescript
{
  integrations: [
    {
      systemName: "Stripe",
      systemType: "payment",
      priority: "nice-to-have", // User's modification preserved
      notes: "User changed priority" // User's notes preserved
    }
  ]
}
```

## Summary

### Mapping Table Summary

| Audit Field | Maps To | systemType | priority | Confidence Filter |
|-------------|---------|------------|---------|-------------------|
| `cms.name` | Integration | `"other"` | `"important"` | high/medium only |
| `ecommerce.name` | Integration | `"other"` | `"important"` | high/medium only |
| `paymentProcessors[].name` | Integration | `"payment"` | `"critical"` | all levels |
| `analytics[].name` | Integration | `"other"` | `"nice-to-have"` | all levels |

### Merge Strategy

**Recommended: Smart Merge**
- Preserve existing integrations (user edits)
- Add audit-derived integrations that don't exist
- Deduplicate by `systemName` (case-insensitive)
- User edits always take precedence

### Implementation

1. Create `deriveIntegrationsFromAudit()` function
2. Create `mergeIntegrations()` helper function
3. Update GET handler to merge audit integrations
4. No type changes needed ✅

### Benefits

1. **Reduces Manual Input:** Pre-populates common integrations
2. **Increases Accuracy:** Based on actual site analysis
3. **Respects User Edits:** Never overwrites user modifications
4. **Non-Breaking:** Works with existing UI and types
