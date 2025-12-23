# Audit API Alignment with Existing Patterns

## Analysis of Existing API Patterns

### Pattern 1: Route Structure

**Discovery Tree API (`app/api/discovery-tree/route.ts`):**
- Single file with GET and POST handlers
- Route: `/api/discovery-tree`
- GET: Query parameter `?questionnaireResponseId=...`
- POST: JSON body with `DiscoveryTreeUpdateRequest`

**Current Audit API:**
- Two separate files:
  - `app/api/audit-website/route.ts` (POST)
  - `app/api/audit-website/get/route.ts` (GET)
- Routes: `/api/audit-website` (POST) and `/api/audit-website/get` (GET)

### Pattern 2: Request/Response Formats

**Discovery Tree GET:**
- Query: `?questionnaireResponseId=...`
- Response: `DiscoveryTreePrePopulateResponse` (200)
- Error: `{ error: string, details?: string }` (400, 404, 500)

**Discovery Tree POST:**
- Body: `DiscoveryTreeUpdateRequest`
- Response: `DiscoveryTreeUpdateResponse` (200)
- Error: `{ error: string, details?: string }` (400, 404, 500)

**Current Audit POST:**
- Body: `AuditRequest`
- Response: `AuditResponse` (202 Accepted)
- Error: `{ success: false, error: string, details?: string }` (400, 500)

**Current Audit GET:**
- Query: `?questionnaireResponseId=...`
- Response: `AuditFetchResponse` (200, 404)
- Error: `{ error: string, details?: string }` (400, 500)

### Pattern 3: Error Handling

**Discovery Tree Pattern:**
```typescript
// Validation error (400)
return NextResponse.json(
  { error: "questionnaireResponseId query parameter is required" },
  { status: 400 }
);

// Not found (404)
return NextResponse.json(
  { error: "Questionnaire response not found" },
  { status: 404 }
);

// Database error (500)
return NextResponse.json(
  { error: "Failed to fetch questionnaire response", details: error.message },
  { status: 500 }
);

// Catch-all error (500)
return NextResponse.json(
  {
    error: "Internal server error",
    details: error instanceof Error ? error.message : String(error),
  },
  { status: 500 }
);
```

**Current Audit Pattern:**
```typescript
// Validation error (400) - Uses success: false
return NextResponse.json(
  { success: false, error: "questionnaireResponseId is required" },
  { status: 400 }
);

// Catch-all error (500) - Uses success: false
return NextResponse.json(
  {
    success: false,
    error: "Internal server error",
    details: error instanceof Error ? error.message : String(error),
  },
  { status: 500 }
);
```

### Pattern 4: Status Codes

**Discovery Tree:**
- `200` - Success
- `400` - Bad request (validation)
- `404` - Not found
- `500` - Server error

**Current Audit:**
- `202` - Accepted (POST - fire-and-forget)
- `200` - Success (GET - with data or error info)
- `400` - Bad request (validation)
- `404` - Not found (GET - audit not completed)
- `500` - Server error

### Pattern 5: Response Headers

**Discovery Tree:**
```typescript
headers: { "Content-Type": "application/json; charset=utf-8" }
```

**Current Audit:**
```typescript
headers: { "Content-Type": "application/json; charset=utf-8" }
```

✅ **Consistent**

### Pattern 6: Runtime Configuration

**Discovery Tree:**
```typescript
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
```

**Current Audit:**
```typescript
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
```

✅ **Consistent**

## Proposed Aligned API Design

### Option 1: Single File (Matches Discovery Tree Pattern)

**Route:** `app/api/audit-website/route.ts`

**GET `/api/audit-website?questionnaireResponseId=...`**
- Query parameter: `questionnaireResponseId`
- Response: `AuditFetchResponse` (200, 404)
- Error: `{ error: string, details?: string }` (400, 500)

**POST `/api/audit-website`**
- Body: `AuditRequest`
- Response: `AuditResponse` (202 Accepted)
- Error: `{ error: string, details?: string }` (400, 500)

**Benefits:**
- ✅ Matches discovery tree pattern exactly
- ✅ Single file for related endpoints
- ✅ Consistent with existing codebase

### Option 2: Keep Separate Files (Current Structure)

