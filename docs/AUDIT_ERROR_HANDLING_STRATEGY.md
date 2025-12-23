# Audit Error Handling Strategy

## Analysis of Existing Patterns

### 1. Error Handling Patterns in API Routes

**Discovery Tree API (`app/api/discovery-tree/route.ts`):**
```typescript
try {
  // ... logic ...
} catch (error) {
  console.error("[DiscoveryTree] GET error:", error);
  return NextResponse.json(
    {
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    },
    { status: 500 }
  );
}
```

**Pattern:**
- ✅ Try/catch around entire handler
- ✅ `console.error` with prefix `[ServiceName]`
- ✅ Return user-friendly error message
- ✅ Include error details in response
- ✅ Log full error for debugging

**Questionnaire Submit API (`app/api/questionnaire/submit/route.ts`):**
```typescript
try {
  // ... logic ...
} catch (dbError) {
  await logger.error("Database error storing questionnaire response", {
    error: String(dbError),
    errorMessage: dbError instanceof Error ? dbError.message : String(dbError),
    errorStack: dbError instanceof Error ? dbError.stack : undefined,
    businessName: formData.businessName,
  });
  
  const isDev = process.env.NODE_ENV !== 'production';
  return NextResponse.json(
    {
      success: false,
      error: "Failed to save questionnaire response",
      ...(isDev && {
        debug: "storeQuestionnaireResponse returned null - check server logs for details",
        hint: "Common causes: RLS blocking, missing env vars, or table doesn't exist",
      }),
    },
    { status: 500 }
  );
}
```

**Pattern:**
- ✅ Structured logging with `logger.error()` (not `console.error`)
- ✅ Include context (businessName, etc.)
- ✅ Include error message and stack
- ✅ Different responses for dev vs production
- ✅ Helpful hints in dev mode

### 2. Logging Patterns

**Logger Utility (`lib/utils/logger.ts`):**
```typescript
export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => coreLogger.info(message, meta),
  error: (message: string, meta?: Record<string, unknown>) => coreLogger.error(message, meta),
};
```

**Pattern:**
- ✅ Structured logging with metadata
- ✅ Separate `info` and `error` methods
- ✅ Metadata as optional object

**Current Audit Logging (`lib/services/audit-logging.ts`):**
- Specialized audit logging helpers exist
- Uses same `logger` utility

### 3. Timeout Handling

**Current Audit Service:**
```typescript
const AUDIT_TIMEOUT_MS = 30000; // 30 seconds

async function fetchWebsiteHtml(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      timeout: AUDIT_TIMEOUT_MS,
      // ...
    });
  } catch (error) {
    await logger.error("Failed to fetch website HTML", {
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
```

**Pattern:**
- ✅ Timeout configured at top level
- ✅ Returns `null` on failure (graceful degradation)
- ✅ Logs error with context
- ✅ Doesn't throw - allows partial results

### 4. UI Error Handling Patterns

**AuditCard Component:**
```typescript
if (isLoading) {
  return <LoadingState />;
}

if (!audit) {
  return (
    <Card>
      <p>No audit data available. Audit will run automatically...</p>
    </Card>
  );
}
```

**Pattern:**
- ✅ Loading state handled
- ✅ Missing data handled gracefully
- ✅ No error thrown - just shows message
- ✅ Non-blocking - doesn't prevent other UI from rendering

## Proposed Error Handling Strategy

### 1. Error Categories

**Category 1: Fatal Errors (Audit Cannot Proceed)**
- Invalid URL format
- Website completely inaccessible (timeout, DNS failure, etc.)
- Database save failure

**Category 2: Partial Failures (Partial Audit Possible)**
- PageSpeed API failure (can still analyze HTML)
- Some tech detection uncertain (low confidence)
- Non-200 HTTP status (but HTML received)

**Category 3: Degraded Results (Some Data Missing)**
- Missing performance metrics (PageSpeed failed)
- Uncertain tech stack detection
- Missing SEO data

