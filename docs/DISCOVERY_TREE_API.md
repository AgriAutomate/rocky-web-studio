# Discovery Tree API Documentation

## Overview

The Discovery Tree API extends the base questionnaire system to support guided discovery and richer data collection for project planning. It provides endpoints to store and retrieve discovery tree data, business profiles, and sector-specific operational details.

## Database Schema

### New Columns Added to `questionnaire_responses`

- `sector_specific_data JSONB` - Stores sector-specific answers (h6-h10, t6-t10, r6-r10, p6-p10)
- `goals JSONB` - Array of selected goal identifiers from questionnaire q3
- `primary_offers JSONB` - Array of selected primary business offer identifiers from questionnaire q5
- `business_profile JSONB` - Business profile data (revenue, employees, years, digital maturity)
- `discovery_tree JSONB` - Guided discovery tree data (trunk, branches, priorities)

All columns are nullable and have GIN indexes for efficient JSONB queries.

## API Endpoints

### GET /api/discovery-tree

Fetches existing questionnaire data and returns a pre-population payload for the discovery UI.

**Query Parameters:**
- `questionnaireResponseId` (required) - The ID of the questionnaire response

**Response:**
```json
{
  "client": {
    "name": "John Doe",
    "businessName": "Acme Corp",
    "sector": "hospitality"
  },
  "businessProfile": {
    "annualRevenue": "0-100k",
    "employeeCount": "1-5",
    "yearsInBusiness": "0-2",
    "digitalMaturity": "basic"
  },
  "currentStack": {
    "systems": ["square", "toast"],
    "integrations": [],
    "notes": "Currently using Square POS and Toast for reservations"
  },
  "goals": ["reduce-operating-costs", "increase-online-visibility"],
  "primaryOffers": ["hospitality-food"],
  "discoveryTree": null
}
```

**Error Responses:**
- `400` - Missing questionnaireResponseId parameter
- `404` - Questionnaire response not found
- `500` - Server error

### POST /api/discovery-tree

Updates questionnaire response with discovery tree data. Merges new data into existing fields without overwriting unrelated data.

**Request Body:**
```json
{
  "questionnaireResponseId": "123",
  "businessProfile": {
    "annualRevenue": "100-500k",
    "employeeCount": "6-20",
    "yearsInBusiness": "3-5",
    "digitalMaturity": "intermediate"
  },
  "discoveryTree": {
    "trunk": {
      "integrations": [
        {
          "systemName": "Xero",
          "systemType": "accounting",
          "integrationType": "api",
          "priority": "critical",
          "notes": "Need real-time sync"
        }
      ],
      "dataMigration": {
        "hasExistingData": true,
        "dataTypes": ["customers", "products"],
        "dataVolume": "medium",
        "currentSystem": "Shopify",
        "exportFormat": "csv"
      },
      "successMetrics": [
        {
          "metric": "Increase online bookings by 30%",
          "target": "30%",
          "timeframe": "within 6 months",
          "priority": "critical"
        }
      ]
    },
    "branches": {
      "hospitality": {
        "bookingModel": "table",
        "channels": ["walkins", "phone", "online"],
        "serviceFlow": "Average 2 table turns per night",
        "posPmsStack": "Using Square POS and ResDiary",
        "menuInventoryComplexity": "Menu changes weekly, ~50 items"
      }
    },
    "priorities": {
      "mustHave": ["Online booking system", "Payment integration"],
      "niceToHave": ["Loyalty program", "Email marketing"],
      "future": ["Mobile app", "AI chatbot"]
    }
  },
  "goals": ["reduce-operating-costs", "increase-online-visibility"],
  "primaryOffers": ["hospitality-food"]
}
```

**Response:**
```json
{
  "id": "123",
  "businessProfile": {
    "annualRevenue": "100-500k",
    "employeeCount": "6-20",
    "yearsInBusiness": "3-5",
    "digitalMaturity": "intermediate"
  },
  "discoveryTree": {
    "trunk": { ... },
    "branches": { ... },
    "priorities": { ... }
  },
  "goals": ["reduce-operating-costs", "increase-online-visibility"],
  "primaryOffers": ["hospitality-food"],
  "updatedAt": "2025-01-22T10:30:00Z"
}
```

