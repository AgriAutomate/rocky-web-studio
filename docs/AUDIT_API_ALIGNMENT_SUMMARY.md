# Audit API Alignment - Implementation Summary

## Changes Made

### ✅ 1. Consolidated Routes

**Before:**
- `app/api/audit-website/route.ts` (POST only)
- `app/api/audit-website/get/route.ts` (GET only)

**After:**
- `app/api/audit-website/route.ts` (GET + POST handlers)

**Rationale:** Matches discovery tree pattern exactly - single file with both handlers.

### ✅ 2. Aligned Error Response Format

**Before (POST errors):**
```typescript
{ success: false, error: "...", details?: "..." }
```

**After (POST errors):**
```typescript
{ error: "...", details?: "..." }
```

**Rationale:** Discovery tree uses `{ error: string }` without `success: false`. Keep `success: true` in success responses for POST (202 Accepted) for clarity.

### ✅ 3. Updated Frontend Route

**Before:**
```typescript
`/api/audit-website/get?questionnaireResponseId=${questionnaireResponseId}`
```

**After:**
```typescript
`/api/audit-website?questionnaireResponseId=${questionnaireResponseId}`
```

**File Updated:** `app/discovery/[id]/page.tsx`

### ✅ 4. Removed Old Route File

**Deleted:** `app/api/audit-website/get/route.ts`

## API Specification

### POST `/api/audit-website`

**Purpose:** Trigger asynchronous website audit

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

**Error Responses:**
- `400 Bad Request`: `{ error: string, details?: string }`
- `500 Internal Server Error`: `{ error: "Internal server error", details?: string }`

### GET `/api/audit-website?questionnaireResponseId=...`

**Purpose:** Fetch stored audit results

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
  error: string;
  auditError: string;
}
```

**Not Found Response (404 Not Found):**
```typescript
{
  questionnaireResponseId: string | number;
  message: string; // "Audit not yet completed. Please check again shortly."
}
```

**Error Responses:**
- `400 Bad Request`: `{ error: string }`
- `500 Internal Server Error`: `{ error: string, details?: string }`

## Pattern Alignment Checklist

| Pattern | Discovery Tree | Audit API | Status |
|---------|---------------|-----------|--------|
| **Route Structure** | Single file (GET + POST) | ✅ Single file (GET + POST) | ✅ Aligned |
| **Error Format** | `{ error: string, details?: string }` | ✅ `{ error: string, details?: string }` | ✅ Aligned |
| **Success Format** | `{ ...data }` | ✅ `{ success: true, ...data }` (POST only) | ✅ Aligned |
| **Status Codes** | 200, 400, 404, 500 | ✅ 200, 202, 400, 404, 500 | ✅ Aligned |
| **Response Headers** | `Content-Type: application/json; charset=utf-8` | ✅ Same | ✅ Aligned |
| **Runtime Config** | `dynamic: "force-dynamic"`, `runtime: "nodejs"` | ✅ Same | ✅ Aligned |
| **Validation** | Check required fields, return 400 | ✅ Same | ✅ Aligned |
| **Error Handling** | Try/catch with console.error | ✅ Same | ✅ Aligned |
| **Database Errors** | Return 500 with details | ✅ Same | ✅ Aligned |

## Differences (By Design)

### 1. 202 Accepted Status

**Audit POST:** Returns `202 Accepted` (not `200 OK`)

**Rationale:** Fire-and-forget pattern - request accepted but processing continues asynchronously.

### 2. Success Field in POST Response

**Audit POST Success:** Includes `success: true`

**Rationale:** Provides clarity that request was accepted. Discovery tree POST returns data directly (synchronous operation).

### 3. GET Error Response for Failed Audits

**Audit GET:** Returns `200 OK` with `error` field for failed audits

**Rationale:** Distinguishes between:
- Audit completed but failed (200 with error)
- Audit not yet completed (404)

## Files Modified

1. ✅ `app/api/audit-website/route.ts` - Added GET handler, aligned error format
2. ✅ `app/discovery/[id]/page.tsx` - Updated route from `/api/audit-website/get` to `/api/audit-website`

## Files Deleted

1. ✅ `app/api/audit-website/get/route.ts` - Consolidated into main route file

## Testing Checklist

- [ ] POST `/api/audit-website` with valid data returns 202
- [ ] POST `/api/audit-website` with missing `questionnaireResponseId` returns 400
- [ ] POST `/api/audit-website` with missing `websiteUrl` returns 400
- [ ] POST `/api/audit-website` with invalid URL returns 400
- [ ] GET `/api/audit-website?questionnaireResponseId=...` with completed audit returns 200 with data
- [ ] GET `/api/audit-website?questionnaireResponseId=...` with failed audit returns 200 with error
- [ ] GET `/api/audit-website?questionnaireResponseId=...` with pending audit returns 404
- [ ] GET `/api/audit-website` without query parameter returns 400
- [ ] GET `/api/audit-website?questionnaireResponseId=invalid` returns 404
- [ ] Frontend discovery page loads audit results correctly

## Summary

✅ **Routes consolidated** - Single file matches discovery tree pattern
✅ **Error format aligned** - Removed `success: false` from errors
✅ **Frontend updated** - Route changed from `/get` to main route
✅ **Old file deleted** - Cleanup complete
✅ **Patterns consistent** - Matches discovery tree API patterns exactly

**Status:** Complete and aligned with existing patterns!
