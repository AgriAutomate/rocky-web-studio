# Audit UI Integration - UX Proposal

## Current State Analysis

### Layout Structure

**Discovery Page Layout:**
- Grid: `grid-cols-1 lg:grid-cols-3` (2 columns form, 1 column sidebar)
- Sidebar: `space-y-6` vertical spacing between cards
- Cards: Consistent `<Card className="p-6">` styling

### Current Sidebar Cards (in order)

1. **AuditCard** - Website audit results (already integrated)
2. **Client Information** - Name, business, sector
3. **Business Profile** - Revenue, employees, years, digital maturity
4. **Current Technology Stack** - Systems, integrations, notes
5. **Project Estimate** - Cost, timeline, selected features
6. **Progress** - Completion status

### Current AuditCard Implementation

**Strengths:**
- ✅ Already integrated in sidebar
- ✅ Consistent card styling
- ✅ Handles loading/empty states
- ✅ Shows key metrics (platform, performance, top issue)

**Limitations:**
- ⚠️ Positioned at top (may feel disconnected from "Current Stack")
- ⚠️ Doesn't emphasize "current state" context
- ⚠️ Could better integrate with discovery questions
- ⚠️ Missing visual connection to tech stack insights

## UX Integration Options

### Option 1: Enhanced AuditCard with Contextual Insights (RECOMMENDED)

**Concept:** Improve existing AuditCard to better emphasize "current state" and connect to discovery questions.

**Position:** Keep in sidebar, but enhance with:
- Clear "Current Site Analysis" header
- Visual connection to "Current Technology Stack" card
- Contextual insights that inform discovery questions
- Collapsible details section for less overwhelming experience

**Visual Design:**
- Prominent header: "Current Site Analysis"
- Key metrics at top (platform, performance)
- Collapsible "Insights" section with:
  - Detected technologies (links to Current Stack)
  - Top issues (informs prioritization)
  - Quick wins (low effort, high impact)
- Subtle visual indicator connecting to Current Stack card

**Props:**
```typescript
interface AuditCardProps {
  audit?: WebsiteAuditResult;
  isLoading: boolean;
  currentStack?: { systems?: string[]; integrations?: string[]; notes?: string };
  onTechStackMerge?: (techStack: TechStackInfo) => void; // Optional callback
}
```

**States:**
- Loading: Spinner + "Analyzing your website..."
- Not Run: "We'll analyze your website automatically when you provide a URL"
- Success: Show metrics + collapsible insights
- Partial: Show available data + warnings banner
- Error: Show error message + "Analysis unavailable"

**Visual Integration:**
- Same card styling as other sidebar cards
- Color-coded performance badges (green/yellow/red)
- Subtle border-top accent color matching performance score
- Collapsible section uses accordion pattern

### Option 2: Top Banner Above Form

**Concept:** Prominent banner at top of form showing "We analyzed your current site" with key insights.

**Position:** Above form sections, full width

**Visual Design:**
- Banner with subtle background color
- Left: Icon + "We analyzed your current site"
- Center: Key metrics (platform badge, performance score)
- Right: "View Details" link/button
- Expandable section with full insights

**Pros:**
- ✅ Very prominent - can't miss it
- ✅ Sets context before questions
- ✅ Doesn't take sidebar space

**Cons:**
- ⚠️ May feel intrusive
- ⚠️ Takes vertical space from form
- ⚠️ Less integrated with other context cards

**Props:**
```typescript
interface AuditBannerProps {
  audit?: WebsiteAuditResult;
  isLoading: boolean;
  onViewDetails?: () => void;
}
```

### Option 3: Collapsible "Current Site Analysis" Panel

**Concept:** Collapsible panel in sidebar that can be expanded for details.

**Position:** Sidebar, between Client Info and Current Stack

**Visual Design:**
- Collapsed: Shows summary (platform + performance score)
- Expanded: Full audit details
- Default: Collapsed (less overwhelming)
- Visual indicator when insights available

**Pros:**
- ✅ Less overwhelming (collapsed by default)
- ✅ User controls visibility
- ✅ Saves sidebar space

