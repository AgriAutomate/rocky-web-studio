# Feature Estimation Implementation Summary

## Overview

Implemented a config-driven feature-to-cost/timeline mapping system that calculates project estimates based on selected features and business sector. The system is fully integrated into the discovery UI sidebar.

## Files Created

### 1. Feature Configuration
**File:** `lib/config/feature-estimates.ts`

- Defines 20 feature types with base costs and timelines
- Supports sector-specific overrides
- Maps discovery tree feature names to config keys
- Helper functions to extract feature keys from priorities

**Key Features:**
- Base costs in AUD
- Base timelines in weeks
- Sector overrides for hospitality, retail, professional-services, construction, healthcare
- Feature name mapping (e.g., "booking" → "onlineBooking")

### 2. Estimator Function
**File:** `lib/utils/feature-estimator.ts`

**Function:** `estimateProject(input: EstimateInput): EstimateOutput`

- Pure function (no side effects)
- Sums costs and timelines across features
- Applies sector overrides automatically
- Returns totals + per-feature breakdown
- Includes formatting helpers (`formatCost`, `formatTimeline`)

### 3. React Hook
**File:** `lib/hooks/useEstimate.ts`

**Hook:** `useEstimate(sector: string, featureKeys: FeatureKey[])`

- Reactive calculation
- Auto-recalculates when inputs change
- Returns `EstimateOutput | null`
- Handles empty inputs gracefully

### 4. Updated Summary Sidebar
**File:** `components/discovery/SummarySidebar.tsx`

- Integrated estimation system
- Shows total cost and timeline
- Displays breakdown of selected features
- Updates in real-time as user selects features
- Shows placeholder message when no features selected

## Usage Flow

1. **User selects features** in PrioritizationSection
2. **Feature names mapped** to config keys via `getFeatureKeysFromPriorities`
3. **Hook calculates estimate** using `useEstimate(sector, featureKeys)`
4. **Sidebar displays** formatted cost, timeline, and breakdown

## Example Output

When user selects:
- Must-have: `["booking", "seo", "speed"]`
- Nice-to-have: `["analytics", "design"]`

For hospitality sector:
```
Total Cost: $8,500 AUD
Timeline: 10 weeks

Selected Features:
- Online Booking System: $3,000
- SEO Setup & Optimization: $2,000
- Performance Optimization: $1,500
- Analytics Setup: $1,000
- Custom Design: $3,000
```

## Sector Overrides

Some features have sector-specific pricing:

| Feature | Base Cost | Hospitality | Retail | Professional Services |
|---------|-----------|-------------|--------|----------------------|
| Online Booking | $2,500 | $3,000 | - | $2,800 |
| E-commerce | $5,000 | - | $5,500 | - |
| Payment Processing | $1,500 | - | $2,000 | - |
| Client Portal | $3,500 | - | - | $4,000 |
| Job Management | $4,000 | - | - | - (construction: $4,500) |

## Updating Pricing

To update pricing, edit `lib/config/feature-estimates.ts`:

```typescript
onlineBooking: {
  label: "Online Booking System",
  baseCost: 3000, // ← Change base cost
  baseWeeks: 4,   // ← Change timeline
  sectorOverrides: {
    hospitality: {
      baseCost: 3500, // ← Change sector-specific cost
      baseWeeks: 5    // ← Change sector-specific timeline
    }
  }
}
```

All components automatically use updated pricing - no code changes needed!

## Integration Points

### Discovery UI
- `SummarySidebar` uses `useEstimate` hook
- Reads from `discoveryTree.priorities`
- Updates in real-time

### Future Integration
- Proposal generation can use `estimateProject` directly
- Can be extended for bundle discounts
- Can add complexity multipliers
- Can account for timeline overlap

## Testing

To test the estimation system:

```typescript
import { estimateProject } from "@/lib/utils/feature-estimator";

const estimate = estimateProject({
  sector: "hospitality",
  featureKeys: ["onlineBooking", "seoSetup", "performanceTuning"]
});

console.log(estimate);
// {
//   totalCost: 6500,
//   totalWeeks: 8,
//   breakdown: [...]
// }
```

## Features Supported

All 20 features from prioritization section are mapped:

- booking → onlineBooking
- e-commerce → ecommerce
- crm → crmIntegration
- portal → clientPortal
- automation → automation
- seo → seoSetup
- speed → performanceTuning
- design → design
- analytics → analytics
- payments → paymentProcessing
- inventory → inventory
- scheduling → scheduling
- reporting → reporting
- integrations → integrations
- mobile-app → mobileApp

## Benefits

✅ **Config-Driven**: Update pricing in one place
✅ **Type-Safe**: Full TypeScript support
✅ **Reactive**: Auto-updates when features change
✅ **Sector-Aware**: Applies sector-specific pricing
✅ **Composable**: Easy to extend and customize
✅ **Pure Functions**: No side effects, easy to test

## Next Steps

Potential enhancements:

1. **Bundle Discounts**: Reduce cost when multiple related features selected
2. **Complexity Multipliers**: Adjust estimates based on project complexity
3. **Timeline Overlap**: Account for parallel work (e.g., design + development)
4. **Historical Learning**: Refine estimates based on past projects
5. **Custom Features**: Allow manual pricing for custom features
