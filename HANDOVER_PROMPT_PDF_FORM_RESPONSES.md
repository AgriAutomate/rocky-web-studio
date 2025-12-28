# Handover Prompt: PDF Form Responses Issue

## Context
The questionnaire form PDF that's returned to clients after submission is not showing all the questions and responses. Currently, only the "sector" field appears in the "Your Questionnaire Responses" section of the PDF.

## Problem Statement
The PDF component is designed to display all questionnaire responses, but it's not receiving the raw form data with question IDs (q1, q2, q3, q23, q24, q21, q22, etc.). Instead, the frontend form sends a transformed/mapped payload (firstName, businessName, etc.) which doesn't include the original question IDs needed by the PDF component.

## What's Been Done

### 1. PDF Component Enhancement ✅
- **File:** `lib/pdf/PDFDocument.tsx`
- Added "Your Questionnaire Responses" section to display all questions
- Component filters questions to only show those with responses
- Formats responses correctly (arrays, radio options, text)

### 2. Helper Module Created ✅
- **File:** `lib/pdf/questionnaireDataMapper.ts`
- Functions to get question labels from IDs
- Functions to format response values
- Functions to get all questions (trunk + leaves + sector-specific)

### 3. Data Passing Attempt ✅
- **File:** `app/api/questionnaire/submit/route.ts`
- Attempted to pass `rawBodyForExtraction` as `allFormResponses` to PDF
- Added logging to debug what's in `allFormResponses`

### 4. Logging Added ✅
- Added detailed logging to see what's actually in `allFormResponses` when PDF is generated
- Logs keys, preview of values, array lengths, etc.

## Root Cause Identified

**The Problem:** The frontend form (`components/QuestionnaireForm.tsx`) constructs an `apiPayload` that:
- Maps/transforms form data (e.g., `formData.q1` → `firstName`, `formData.q23` → `businessEmail`)
- Only includes mapped fields (firstName, businessName, sector, budget, timeline, etc.)
- Does NOT include the original question IDs (q1, q2, q3, q23, q24, q21, q22, etc.)

**Code Location:** `components/QuestionnaireForm.tsx`, lines 403-446

```typescript
const apiPayload = {
  firstName: formData.q1 || formData.businessName || "Client",
  businessName: formData.q1 || "Client",
  businessEmail: formData.q23 || "",
  businessPhone: formData.q24 || "0000000000",
  sector: mapSectorToApiFormat(formData.sector),
  budget: mapBudgetToApiFormat(formData.q21),
  timelineToImplement: mapTimelineToApiFormat(formData.q22),
  // ... no q1, q2, q3, q23, q24, q21, q22, etc.
};
```

## Solution Needed

The frontend form needs to send BOTH:
1. The mapped/transformed payload (for validation and database storage)
2. The raw form data with question IDs (for PDF display)

**Recommended Approach:**
Include the original form data with question IDs in the API payload, either:
- Option A: Add a `formResponses` field containing the raw `formData` object
- Option B: Include both the mapped fields AND the original question IDs in the payload
- Option C: Send the raw `formData` object and handle mapping on the backend

## Key Files

### Frontend Form
- **File:** `components/QuestionnaireForm.tsx`
- **Lines:** 397-454 (handleSubmit function)
- **Issue:** Only sends mapped apiPayload, not raw formData

### Backend Submit Route
- **File:** `app/api/questionnaire/submit/route.ts`
- **Lines:** 185-199 (allFormResponses construction)
- **Lines:** 189-227 (logging added)
- **Lines:** 442-456 (PDF generation with logging)
- **Current:** Uses `rawBodyForExtraction` but this doesn't have question IDs

### PDF Component
- **File:** `lib/pdf/PDFDocument.tsx`
- **Lines:** 394-451 (All Questions & Responses section)
- **Status:** ✅ Ready to display data, just needs the data

### PDF Data Mapper
- **File:** `lib/pdf/questionnaireDataMapper.ts`
- **Status:** ✅ Helper functions ready to use

## Next Steps

1. **Modify Frontend Form Submission**
   - Update `handleSubmit` in `components/QuestionnaireForm.tsx`
   - Include raw `formData` in the API payload (e.g., add `formResponses: formData` field)
   - Keep the existing mapped `apiPayload` fields for backward compatibility

2. **Update Backend to Use Raw Form Data**
   - Update `app/api/questionnaire/submit/route.ts` to extract `formResponses` from request body
   - Use this for `allFormResponses` instead of `rawBodyForExtraction`
   - Ensure all question IDs (q1, q2, q3, q23, q24, q21, q22, sector, h6-h10, t6-t10, r6-r10, p6-p10, e6-e12, etc.) are included

3. **Test the Fix**
   - Submit a questionnaire with multiple questions filled
   - Check server logs for the logging output to verify allFormResponses contains all question IDs
   - Verify PDF shows all questions in "Your Questionnaire Responses" section

4. **Verify Data Flow**
   - Confirm `formData` object in frontend contains all question IDs
   - Confirm API receives `formResponses` field
   - Confirm PDF component receives `allFormResponses` with all question IDs

## Example Code Change Needed

**In `components/QuestionnaireForm.tsx`, modify the apiPayload:**

```typescript
const apiPayload = {
  // ... existing mapped fields ...
  firstName: formData.q1 || formData.businessName || "Client",
  businessName: formData.q1 || "Client",
  // ... etc ...
  
  // ADD THIS: Include raw form data for PDF
  formResponses: formData, // This contains all q1, q2, q3, q23, q24, etc.
};
```

**In `app/api/questionnaire/submit/route.ts`, update allFormResponses:**

```typescript
// Use formResponses from body if provided, otherwise fall back to rawBodyForExtraction
const allFormResponses: Record<string, any> = body.formResponses || rawBodyForExtraction;
```

## Testing Checklist

- [ ] Submit questionnaire with all questions filled
- [ ] Check server logs for "All form responses for PDF generation" log entry
- [ ] Verify log shows all question IDs (q1, q2, q3, q23, q24, q21, q22, sector, etc.)
- [ ] Download/check PDF
- [ ] Verify "Your Questionnaire Responses" section shows all questions
- [ ] Verify question labels are correct (not just IDs)
- [ ] Verify response values are formatted correctly
- [ ] Test with different sectors to ensure sector-specific questions appear

## Current Status

- ✅ PDF component ready to display all questions
- ✅ Helper functions ready
- ✅ Logging added for debugging
- ⏳ Frontend needs to send raw formData
- ⏳ Backend needs to use raw formData for PDF

## Additional Notes

- The PDF component already handles:
  - Getting all questions (trunk + leaves + sector-specific)
  - Filtering to only show questions with responses
  - Formatting responses (arrays, radio options, text)
  - Getting proper question labels from IDs

- The issue is purely about data not being sent from frontend to backend
- Once the raw formData is sent and used, the PDF should work correctly