**Cons:**
- ⚠️ May be missed if collapsed
- ⚠️ Requires interaction to see insights
- ⚠️ Less immediate context

**Props:**
```typescript
interface CollapsibleAuditPanelProps {
  audit?: WebsiteAuditResult;
  isLoading: boolean;
  defaultExpanded?: boolean;
}
```

## Recommended: Option 1 (Enhanced AuditCard)

### Rationale

1. **Already Integrated:** AuditCard exists and works
2. **Consistent UX:** Matches sidebar card pattern
3. **Contextual:** Can visually connect to Current Stack
4. **Progressive Disclosure:** Collapsible details reduce overwhelm
5. **Non-Intrusive:** Doesn't disrupt form flow

### Detailed Design Specification

#### Component Structure

```typescript
interface EnhancedAuditCardProps {
  audit?: WebsiteAuditResult;
  isLoading: boolean;
  currentStack?: {
    systems?: string[];
    integrations?: string[];
    notes?: string;
  };
  // Optional: Callback to merge audit tech stack into current stack
  onTechStackMerge?: (techStack: TechStackInfo) => void;
}
```

#### Visual Layout

```
┌─────────────────────────────────┐
│ Current Site Analysis           │ ← Header (text-lg font-semibold)
├─────────────────────────────────┤
│                                 │
│ Platform: [WordPress]          │ ← Badge
│                                 │
│ Performance: 65  Mobile: 58    │ ← Large scores with color
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ⚠️ Some data unavailable    │ │ ← Warning banner (if partial)
│ └─────────────────────────────┘ │
│                                 │
│ ▼ Insights                      │ ← Collapsible section
│   • Detected: WordPress, Stripe│
│   • Top Issue: Mobile performance│
│   • Quick Win: Optimize images  │
│                                 │
│ [View Full Report →]            │ ← Link to website
└─────────────────────────────────┘
```

#### States

**1. Loading State:**
```tsx
<Card className="p-6">
  <h3 className="text-lg font-semibold mb-4">Current Site Analysis</h3>
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      <span className="text-sm text-muted-foreground">
        Analyzing your website...
      </span>
    </div>
    <p className="text-xs text-muted-foreground">
      This helps us understand your current setup
    </p>
  </div>
</Card>
```

**2. Not Run State:**
```tsx
<Card className="p-6">
  <h3 className="text-lg font-semibold mb-4">Current Site Analysis</h3>
  <p className="text-sm text-muted-foreground">
    We'll automatically analyze your website when you provide a URL in the questionnaire.
  </p>
</Card>
```

**3. Success State:**
```tsx
<Card className="p-6 border-t-4 border-t-green-500"> {/* Color based on performance */}
  <h3 className="text-lg font-semibold mb-4">Current Site Analysis</h3>
  
  {/* Key Metrics */}
  <div className="space-y-4 mb-4">
    <div>
      <span className="text-sm text-muted-foreground">Platform:</span>
      <Badge variant="outline" className="ml-2">{platform}</Badge>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div>
        <span className="text-sm text-muted-foreground">Performance</span>
        <div className={`text-2xl font-bold ${getColor(score)}`}>{score}</div>
      </div>
      <div>
        <span className="text-sm text-muted-foreground">Mobile</span>
        <div className={`text-2xl font-bold ${getColor(mobileScore)}`}>{mobileScore}</div>
      </div>
    </div>
  </div>

  {/* Collapsible Insights */}
  <Collapsible>
    <CollapsibleTrigger className="text-sm font-medium">
      Insights →
    </CollapsibleTrigger>
    <CollapsibleContent>
      <div className="mt-3 space-y-2 text-sm">
        <div>
          <span className="font-medium">Detected Technologies:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {technologies.map(tech => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <span className="font-medium">Top Priority Issue:</span>
          <p className="text-muted-foreground mt-1">{topIssue}</p>
        </div>
        {quickWins.length > 0 && (
          <div>
            <span className="font-medium">Quick Wins:</span>
            <ul className="list-disc list-inside text-muted-foreground mt-1">
              {quickWins.map((win, i) => (
                <li key={i}>{win}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </CollapsibleContent>
  </Collapsible>

  {/* Link to website */}
  <div className="mt-4 pt-4 border-t">
    <a href={url} target="_blank" className="text-sm text-primary hover:underline">
      View Full Report →
    </a>
  </div>
</Card>
```

