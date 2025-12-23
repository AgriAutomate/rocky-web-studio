# Audit System - Sanity Check & Improvements

## Architectural Issues & Smells

### 🔴 Critical Issues

#### 1. **Vercel Serverless Function Timeout Risk**

**Problem:**
- Audit process can take 30+ seconds (PageSpeed API calls, HTML parsing, etc.)
- Vercel serverless functions have default timeout limits:
  - Hobby: 10 seconds
  - Pro: 60 seconds (can be extended to 300s)
  - Enterprise: 300 seconds

**Current Implementation:**
```typescript
// Fire-and-forget: Start audit asynchronously
auditWebsiteAsync(body.questionnaireResponseId, normalizedUrl).catch(...)
```

**Risk:**
- If function times out before audit completes, audit may fail silently
- No guarantee audit will complete if function is killed

**Solution:**
- ✅ Current approach (fire-and-forget) is correct
- ⚠️ But need to ensure function doesn't timeout before audit starts
- Consider: Add `maxDuration` config if on Pro plan
- Consider: Use Vercel Background Functions (if available)

#### 2. **No Idempotency Check**

**Problem:**
- Multiple POST requests can trigger duplicate audits
- No check if audit already in progress or recently completed
- Wastes API quota (PageSpeed API)

**Current Implementation:**
```typescript
// No check for existing audit
auditWebsiteAsync(body.questionnaireResponseId, normalizedUrl)
```

**Solution:**
```typescript
// Check if audit already exists or is in progress
const existing = await supabase
  .from("questionnaire_responses")
  .select("audit_results, audit_completed_at, audit_error")
  .eq("id", questionnaireResponseId)
  .single();

// If completed within last 24h, return cached result
if (existing.data?.audit_completed_at) {
  const completedAt = new Date(existing.data.audit_completed_at);
  const hoursSince = (Date.now() - completedAt.getTime()) / (1000 * 60 * 60);
  if (hoursSince < 24) {
    return NextResponse.json({
      success: true,
      message: "Using cached audit results",
      cached: true,
      auditCompletedAt: existing.data.audit_completed_at,
    }, { status: 200 });
  }
}

// If audit_error exists but recent, don't retry immediately
if (existing.data?.audit_error) {
  const errorTime = new Date(existing.data.audit_error); // Need to track error time
  // Don't retry if error was recent (< 1 hour)
}
```

#### 3. **No Rate Limiting Protection**

**Problem:**
- PageSpeed API has rate limits
- No protection against hitting limits
- Can cause cascading failures

**Current Implementation:**
```typescript
// No rate limit check
const mobileResponse = await axios.get(PAGESPEED_API_URL, {...});
```

**Solution:**
- Add simple in-memory rate limit tracking (per URL)
- Or use Vercel KV for distributed rate limiting
- Or add retry logic with exponential backoff

### 🟡 Medium Issues

#### 4. **Type Complexity**

**Problem:**
- `WebsiteAuditResult` has many nested types
- Some fields may be over-engineered for V1
- Makes debugging harder

**Current:**
```typescript
export interface WebsiteAuditResult {
  websiteInfo: WebsiteInfo;
  techStack: TechStackInfo;
  performance: PerformanceMetrics;
  seo: SeoMetrics;
  metadata: SiteMetadata;
  contentAnalysis: ContentAnalysis;
  recommendations: Recommendation[];
  auditDate: string;
  auditDurationMs: number;
}
```

**Simplification:**
- Consider flattening some nested structures
- Make optional fields truly optional (use `?`)
- Consider: Combine `metadata` and `websiteInfo` (some overlap)

#### 5. **Error Handling Inconsistency**

**Problem:**
- Some functions return `null` on error, others throw
- Inconsistent error message formats
- Hard to debug failures

**Current:**
```typescript
async function fetchWebsiteHtml(url: string): Promise<string | null> {
  // Returns null on error
}

async function getPageSpeedMetrics(url: string): Promise<PerformanceMetrics> {
  // Returns {} on error
}
```

**Solution:**
- Standardize: Always throw errors, catch at top level
- Or: Return `Result<T, Error>` type pattern
- Use consistent error types

#### 6. **No Audit Status Tracking**

**Problem:**
- Can't tell if audit is in progress vs not started
- Frontend polls blindly
- No way to cancel/retry

**Current:**
- Only `audit_completed_at` and `audit_error` fields
- No `audit_started_at` or `audit_status`

**Solution:**
- Add `audit_status: 'pending' | 'running' | 'completed' | 'failed'`
- Add `audit_started_at` timestamp
- Allows better UI feedback

### 🟢 Minor Issues

#### 7. **Duplicate URL Normalization**

**Problem:**
- URL normalized in API route AND in service
- Could normalize once

**Current:**
```typescript
// In API route
const normalizedUrl = normalizeUrl(body.websiteUrl);
auditWebsiteAsync(body.questionnaireResponseId, normalizedUrl);

// In service
const normalizedUrl = normalizeUrl(websiteUrl);
```

**Solution:**
- Normalize once in API route
- Service assumes normalized URL

#### 8. **No Audit History**

**Problem:**
- Only stores latest audit
- Can't track changes over time
- Can't compare audits

**Solution:**
- Future: Add `audit_history` JSONB array
- For now: Not critical for V1

## Design Improvements for Solo Dev

### 1. Simplify Type Definitions