**Error Responses:**
- `400` - Missing questionnaireResponseId or invalid request body
- `404` - Questionnaire response not found
- `500` - Server error

## TypeScript Types

All types are defined in `lib/types/discovery.ts`:

- `BusinessProfile` - Business size and digital maturity
- `DiscoveryTree` - Complete discovery tree structure
- `DiscoveryTrunk` - Universal questions (integrations, data migration, success metrics)
- `HospitalityBranch`, `RetailBranch`, `TradesBranch`, `ProfessionalServicesBranch` - Sector-specific data
- `FeaturePriorities` - Must-have, nice-to-have, future features

## Usage Examples

### Fetching Discovery Data

```typescript
const response = await fetch(
  `/api/discovery-tree?questionnaireResponseId=${responseId}`
);
const data = await response.json();

// Pre-populate discovery UI with existing data
setBusinessProfile(data.businessProfile || defaultProfile);
setDiscoveryTree(data.discoveryTree || null);
setGoals(data.goals);
setPrimaryOffers(data.primaryOffers);
```

### Saving Discovery Data

```typescript
const updateData = {
  questionnaireResponseId: responseId,
  businessProfile: {
    annualRevenue: "100-500k",
    employeeCount: "6-20",
    yearsInBusiness: "3-5",
    digitalMaturity: "intermediate",
  },
  discoveryTree: {
    trunk: {
      integrations: [
        {
          systemName: "Xero",
          systemType: "accounting",
          integrationType: "api",
          priority: "critical",
        },
      ],
    },
    branches: {
      hospitality: {
        bookingModel: "table",
        channels: ["walkins", "online"],
      },
    },
    priorities: {
      mustHave: ["Online booking"],
      niceToHave: ["Loyalty program"],
      future: [],
    },
  },
};

const response = await fetch("/api/discovery-tree", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(updateData),
});
```

## Data Model Notes

### Merging Strategy

The POST endpoint uses a **merge strategy** rather than overwrite:

- **Business Profile**: Partial updates merge with existing data
- **Discovery Tree**: Deep merge for trunk, branches, and priorities
- **Goals/Offers**: Replace if provided, otherwise keep existing

### Sector-Specific Data Structure

Sector-specific data is stored as a flat object with keys matching question IDs:

```json
{
  "h6": "table",
  "h7": ["walkins", "phone", "online"],
  "h8": "Average 2 table turns per night",
  "h9": "Using Square POS and ResDiary",
  "h10": "Menu changes weekly, ~50 items"
}
```

### Current Stack Derivation

The GET endpoint automatically derives `currentStack` from `sector_specific_data`:

- Extracts system names from textarea fields (h9, t8, r8, p9)
- Identifies common tools (POS systems, PM tools, etc.)
- Maps channels to systems (e.g., Shopify from r7)

## Future Extensions

### Adding New Discovery Questions

1. **Add to TypeScript types** (`lib/types/discovery.ts`):
   - Extend `DiscoveryTrunk` for universal questions
   - Extend sector branch types for sector-specific questions

2. **Update API route** (`app/api/discovery-tree/route.ts`):
   - Add merging logic for new fields
   - Update `deriveCurrentStack` if needed

3. **Update frontend**:
   - Add UI components for new questions
   - Map form data to discovery tree structure

### Adding New Sectors

1. **Add branch type** in `lib/types/discovery.ts`
2. **Update `SectorBranch` union type**
3. **Add to `discoveryTree.branches` in API**
4. **Update `deriveCurrentStack` logic**

## Migration

Run the migration to add new columns:

```sql
-- Run: supabase/migrations/20250122_add_discovery_tree_columns.sql
```

The migration is idempotent and safe for existing rows (uses `IF NOT EXISTS`).

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (in development)"
}
```

Always check response status before parsing JSON:

```typescript
if (!response.ok) {
  const error = await response.json();
  console.error("API Error:", error.error);
  return;
}
```
