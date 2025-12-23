# Merging Audit Tech Stack into Current Stack - Proposal

## Current State Analysis

### Current `deriveCurrentStack()` Function

**Location:** `app/api/discovery-tree/route.ts` (lines 28-81)

**Current Behavior:**
- Takes `sectorSpecificData` (JSONB) and `sector` (Sector type)
- Uses regex patterns to extract system names from sector-specific text fields:
  - **Hospitality:** Extracts from `h9` (POS/PMS stack textarea)
  - **Construction:** Extracts from `t8` (dispatch/routing tools textarea)
  - **Retail:** Uses `r7` directly (channels array)
  - **Professional Services:** Extracts from `p9` (delivery tooling textarea)
- Returns: `{ systems?: string[]; integrations?: string[]; notes?: string }`
- Currently only populates `systems` and `notes` (not `integrations`)

**Current Type Definition:**
```typescript
// In DiscoveryTreePrePopulateResponse
currentStack: {
  systems?: string[];
  integrations?: string[];
  notes?: string;
}
```

### Audit Tech Stack Structure

**Location:** `lib/types/audit.ts`

**Available Data:**
```typescript
TechStackInfo {
  cms?: DetectedTechnology;           // e.g., WordPress, Shopify
  ecommerce?: DetectedTechnology;     // e.g., WooCommerce, Shopify
  analytics?: DetectedTechnology[];    // e.g., Google Analytics, Facebook Pixel
  paymentProcessors?: DetectedTechnology[]; // e.g., Stripe, PayPal
  hosting?: DetectedTechnology;        // e.g., Vercel, AWS
  cdn?: DetectedTechnology;           // e.g., Cloudflare
  frameworks?: DetectedTechnology[];   // e.g., React, Next.js
  languages?: string[];               // e.g., JavaScript, PHP
  otherTechnologies?: DetectedTechnology[];
}

DetectedTechnology {
  name: string;                        // e.g., "WordPress"
  version?: string;                    // e.g., "6.4"
  confidence: "high" | "medium" | "low";
  detectionMethod: "meta-tag" | "script" | "header" | "url-pattern" | "content-analysis";
}
```

## Proposed Merge Strategy

### Fields to Merge from Audit

**1. Systems (Primary Merge Target)**

**From Audit:**
- `cms.name` → Add to `systems` array
- `ecommerce.name` → Add to `systems` array
- `hosting.name` → Add to `systems` array (optional - may be less relevant)
- `frameworks[].name` → Add to `systems` array (optional - technical detail)

**Rationale:**
- CMS and ecommerce platforms are "systems" the client uses
- Hosting/CDN are infrastructure but less user-facing
- Frameworks are technical details, may be too granular

**2. Integrations (New Merge Target)**

**From Audit:**
- `paymentProcessors[].name` → Add to `integrations` array
- `analytics[].name` → Add to `integrations` array

**Rationale:**
- Payment processors are integrations (connect to payment systems)
- Analytics are integrations (connect to tracking systems)
- These map naturally to the `integrations` field

**3. Notes (Enhancement)**

**From Audit:**
- If audit detects CMS/ecommerce, add to notes: "Detected via site analysis: WordPress, Stripe"
- Merge with existing sector-derived notes

**Rationale:**
- Provides context about where the information came from
- Helps user understand the data source

### Conflict Resolution Strategy

**Precedence Rules:**

1. **Sector-Derived Data Takes Precedence** (if both exist)
   - If sector data says "Square POS" and audit says "Stripe", prefer sector data
   - Rationale: Client explicitly stated their systems in questionnaire

2. **Audit Data Complements** (if sector data missing)
   - If sector data has no systems but audit detects WordPress → Add WordPress
   - Rationale: Audit fills gaps, doesn't override explicit client input

3. **Merge Arrays** (combine unique values)
   - Sector: `["Square", "ResDiary"]`
   - Audit: `["WordPress", "Stripe"]`
   - Result: `["Square", "ResDiary", "WordPress", "Stripe"]`
   - Rationale: Both sources are valid, combine them

4. **Confidence-Based Filtering** (optional enhancement)
   - Only include audit data with `confidence: "high"` or `"medium"`
   - Filter out `confidence: "low"` unless no other data exists
   - Rationale: Avoid false positives from low-confidence detections

### Source Tracking (Optional but Recommended)

**Proposal: Track source per item**

**Option A: Simple Source Array**
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

