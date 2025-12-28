# Production Debug Logging Enabled

## Changes Made

I've updated the debug logging to work in **production** (not just development mode) so you can see what's happening when testing on rockywebstudio.com.au.

## Enhanced Logging Points

### 1. **Question Display Logging** (`getCurrentQuestion()`)
Logs when sector-specific questions are displayed:
```javascript
[QuestionnaireForm] Displaying sector question: {
  questionId: "h6",
  questionLabel: "Booking model",
  currentStep: 4,
  sectorStep: 0,
  selectedSector: "hospitality",
  filteredSectorQuestionsCount: 5,
  filteredSectorQuestionIds: ["h6", "h7", "h8", "h9", "h10"]
}
```

### 2. **Answer Handler Logging** (`handleAnswer()`)
Logs when sector questions are answered:
```javascript
[QuestionnaireForm] handleAnswer called for sector question: {
  questionId: "h6",
  value: "table",
  currentFormDataKeys: ["q1", "q2", "q3", "q4", "sector"],
  timestamp: "2025-01-23T..."
}
```

### 3. **State Update Logging** (after `setFormData`)
Logs after formData is updated:
```javascript
[QuestionnaireForm] Updated formData with sector question: {
  questionId: "h6",
  value: "table",
  updatedDataKeys: ["q1", "q2", "q3", "q4", "sector", "h6"],
  hasQuestionId: true,
  questionValue: "table",
  timestamp: "2025-01-23T..."
}
```

### 4. **FormData State Tracking** (`useEffect`)
Logs whenever formData changes and contains sector questions:
```javascript
[QuestionnaireForm] formData state updated with sector questions: {
  sectorKeys: ["h6", "h7", "h8"],
  sectorValues: { h6: "table", h7: ["walkins", "online"], h8: "45 minutes" },
  allFormDataKeys: ["q1", "q2", "q3", "q4", "sector", "h6", "h7", "h8"],
  selectedSector: "hospitality",
  timestamp: "2025-01-23T..."
}
```

### 5. **Form Submission Logging** (`handleSubmit()`)
Logs complete formData snapshot when submitting:
```javascript
[QuestionnaireForm] Submitting form data: {
  totalKeys: 18,
  keys: ["q1", "q2", "q3", "q4", "sector", "h6", "h7", "h8", "h9", "h10", "q21", "q22", "q23", "q24"],
  hasSectorSpecific: true,
  sectorSpecificKeys: ["h6", "h7", "h8", "h9", "h10"],
  selectedSector: "hospitality",
  formDataSnapshot: { q1: "...", h6: "table", ... },
  timestamp: "2025-01-23T..."
}
```

## Testing Instructions

1. **Open Browser Console** (F12) on https://www.rockywebstudio.com.au/questionnaire
2. **Fill out the complete form** including all hospitality questions (h6-h10)
3. **Watch console logs** - you should see:
   - "Displaying sector question" when each sector question appears
   - "handleAnswer called for sector question" when you answer
   - "Updated formData with sector question" after state update
   - "formData state updated with sector questions" when React state changes
   - "Submitting form data" with complete snapshot when you submit

## What to Look For

### Scenario 1: Questions Not Displayed
**Symptom:** No "Displaying sector question" logs
**Cause:** Questions aren't being shown (sector mapping issue, filtering issue)
**Check:** Verify `selectedSector` is set correctly, `filteredSectorQuestions` has questions

### Scenario 2: handleAnswer Not Called
**Symptom:** See "Displaying sector question" but no "handleAnswer called"
**Cause:** onChange handlers not firing, input elements not connected
**Check:** Verify input elements have correct `onChange` handlers

### Scenario 3: State Not Updating
**Symptom:** See "handleAnswer called" but no "Updated formData" or "formData state updated"
**Cause:** React state batching issue, `setFormData()` not working
**Check:** Verify `setFormData(updatedData)` is being called

### Scenario 4: State Updates But Disappears
**Symptom:** See sector questions in formData logs, but they're gone at submission
**Cause:** formData being cleared/reset somewhere
**Check:** Look for code that resets formData or deletes keys

### Scenario 5: State Has Questions But Not in Submission
**Symptom:** formData logs show h6-h10, but submission log doesn't
**Cause:** formData being filtered/transformed before submission
**Check:** Verify `formResponses: formData` uses correct formData state

## Expected Console Output Flow

When answering h6 (Booking model):
```
[QuestionnaireForm] Displaying sector question: { questionId: "h6", ... }
[QuestionnaireForm] handleAnswer called for sector question: { questionId: "h6", value: "table", ... }
[QuestionnaireForm] Updated formData with sector question: { questionId: "h6", updatedDataKeys: [...], ... }
[QuestionnaireForm] formData state updated with sector questions: { sectorKeys: ["h6"], ... }
```

When submitting:
```
[QuestionnaireForm] Submitting form data: {
  totalKeys: 18,
  keys: [..., "h6", "h7", "h8", "h9", "h10", ...],
  sectorSpecificKeys: ["h6", "h7", "h8", "h9", "h10"],
  ...
}
```

## Next Steps

1. **Deploy these changes** to production
2. **Run the test** with console open
3. **Share the console logs** - they will reveal exactly where the data is being lost
4. **Fix the identified issue** based on the logs

The comprehensive logging will pinpoint the exact problem!

