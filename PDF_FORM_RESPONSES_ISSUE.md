# PDF Form Responses Issue

## Problem
The PDF generated for questionnaire submissions doesn't include all the form response data. Only one question (sector) is showing in the "Your Questionnaire Responses" section.

## Root Cause Analysis

1. **Submit Route PDF Generation:**
   - The PDF is generated in `app/api/questionnaire/submit/route.ts` during form submission
   - `rawBodyForExtraction` contains the raw form body
   - This is passed as `allFormResponses` to the PDF component

2. **Potential Issues:**
   - `rawBodyForExtraction` might not contain all fields if they're filtered out during validation
   - The data structure might not match what the PDF component expects
   - Some fields might be transformed during validation and not present in rawBodyForExtraction

3. **Database Storage:**
   - The database doesn't store the complete raw form responses
   - Only specific fields are stored (first_name, business_name, sector, pain_points, etc.)
   - If PDF is regenerated later via webhook, it won't have access to all form data

## Solution Implemented

### Fix 1: Merge rawBodyForExtraction with formData
- Create `allFormResponses` object that merges `rawBodyForExtraction` with validated `formData`
- Ensure mapped fields (q23→businessEmail, q21→budget, etc.) are included
- This ensures all question IDs (q1, q2, q3, etc.) are present in the PDF data

### Next Steps (If Issue Persists)

1. **Add Database Column for Raw Form Data:**
   - Add `form_responses JSONB` column to `questionnaire_responses` table
   - Store complete raw form data during submission
   - Update webhook route to use stored data

2. **Debug Data Flow:**
   - Add logging to see what's actually in `allFormResponses` when PDF is generated
   - Verify question IDs match between form and PDF component
   - Check if sector-specific questions are being included

3. **Verify PDF Component Logic:**
   - Ensure `getAllQuestions()` returns all questions (trunk + leaves)
   - Verify sector-specific questions are being retrieved correctly
   - Check if filtering logic is excluding valid responses

## Testing

To verify the fix:
1. Submit a questionnaire with multiple questions filled
2. Check the PDF to see if all questions appear in "Your Questionnaire Responses" section
3. Verify question labels and response values are correct
4. Test with different sectors to ensure sector-specific questions appear

