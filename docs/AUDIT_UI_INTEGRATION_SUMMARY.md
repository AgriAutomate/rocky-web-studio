# Audit UI Integration - Summary

## Current State

### Existing Implementation

✅ **AuditCard already integrated** in `SummarySidebar`
- Positioned at top of sidebar
- Shows platform, performance scores, top issue
- Handles loading/empty states
- Uses consistent card styling

### Current Sidebar Structure

1. **AuditCard** - Website audit (existing)
2. **Client Information** - Name, business, sector
3. **Business Profile** - Revenue, employees, years, maturity
4. **Current Technology Stack** - Systems, integrations
5. **Project Estimate** - Cost, timeline, features
6. **Progress** - Completion status

## Proposed UX Options

### Option 1: Enhanced AuditCard (RECOMMENDED) ⭐

**Concept:** Improve existing AuditCard to better emphasize "current state" context.

**Key Features:**
- Clear "Current Site Analysis" header
- Collapsible insights section (default expanded)
- Visual connection to Current Stack card
- Contextual insights that inform discovery questions
- Border-top accent color based on performance score

**Pros:**
- ✅ Already integrated - minimal changes needed
- ✅ Consistent with sidebar card pattern
- ✅ Non-intrusive - doesn't disrupt form flow
- ✅ Progressive disclosure - details on demand
- ✅ Visual connection to Current Stack

**Cons:**
- ⚠️ Requires enhancement of existing component

### Option 2: Top Banner Above Form

**Concept:** Prominent banner showing "We analyzed your current site" with key insights.

**Pros:**
- ✅ Very prominent - can't miss it
- ✅ Sets context before questions
- ✅ Doesn't take sidebar space

**Cons:**
- ⚠️ May feel intrusive
- ⚠️ Takes vertical space from form
- ⚠️ Less integrated with other context cards

### Option 3: Collapsible Panel

**Concept:** Collapsible panel in sidebar, collapsed by default.

**Pros:**
- ✅ Less overwhelming (collapsed by default)
- ✅ User controls visibility
- ✅ Saves sidebar space

**Cons:**
- ⚠️ May be missed if collapsed
- ⚠️ Requires interaction to see insights
- ⚠️ Less immediate context

## Recommended: Option 1 (Enhanced AuditCard)

### Rationale

1. **Minimal Disruption:** Builds on existing implementation
2. **Consistent UX:** Matches sidebar card pattern perfectly
3. **Contextual:** Emphasizes "current state" before questions
4. **Progressive:** Shows key metrics first, details on demand
5. **Integrated:** Can visually connect to Current Stack

### Component Specification

**Props:**
```typescript
interface EnhancedAuditCardProps {
  audit?: WebsiteAuditResult;
  isLoading: boolean;
  currentStack?: {
    systems?: string[];
    integrations?: string[];
    notes?: string;
  };
  onTechStackMerge?: (techStack: TechStackInfo) => void;
}
```

**States:**
1. **Loading:** Spinner + "Analyzing your website..."
2. **Not Run:** "We'll analyze automatically when URL provided"
3. **Success:** Metrics + collapsible insights (expanded)
4. **Partial:** Available data + warnings banner
5. **Error:** Error message + "Analysis unavailable"

### Visual Design

**Key Elements:**
- Header: "Current Site Analysis" (matches other cards)
- Border-top accent: Color based on performance (green/yellow/red)
- Key metrics: Platform badge, performance scores (large, color-coded)
- Collapsible insights: Detected technologies, top issue, quick wins
- Link: "View Full Report →" to website

**Color Scheme:**
- Performance ≥80: Green (`text-green-600`, `border-green-500`)
- Performance 50-79: Yellow (`text-yellow-600`, `border-yellow-500`)
- Performance <50: Red (`text-red-600`, `border-red-500`)

**Spacing:**
- Card padding: `p-6` (consistent with other cards)
- Section spacing: `space-y-4`
- Border separation: `border-t`, `pt-4`, `mt-4`

### Integration Points

**With Current Stack:**
- Extract detected technologies from audit
- Show visual indicator if technologies detected
- Optional: "Merge detected technologies" button

**With Discovery Questions:**
- Top issue informs prioritization section
- Quick wins inform feature selection
- Detected technologies inform integrations section

### Implementation Steps

1. **Update AuditCard component:**
   - Change header to "Current Site Analysis"
   - Add collapsible insights section
   - Add warning/error state handling
   - Add border-top accent color

2. **Add helper functions:**
   - `extractDetectedTechnologies()`
   - `getQuickWins()`
   - `getPerformanceColor()`
   - `getPerformanceBadge()`

3. **Update SummarySidebar:**
   - Pass `currentStack` to AuditCard
   - Handle tech stack merge callback

4. **Test all states:**
   - Loading, not run, success, partial, error

## Benefits

1. **Native Feel:** Matches existing sidebar card pattern
2. **Non-Overwhelming:** Collapsible details, clear hierarchy
3. **Contextual:** Emphasizes "current state" before questions
4. **Integrated:** Visual connection to Current Stack
5. **Progressive:** Shows key metrics first, details on demand

## Next Steps

1. ✅ Review UX options (this document)
2. ⏳ Implement enhanced AuditCard
3. ⏳ Add helper functions
4. ⏳ Update SummarySidebar integration
5. ⏳ Test all states
6. ⏳ Add visual connection to Current Stack

## Related Documents

- `docs/AUDIT_UI_INTEGRATION_PROPOSAL.md` - Detailed proposal with all options
- `docs/AUDIT_UI_VISUAL_SPEC.md` - Visual specification and code examples
- `components/discovery/AuditCard.tsx` - Current implementation
- `components/discovery/SummarySidebar.tsx` - Sidebar component