**Current:** Many nested interfaces

**Simplified:**
```typescript
// Flatten some structures
export interface WebsiteAuditResult {
  // Basic info (flattened)
  url: string;
  title?: string;
  platform?: string; // Just the name, not full DetectedTechnology
  
  // Metrics (simplified)
  performanceScore?: number; // Overall score
  mobileScore?: number;
  
  // Tech stack (simplified)
  detectedTechnologies?: string[]; // Just names
  
  // Recommendations (keep as-is - useful)
  recommendations: Recommendation[];
  
  // Metadata
  auditDate: string;
  auditDurationMs: number;
}
```

**Benefit:** Easier to debug, less nested access

### 2. Reduce Moving Parts

**Current:** Many helper functions, complex flow

**Simplified:**
- Combine `extractWebsiteInfo` and `parseHtmlMetadata` (overlap)
- Reduce number of separate extraction functions
- Use single `extractAll()` function that returns everything

**Benefit:** Less code to maintain, easier to understand

### 3. Reuse Existing Patterns

**Current:** Custom error handling

**Better:** Use existing logger patterns consistently
```typescript
// Instead of:
await logger.error("Failed to fetch website HTML", {...});

// Use existing pattern:
await logger.error("Website audit failed", {
  questionnaireResponseId,
  websiteUrl,
  error: errorMessage,
  step: "fetch_html", // Add step for debugging
});
```

### 4. Simplify API Response Types

**Current:** Separate `AuditResponse` and `AuditFetchResponse`

**Simplified:** Single response type with optional fields
```typescript
export interface AuditResponse {
  questionnaireResponseId: string | number;
  audit?: WebsiteAuditResult;
  error?: string;
  status: 'pending' | 'completed' | 'failed';
  completedAt?: string;
  cached?: boolean; // If using cached result
}
```

**Benefit:** One type to maintain, clearer API contract

### 5. Add Simple Health Check

**Current:** No way to verify audit system is working

**Add:**
```typescript
// GET /api/audit-website/health
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    pageSpeedApiConfigured: !!process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    lastAuditCount: await getRecentAuditCount(), // Optional
  });
}
```

**Benefit:** Easy to verify system is working

## Nice-to-Have: Maximum Value, Minimal Complexity

### 🎯 Recommendation: **24-Hour Caching with Simple Health Score**

**Why This:**
1. **Maximum Value:**
   - Prevents duplicate audits (saves API quota)
   - Faster response times (no re-audit needed)
   - Reduces costs (PageSpeed API calls)

2. **Minimal Complexity:**
   - Just check `audit_completed_at` timestamp
   - No external cache needed (use database)
   - Simple time comparison

3. **Bonus: Health Score**
   - Single number (0-100) for quick assessment
   - Calculated from existing data
   - No extra API calls needed

**Implementation:**

```typescript
// In POST handler - check cache
const existing = await supabase
  .from("questionnaire_responses")
  .select("audit_results, audit_completed_at, website_url")
  .eq("id", questionnaireResponseId)
  .single();

if (existing.data?.audit_completed_at && existing.data?.audit_results) {
  const completedAt = new Date(existing.data.audit_completed_at);
  const hoursSince = (Date.now() - completedAt.getTime()) / (1000 * 60 * 60);
  
  // If same URL and completed within 24h, return cached
  if (hoursSince < 24 && existing.data.website_url === normalizedUrl) {
    return NextResponse.json({
      success: true,
      message: "Using cached audit results",
      cached: true,
      auditCompletedAt: existing.data.audit_completed_at,
    }, { status: 200 });
  }
}

// Otherwise, trigger new audit
auditWebsiteAsync(body.questionnaireResponseId, normalizedUrl);
```

**Add Health Score:**

```typescript
// In lib/utils/audit-utils.ts
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

**Add to WebsiteAuditResult:**

```typescript
export interface WebsiteAuditResult {
  // ... existing fields
  healthScore?: number; // 0-100 overall health score
}
```

**Update UI:**

```typescript
// In AuditCard
{audit.healthScore !== undefined && (
  <div>
    <span className="text-sm text-muted-foreground">Overall Health:</span>
    <div className={`text-2xl font-bold ${getHealthColor(audit.healthScore)}`}>
      {audit.healthScore}
    </div>
  </div>
)}
```

**Benefits:**
- ✅ Prevents duplicate audits (saves quota)
- ✅ Faster response (cached results)
- ✅ Health score gives quick assessment
- ✅ Minimal code changes
- ✅ No external dependencies

## Summary of Recommendations

### Must Fix (Before Production)

1. ✅ Add idempotency check (24h cache)
2. ✅ Add audit status tracking (`audit_status` field)
3. ✅ Add `maxDuration` config for Vercel Pro

### Should Fix (For Maintainability)

1. ✅ Simplify type definitions (flatten some structures)
2. ✅ Standardize error handling (consistent patterns)
3. ✅ Reduce duplicate code (URL normalization)

### Nice to Have (Maximum Value)

1. ✅ **24-hour caching** (prevents duplicates, saves quota)
2. ✅ **Health score** (quick assessment, calculated from existing data)
3. ✅ Health check endpoint (verify system working)

### Future Considerations

1. Audit history (track changes over time)
2. Rate limiting (protect PageSpeed API quota)
3. Retry logic (exponential backoff for failures)
4. Background job queue (if audit volume increases)
