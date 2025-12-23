# Audit UI Integration - Visual Specification

## Recommended Option: Enhanced AuditCard

### Component Props

```typescript
interface EnhancedAuditCardProps {
  audit?: WebsiteAuditResult;
  isLoading: boolean;
  currentStack?: {
    systems?: string[];
    integrations?: string[];
    notes?: string;
  };
  // Optional callback to merge audit tech stack into current stack
  onTechStackMerge?: (techStack: TechStackInfo) => void;
}
```

### State Handling

#### 1. Loading State

**Visual:**
```
┌─────────────────────────────────────┐
│ Current Site Analysis               │
├─────────────────────────────────────┤
│                                     │
│  ⟳  Analyzing your website...      │
│                                     │
│  This helps us understand your     │
│  current setup                      │
│                                     │
└─────────────────────────────────────┘
```

**Code:**
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

#### 2. Not Run State

**Visual:**
```
┌─────────────────────────────────────┐
│ Current Site Analysis               │
├─────────────────────────────────────┤
│                                     │
│  We'll automatically analyze your  │
│  website when you provide a URL in │
│  the questionnaire.                 │
│                                     │
└─────────────────────────────────────┘
```

**Code:**
```tsx
<Card className="p-6">
  <h3 className="text-lg font-semibold mb-4">Current Site Analysis</h3>
  <p className="text-sm text-muted-foreground">
    We'll automatically analyze your website when you provide a URL in the questionnaire.
  </p>
</Card>
```

#### 3. Success State (Expanded)

**Visual:**
```
┌─────────────────────────────────────┐
│ Current Site Analysis               │
├─────────────────────────────────────┤
│                                     │
│  Platform: [WordPress]              │
│                                     │
│  Performance: 65    Mobile: 58     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  ▼ Insights                         │
│                                     │
│  Detected Technologies:             │
│  [WordPress] [Stripe] [GA]          │
│                                     │
│  Top Priority Issue:                │
│  Mobile performance score is low    │
│  (58/100). This significantly      │
│  impacts user experience.           │
│                                     │
│  Quick Wins:                        │
│  • Optimize images (reduce size)    │
│  • Enable caching                  │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  View Full Report →                 │
└─────────────────────────────────────┘
```

**Code:**
```tsx
<Card className="p-6 border-t-4 border-t-yellow-500">
  <h3 className="text-lg font-semibold mb-4">Current Site Analysis</h3>
  
  {/* Key Metrics */}
  <div className="space-y-4 mb-4">
    <div>
      <span className="text-sm text-muted-foreground">Platform:</span>
      <Badge variant="outline" className="ml-2">{summary.platform}</Badge>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div>
        <span className="text-sm text-muted-foreground">Performance</span>
        <div className={`text-2xl font-bold mt-1 ${getPerformanceColor(summary.performanceScore)}`}>
          {summary.performanceScore}
        </div>
        <Badge variant={getPerformanceBadge(summary.performanceScore)} className="mt-1">
          {getPerformanceLabel(summary.performanceScore)}
        </Badge>
      </div>
      <div>
        <span className="text-sm text-muted-foreground">Mobile</span>
        <div className={`text-2xl font-bold mt-1 ${getPerformanceColor(summary.mobileScore)}`}>
          {summary.mobileScore}
        </div>
        <Badge variant={getPerformanceBadge(summary.mobileScore)} className="mt-1">
          Mobile
        </Badge>
      </div>
    </div>
  </div>

  {/* Collapsible Insights */}
  <Collapsible defaultOpen>
    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
      <ChevronDown className="h-4 w-4" />
      Insights
    </CollapsibleTrigger>
    <CollapsibleContent className="mt-3 space-y-3">
      {/* Detected Technologies */}
      {detectedTechnologies.length > 0 && (
        <div>
          <span className="text-sm font-medium">Detected Technologies:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {detectedTechnologies.map(tech => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Top Issue */}
      <div>
        <span className="text-sm font-medium">Top Priority Issue:</span>
        <p className="text-sm text-muted-foreground mt-1">
          {summary.topIssue}
        </p>
      </div>
      
      {/* Quick Wins */}
      {quickWins.length > 0 && (
        <div>
          <span className="text-sm font-medium">Quick Wins:</span>
          <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
            {quickWins.map((win, i) => (
              <li key={i}>{win}</li>
            ))}
          </ul>
        </div>
      )}
    </CollapsibleContent>
  </Collapsible>

  {/* Link to website */}
  <div className="mt-4 pt-4 border-t">
    <a
      href={audit.websiteInfo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-primary hover:underline flex items-center gap-1"
    >
      View Full Report
      <ExternalLink className="h-3 w-3" />
    </a>
  </div>
</Card>
```

#### 4. Partial State (with Warnings)

**Visual:**
```
┌─────────────────────────────────────┐
│ Current Site Analysis               │
├─────────────────────────────────────┤
│                                     │
│  ⚠️ Some data unavailable           │
│  Performance metrics unavailable    │
│  due to API rate limit              │
│                                     │
│  Platform: [WordPress]              │
│                                     │
│  ▼ Insights                         │
│  ...                                │
└─────────────────────────────────────┘
```