### 2. Error Storage Strategy

#### Database Fields

**`audit_error` (TEXT):**
- Store for fatal errors only
- Format: `"ErrorType: Human-readable message"`
- Examples:
  - `"InvalidURL: Invalid URL format: not-a-url"`
  - `"Timeout: Website did not respond within 30 seconds"`
  - `"PageSpeedAPI: Rate limit exceeded (429)"`
  - `"DatabaseError: Failed to save audit results"`

**`audit_results` (JSONB):**
- Store partial results even if some parts failed
- Include error flags in result structure:
```typescript
{
  websiteInfo: { ... },
  techStack: { ... },
  performance: null, // null if PageSpeed failed
  seo: { ... },
  metadata: { ... },
  contentAnalysis: { ... },
  recommendations: [ ... ],
  auditDate: "...",
  auditDurationMs: 1234,
  // New fields for error tracking
  errors?: {
    performance?: "PageSpeed API rate limit exceeded",
    techStack?: "Low confidence detection",
  },
  warnings?: string[],
}
```

**`audit_completed_at` (TIMESTAMP):**
- Set only when audit completes (success or partial failure)
- Don't set if fatal error occurred

### 3. Error Handling Implementation

#### Updated `auditWebsiteAsync` Function

```typescript
export async function auditWebsiteAsync(
  questionnaireResponseId: string | number,
  websiteUrl: string
): Promise<void> {
  const startTime = Date.now();
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  try {
    // Validate URL
    if (!isValidUrl(websiteUrl)) {
      await saveAuditError(
        questionnaireResponseId,
        `InvalidURL: Invalid URL format: ${websiteUrl}`
      );
      return;
    }

    const normalizedUrl = normalizeUrl(websiteUrl);

    await logger.info("Starting website audit", {
      questionnaireResponseId,
      websiteUrl: normalizedUrl,
    });

    // Fetch HTML with timeout handling
    let html: string | null = null;
    try {
      html = await fetchWebsiteHtml(normalizedUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check if it's a timeout
      if (errorMessage.includes("timeout") || errorMessage.includes("ETIMEDOUT")) {
        await saveAuditError(
          questionnaireResponseId,
          `Timeout: Website did not respond within ${AUDIT_TIMEOUT_MS}ms`
        );
        return;
      }
      
      // Other fetch errors - try to continue with partial data
      errors.fetch = errorMessage;
      warnings.push(`Failed to fetch website HTML: ${errorMessage}`);
    }

    if (!html) {
      // Fatal - cannot proceed without HTML
      await saveAuditError(
        questionnaireResponseId,
        `FetchError: Failed to fetch website HTML - ${errors.fetch || "Unknown error"}`
      );
      return;
    }

    const $ = cheerio.load(html);

    // Extract data with individual error handling
    const websiteInfo = await extractWebsiteInfo(normalizedUrl, html, $).catch((err) => {
      errors.websiteInfo = err instanceof Error ? err.message : String(err);
      return getDefaultWebsiteInfo(normalizedUrl);
    });

    const techStack = extractTechStack(html, $, normalizedUrl);
    // Add warnings for low confidence detections
    if (techStack.cms && techStack.cms.confidence === "low") {
      warnings.push(`Low confidence CMS detection: ${techStack.cms.name}`);
    }

    // PageSpeed metrics - optional, don't fail if it errors
    let performance: PerformanceMetrics | null = null;
    try {
      performance = await getPageSpeedMetrics(normalizedUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check for rate limiting
      if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
        errors.performance = "PageSpeed API rate limit exceeded";
        warnings.push("Performance metrics unavailable due to API rate limit");
      } else {
        errors.performance = errorMessage;
        warnings.push(`Performance metrics unavailable: ${errorMessage}`);
      }
      
      // Continue without performance data
      performance = null;
    }

    const metadata = parseHtmlMetadata($, html);
    const seo = extractSeoMetrics($, html, normalizedUrl);
    const contentAnalysis = analyzeContent($, html, normalizedUrl);

    // Generate recommendations (works even with partial data)
    const recommendations = generateRecommendations({
      websiteInfo,
      techStack,
      performance: performance || undefined,
      seo,
      contentAnalysis,
    });

    // Build audit result with error tracking
    const auditResult: WebsiteAuditResult = {
      websiteInfo,
      techStack,
      performance: performance || undefined,
      seo,
      metadata,
      contentAnalysis,
      recommendations,
      auditDate: new Date().toISOString(),
      auditDurationMs: Date.now() - startTime,
      // Add error/warning tracking (if we extend the type)
      ...(Object.keys(errors).length > 0 && { errors }),
      ...(warnings.length > 0 && { warnings }),
    };

    // Save results (even if partial)
    await saveAuditResults(questionnaireResponseId, auditResult);

    await logger.info("Website audit completed", {
      questionnaireResponseId,
      websiteUrl: normalizedUrl,
      durationMs: auditResult.auditDurationMs,
      hasErrors: Object.keys(errors).length > 0,
      hasWarnings: warnings.length > 0,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    await logger.error("Website audit failed", {
      questionnaireResponseId,
      websiteUrl,
      error: errorMessage,
      stack: errorStack,
    });

    // Save error - this is a fatal error
    await saveAuditError(
      questionnaireResponseId,
      `FatalError: ${errorMessage}`
    );
  }
}
```

