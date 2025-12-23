# Feature Estimation Usage Guide

## Overview

The feature estimation system provides config-driven cost and timeline estimates based on selected features and business sector. It's designed to be easy to update pricing without changing component code.

## Architecture

### Config File
**File:** `lib/config/feature-estimates.ts`

- Defines all available features with base costs and timelines
- Supports sector-specific overrides
- Maps discovery tree feature names to config keys

### Estimator Function
**File:** `lib/utils/feature-estimator.ts`

- Pure function: `estimateProject(input)`
- Calculates totals and breakdown
- Applies sector overrides automatically

### React Hook
**File:** `lib/hooks/useEstimate.ts`

- Reactive hook for components
- Auto-recalculates when inputs change
- Returns `EstimateOutput | null`

## Usage Examples

### Basic Usage

```typescript
import { estimateProject } from "@/lib/utils/feature-estimator";
import type { FeatureKey } from "@/lib/config/feature-estimates";

const featureKeys: FeatureKey[] = [
  "onlineBooking",
  "seoSetup",
  "performanceTuning"
];

const estimate = estimateProject({
  sector: "hospitality",
  featureKeys
});

console.log(`Total Cost: ${estimate.totalCost} AUD`);
console.log(`Timeline: ${estimate.totalWeeks} weeks`);
```

### Using the Hook in Components

```tsx
import { useEstimate } from "@/lib/hooks/useEstimate";
import type { FeatureKey } from "@/lib/config/feature-estimates";

function MyComponent() {
  const sector = "hospitality";
  const featureKeys: FeatureKey[] = ["onlineBooking", "seoSetup"];
  
  const estimate = useEstimate(sector, featureKeys);
  
  if (!estimate) {
    return <div>No features selected</div>;
  }
  
  return (
    <div>
      <h3>Project Estimate</h3>
      <p>Total: {formatCost(estimate.totalCost)}</p>
      <p>Timeline: {formatTimeline(estimate.totalWeeks)}</p>
      
      <ul>
        {estimate.breakdown.map((feature, i) => (
          <li key={i}>
            {feature.label}: {formatCost(feature.appliedCost)}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Mapping from Discovery Tree Priorities

```typescript
import { getFeatureKeysFromPriorities } from "@/lib/config/feature-estimates";

const priorities = {
  mustHave: ["booking", "seo", "speed"],
  niceToHave: ["analytics", "design"],
  future: []
};

const featureKeys = getFeatureKeysFromPriorities(priorities);
// Returns: ["onlineBooking", "seoSetup", "performanceTuning", "analytics", "design"]

const estimate = estimateProject({
  sector: "hospitality",
  featureKeys
});
```

## Updating Pricing

To update pricing, edit `lib/config/feature-estimates.ts`:

```typescript
export const featureConfig: Record<FeatureKey, FeatureEstimate> = {
  onlineBooking: {
    label: "Online Booking System",
    baseCost: 3000, // ← Update base cost here
    baseWeeks: 4,  // ← Update timeline here
    sectorOverrides: {
      hospitality: {
        baseCost: 3500, // ← Update sector-specific cost
        baseWeeks: 5    // ← Update sector-specific timeline
      }
    }
  },
  // ...
};
```

Changes will automatically reflect in all components using the estimation system.

## Feature Keys

Available feature keys:

- `onlineBooking` - Online booking system
- `staffPortal` - Staff portal
- `paymentProcessing` - Payment processing
- `emailAutomation` - Email automation
- `basicWebsite` - Basic website
- `ecommerce` - E-commerce platform
- `crmIntegration` - CRM integration
- `clientPortal` - Client portal
- `jobManagement` - Job management system
- `reportingDashboard` - Reporting dashboard
- `seoSetup` - SEO setup & optimization
- `performanceTuning` - Performance optimization
- `inventory` - Inventory management
- `scheduling` - Scheduling system
- `reporting` - Custom reporting
- `integrations` - Third-party integrations
- `mobileApp` - Mobile app
- `design` - Custom design
- `analytics` - Analytics setup
- `automation` - Workflow automation

## Sector Overrides

Some features have sector-specific pricing:

- **Hospitality**: `onlineBooking` costs more (3000 vs 2500)
- **Retail**: `ecommerce` and `paymentProcessing` cost more
- **Professional Services**: `clientPortal` and `crmIntegration` cost more
- **Construction/Trades**: `jobManagement` costs more
- **Healthcare**: `clientPortal` costs more

## Formatting Helpers

Use formatting helpers for display:

```typescript
import { formatCost, formatTimeline } from "@/lib/utils/feature-estimator";

formatCost(2500); // "$2,500"
formatTimeline(3); // "3 weeks"
formatTimeline(6); // "1 month 2 weeks"
formatTimeline(8); // "2 months"
```

## Integration in Discovery UI

The `SummarySidebar` component automatically:

1. Extracts feature keys from discovery tree priorities
2. Calculates estimates using the hook
3. Displays formatted cost and timeline
4. Shows breakdown of selected features

No additional code needed - it's already integrated!

## Future Enhancements

Potential additions:

- **Complexity multipliers**: Adjust estimates based on project complexity
- **Bundle discounts**: Reduce cost when multiple related features selected
- **Timeline overlap**: Account for parallel work (e.g., design + development)
- **Custom features**: Allow adding custom features with manual pricing
- **Historical data**: Learn from past projects to refine estimates