**Routes:**
- `app/api/audit-website/route.ts` (POST)
- `app/api/audit-website/get/route.ts` (GET)

**Benefits:**
- ✅ Clear separation of concerns
- ✅ Easier to find specific handlers
- ⚠️ Different from discovery tree pattern

## Recommended: Option 1 (Single File)

### Aligned Request/Response Formats

#### POST `/api/audit-website`

**Request Body:**
```typescript
{
  questionnaireResponseId: string | number;
  websiteUrl: string;
}
```

**Success Response (202 Accepted):**
```typescript
{
  success: true;
  questionnaireResponseId: string | number;
  message: string;
  auditStartedAt?: string; // ISO 8601
}
```

**Error Response (400 Bad Request):**
```typescript
{
  error: string; // e.g., "questionnaireResponseId is required"
  details?: string; // Optional additional context
}
```

**Error Response (500 Internal Server Error):**
```typescript
{
  error: "Internal server error";
  details?: string; // Error message
}
```

#### GET `/api/audit-website?questionnaireResponseId=...`

**Query Parameters:**
- `questionnaireResponseId` (required)

**Success Response (200 OK) - Audit Completed:**
```typescript
{
  questionnaireResponseId: string | number;
  audit: WebsiteAuditResult;
  auditCompletedAt: string; // ISO 8601
}
```

**Success Response (200 OK) - Audit Failed:**
```typescript
{
  questionnaireResponseId: string | number;
  error: string; // Error message
  auditError: string; // Same error message
}
```

**Not Found Response (404 Not Found):**
```typescript
{
  questionnaireResponseId: string | number;
  message: string; // e.g., "Audit not yet completed. Please check again shortly."
}
```

**Error Response (400 Bad Request):**
```typescript
{
  error: string; // e.g., "questionnaireResponseId query parameter is required"
}
```

**Error Response (500 Internal Server Error):**
```typescript
{
  error: "Internal server error" | "Failed to fetch audit results";
  details?: string; // Error message
}
```

## Differences from Current Implementation

### 1. Error Response Format

**Current (POST):**
```typescript
{ success: false, error: "...", details?: "..." }
```

**Proposed (Aligned):**
```typescript
{ error: "...", details?: "..." }
```

**Rationale:** Discovery tree uses `{ error: string }` without `success: false`. For consistency, remove `success` field from error responses. Keep `success: true` in success responses for POST (202 Accepted).

### 2. Route Structure

**Current:**
- Separate files: `route.ts` (POST) and `get/route.ts` (GET)

**Proposed:**
- Single file: `route.ts` with GET and POST handlers

**Rationale:** Matches discovery tree pattern exactly.

### 3. GET Response for Failed Audits

**Current:**
```typescript
// Returns 200 with error field
{
  questionnaireResponseId,
  error: response.audit_error,
  auditError: response.audit_error,
}
```

**Proposed (Aligned):**
```typescript
// Keep 200 with error field (this is fine - indicates audit completed but failed)
{
  questionnaireResponseId,
  error: response.audit_error,
  auditError: response.audit_error,
}
```

**Rationale:** This pattern is acceptable - audit completed but failed. Different from "not yet completed" (404).

## Final Aligned Implementation