### 4. Helper Functions

#### Enhanced `saveAuditError`

```typescript
async function saveAuditError(
  questionnaireResponseId: string | number,
  errorMessage: string
): Promise<void> {
  try {
    const supabase = createServerSupabaseClient(true);
    
    const { error } = await (supabase as any)
      .from("questionnaire_responses")
      .update({
        audit_error: errorMessage,
        // Don't set audit_completed_at for fatal errors
        // audit_completed_at: null, // Explicitly clear if was set
      })
      .eq("id", questionnaireResponseId);

    if (error) {
      // Log but don't throw - we don't want to break the flow
      console.error("[Audit] Failed to save audit error:", error);
      await logger.error("Failed to save audit error to database", {
        questionnaireResponseId,
        errorMessage,
        dbError: error.message,
      });
    }
  } catch (err) {
    // Log but don't throw
    console.error("[Audit] Exception saving audit error:", err);
  }
}
```

#### Enhanced `saveAuditResults`

```typescript
async function saveAuditResults(
  questionnaireResponseId: string | number,
  auditResult: WebsiteAuditResult
): Promise<void> {
  try {
    const supabase = createServerSupabaseClient(true);
    
    const { error } = await (supabase as any)
      .from("questionnaire_responses")
      .update({
        audit_results: auditResult,
        audit_completed_at: new Date().toISOString(),
        audit_error: null, // Clear any previous errors
      })
      .eq("id", questionnaireResponseId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  } catch (error) {
    // This is a fatal error - we tried to save but failed
    await logger.error("Failed to save audit results to database", {
      questionnaireResponseId,
      error: error instanceof Error ? error.message : String(error),
    });
    
    // Save as error instead
    await saveAuditError(
      questionnaireResponseId,
      `DatabaseError: Failed to save audit results - ${error instanceof Error ? error.message : String(error)}`
    );
    
    throw error; // Re-throw so caller knows save failed
  }
}
```

### 5. UI Error Handling

#### Updated `AuditCard` Component

```typescript
export function AuditCard({ audit, isLoading }: AuditCardProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!audit) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Website Audit</h3>
        <p className="text-sm text-muted-foreground">
          No audit data available. Audit will run automatically when a website URL is provided.
        </p>
      </Card>
    );
  }

  // Check for errors/warnings in audit result
  const hasErrors = audit.errors && Object.keys(audit.errors).length > 0;
  const hasWarnings = audit.warnings && audit.warnings.length > 0;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Website Audit</h3>
      
      {/* Show warnings if present */}
      {hasWarnings && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800 font-medium">Note:</p>
          <ul className="text-xs text-yellow-700 mt-1 list-disc list-inside">
            {audit.warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Show errors if present */}
      {hasErrors && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800 font-medium">Some data unavailable:</p>
          <ul className="text-xs text-red-700 mt-1 list-disc list-inside">
            {Object.entries(audit.errors).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rest of component... */}
    </Card>
  );
}
```

