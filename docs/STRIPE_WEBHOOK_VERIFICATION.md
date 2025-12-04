# Stripe Webhook Handler - Standards Verification

## Issues Found ❌

### 1. **NOT Using `withApiHandler` Wrapper** ⚠️ CRITICAL
- **Current:** Direct `POST` export with manual error handling
- **Required:** Use `withApiHandler` wrapper for consistent responses
- **Impact:** Inconsistent error responses, no automatic request ID tracking

### 2. **Blocking Email Operations** ⚠️ CRITICAL
- **Current:** Emails are `await`ed (lines 225-228)
- **Required:** Emails must be non-blocking to return 200 OK immediately
- **Impact:** Delays webhook response, may cause Stripe timeouts

### 3. **Manual Error Handling** ⚠️
- **Current:** Manual try-catch with custom response formatting
- **Required:** Let `withApiHandler` handle errors automatically
- **Impact:** Inconsistent error format, missing request IDs

### 4. **Direct NextResponse.json Returns** ⚠️
- **Current:** Multiple direct `NextResponse.json()` calls
- **Required:** Return data object, let wrapper format response
- **Impact:** Inconsistent response format

## Required Changes

1. Wrap handler with `withApiHandler`
2. Make email sending non-blocking (fire and forget)
3. Use typed errors (`ValidationError`, `ExternalServiceError`)
4. Remove manual error handling
5. Return data objects instead of NextResponse

## Special Considerations for Webhooks

Webhooks have special requirements:
- Must return 200 OK quickly to Stripe
- Idempotency checks need early returns
- Stripe expects specific response formats

However, we can still:
- Use `withApiHandler` for consistent error handling
- Make emails non-blocking
- Use typed errors
- Add request ID tracking

