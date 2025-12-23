# Audit API - Final Specification

## Route Structure

**Single File:** `app/api/audit-website/route.ts`

**Endpoints:**
- `GET /api/audit-website?questionnaireResponseId=...`
- `POST /api/audit-website`

## Request/Response Formats

### POST `/api/audit-website`

**Purpose:** Trigger asynchronous website audit (fire-and-forget)

**Request Body:**
```json
{
  "questionnaireResponseId": "123" | 123,
  "websiteUrl": "https://example.com"
}
```

**Success Response (202 Accepted):**
```json
{
  "success": true,
  "questionnaireResponseId": "123",
  "message": "Audit started. Results will be available shortly.",
  "auditStartedAt": "2025-01-22T10:30:15.123Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "questionnaireResponseId is required"
}
```

```json
{
  "error": "websiteUrl is required"
}
```

```json
{
  "error": "Invalid URL format: not-a-url"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Internal server error",
  "details": "Error message here"
}
```

### GET `/api/audit-website?questionnaireResponseId=...`

**Purpose:** Fetch stored audit results

**Query Parameters:**
- `questionnaireResponseId` (required) - string or number

**Success Response (200 OK) - Audit Completed Successfully:**
```json
{
  "questionnaireResponseId": "123",
  "audit": {
    "websiteInfo": { ... },
    "techStack": { ... },
    "performance": { ... },
    "seo": { ... },
    "metadata": { ... },
    "contentAnalysis": { ... },
    "recommendations": [ ... ],
    "auditDate": "2025-01-22T10:30:15.123Z",
    "auditDurationMs": 12500
  },
  "auditCompletedAt": "2025-01-22T10:30:15.123Z"
}
```

**Success Response (200 OK) - Audit Failed:**
```json
{
  "questionnaireResponseId": "123",
  "error": "Failed to fetch website: timeout",
  "auditError": "Failed to fetch website: timeout"
}
```

**Not Found Response (404 Not Found) - Audit Not Yet Completed:**
```json
{
  "questionnaireResponseId": "123",
  "message": "Audit not yet completed. Please check again shortly."
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "questionnaireResponseId query parameter is required"
}
```

**Error Response (404 Not Found) - Questionnaire Not Found:**
```json
{
  "error": "Questionnaire response not found"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Failed to fetch audit results",
  "details": "Database error message"
}
```

```json
{
  "error": "Internal server error",
  "details": "Error message here"
}
```

## Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| `200` | OK | GET: Audit completed (success or failure) |
| `202` | Accepted | POST: Audit triggered successfully |
| `400` | Bad Request | Missing/invalid parameters |
| `404` | Not Found | Questionnaire not found, audit not completed |
| `500` | Internal Server Error | Server/database errors |

## Error Response Format

**Standard Error Format:**
```typescript
{
  error: string;        // Required: Human-readable error message
  details?: string;     // Optional: Additional error details
}
```

**Note:** POST success responses include `success: true` for clarity. Error responses do NOT include `success: false` (aligned with discovery tree pattern).

## Pattern Alignment

### ✅ Matches Discovery Tree API Patterns

1. **Single File:** Both GET and POST handlers in one file ✅
2. **Error Format:** `{ error: string, details?: string }` ✅
3. **Status Codes:** 200, 400, 404, 500 (plus 202 for async POST) ✅
4. **Response Headers:** `Content-Type: application/json; charset=utf-8` ✅
5. **Runtime Config:** `dynamic: "force-dynamic"`, `runtime: "nodejs"` ✅
6. **Validation:** Check required fields, return 400 ✅
7. **Error Handling:** Try/catch with console.error ✅

### ⚠️ Differences (By Design)

1. **202 Accepted:** POST returns 202 (not 200) - fire-and-forget pattern
2. **Success Field:** POST success includes `success: true` - provides clarity
3. **GET Error Response:** Returns 200 with error field for failed audits (different from "not completed" 404)

## Usage Examples

### Trigger Audit

```typescript
const response = await fetch("/api/audit-website", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    questionnaireResponseId: "123",
    websiteUrl: "https://example.com",
  }),
});

if (response.status === 202) {
  const data = await response.json();
  console.log("Audit triggered:", data.message);
}
```

### Fetch Audit Results

```typescript
const response = await fetch(
  `/api/audit-website?questionnaireResponseId=123`
);

if (response.status === 200) {
  const data = await response.json();
  
  if (data.audit) {
    // Audit completed successfully
    console.log("Audit results:", data.audit);
  } else if (data.error) {
    // Audit failed
    console.error("Audit error:", data.error);
  }
} else if (response.status === 404) {
  // Audit not yet completed
  console.log("Audit pending...");
}
```

## Migration Notes

**Route Change:**
- Old: `GET /api/audit-website/get?questionnaireResponseId=...`
- New: `GET /api/audit-website?questionnaireResponseId=...`

**Error Format Change:**
- Old: `{ success: false, error: "...", details?: "..." }`
- New: `{ error: "...", details?: "..." }`

**Files Updated:**
- ✅ `app/api/audit-website/route.ts` - Consolidated GET + POST
- ✅ `app/discovery/[id]/page.tsx` - Updated route

**Files Deleted:**
- ✅ `app/api/audit-website/get/route.ts` - Consolidated into main route

## Summary

✅ **Aligned with discovery tree patterns**
✅ **Consistent error handling**
✅ **Clear status codes**
✅ **Type-safe responses**
✅ **Ready for production**
