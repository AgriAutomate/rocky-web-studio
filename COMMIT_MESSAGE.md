fix(pdf): include raw form data with question IDs for PDF generation

## Problem
The PDF component was only receiving mapped/transformed form data (firstName, businessName, etc.) instead of the raw form data with question IDs (q1, q2, q3, q23, q24, q21, q22, etc.). This caused the "Your Questionnaire Responses" section in the PDF to only show the sector field.

## Solution
- Modified frontend form (`components/QuestionnaireForm.tsx`) to include `formResponses: formData` in API payload
- Updated backend route (`app/api/questionnaire/submit/route.ts`) to use `body.formResponses` for PDF generation
- Maintains backward compatibility by falling back to `rawBodyForExtraction` if `formResponses` is not provided

## Changes
- Frontend now sends both mapped fields (for validation/DB) and raw formData (for PDF)
- Backend prioritizes `formResponses` from request body when constructing `allFormResponses`
- PDF component already had logic to display all questions - just needed the data

## Testing Checklist
- [ ] Submit questionnaire with all questions filled
- [ ] Check server logs for "All form responses for PDF generation" log entry
- [ ] Verify log shows all question IDs (q1, q2, q3, q23, q24, q21, q22, sector, etc.)
- [ ] Download/check PDF
- [ ] Verify "Your Questionnaire Responses" section shows all questions
- [ ] Verify question labels are correct (not just IDs)
- [ ] Verify response values are formatted correctly
- [ ] Test with different sectors to ensure sector-specific questions appear

## Files Changed
- `components/QuestionnaireForm.tsx` - Added formResponses to API payload
- `app/api/questionnaire/submit/route.ts` - Updated to use formResponses for PDF generation

