# Audit Types Integration Guide

## Summary

The audit types in `lib/types/audit.ts` have been aligned with existing patterns from `lib/types/discovery.ts`. This document shows how they integrate with the current type system.

## Type Alignment Checklist

### ✅ Pattern Consistency

| Pattern | Discovery Types | Audit Types | Status |
|---------|----------------|-------------|--------|
| **Section Organization** | Clear comments, logical grouping | ✅ Same structure | ✅ |
| **Naming Conventions** | PascalCase interfaces, `*Request`/`*Response` | ✅ Same pattern | ✅ |
| **Optionality** | Required fields not optional, optional use `?` | ✅ Same pattern | ✅ |
| **Nullability** | `\| null` in responses, `\| undefined` in props | ✅ Same pattern | ✅ |
| **Date Formats** | ISO 8601 strings (`string` type) | ✅ Same pattern | ✅ |
| **Union Types** | String unions for enums | ✅ Same pattern | ✅ |
| **API Responses** | Include ID, optional data, error fields | ✅ Same pattern | ✅ |

## Type Definitions Overview

### Core Types

```typescript
// Main audit result (matches WebsiteAuditResult structure)
WebsiteAuditResult {
  websiteInfo: WebsiteInfo;
  techStack: TechStackInfo;
  performance: PerformanceMetrics;
  seo: SeoMetrics;
  metadata: SiteMetadata;
  contentAnalysis: ContentAnalysis;
  recommendations: Recommendation[];
  auditDate: string; // ISO 8601
  auditDurationMs: number;
}
```

### Union Types (Aligned with Discovery Patterns)

```typescript
// Confidence levels (like priority levels in discovery)
TechnologyConfidence = "high" | "medium" | "low"

// Detection methods (like system types in discovery)
TechnologyDetectionMethod = "meta-tag" | "script" | "header" | "url-pattern" | "content-analysis"

// Recommendation priorities (aligned with discovery priorities)
RecommendationPriority = "critical" | "high" | "medium" | "low"

// Recommendation categories
RecommendationCategory = "performance" | "seo" | "security" | "accessibility" | "mobile" | "content" | "technical"

// Implementation effort
RecommendationEffort = "low" | "medium" | "high"
```

### API Types (Matching Discovery API Patterns)

```typescript
// Request type (like DiscoveryTreeUpdateRequest)
AuditRequest {
  questionnaireResponseId: string | number;
  websiteUrl: string;
}

// Response type (like DiscoveryTreeUpdateResponse)
AuditResponse {
  success: boolean;
  questionnaireResponseId: string | number;
  message: string;
  auditStartedAt?: string; // ISO 8601
}

// Fetch response (like DiscoveryTreePrePopulateResponse)
AuditFetchResponse {
  questionnaireResponseId: string | number;
  audit?: WebsiteAuditResult; // Optional - may not be completed
  error?: string;
  auditCompletedAt?: string; // ISO 8601
  auditError?: string;
}
```

## Integration Points

### 1. Discovery Tree API Integration

**Current Usage:**
```typescript
// app/api/discovery-tree/route.ts
import type { WebsiteAuditResult } from "@/lib/types/audit";

// In GET handler - fetch audit results
const { data: auditData } = await supabase
  .from("questionnaire_responses")
  .select("audit_results")
  .eq("id", questionnaireResponseId)
  .single();

const audit: WebsiteAuditResult | null = auditData?.audit_results || null;
```

**Future Enhancement (Optional):**
```typescript
// lib/types/discovery.ts - Add audit to pre-populate response
export interface DiscoveryTreePrePopulateResponse {
  // ... existing fields
  audit?: WebsiteAuditResult; // Optional - matches pattern
}
```

### 2. Component Integration

**Current Usage:**
```typescript
// components/discovery/SummarySidebar.tsx
import type { WebsiteAuditResult } from "@/lib/types/audit";
import type { BusinessProfile, DiscoveryTreePrePopulateResponse } from "@/lib/types/discovery";

interface SummarySidebarProps {
  client: DiscoveryTreePrePopulateResponse["client"];
  businessProfile: BusinessProfile | null; // Nullable pattern
  currentStack: DiscoveryTreePrePopulateResponse["currentStack"];
  discoveryTree?: DiscoveryTree;
  audit?: WebsiteAuditResult; // Optional - matches businessProfile pattern
  auditLoading?: boolean;
}
```

**Pattern Match:** ✅ Uses same optionality pattern as `businessProfile: BusinessProfile | null`

### 3. Type Extraction (Indexed Access)

**Following Discovery Pattern:**
```typescript
// Extract nested types using indexed access (like discovery types)
type TechStack = WebsiteAuditResult["techStack"];
type Performance = WebsiteAuditResult["performance"];
type Recommendations = WebsiteAuditResult["recommendations"];

// Use in components
function AuditSummary({ audit }: { audit: WebsiteAuditResult }) {
  const techStack: TechStack = audit.techStack;
  const performance: Performance = audit.performance;
}
```

### 4. API Route Usage

**POST Endpoint:**
```typescript
// app/api/audit-website/route.ts
import type { AuditRequest, AuditResponse } from "@/lib/types/audit";

export async function POST(req: NextRequest) {
  const body: AuditRequest = await req.json();
  // ... trigger audit
  const response: AuditResponse = {
    success: true,
    questionnaireResponseId: body.questionnaireResponseId,
    message: "Audit triggered successfully",
    auditStartedAt: new Date().toISOString(),
  };
  return NextResponse.json(response, { status: 202 });
}
```

