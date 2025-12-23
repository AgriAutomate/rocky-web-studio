# Discovery Tree Implementation Summary

## Overview

Extended the questionnaire system to support a guided discovery tree for richer project planning data. This implementation adds database columns, TypeScript types, and API endpoints to store and retrieve discovery data.

## Files Created

### 1. Database Migration
**File:** `supabase/migrations/20250122_add_discovery_tree_columns.sql`

- Adds 5 new JSONB columns to `questionnaire_responses` table
- Creates GIN indexes for efficient JSONB queries
- Idempotent migration (safe to run multiple times)
- All columns are nullable to support existing data

**New Columns:**
- `sector_specific_data JSONB` - Sector-specific operational answers
- `goals JSONB` - Selected goals array
- `primary_offers JSONB` - Selected primary offers array
- `business_profile JSONB` - Business size and digital maturity
- `discovery_tree JSONB` - Complete discovery tree structure

### 2. TypeScript Types
**File:** `lib/types/discovery.ts`

Comprehensive type definitions for:
- `BusinessProfile` - Revenue, employees, years, digital maturity
- `DiscoveryTree` - Complete tree structure
- `DiscoveryTrunk` - Universal questions (integrations, data migration, success metrics)
- Sector branches: `HospitalityBranch`, `RetailBranch`, `TradesBranch`, `ProfessionalServicesBranch`
- `FeaturePriorities` - Must-have, nice-to-have, future features
- API request/response types

### 3. API Routes
**File:** `app/api/discovery-tree/route.ts`

Two endpoints implemented:

#### GET /api/discovery-tree
- Fetches questionnaire response by ID
- Returns pre-population data for discovery UI
- Automatically derives `currentStack` from sector-specific data
- Provides sensible defaults for missing data

#### POST /api/discovery-tree
- Updates questionnaire response with discovery data
- Uses merge strategy (doesn't overwrite unrelated fields)
- Supports partial updates
- Returns updated record subset

### 4. Updated Files

#### `lib/utils/supabase-client.ts`
- Updated `storeQuestionnaireResponse()` to store:
  - Sector-specific data (h6-h10, t6-t10, r6-r10, p6-p10)
  - Goals array
  - Primary offers array

#### `app/api/questionnaire/submit/route.ts`
- Extracts sector-specific data from raw form body
- Extracts goals and primary offers
- Passes extracted data to storage function

### 5. Documentation
**File:** `docs/DISCOVERY_TREE_API.md`

Complete API documentation with:
- Endpoint specifications
- Request/response examples
- TypeScript usage examples
- Data model notes
- Future extension guidelines

## Key Features

### ✅ Data Storage
- Sector-specific answers now stored (previously lost)
- Goals and primary offers properly stored (previously only used for PDF)
- Business profile can be collected and stored
- Discovery tree supports guided discovery workflow

### ✅ Type Safety
- Full TypeScript types for all data structures
- Narrow types with string unions where appropriate
- Flexible optional fields for extensibility

### ✅ API Design
- RESTful endpoints
- Consistent error handling
- Merge strategy prevents data loss
- Pre-population support for better UX

### ✅ Performance
- GIN indexes on JSONB columns for efficient queries
- Minimal database round trips
- Efficient data derivation

## Usage Flow

1. **Questionnaire Submission**
   - Client completes base questionnaire
   - Sector-specific data, goals, and offers are stored

2. **Discovery Tree Population**
   - GET endpoint fetches existing data
   - UI pre-populates with known information
   - Client completes guided discovery questions

3. **Discovery Tree Save**
   - POST endpoint saves discovery data
   - Merges with existing questionnaire data
   - Ready for project planning

## Next Steps

### Immediate
1. Run migration: `supabase/migrations/20250122_add_discovery_tree_columns.sql`
2. Test API endpoints with sample data
3. Build discovery UI components

### Short-term
1. Update questionnaire form to pass sector-specific data
2. Add business profile questions to questionnaire
3. Create discovery tree UI components

### Long-term
1. Add more discovery questions to trunk
2. Extend sector branches with more questions
3. Build project plan generator using discovery data

## Testing Checklist

- [ ] Migration runs successfully on existing database
- [ ] GET endpoint returns correct pre-population data
- [ ] POST endpoint merges data correctly
- [ ] Sector-specific data extraction works
- [ ] Current stack derivation works for all sectors
- [ ] Error handling works for invalid IDs
- [ ] TypeScript types compile without errors

## Notes

- All endpoints use service role key for admin operations
- JSONB columns allow flexible schema evolution
- Migration is backward compatible (nullable columns)
- API follows existing patterns in codebase
- Documentation includes extension guidelines
