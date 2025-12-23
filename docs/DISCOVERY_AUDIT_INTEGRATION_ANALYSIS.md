# Discovery Tree & Audit Integration Analysis

## Current Discovery System Structure

### 1. **API Layer** (`app/api/discovery-tree/route.ts`)

**GET Endpoint:**
- Fetches questionnaire response from database
- Selects: `sector_specific_data`, `business_profile`, `goals`, `primary_offers`, `discovery_tree`
- **Derives `currentStack`** from `sector_specific_data` using `deriveCurrentStack()` function
- Returns `DiscoveryTreePrePopulateResponse` with pre-populated data

**POST Endpoint:**
- Updates discovery tree data with merge strategy
- Supports partial updates (doesn't overwrite unrelated fields)
- Returns updated subset

**Key Pattern:** Single source of truth - GET endpoint builds complete pre-population payload

### 2. **Type System** (`lib/types/discovery.ts`)

**Core Types:**
- `DiscoveryTreePrePopulateResponse` - Complete pre-population payload
  - `client`: Basic client info
  - `businessProfile`: Business size/maturity
  - `currentStack`: Derived from sector_specific_data
  - `goals`: Array from questionnaire
  - `primaryOffers`: Array from questionnaire
  - `discoveryTree`: Stored discovery tree data

**Data Flow Pattern:**
- Database → API → Types → UI Components
- Types are the contract between API and UI

### 3. **UI Layer**

**Page Component** (`app/discovery/[id]/page.tsx`):
- Fetches discovery data via GET `/api/discovery-tree`
- **Separately fetches audit** via GET `/api/audit-website/get`
- Passes both to `DiscoveryTreeForm`
- Handles loading/error states

**Form Component** (`components/discovery/DiscoveryTreeForm.tsx`):
- Uses `useReducer` for state management
- Initializes from `prePopulateData`
- Passes audit as separate prop to `SummarySidebar`
- Manages save/continue actions

**Sidebar Component** (`components/discovery/SummarySidebar.tsx`):
- Receives: `client`, `businessProfile`, `currentStack`, `discoveryTree`, `audit`, `auditLoading`
- **Already includes `AuditCard`** at the top
- Shows feature estimates, client info, business profile, current stack, project estimate

## Current Integration Status

✅ **Audit is already integrated!**
- Audit fetched separately in discovery page
- Passed as props through component tree
- Displayed in `AuditCard` component in sidebar
- Loading states handled gracefully

## Where Audit Should Enhance the System

### Option 1: Enhance `currentStack` (RECOMMENDED)

**Current:** `currentStack` is derived from `sector_specific_data` only

**Enhancement:** Merge audit `techStack` into `currentStack` in GET endpoint

**Benefits:**
- More accurate tech stack detection
- Audit data feels native to discovery system
- Single source of truth for "current systems"
- No UI changes needed

**Implementation:**
```typescript
// In GET /api/discovery-tree
function deriveCurrentStack(
  sectorSpecificData: any,
  sector: Sector,
  auditResults?: WebsiteAuditResult  // Add audit parameter
): CurrentStack {
  const stack = { systems: [], integrations: [], notes: "" };
  
  // Existing sector-specific derivation...
  
  // Enhance with audit data if available
  if (auditResults?.techStack) {
    // Merge CMS
    if (auditResults.techStack.cms && !stack.systems.includes(auditResults.techStack.cms.name)) {
      stack.systems.push(auditResults.techStack.cms.name.toLowerCase());
    }
    
    // Merge analytics
    auditResults.techStack.analytics?.forEach(analytics => {
      if (!stack.systems.includes(analytics.name.toLowerCase())) {
        stack.systems.push(analytics.name.toLowerCase());
      }
    });
    
    // Merge payment processors as integrations
    auditResults.techStack.paymentProcessors?.forEach(payment => {
      if (!stack.integrations?.includes(payment.name.toLowerCase())) {
        stack.integrations = stack.integrations || [];
        stack.integrations.push(payment.name.toLowerCase());
      }
    });
  }
  
  return stack;
}
```

### Option 2: Add Audit to Pre-Populate Response

**Enhancement:** Include audit in `DiscoveryTreePrePopulateResponse`

**Benefits:**
- Single API call instead of two
- Audit becomes part of discovery data contract
- Simpler UI code

**Trade-offs:**
- GET endpoint becomes slower (waits for audit)
- Breaks async pattern (audit may not be ready)
- Less flexible (can't handle audit loading separately)

**Not Recommended** - Breaks async pattern, makes GET endpoint slower

### Option 3: Pre-Populate Discovery Tree Trunk

**Enhancement:** Use audit data to pre-fill integration questions in TrunkSection

**Benefits:**
- Reduces manual data entry
- More accurate integration discovery
- Better UX

**Implementation:**
```typescript
// In GET endpoint, enhance discoveryTree.trunk with audit data
if (auditResults?.techStack) {
  const integrations: IntegrationRequirement[] = [];
  
  // Map audit tech stack to integration requirements
  auditResults.techStack.analytics?.forEach(analytics => {
    integrations.push({
      systemName: analytics.name,
      systemType: "crm", // or map appropriately
      integrationType: "api",
      priority: "important",
    });
  });
  
  // Merge into existing trunk
  prePopulateData.discoveryTree = {
    ...prePopulateData.discoveryTree,
    trunk: {
      ...prePopulateData.discoveryTree?.trunk,
      integrations: [
        ...(prePopulateData.discoveryTree?.trunk?.integrations || []),
        ...integrations,
      ],
    },
  };
}
```

## Constraints & Patterns to Respect

### 1. **Async Pattern**
- ✅ Audit runs asynchronously (fire-and-forget)
- ✅ GET endpoint should NOT wait for audit
- ✅ UI handles loading states gracefully
- ✅ Audit failures don't break discovery flow

### 2. **Data Flow Pattern**
- ✅ Database → API → Types → UI Components
- ✅ Single source of truth in GET endpoint
- ✅ Props flow down, callbacks flow up
- ✅ No direct database access from UI

### 3. **Merge Strategy**
- ✅ POST endpoint uses merge (not overwrite)
- ✅ Partial updates supported
- ✅ Existing data preserved when merging

### 4. **Error Handling**
- ✅ Non-blocking errors (audit failures don't break questionnaire)
- ✅ Graceful degradation (show what's available)
- ✅ Console logging for debugging
- ✅ User-friendly error messages

### 5. **Type Safety**
- ✅ All types defined in `lib/types/`
- ✅ API responses match type definitions
- ✅ Props are typed
- ✅ No `any` types in public APIs

### 6. **Naming Conventions**
- ✅ API endpoints: `/api/discovery-tree`, `/api/audit-website`
- ✅ Database columns: snake_case (`audit_results`, `website_url`)
- ✅ TypeScript: camelCase (`auditResults`, `websiteUrl`)
- ✅ Components: PascalCase (`AuditCard`, `SummarySidebar`)

### 7. **Component Patterns**
- ✅ Functional components with hooks
- ✅ Props interface defined above component
- ✅ useReducer for complex state
- ✅ useCallback for event handlers
- ✅ useEffect for initialization

## Recommended Integration Approach

### Primary Enhancement: Merge Audit into `currentStack`

**Why:**
- `currentStack` is already displayed in sidebar
- Audit tech stack is complementary to sector-specific data
- No UI changes needed
- Feels native to discovery system

**Implementation:**
1. Update GET `/api/discovery-tree` to fetch `audit_results`
2. Pass audit to `deriveCurrentStack()` function
3. Merge audit tech stack into currentStack
4. Return enhanced currentStack in response

**Code Location:**
- `app/api/discovery-tree/route.ts` - Line 28-81 (`deriveCurrentStack` function)
- `app/api/discovery-tree/route.ts` - Line 104-110 (SELECT query - add `audit_results`)

### Secondary Enhancement: Pre-Populate Trunk Integrations

**Why:**
- Reduces manual data entry
- More accurate integration discovery
- Better UX

**Implementation:**
1. Map audit tech stack to `IntegrationRequirement[]`
2. Merge into `discoveryTree.trunk.integrations`
3. Return in pre-populate response

**Code Location:**
- `app/api/discovery-tree/route.ts` - Line 127-142 (build prePopulateData)

## Files to Update

1. **`app/api/discovery-tree/route.ts`**
   - Add `audit_results` to SELECT query
   - Update `deriveCurrentStack()` to accept audit parameter
   - Enhance `currentStack` with audit data
   - Optionally pre-populate trunk integrations

2. **`lib/types/discovery.ts`**
   - No changes needed (audit stays separate type)
   - Or add optional `audit` field to `DiscoveryTreePrePopulateResponse` if desired

3. **UI Components**
   - No changes needed (already integrated)
   - Or remove separate audit fetch if adding to pre-populate response

## Summary

**Current State:**
- ✅ Audit system is built and working
- ✅ Audit is displayed in sidebar via AuditCard
- ✅ Audit fetched separately (good - async pattern)

**Recommended Enhancement:**
1. **Merge audit tech stack into `currentStack`** - Makes audit feel native
2. **Pre-populate trunk integrations** - Reduces manual entry

**Constraints to Respect:**
- Keep async pattern (don't block GET endpoint)
- Use merge strategy (don't overwrite)
- Maintain type safety
- Follow existing naming conventions
- Handle errors gracefully
