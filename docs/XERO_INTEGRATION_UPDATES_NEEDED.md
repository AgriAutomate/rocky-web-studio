# XERO_INTEGRATION.md - Updates Needed

**Date:** December 4, 2025  
**Status:** Review Required

---

## 🔍 Issues Found

### 1. Missing Token Refresh Details

**Current Documentation:**
- Mentions token refresh briefly
- Doesn't explain the robust implementation

**What's Missing:**
- Proactive refresh (5 minutes before expiry)
- Exponential backoff retry logic (3 attempts with 200ms, 400ms, 800ms delays)
- Concurrency guard using Vercel KV locks
- Structured logging for refresh operations

**Location in Code:** `lib/xero/helpers.ts` (lines 34-184)

---

### 2. Missing Lazy Initialization Pattern

**Current Documentation:**
- Doesn't mention lazy initialization
- Doesn't explain why it's needed (prevents build-time failures)

**What's Missing:**
- Explanation of `getXeroClient()` function
- Why lazy initialization prevents build errors
- Usage pattern for API routes

**Location in Code:** `lib/xero/client.ts` (lines 54-61)

---

### 3. Missing Structured Logging Information

**Current Documentation:**
- Doesn't mention structured logging
- Doesn't explain log levels or context

**What's Missing:**
- All Xero operations use structured logging
- Logger instances: `xero.helpers`, `xero.invoices.create`, etc.
- Log levels: info, warn, error
- Context includes userId, attempt numbers, etc.

**Location in Code:** All Xero API routes and helpers

---

### 4. API Routes Don't Use withApiHandler

**Current Documentation:**
- Doesn't mention error handling pattern
- Doesn't explain response format

**What's Missing:**
- Xero routes use manual error handling (inconsistent with Stripe)
- Should be updated to use `withApiHandler` for consistency
- Response format differs from other API routes

**Location in Code:** All `app/api/xero/*/route.ts` files

---

### 5. Missing Error Hierarchy Information

**Current Documentation:**
- Mentions errors but doesn't explain types
- Doesn't explain when each error type is used

**What's Missing:**
- `AuthenticationError` - Used when Xero not connected or tokens expired
- `ExternalServiceError` - Used when Xero API calls fail
- Error context and retryability flags

**Location in Code:** `lib/xero/helpers.ts` uses `@/lib/errors`

---

## 📝 Recommended Updates

### Section 1: Add Token Refresh Details

Add a new section after "Usage Guide" called "Token Management":

```markdown
## Token Management

### Automatic Token Refresh

The Xero integration automatically refreshes access tokens when they expire:

**Proactive Refresh:**
- Tokens are refreshed 5 minutes before expiry
- Prevents failed API calls due to expired tokens
- Uses `obtained_at` timestamp for accurate timing

**Retry Logic:**
- Up to 3 refresh attempts
- Exponential backoff: 200ms, 400ms, 800ms
- Logs each attempt for debugging

**Concurrency Guard:**
- Uses Vercel KV locks to prevent concurrent refreshes
- If another request is refreshing, waits up to 1.5 seconds
- Ensures only one refresh happens at a time

**Error Handling:**
- If all refresh attempts fail, throws `AuthenticationError`
- User must reconnect Xero from admin panel
- Previous tokens are cleared from storage
```

### Section 2: Add Lazy Initialization Note

Update "Setup Instructions" to mention:

```markdown
### Important: Lazy Initialization

The Xero client uses lazy initialization to prevent build-time failures:

- Client is only created when first accessed
- Prevents errors when environment variables aren't available during build
- Use `getXeroClient()` function to access the client
```

### Section 3: Add Logging Information

Add to "Troubleshooting" section:

```markdown
#### Check Structured Logs

All Xero operations are logged with structured logging:

- **Logger Names:**
  - `xero.helpers` - Token management
  - `xero.invoices.create` - Invoice creation
  - `xero.invoices.list` - Invoice listing
  - `xero.invoices.detail` - Invoice details

- **Log Levels:**
  - `info` - Normal operations (token refresh, invoice creation)
  - `warn` - Retryable issues (token refresh attempts)
  - `error` - Failures (API errors, authentication failures)

- **View Logs:**
  ```bash
  vercel logs --follow
  # Filter for Xero operations
  vercel logs --follow | grep xero
  ```
```

### Section 4: Update API Reference

Add note about error handling:

```markdown
### Error Response Format

All Xero API routes return consistent error responses:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Note:** Xero routes currently use manual error handling. Future updates will use `withApiHandler` for consistency with other API routes.
```

---

## ✅ Quick Fix Checklist

- [ ] Add token refresh details section
- [ ] Add lazy initialization explanation
- [ ] Add structured logging information
- [ ] Update API reference with error format
- [ ] Add troubleshooting for token refresh failures
- [ ] Document concurrency guard behavior
- [ ] Add examples of log output

---

## 🎯 Priority

**High Priority:**
1. Token refresh details (important for troubleshooting)
2. Structured logging (helps with debugging)

**Medium Priority:**
3. Lazy initialization explanation
4. Error handling pattern notes

**Low Priority:**
5. API route consistency note (future improvement)

---

**Status:** Documentation needs updates to reflect current implementation  
**Action:** Update XERO_INTEGRATION.md with missing details

