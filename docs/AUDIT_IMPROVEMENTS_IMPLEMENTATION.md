# Audit System Improvements - Implementation Guide

## Priority 1: Critical Fixes

### 1. Add Idempotency Check (24h Cache)

**File:** `app/api/audit-website/route.ts`

**Change:**
```typescript
export async function POST(req: NextRequest) {
  try {
    const body: AuditRequest = await req.json();

    // ... validation ...

    const normalizedUrl = normalizeUrl(body.websiteUrl);

    // CHECK: Idempotency - use cached result if available
    const supabase = createServerSupabaseClient(true);
    const { data: existing } = await (supabase as any)
      .from("questionnaire_responses")
      .select("audit_results, audit_completed_at, website_url")
      .eq("id", body.questionnaireResponseId)
      .single();

    if (existing?.audit_completed_at && existing?.audit_results && existing?.website_url === normalizedUrl) {
      const completedAt = new Date(existing.audit_completed_at);
      const hoursSince = (Date.now() - completedAt.getTime()) / (1000 * 60 * 60);
      
      // Use cached result if less than 24 hours old
      if (hoursSince < 24) {
        await logger.info("Using cached audit result", {
          questionnaireResponseId: body.questionnaireResponseId,
          websiteUrl: normalizedUrl,
          hoursSince: Math.round(hoursSince * 10) / 10,
        });

        return NextResponse.json({
          success: true,
          questionnaireResponseId: body.questionnaireResponseId,
          message: "Using cached audit results",
          cached: true,
          auditCompletedAt: existing.audit_completed_at,
        }, { status: 200 });
      }
    }

    // Trigger new audit
    auditWebsiteAsync(body.questionnaireResponseId, normalizedUrl).catch(...);

    // ... rest of handler ...
  }
}
```

### 2. Add Audit Status Tracking

**File:** `supabase/migrations/20250122_add_audit_status.sql`

**Migration:**
```sql
-- Add audit status tracking
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS audit_status TEXT DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_responses.audit_status IS 
  'Audit status: pending, running, completed, failed';

-- Add audit started timestamp
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS audit_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_responses.audit_started_at IS 
  'Timestamp when audit started';

-- Index for querying audits by status
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_audit_status
  ON public.questionnaire_responses (audit_status)
  WHERE audit_status IS NOT NULL;
```

**File:** `lib/services/audit-service.ts`

**Update:**
```typescript
export async function auditWebsiteAsync(
  questionnaireResponseId: string | number,
  websiteUrl: string
): Promise<void> {
  const startTime = Date.now();

  try {
    // Set status to 'running'
    await setAuditStatus(questionnaireResponseId, 'running');

    // ... existing audit logic ...

    // Set status to 'completed' on success
    await saveAuditResults(questionnaireResponseId, auditResult);
    await setAuditStatus(questionnaireResponseId, 'completed');

  } catch (error) {
    await setAuditStatus(questionnaireResponseId, 'failed');
    await saveAuditError(questionnaireResponseId, errorMessage);
  }
}

async function setAuditStatus(
  questionnaireResponseId: string | number,
  status: 'pending' | 'running' | 'completed' | 'failed'
): Promise<void> {
  const supabase = createServerSupabaseClient(true);
  const update: any = { audit_status: status };
  
  if (status === 'running') {
    update.audit_started_at = new Date().toISOString();
  }
  
  await (supabase as any)
    .from("questionnaire_responses")
    .update(update)
    .eq("id", questionnaireResponseId);
}
```

**File:** `app/api/audit-website/route.ts`

**Update POST handler:**
```typescript
// Set status to 'pending' before triggering
await (supabase as any)
  .from("questionnaire_responses")
  .update({ audit_status: 'pending' })
  .eq("id", body.questionnaireResponseId);

auditWebsiteAsync(body.questionnaireResponseId, normalizedUrl);
```

**Update GET handler:**
```typescript
// Check status
if (response.audit_status === 'running' || response.audit_status === 'pending') {
  return NextResponse.json({
    questionnaireResponseId,
    status: response.audit_status,
    message: "Audit in progress. Please check again shortly.",
  }, { status: 202 }); // 202 Accepted - processing
}
```

### 3. Add maxDuration Config

**File:** `app/api/audit-website/route.ts`

**Add:**
```typescript
// Force dynamic rendering
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Extend timeout for audit processing (Vercel Pro: up to 300s)
export const maxDuration = 60; // 60 seconds - enough for audit to start
```

## Priority 2: Nice-to-Have (Health Score)

### 1. Add Health Score Calculation

**File:** `lib/utils/audit-utils.ts`

