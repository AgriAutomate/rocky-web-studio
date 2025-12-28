# PDF Form Responses Fix Summary

## Issue
The PDF generated for questionnaire submissions was not showing all question responses - only the sector question was appearing in the "Your Questionnaire Responses" section.

## Root Cause
The `allFormResponses` object was being passed to the PDF component, but the data structure wasn't correctly preserving all the form data. The fix ensures that `rawBodyForExtraction` (which contains all the original question IDs from the form submission) is passed directly to the PDF component.

## Solution Implemented

### 1. Simplified Data Passing
- Changed `allFormResponses` to use `rawBodyForExtraction` directly
- This preserves the exact data structure sent from the form (q1, q2, q3, q23, q24, q21, q22, sector, etc.)
- Removed complex merging logic that might have been causing data loss

### 2. PDF Component Logic
- The PDF component already has logic to:
  - Get all questions from the questionnaire config (trunk + leaves)
  - Get sector-specific questions based on the selected sector
  - Filter to only show questions that have responses
  - Format responses correctly (arrays, radio options, text values)

## Files Modified

1. **app/api/questionnaire/submit/route.ts**
   - Simplified `allFormResponses` to use `rawBodyForExtraction` directly
   - Ensures all form data is passed to PDF generation

2. **lib/pdf/PDFDocument.tsx**
   - Already includes logic to display all questions and responses
   - Uses helper functions to format and display responses

3. **lib/pdf/questionnaireDataMapper.ts**
   - Helper functions for getting question labels and formatting responses

## Expected Behavior

After this fix, the PDF should:
- ✅ Display all questions that were answered in the form
- ✅ Show proper question labels (e.g., "What should we call you", "Contact email", etc.)
- ✅ Format responses correctly:
  - Radio buttons: Show selected option label (e.g., "$5,000 - $10,000" instead of "5k-10k")
  - Checkboxes: Show all selected options as comma-separated list
  - Text fields: Show entered text
  - Empty fields: Show "Not provided" or skip if optional

## Testing

To verify the fix:
1. Submit a questionnaire with multiple questions filled
2. Check the PDF "Your Questionnaire Responses" section
3. Verify that all answered questions appear with correct labels and values
4. Test with different sectors to ensure sector-specific questions appear

## Potential Issues & Next Steps

If the issue persists, possible causes:

1. **Form Data Not Being Sent**
   - Check browser network tab to see what data is actually sent in the POST request
   - Verify all question IDs (q1, q2, q23, q24, etc.) are in the request body

2. **Database Storage for Future Regeneration**
   - Currently, raw form data is not stored in the database
   - If PDFs are regenerated later via webhook, they won't have access to all form responses
   - Consider adding a `form_responses JSONB` column to store complete raw data

3. **Sector-Specific Questions**
   - Sector mapping might not match between form values and config sectors
   - Check sector mapping logic in PDF component

## Debugging

To debug further, add logging in `app/api/questionnaire/submit/route.ts`:
```typescript
await logger.info("All form responses for PDF", {
  responseId,
  allFormResponsesKeys: Object.keys(allFormResponses),
  allFormResponsesPreview: Object.keys(allFormResponses).reduce((acc, key) => {
    const value = allFormResponses[key];
    acc[key] = Array.isArray(value) ? `${value.length} items` : String(value).substring(0, 50);
    return acc;
  }, {} as Record<string, string>),
});
```