**GET Endpoint:**
```typescript
// app/api/audit-website/get/route.ts
import type { AuditFetchResponse, WebsiteAuditResult } from "@/lib/types/audit";

export async function GET(req: NextRequest) {
  // ... fetch audit
  const fetchResponse: AuditFetchResponse = {
    questionnaireResponseId,
    audit: auditResults as WebsiteAuditResult,
    auditCompletedAt: response.audit_completed_at,
  };
  return NextResponse.json(fetchResponse);
}
```

## Type Safety Examples

### 1. Component Props

```typescript
// Type-safe component props
interface AuditCardProps {
  audit?: WebsiteAuditResult; // Optional - may not be loaded yet
  isLoading?: boolean;
}

function AuditCard({ audit, isLoading }: AuditCardProps) {
  if (isLoading) return <LoadingState />;
  if (!audit) return <EmptyState />;
  
  // TypeScript knows audit is WebsiteAuditResult here
  const platform = audit.techStack.cms?.name; // string | undefined
  const score = audit.performance.mobileScore; // number | undefined
}
```

### 2. API Response Handling

```typescript
// Type-safe API response handling
async function fetchAudit(id: string): Promise<AuditFetchResponse> {
  const response = await fetch(`/api/audit-website/get?questionnaireResponseId=${id}`);
  const data: AuditFetchResponse = await response.json();
  
  if (data.error) {
    // Handle error
    console.error(data.error);
    return data;
  }
  
  if (data.audit) {
    // TypeScript knows audit is WebsiteAuditResult
    const recommendations = data.audit.recommendations; // Recommendation[]
    const criticalIssues = recommendations.filter(r => r.priority === "critical");
  }
  
  return data;
}
```

### 3. Database Type Assertion

```typescript
// Safe type assertion from database JSONB
const { data } = await supabase
  .from("questionnaire_responses")
  .select("audit_results")
  .eq("id", responseId)
  .single();

// Type assertion (safe - structure matches interface)
const audit: WebsiteAuditResult | null = data?.audit_results || null;

if (audit) {
  // Type-safe access
  const date = audit.auditDate; // string (ISO 8601)
  const duration = audit.auditDurationMs; // number
}
```

## Comparison with Discovery Types

### Similarities

| Aspect | Discovery Types | Audit Types |
|--------|----------------|-------------|
| **Main Interface** | `DiscoveryTree` | `WebsiteAuditResult` |
| **Nested Structures** | `trunk`, `branches`, `priorities` | `techStack`, `performance`, `seo`, `metadata` |
| **Union Types** | `AnnualRevenue`, `EmployeeCount` | `TechnologyConfidence`, `RecommendationPriority` |
| **API Requests** | `DiscoveryTreeUpdateRequest` | `AuditRequest` |
| **API Responses** | `DiscoveryTreePrePopulateResponse` | `AuditFetchResponse` |
| **Date Fields** | `updatedAt: string` | `auditDate: string` |

### Differences (By Design)

| Aspect | Discovery Types | Audit Types | Reason |
|--------|----------------|-------------|--------|
| **Sector-Specific** | Has `branches` by sector | No sector-specific types | Audit is universal |
| **Update Pattern** | Uses `Partial<>` for updates | No update types | Audit is write-once |
| **Priority Levels** | `"critical" \| "important" \| "nice-to-have"` | `"critical" \| "high" \| "medium" \| "low"` | Different contexts |

## Future Integration Opportunities

### 1. Merge Audit Tech Stack into Discovery Current Stack

```typescript
// Future enhancement in app/api/discovery-tree/route.ts
function deriveCurrentStack(
  sectorSpecificData: any,
  sector: Sector,
  auditResults?: WebsiteAuditResult | null
): {
  systems?: string[];
  integrations?: string[];
  notes?: string;
} {
  const stack = { systems: [], integrations: [], notes: "" };
  
  // ... existing derivation logic ...
  
  // Merge audit tech stack if available
  if (auditResults?.techStack) {
    const auditSystems: string[] = [];
    
    if (auditResults.techStack.cms) {
      auditSystems.push(auditResults.techStack.cms.name);
    }
    if (auditResults.techStack.analytics) {
      auditSystems.push(...auditResults.techStack.analytics.map(a => a.name));
    }
    if (auditResults.techStack.paymentProcessors) {
      auditSystems.push(...auditResults.techStack.paymentProcessors.map(p => p.name));
    }
    
    stack.systems = [...new Set([...stack.systems, ...auditSystems])];
  }
  
  return stack;
}
```

### 2. Pre-populate Discovery Integrations from Audit

```typescript
// Future enhancement - derive integrations from audit
function deriveIntegrationsFromAudit(
  auditResults?: WebsiteAuditResult | null
): IntegrationRequirement[] {
  if (!auditResults?.techStack) return [];
  
  const integrations: IntegrationRequirement[] = [];
  
  if (auditResults.techStack.paymentProcessors) {
    auditResults.techStack.paymentProcessors.forEach(processor => {
      integrations.push({
        systemName: processor.name,
        systemType: "payment",
        integrationType: "api", // Assume API for payment processors
        priority: "important",
      });
    });
  }
  
  // ... more derivation logic ...
  
  return integrations;
}
```

## Summary

### ✅ Type Alignment Complete

The audit types now:
- ✅ Follow exact same patterns as discovery types
- ✅ Use consistent naming conventions
- ✅ Proper optionality and nullability
- ✅ ISO 8601 date strings
- ✅ Aligned union types
- ✅ API response types match discovery patterns
- ✅ Easy to integrate into existing components
- ✅ Type-safe and future-proof

### ✅ Integration Points

1. **Components:** `SummarySidebar` already uses audit types ✅
2. **API Routes:** Audit endpoints use typed requests/responses ✅
3. **Database:** Type assertions from JSONB are safe ✅
4. **Future:** Ready for merging into discovery tree API ✅

**Status:** Types are fully aligned and ready for use!