**4. Partial State (with warnings):**
```tsx
<Card className="p-6 border-t-4 border-t-yellow-500">
  {/* Warning banner */}
  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
    <p className="text-sm text-yellow-800">
      ⚠️ Some analysis data unavailable: {warnings.join(", ")}
    </p>
  </div>
  
  {/* Available data */}
  {/* ... */}
</Card>
```

**5. Error State:**
```tsx
<Card className="p-6">
  <h3 className="text-lg font-semibold mb-4">Current Site Analysis</h3>
  <div className="p-3 bg-red-50 border border-red-200 rounded">
    <p className="text-sm text-red-800">
      Analysis unavailable: {errorMessage}
    </p>
  </div>
</Card>
```

#### Visual Integration Details

**Color Coding:**
- Border-top accent: Green (≥80), Yellow (50-79), Red (<50)
- Performance scores: Same color scheme
- Badges: Match existing Badge component variants

**Spacing:**
- Consistent with other sidebar cards (`p-6`)
- `space-y-4` for internal spacing
- `mb-4` for section separation

**Typography:**
- Header: `text-lg font-semibold mb-4` (matches other cards)
- Labels: `text-sm text-muted-foreground`
- Values: `text-sm font-medium` or `text-2xl font-bold` for scores
- Links: `text-sm text-primary hover:underline`

**Collapsible Pattern:**
- Use Radix UI Collapsible or similar
- Default: Expanded (show insights immediately)
- Smooth animation
- Clear visual indicator (chevron or arrow)

#### Integration with Current Stack

**Visual Connection:**
- If audit detects technologies, show subtle indicator
- Optional: "Merge detected technologies" button
- Visual line/arrow connecting cards (subtle)

**Data Flow:**
```typescript
// In SummarySidebar
const detectedTechs = audit?.techStack 
  ? extractTechnologies(audit.techStack)
  : [];

// Show in Current Stack card if not already present
const mergedSystems = [
  ...(currentStack.systems || []),
  ...detectedTechs.filter(t => !currentStack.systems?.includes(t))
];
```

## Implementation Plan

### Phase 1: Enhance Existing AuditCard

1. Update header to "Current Site Analysis"
2. Add collapsible insights section
3. Add warning/error state handling
4. Improve visual hierarchy

### Phase 2: Visual Integration

1. Add border-top accent color based on performance
2. Add visual connection to Current Stack card
3. Extract and display detected technologies

### Phase 3: Contextual Insights

1. Show "Quick Wins" (low effort, high impact recommendations)
2. Highlight technologies that inform discovery questions
3. Add "Merge to Current Stack" functionality

## Props Summary

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

## States Summary

1. **Loading:** Spinner + "Analyzing your website..."
2. **Not Run:** "We'll analyze automatically when URL provided"
3. **Success:** Metrics + collapsible insights
4. **Partial:** Available data + warnings banner
5. **Error:** Error message + "Analysis unavailable"

## Visual Consistency

- ✅ Same card styling (`Card className="p-6"`)
- ✅ Same header style (`text-lg font-semibold mb-4`)
- ✅ Same badge/typography patterns
- ✅ Same spacing (`space-y-4`, `mb-4`)
- ✅ Color scheme matches performance indicators
- ✅ Collapsible pattern matches other UI components

## Benefits

1. **Native Feel:** Matches existing sidebar card pattern
2. **Non-Overwhelming:** Collapsible details, clear hierarchy
3. **Contextual:** Emphasizes "current state" before questions
4. **Integrated:** Visual connection to Current Stack
5. **Progressive:** Shows key metrics first, details on demand