**Add:**
```typescript
/**
 * Calculate overall health score (0-100)
 * Combines performance, SEO, and technical metrics
 */
export function calculateHealthScore(audit: WebsiteAuditResult): number {
  let score = 0;
  let maxScore = 0;
  
  // Performance (40% weight)
  if (audit.performance?.overallScore !== undefined) {
    score += audit.performance.overallScore * 0.4;
    maxScore += 100 * 0.4;
  }
  
  // SEO (30% weight)
  const seoScore = calculateSeoScore(audit.seo);
  score += seoScore * 0.3;
  maxScore += 100 * 0.3;
  
  // Technical (30% weight)
  const techScore = calculateTechnicalScore(audit.techStack, audit.websiteInfo);
  score += techScore * 0.3;
  maxScore += 100 * 0.3;
  
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

function calculateSeoScore(seo: SeoMetrics): number {
  let score = 0;
  if (seo.hasTitleTag) score += 10;
  if (seo.hasMetaDescription) score += 10;
  if (seo.hasOpenGraphTags) score += 10;
  if (seo.hasStructuredData) score += 10;
  if (seo.hasSitemap) score += 10;
  if (seo.hasRobotsTxt) score += 10;
  if (seo.mobileFriendly) score += 15;
  if (seo.httpsEnabled) score += 15;
  if (seo.imageAltTags) {
    const altRatio = seo.imageAltTags.withAlt / seo.imageAltTags.total;
    score += altRatio * 10;
  }
  return Math.min(score, 100);
}

function calculateTechnicalScore(
  techStack: TechStackInfo,
  websiteInfo: WebsiteInfo
): number {
  let score = 50; // Base score
  
  // Modern CMS/framework detected
  if (techStack.cms) score += 20;
  if (techStack.frameworks?.length) score += 15;
  
  // Good practices
  if (techStack.cdn) score += 10;
  if (techStack.analytics?.length) score += 5;
  
  return Math.min(score, 100);
}
```

**File:** `lib/services/audit-service.ts`

**Update:**
```typescript
import { calculateHealthScore } from "@/lib/utils/audit-utils";

// After building auditResult
const auditResult: WebsiteAuditResult = {
  // ... existing fields
  healthScore: calculateHealthScore({
    performance: auditResult.performance,
    seo: auditResult.seo,
    techStack: auditResult.techStack,
    websiteInfo: auditResult.websiteInfo,
  } as WebsiteAuditResult), // Temporary cast for calculation
};

// Actually, better to calculate after all fields are set:
const auditResult: WebsiteAuditResult = {
  websiteInfo,
  techStack,
  performance,
  seo,
  metadata,
  contentAnalysis,
  recommendations,
  auditDate: new Date().toISOString(),
  auditDurationMs: Date.now() - startTime,
};

// Calculate health score
auditResult.healthScore = calculateHealthScore(auditResult);
```

**File:** `lib/types/audit.ts`

**Update:**
```typescript
export interface WebsiteAuditResult {
  // ... existing fields
  healthScore?: number; // 0-100 overall health score
}
```

**File:** `components/discovery/AuditCard.tsx`

**Update:**
```typescript
{audit.healthScore !== undefined && (
  <div>
    <span className="text-sm text-muted-foreground">Overall Health:</span>
    <div className={`text-2xl font-bold ${getPerformanceColor(audit.healthScore)}`}>
      {audit.healthScore}
    </div>
    <Badge variant={getPerformanceBadge(audit.healthScore)} className="mt-1">
      {getHealthLabel(audit.healthScore)}
    </Badge>
  </div>
)}

function getHealthLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Work";
}
```

## Testing Checklist

### Idempotency
- [ ] POST same URL twice → Second returns cached result
- [ ] POST same URL after 24h → Triggers new audit
- [ ] POST different URL → Triggers new audit

### Status Tracking
- [ ] POST → Status set to 'pending'
- [ ] Audit starts → Status set to 'running'
- [ ] Audit completes → Status set to 'completed'
- [ ] Audit fails → Status set to 'failed'
- [ ] GET with 'running' status → Returns 202

### Health Score
- [ ] Health score calculated correctly
- [ ] Health score displayed in UI
- [ ] Health score color coding works

## Migration Order

1. **Add idempotency check** (no migration needed)
2. **Add status tracking** (requires migration)
3. **Add health score** (no migration needed, just code)
4. **Add maxDuration** (no migration needed)

## Rollback Plan

If issues arise:
1. Remove idempotency check (revert POST handler)
2. Remove status tracking (set `audit_status` to NULL in DB)
3. Remove health score (make optional, won't break existing data)
