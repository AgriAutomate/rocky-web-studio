# Similar Issues Audit: Raw Form Data Loss

## Issues Found

### 1. ✅ FIXED: PDF Generation (`app/api/questionnaire/submit/route.ts`)
**Issue:** `allFormResponses` was using `rawBodyForExtraction` which contains mapped fields, not raw question IDs.
**Status:** Fixed by using `body.formResponses` (but Comet found it's still not working - likely frontend issue)

### 2. ⚠️ POTENTIAL ISSUE: N8N Webhook (`app/api/questionnaire/submit/route.ts:61`)
**Location:** Line 61 in `triggerN8nWebhook` function
**Issue:** Sends `formData` (validated/mapped data) instead of raw form data with question IDs
**Impact:** If n8n workflow needs raw question IDs (q1, q2, q3, etc.), it won't have them
**Code:**
```typescript
body: JSON.stringify({
  responseId,
  formData,  // ❌ This is mapped data, not raw question IDs
  timestamp: new Date().toISOString(),
}),
```
**Recommendation:** Include `allFormResponses` or `body.formResponses` in webhook payload if n8n needs raw data

### 3. ⚠️ POTENTIAL ISSUE: Database Storage (`app/api/questionnaire/submit/route.ts:284`)
**Location:** Line 284 - `storeQuestionnaireResponse` call
**Issue:** Stores `formDataWithExtras` which includes some extracted data, but may not include all raw question IDs
**Current Implementation:**
- Extracts sector-specific keys (h6-h10, t6-t10, r6-r10, p6-p10) from `rawBodyForExtraction`
- Extracts goals (q3) and primary offers (q5) from `rawBodyForExtraction`
- But doesn't store ALL raw question IDs (q1, q2, q4, q21, q22, q23, q24, etc.)
**Impact:** Database may not have complete raw form data for future reference
**Recommendation:** Consider storing `allFormResponses` as JSONB column if full audit trail is needed

### 4. ✅ GOOD: Goals/Offers Extraction (`app/api/questionnaire/submit/route.ts:147-153`)
**Status:** Correctly extracts q3 and q5 from `rawBodyForExtraction` before validation
**Note:** This works because these fields are in the raw body, but they're extracted manually

### 5. ✅ GOOD: Sector-Specific Data Extraction (`app/api/questionnaire/submit/route.ts:266-274`)
**Status:** Correctly extracts sector-specific question IDs from `rawBodyForExtraction`
**Note:** This works but only for specific known keys

## Root Cause Analysis

The fundamental issue is that:
1. Frontend sends mapped fields (firstName, businessName, etc.) in the main payload
2. Frontend should also send `formResponses: formData` with raw question IDs
3. Backend uses `body.formResponses || rawBodyForExtraction` as fallback
4. But `rawBodyForExtraction` is a copy of `body`, which contains mapped fields, not raw question IDs

**The real problem:** If `body.formResponses` is missing or undefined, we fall back to mapped data, not raw data.

## Recommendations

### Immediate Fix (Comet is handling):
- Ensure frontend sends `formResponses: formData` correctly
- Verify backend receives and uses `body.formResponses`

### Additional Improvements:

1. **N8N Webhook Enhancement:**
   ```typescript
   body: JSON.stringify({
     responseId,
     formData,  // Keep for backward compatibility
     allFormResponses: allFormResponses,  // Add raw data
     timestamp: new Date().toISOString(),
   }),
   ```

2. **Database Storage Enhancement:**
   - Consider adding `raw_form_responses JSONB` column to `questionnaire_responses` table
   - Store complete `allFormResponses` for full audit trail
   - Useful for debugging, analytics, and future features

3. **Validation:**
   - Add logging to verify `body.formResponses` exists and contains question IDs
   - Add fallback warning if `formResponses` is missing

## Testing Checklist for Similar Issues

- [ ] Verify N8N webhook receives raw question IDs if needed
- [ ] Check database storage includes all necessary raw data
- [ ] Verify any other external services receive raw data if required
- [ ] Check audit logs have access to raw form data
- [ ] Verify analytics/reporting can access raw question IDs