#### Updated Discovery Page Error Handling

```typescript
// In app/discovery/[id]/page.tsx
const fetchAudit = async () => {
  setAuditLoading(true);
  try {
    const auditResponse = await fetch(
      `/api/audit-website?questionnaireResponseId=${questionnaireResponseId}`
    );

    if (auditResponse.ok) {
      const auditData = await auditResponse.json();
      
      if (auditData.audit) {
        // Audit completed (may have partial data)
        setAudit(auditData.audit);
      } else if (auditData.error) {
        // Audit failed - don't set audit, but don't show error to user
        // The AuditCard will handle the missing data gracefully
        console.log("[Discovery] Audit failed:", auditData.error);
        // Don't set audit - AuditCard will show "No audit data available"
      }
    } else if (auditResponse.status === 404) {
      // Audit not yet completed - this is fine, just wait
      console.log("[Discovery] Audit pending...");
      // Don't set audit - AuditCard will show loading or "not available"
    } else {
      // Unexpected error - log but don't break UI
      console.error("[Discovery] Unexpected audit fetch error:", auditResponse.status);
    }
  } catch (auditErr) {
    // Network error or other exception - log but don't break UI
    console.error("[Discovery] Audit fetch exception:", auditErr);
    // Don't set audit - UI will handle gracefully
  } finally {
    setAuditLoading(false);
  }
};
```

### 6. Error Message Format

**Standard Format:** `"ErrorType: Human-readable message"`

**Error Types:**
- `InvalidURL` - URL format validation failed
- `Timeout` - Request timed out
- `FetchError` - Failed to fetch website HTML
- `PageSpeedAPI` - PageSpeed API error (rate limit, etc.)
- `DatabaseError` - Failed to save to database
- `FatalError` - Unexpected fatal error

**Examples:**
```
"InvalidURL: Invalid URL format: not-a-url"
"Timeout: Website did not respond within 30000ms"
"FetchError: Failed to fetch website HTML - ECONNREFUSED"
"PageSpeedAPI: Rate limit exceeded (429)"
"DatabaseError: Failed to save audit results - RLS policy violation"
"FatalError: Unexpected error in audit process"
```

## Summary

### ✅ Principles

1. **Never Break the Flow:** Audit failures should never prevent questionnaire/discovery flows from working
2. **Graceful Degradation:** Return partial results when possible
3. **Clear Error Messages:** Store structured error messages in `audit_error`
4. **Structured Logging:** Use `logger.error()` with context
5. **UI Resilience:** UI handles missing/failed audit data gracefully

### ✅ Implementation Checklist

- [ ] Update `auditWebsiteAsync` to handle partial failures
- [ ] Add error/warning tracking to audit results
- [ ] Update `saveAuditError` to use structured error format
- [ ] Update `saveAuditResults` to handle save failures
- [ ] Update `AuditCard` to show warnings/errors
- [ ] Update discovery page to handle audit fetch errors gracefully
- [ ] Add timeout handling for all external calls
- [ ] Add rate limit detection for PageSpeed API
- [ ] Test with various failure scenarios

### ✅ Testing Scenarios

1. **Invalid URL** → Should save error, not break flow
2. **Timeout** → Should save error, not break flow
3. **PageSpeed API Rate Limit** → Should continue with partial results
4. **Non-200 HTTP Status** → Should continue if HTML received
5. **Database Save Failure** → Should log error, save to `audit_error`
6. **Partial Tech Detection** → Should continue with low confidence
7. **Missing Audit Data in UI** → Should show graceful message
