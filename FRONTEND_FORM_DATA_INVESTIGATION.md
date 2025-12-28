# Frontend Form Data Investigation

## Code Analysis

### ✅ What's Working Correctly

1. **Question Display Logic** (`getCurrentQuestion()`)
   - Correctly shows trunk questions first
   - Shows sector-specific questions after sector selection
   - Shows leaves questions last
   - Uses `filteredSectorQuestions` for conditional logic (equipment questions)

2. **Answer Storage** (`handleAnswer()`)
   - Stores all answers in `formData` with question ID as key
   - Handles sector changes (clears previous sector's questions)
   - Handles conditional logic (clears equipment questions when needed)

3. **Form Submission** (`handleSubmit()`)
   - Sends `formResponses: formData` which should include ALL answers
   - Includes mapped fields for API validation
   - Includes raw formData for PDF generation

### 🔍 Potential Issues to Investigate

1. **Question IDs Not Being Stored**
   - **Check:** Are sector-specific questions (h6-h10) actually being answered?
   - **Check:** Is `handleAnswer()` being called when user answers these questions?
   - **Debug:** Added console.log in handleSubmit to verify formData contents

2. **FormData State Not Updating**
   - **Check:** Is `setFormData(updatedData)` being called correctly?
   - **Check:** Are there any React state batching issues?
   - **Debug:** Check browser console for the debug log added in handleSubmit

3. **JSON Serialization**
   - **Check:** Are undefined/null values being filtered out?
   - **Note:** JSON.stringify should include all keys, even with undefined values

4. **Sector Mapping Issue**
   - **Check:** Is `selectedSector` being set correctly?
   - **Check:** Are sector-specific questions being shown for the selected sector?
   - **Check:** Is `mapFormSectorToBranchSector()` working correctly?

## Debug Logging Added

Added debug logging in `handleSubmit()` to verify formData contents:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('[QuestionnaireForm] Submitting form data:', {
    totalKeys: Object.keys(formData).length,
    keys: Object.keys(formData),
    hasSectorSpecific: Object.keys(formData).some(key => 
      key.startsWith('h') || key.startsWith('t') || key.startsWith('r') || 
      key.startsWith('p') || key.startsWith('e')
    ),
    sectorSpecificKeys: Object.keys(formData).filter(key => 
      key.startsWith('h') || key.startsWith('t') || key.startsWith('r') || 
      key.startsWith('p') || key.startsWith('e')
    ),
  });
}
```

## Testing Steps

1. **Open Browser Console** (F12)
2. **Fill out questionnaire** including sector-specific questions
3. **Check console log** when submitting - should show:
   - `totalKeys` - should include sector-specific question IDs
   - `sectorSpecificKeys` - should list h6, h7, h8, h9, h10 (for hospitality)
4. **Check Network Tab** - inspect the request payload
   - Look for `formResponses` object
   - Verify it contains sector-specific question IDs

## Expected Behavior

For a **Hospitality** sector questionnaire:
- `formData` should contain: `q1`, `q2`, `q3`, `q4`, `sector`, `h6`, `h7`, `h8`, `h9`, `h10`, `q21`, `q22`, `q23`, `q24`
- `formResponses` in API payload should contain all of these

## If Sector-Specific Questions Are Missing

**Possible Causes:**
1. Questions aren't being answered (user skips them)
2. Questions are being cleared by conditional logic
3. React state not updating correctly
4. FormData being reset somewhere

**Next Steps:**
1. Add more detailed logging in `handleAnswer()` to track when sector-specific questions are answered
2. Add logging to verify `formData` state at each step
3. Check if there's any code that resets `formData` state

## Code Locations

- **Question Display:** `components/QuestionnaireForm.tsx:87-108` (`getCurrentQuestion()`)
- **Answer Storage:** `components/QuestionnaireForm.tsx:204-252` (`handleAnswer()`)
- **Form Submission:** `components/QuestionnaireForm.tsx:391-457` (`handleSubmit()`)
- **Sector Questions:** `components/QuestionnaireForm.tsx:40-44` (`sectorQuestions`)