**Option B: Rich Source Tracking** (More detailed)
```typescript
currentStack: {
  systems?: Array<{
    name: string;
    source: "sector" | "audit" | "merged";
    confidence?: "high" | "medium" | "low"; // Only if from audit
  }>;
  integrations?: Array<{
    name: string;
    source: "sector" | "audit" | "merged";
    confidence?: "high" | "medium" | "low";
  }>;
  notes?: string;
}
```

**Recommendation: Option A (Simple)**

**Rationale:**
- Keeps currentStack simple and easy to consume
- UI doesn't need to know source for most use cases
- Can add rich tracking later if needed
- Matches existing simple structure

**Usage:**
- If `sources` exists, UI can show "Detected via site analysis" badge
- If not present, assume all from sector (backward compatible)

## Type Changes Needed

### Minimal Change (Recommended)

**Update `DiscoveryTreePrePopulateResponse.currentStack`:**
```typescript
currentStack: {
  systems?: string[];
  integrations?: string[];
  notes?: string;
  // Optional: Track which items came from audit
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
- ✅ Can enhance later if needed

### Enhanced Change (Future)

If we want richer tracking:
```typescript
interface CurrentStackItem {
  name: string;
  source: "sector" | "audit" | "merged";
  confidence?: "high" | "medium" | "low"; // Only if from audit
}