### Route: `app/api/audit-website/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { auditWebsiteAsync } from "@/lib/services/audit-service";
import { isValidUrl, normalizeUrl } from "@/lib/utils/audit-utils";
import { logger } from "@/lib/utils/logger";
import type {
  AuditRequest,
  AuditResponse,
  AuditFetchResponse,
  WebsiteAuditResult,
} from "@/lib/types/audit";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/audit-website?questionnaireResponseId=...
 * 
 * Fetches stored audit results for a questionnaire response.
 * 
 * Returns:
 * - 200 with audit results if available
 * - 200 with error field if audit failed
 * - 404 if audit not yet completed or not found
 * - 400 if questionnaireResponseId missing
 * - 500 on server error
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const questionnaireResponseId = searchParams.get("questionnaireResponseId");

    if (!questionnaireResponseId) {
      return NextResponse.json(
        { error: "questionnaireResponseId query parameter is required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient(true);

    // Fetch questionnaire response with audit data
    const { data: response, error } = await (supabase as any)
      .from("questionnaire_responses")
      .select("id, audit_results, audit_completed_at, audit_error")
      .eq("id", questionnaireResponseId)
      .single();

    if (error) {
      console.error("[Audit] Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch audit results", details: error.message },
        { status: 500 }
      );
    }

    if (!response) {
      return NextResponse.json(
        { error: "Questionnaire response not found" },
        { status: 404 }
      );
    }

    // Check if audit has been completed successfully
    if (response.audit_completed_at && response.audit_results) {
      const fetchResponse: AuditFetchResponse = {
        questionnaireResponseId,
        audit: response.audit_results as WebsiteAuditResult,
        auditCompletedAt: response.audit_completed_at,
      };

      return NextResponse.json(fetchResponse, {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    // Check if audit failed
    if (response.audit_error) {
      const fetchResponse: AuditFetchResponse = {
        questionnaireResponseId,
        error: response.audit_error,
        auditError: response.audit_error,
      };

      return NextResponse.json(fetchResponse, {
        status: 200, // 200 because audit completed (but failed)
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    // Audit not yet completed
    return NextResponse.json(
      {
        questionnaireResponseId,
        message: "Audit not yet completed. Please check again shortly.",
      },
      { status: 404 }
    );
  } catch (error) {
    console.error("[Audit] GET error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audit-website
 * 
 * Triggers an asynchronous website audit.
 * Returns 202 Accepted immediately, audit runs in background.
 * 
 * Request Body:
 * {
 *   questionnaireResponseId: string | number,
 *   websiteUrl: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body: AuditRequest = await req.json();

    // Validate required fields
    if (!body.questionnaireResponseId) {
      return NextResponse.json(
        { error: "questionnaireResponseId is required" },
        { status: 400 }
      );
    }

    if (!body.websiteUrl) {
      return NextResponse.json(
        { error: "websiteUrl is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    if (!isValidUrl(body.websiteUrl)) {
      return NextResponse.json(
        { error: `Invalid URL format: ${body.websiteUrl}` },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeUrl(body.websiteUrl);

    // Fire-and-forget: Start audit asynchronously
    // Don't await - return immediately with 202 Accepted
    auditWebsiteAsync(body.questionnaireResponseId, normalizedUrl).catch(
      (error) => {
        // Error already logged in auditWebsiteAsync
        console.error(
          "[Audit] Background audit failed:",
          error instanceof Error ? error.message : String(error)
        );
      }
    );

    await logger.info("Website audit triggered", {
      questionnaireResponseId: body.questionnaireResponseId,
      websiteUrl: normalizedUrl,
    });

    const response: AuditResponse = {
      success: true,
      questionnaireResponseId: body.questionnaireResponseId,
      message: "Audit started. Results will be available shortly.",
      auditStartedAt: new Date().toISOString(),
    };

    // Return 202 Accepted - request accepted but processing continues
    return NextResponse.json(response, {
      status: 202,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    console.error("[Audit] POST error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
```

## Summary of Changes

### ✅ Aligned with Discovery Tree Pattern

1. **Single File:** Combined GET and POST in one file ✅
2. **Error Format:** Use `{ error: string, details?: string }` (remove `success: false` from errors) ✅
3. **Status Codes:** Consistent with discovery tree (200, 400, 404, 500) + 202 for async POST ✅
4. **Response Headers:** Same headers format ✅
5. **Runtime Config:** Same dynamic/runtime settings ✅
6. **Validation:** Same validation pattern ✅
7. **Error Handling:** Same try/catch structure ✅

### ⚠️ Differences (By Design)

1. **202 Accepted:** POST returns 202 (not 200) because it's fire-and-forget ✅
2. **Success Field:** POST success response includes `success: true` (for clarity) ✅
3. **GET Error Response:** Returns 200 with error field for failed audits (different from "not completed" 404) ✅

### 📝 Migration Steps

1. Move GET handler from `app/api/audit-website/get/route.ts` to `app/api/audit-website/route.ts`
2. Update error responses to remove `success: false` (keep `success: true` in POST success)
3. Delete `app/api/audit-website/get/route.ts`
4. Update any frontend code that calls `/api/audit-website/get` to `/api/audit-website`

## Status

✅ **Proposed design aligns with existing patterns**
✅ **Minimal changes needed**
✅ **Backward compatible (just route change)**
