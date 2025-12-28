# Sector-Specific Questions Debugging

## Issue
Sector-specific questions (h6-h10 for hospitality) are not being included in the `formData` that gets sent to the backend as `formResponses`.

## Debug Logging Added

### 1. **handleAnswer() Logging** (Line ~207)
Logs when sector-specific questions are answered:
```typescript
console.log('[QuestionnaireForm] handleAnswer called for sector question:', {
  questionId,
  value,
  currentFormDataKeys: Object.keys(formData),
});
```

### 2. **After State Update Logging** (Line ~250)
Logs after formData is updated with sector question:
```typescript
console.log('[QuestionnaireForm] Updated formData with sector question:', {
  questionId,
  value,
  updatedDataKeys: Object.keys(updatedData),
  hasQuestionId: questionId in updatedData,
  questionValue: updatedData[questionId],
});
```

### 3. **formData State Change Tracking** (Line ~142)
useEffect that logs whenever formData changes and contains sector-specific questions:
```typescript
console.log('[QuestionnaireForm] formData state updated with sector questions:', {
  sectorKeys,
  sectorValues: {...},
  allFormDataKeys: Object.keys(formData),
});
```

### 4. **Form Submission Logging** (Line ~460)
Logs what's in formData when form is submitted:
```typescript
console.log('[QuestionnaireForm] Submitting form data:', {
  totalKeys: Object.keys(formData).length,
  keys: Object.keys(formData),
  hasSectorSpecific: ...,
  sectorSpecificKeys: ...,
});
```

## Testing Steps

1. **Open Browser Console** (F12) on the questionnaire page
2. **Fill out the form** including:
   - Select Hospitality sector
   - Answer ALL hospitality questions (h6-h10)
3. **Watch console logs** as you answer each sector question:
   - Should see "handleAnswer called for sector question" when you answer
   - Should see "Updated formData with sector question" after state update
   - Should see "formData state updated with sector questions" when formData changes
4. **Submit the form** and check:
   - "Submitting form data" log should show sector-specific keys
   - Network tab → Request payload → `formResponses` should contain h6-h10

## What to Look For

### If handleAnswer() is NOT being called:
- **Symptom:** No "handleAnswer called for sector question" logs
- **Cause:** Questions aren't being displayed, or onChange handlers aren't firing
- **Check:** Verify `getCurrentQuestion()` returns sector questions correctly

### If handleAnswer() IS called but formData doesn't update:
- **Symptom:** See "handleAnswer called" but no "Updated formData" or "formData state updated" logs
- **Cause:** React state batching issue, or setFormData() not working
- **Check:** Verify `setFormData(updatedData)` is being called

### If formData updates but disappears:
- **Symptom:** See sector questions in formData logs, but they're gone at submission
- **Cause:** Something is clearing formData, or state is being reset
- **Check:** Look for code that resets formData or deletes keys

### If formData has questions but they're not in submission:
- **Symptom:** formData logs show h6-h10, but submission log doesn't
- **Cause:** formData is being filtered or transformed before submission
- **Check:** Verify `formResponses: formData` is using the correct formData state

## Expected Console Output

When answering h6 (Booking model):
```
[QuestionnaireForm] handleAnswer called for sector question: {
  questionId: "h6",
  value: "table",
  currentFormDataKeys: ["q1", "q2", "q3", "q4", "sector"]
}

[QuestionnaireForm] Updated formData with sector question: {
  questionId: "h6",
  value: "table",
  updatedDataKeys: ["q1", "q2", "q3", "q4", "sector", "h6"],
  hasQuestionId: true,
  questionValue: "table"
}

[QuestionnaireForm] formData state updated with sector questions: {
  sectorKeys: ["h6"],
  sectorValues: { h6: "table" },
  allFormDataKeys: ["q1", "q2", "q3", "q4", "sector", "h6"]
}
```

When submitting:
```
[QuestionnaireForm] Submitting form data: {
  totalKeys: 18,
  keys: ["q1", "q2", "q3", "q4", "sector", "h6", "h7", "h8", "h9", "h10", "q21", "q22", "q23", "q24"],
  hasSectorSpecific: true,
  sectorSpecificKeys: ["h6", "h7", "h8", "h9", "h10"]
}
```

## Code Locations

- **Question Config:** `app/lib/questionnaireConfig.ts:156-209` (hospitality questions h6-h10)
- **Answer Handler:** `components/QuestionnaireForm.tsx:204-252` (`handleAnswer()`)
- **Question Display:** `components/QuestionnaireForm.tsx:87-108` (`getCurrentQuestion()`)
- **Form Submission:** `components/QuestionnaireForm.tsx:391-470` (`handleSubmit()`)

## Next Steps

1. Run the test with console open
2. Share the console logs showing what happens when sector questions are answered
3. Share the Network tab request payload showing what's actually sent
4. Based on the logs, we can identify exactly where the data is being lost