**Code:**
```tsx
<Card className="p-6 border-t-4 border-t-yellow-500">
  <h3 className="text-lg font-semibold mb-4">Current Site Analysis</h3>
  
  {/* Warning Banner */}
  {audit.warnings && audit.warnings.length > 0 && (
    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
      <p className="text-sm text-yellow-800 font-medium mb-1">
        ⚠️ Some data unavailable
      </p>
      <ul className="text-xs text-yellow-700 list-disc list-inside">
        {audit.warnings.map((warning, i) => (
          <li key={i}>{warning}</li>
        ))}
      </ul>
    </div>
  )}
  
  {/* Available data */}
  {/* ... */}
</Card>
```

#### 5. Error State

**Visual:**
```
┌─────────────────────────────────────┐
│ Current Site Analysis               │
├─────────────────────────────────────┤
│                                     │
│  ⚠️ Analysis unavailable            │
│  Website did not respond within     │
│  30 seconds                         │
│                                     │
└─────────────────────────────────────┘
```

**Code:**
```tsx
<Card className="p-6">
  <h3 className="text-lg font-semibold mb-4">Current Site Analysis</h3>
  <div className="p-3 bg-red-50 border border-red-200 rounded">
    <p className="text-sm text-red-800 font-medium mb-1">
      ⚠️ Analysis unavailable
    </p>
    <p className="text-xs text-red-700">
      {errorMessage}
    </p>
  </div>
</Card>
```

### Helper Functions

```typescript
// Extract detected technologies from audit
function extractDetectedTechnologies(audit: WebsiteAuditResult): string[] {
  const techs: string[] = [];
  
  if (audit.techStack.cms) {
    techs.push(audit.techStack.cms.name);
  }
  if (audit.techStack.ecommerce) {
    techs.push(audit.techStack.ecommerce.name);
  }
  if (audit.techStack.analytics) {
    techs.push(...audit.techStack.analytics.map(a => a.name));
  }
  if (audit.techStack.paymentProcessors) {
    techs.push(...audit.techStack.paymentProcessors.map(p => p.name));
  }
  
  return techs;
}

// Get quick wins (low effort, high impact recommendations)
function getQuickWins(audit: WebsiteAuditResult): string[] {
  return audit.recommendations
    .filter(r => r.effort === "low" && (r.priority === "high" || r.priority === "critical"))
    .slice(0, 3)
    .map(r => r.title);
}

// Performance color helper
function getPerformanceColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  return "text-red-600";
}

// Performance badge variant helper
function getPerformanceBadge(score: number): "default" | "secondary" | "destructive" {
  if (score >= 80) return "default";
  if (score >= 50) return "secondary";
  return "destructive";
}

// Performance label helper
function getPerformanceLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 50) return "Good";
  return "Needs Improvement";
}
```

### Visual Integration with Current Stack

**Option A: Visual Indicator**
- Add subtle border-left accent on Current Stack card if audit detected technologies
- Show "Detected via site analysis" badge

**Option B: Merge Button**
- Add "Merge detected technologies" button in AuditCard
- On click, merges audit tech stack into Current Stack
- Shows confirmation toast

**Option C: Auto-Merge (Future)**
- Automatically merge detected technologies into Current Stack
- Show visual indicator that technologies came from audit

### Color Scheme

**Performance Scores:**
- Green (≥80): `text-green-600`, `border-green-500`
- Yellow (50-79): `text-yellow-600`, `border-yellow-500`
- Red (<50): `text-red-600`, `border-red-500`

**Badges:**
- Platform: `variant="outline"`
- Performance: `variant` based on score
- Technologies: `variant="secondary"`

**Warnings/Errors:**
- Warning: `bg-yellow-50`, `border-yellow-200`, `text-yellow-800`
- Error: `bg-red-50`, `border-red-200`, `text-red-800`

### Spacing & Typography

**Consistent with other cards:**
- Card padding: `p-6`
- Header: `text-lg font-semibold mb-4`
- Section spacing: `space-y-4`
- Border separation: `border-t`, `pt-4`, `mt-4`

**Labels:**
- `text-sm text-muted-foreground`

**Values:**
- Scores: `text-2xl font-bold`
- Regular text: `text-sm font-medium`

**Links:**
- `text-sm text-primary hover:underline`

### Accessibility

- Collapsible uses proper ARIA attributes
- Color coding has text labels (not color-only)
- Links have proper `target="_blank"` and `rel="noopener noreferrer"`
- Loading state has proper ARIA live region
- Error states are clearly communicated

### Responsive Behavior

- On mobile: Card stacks normally
- Collapsible works on all screen sizes
- Grid layout adjusts: `grid-cols-2` → `grid-cols-1` on mobile
- Badges wrap properly with `flex-wrap`

## Implementation Notes

1. **Use Radix UI Collapsible** for accordion behavior
2. **Use existing Badge component** for consistency
3. **Use existing Card component** for consistency
4. **Extract helper functions** to `lib/utils/audit-utils.ts`
5. **Add icons** from lucide-react (ChevronDown, ExternalLink)
6. **Test all states** thoroughly
7. **Ensure graceful degradation** if audit data missing