currentStack: {
  systems?: CurrentStackItem[];
  integrations?: CurrentStackItem[];
  notes?: string;
}
```

**Trade-off:**
- More detailed but requires UI changes
- More complex to implement
- Better for future features (filtering, sorting by confidence)

## Implementation Approach

### Step 1: Update `deriveCurrentStack()` Function

**New Signature:**
```typescript
function deriveCurrentStack(
  sectorSpecificData: any,
  sector: Sector,
  auditResults?: WebsiteAuditResult | null
): {
  systems?: string[];
  integrations?: string[];
  notes?: string;
  sources?: {
    systems?: ("sector" | "audit")[];
    integrations?: ("sector" | "audit")[];
  };
}
```

**Logic Flow:**
1. Start with sector-derived data (existing logic)
2. Extract audit tech stack data
3. Merge arrays (combine unique values)
4. Track sources (which items came from where)
5. Enhance notes with audit context

### Step 2: Update GET Handler

**Current:**
```typescript
.select("id, first_name, last_name, business_name, sector, sector_specific_data, business_profile, goals, primary_offers, discovery_tree")
```

**Updated:**
```typescript
.select("id, first_name, last_name, business_name, sector, sector_specific_data, business_profile, goals, primary_offers, discovery_tree, audit_results")
```

**Then:**
```typescript
currentStack: deriveCurrentStack(
  response.sector_specific_data,
  response.sector as Sector,
  response.audit_results as WebsiteAuditResult | null
),
```

### Step 3: Update Type Definition

**File:** `lib/types/discovery.ts`

**Update `DiscoveryTreePrePopulateResponse`:**
```typescript
export interface DiscoveryTreePrePopulateResponse {
  client: {
    name: string;
    businessName: string;
    sector: Sector;
  };
  businessProfile: BusinessProfile | null;
  currentStack: {
    systems?: string[];
    integrations?: string[];
    notes?: string;
    sources?: {
      systems?: ("sector" | "audit")[];
      integrations?: ("sector" | "audit")[];
    };
  };
  goals: string[];
  primaryOffers: string[];
  discoveryTree: DiscoveryTree | null;
}
```

## Detailed Merge Logic

### Systems Merge

**From Sector:**
- Extract from sector-specific text fields (existing regex patterns)
- Mark all as `source: "sector"`

**From Audit:**
- `cms.name` → Add to systems (if confidence ≥ "medium")
- `ecommerce.name` → Add to systems (if confidence ≥ "medium")
- `hosting.name` → Skip (too technical, less relevant)
- `frameworks[].name` → Skip (too technical, less relevant)

**Merge Rules:**
- Combine arrays, remove duplicates (case-insensitive)
- If duplicate exists:
  - Prefer sector data (client explicitly stated)
  - Mark as `source: "merged"` if tracking sources

### Integrations Merge

**From Sector:**
- Currently not populated (field exists but unused)
- Could extract from sector-specific data in future

**From Audit:**
- `paymentProcessors[].name` → Add to integrations (all confidence levels)
- `analytics[].name` → Add to integrations (all confidence levels)

**Merge Rules:**
- Combine arrays, remove duplicates
- Mark all as `source: "audit"` (sector doesn't currently populate this)

### Notes Merge

**From Sector:**
- Existing notes from sector-specific text fields

**From Audit:**
- If audit detected technologies, append: "Detected via site analysis: [technologies]"

**Merge Rules:**
- Combine with separator: `"\n\n"` or `" | "`
- Format: `"[Sector notes] | Detected via site analysis: WordPress, Stripe"`

## Example Scenarios

### Scenario 1: Sector Data Only

**Input:**
- Sector: Hospitality
- Sector Data: `{ h9: "Using Square POS and ResDiary" }`
- Audit: `null`

**Output:**
```typescript
{
  systems: ["square", "resdiary"],
  integrations: [],
  notes: "Using Square POS and ResDiary",
  sources: {
    systems: ["sector", "sector"]
  }
}
```

### Scenario 2: Audit Data Only

**Input:**
- Sector: Retail
- Sector Data: `{}` (no systems mentioned)
- Audit: `{ techStack: { cms: { name: "Shopify", confidence: "high" }, paymentProcessors: [{ name: "Stripe", confidence: "high" }] } }`

**Output:**
```typescript
{
  systems: ["shopify"],
  integrations: ["stripe"],
  notes: "Detected via site analysis: Shopify, Stripe",
  sources: {
    systems: ["audit"],
    integrations: ["audit"]
  }
}
```

### Scenario 3: Both Sources (Merge)

**Input:**
- Sector: Hospitality
- Sector Data: `{ h9: "Using Square POS" }`
- Audit: `{ techStack: { cms: { name: "WordPress", confidence: "high" }, paymentProcessors: [{ name: "Stripe", confidence: "high" }] } }`

**Output:**
```typescript
{
  systems: ["square", "wordpress"],
  integrations: ["stripe"],
  notes: "Using Square POS | Detected via site analysis: WordPress, Stripe",
  sources: {
    systems: ["sector", "audit"],
    integrations: ["audit"]
  }
}
```

### Scenario 4: Conflict Resolution

**Input:**
- Sector: Retail
- Sector Data: `{ r7: ["shopify"] }`
- Audit: `{ techStack: { cms: { name: "WooCommerce", confidence: "high" } } }`

**Output:**
```typescript
{
  systems: ["shopify", "woocommerce"], // Both included (no conflict, different systems)
  integrations: [],
  notes: "shopify | Detected via site analysis: WooCommerce",
  sources: {
    systems: ["sector", "audit"]
  }
}
```

**Note:** If both said "Shopify", we'd deduplicate and prefer sector source.

## UI Impact

### Current UI (No Changes Needed)

**Current:**
```tsx
{currentStack.systems.map((system, index) => (
  <span key={index}>{system}</span>
))}
```

**Still Works:** Arrays are still strings, UI doesn't need to change

### Enhanced UI (Optional)

**If sources tracking added:**
```tsx
{currentStack.systems.map((system, index) => {
  const source = currentStack.sources?.systems?.[index];
  return (
    <span key={index}>
      {system}
      {source === "audit" && (
        <Badge variant="outline" className="ml-1 text-xs">
          Detected
        </Badge>
      )}
    </span>
  );
})}
```

## Summary

### Fields to Merge

**Systems:**
- ✅ `cms.name` (if confidence ≥ "medium")
- ✅ `ecommerce.name` (if confidence ≥ "medium")
- ❌ `hosting.name` (skip - too technical)
- ❌ `frameworks[].name` (skip - too technical)

**Integrations:**
- ✅ `paymentProcessors[].name` (all confidence levels)
- ✅ `analytics[].name` (all confidence levels)

**Notes:**
- ✅ Append audit-detected technologies to notes

### Conflict Resolution

1. **Sector data takes precedence** (if both exist)
2. **Audit data complements** (fills gaps)
3. **Merge arrays** (combine unique values)
4. **Filter by confidence** (only high/medium for systems)

### Source Tracking

**Recommended:** Simple array tracking
- `sources.systems?: ("sector" | "audit")[]`
- `sources.integrations?: ("sector" | "audit")[]`
- Optional field (backward compatible)

### Type Changes

**Minimal:**
- Add optional `sources` object to `currentStack`
- Keep arrays as `string[]` (simple, easy to consume)

**Future Enhancement:**
- Could change to `CurrentStackItem[]` for richer tracking
- Requires UI changes but provides more detail
