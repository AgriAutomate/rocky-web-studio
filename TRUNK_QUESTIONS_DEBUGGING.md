# Trunk Questions (q1-q3) Debugging Guide

## Issue
Trunk questions (q1, q2, q3) are not being included in form submissions, causing default values ("Client", "User") to be used in the database.

## Questions Affected
- **q1**: "What should we call you" (text, optional)
- **q2**: "Website or social link" (text, optional)  
- **q3**: "What are your goals?" (checkbox, required)
- **q4**: "Biggest challenges right now?" (checkbox, required) - This one IS being submitted

## Debug Logging Added

### 1. **Question Display Logging** (`getCurrentQuestion()`)
Logs when trunk questions are displayed:
```javascript
[QuestionnaireForm] Displaying trunk question: {
  questionId: "q1",
  questionLabel: "What should we call you",
  currentStep: 1,
  totalTrunkQuestions: 5,
  trunkQuestionIds: ["sector", "q1", "q2", "q3", "q4"]
}
```

### 2. **Answer Handler Logging** (`handleAnswer()`)
Logs when trunk questions are answered:
```javascript
[QuestionnaireForm] handleAnswer called for trunk question: {
  questionId: "q1",
  value: "John",
  currentFormDataKeys: ["sector"],
  timestamp: "2025-01-23T..."
}
```

### 3. **State Update Logging** (after `setFormData`)
Logs after formData is updated with trunk question:
```javascript
[QuestionnaireForm] Updated formData with trunk question: {
  questionId: "q1",
  value: "John",
  updatedDataKeys: ["sector", "q1"],
  hasQuestionId: true,
  questionValue: "John",
  timestamp: "2025-01-23T..."
}
```

### 4. **FormData State Tracking** (`useEffect`)
Logs whenever formData changes (already exists, will show trunk questions too)

### 5. **Form Submission Logging** (`handleSubmit()`)
Logs complete formData snapshot when submitting (already exists)

## Testing Instructions

1. **Open Browser Console** (F12) on the questionnaire page
2. **Fill out the complete form** including:
   - Answer sector question (should see "Displaying trunk question: sector")
   - Answer q1 "What should we call you" (should see logs)
   - Answer q2 "Website or social link" (should see logs)
   - Answer q3 "What are your goals?" (should see logs)
   - Answer q4 "Biggest challenges?" (should see logs)
3. **Watch console logs** - you should see:
   - "Displaying trunk question" when each trunk question appears
   - "handleAnswer called for trunk question" when you answer
   - "Updated formData with trunk question" after state update
   - "formData state updated" when React state changes
   - "Submitting form data" with complete snapshot when you submit

## What to Look For

### Scenario 1: Questions Not Displayed
**Symptom:** No "Displaying trunk question" logs for q1, q2, q3
**Cause:** Questions aren't being shown (navigation issue, step calculation wrong)
**Check:** Verify `currentStep` is correct, `trunkQuestions` array has all questions

### Scenario 2: handleAnswer Not Called
**Symptom:** See "Displaying trunk question" but no "handleAnswer called"
**Cause:** onChange handlers not firing, input elements not connected
**Check:** Verify input elements have correct `onChange` handlers calling `handleAnswer(currentQuestion.id, value)`

### Scenario 3: State Not Updating
**Symptom:** See "handleAnswer called" but no "Updated formData" or "formData state updated"
**Cause:** React state batching issue, `setFormData()` not working
**Check:** Verify `setFormData(updatedData)` is being called, check for React state batching

### Scenario 4: State Updates But Disappears
**Symptom:** See trunk questions in formData logs, but they're gone at submission
**Cause:** formData being cleared/reset somewhere
**Check:** Look for code that resets formData or deletes keys, check if sector change clears data

### Scenario 5: Optional Questions Skipped
**Symptom:** q1 and q2 are optional, so if user skips them, they won't be in formData
**Cause:** This is expected behavior for optional questions
**Check:** Verify q3 (required) is being stored even if q1 and q2 are skipped

## Expected Console Output Flow

When answering q1:
```
[QuestionnaireForm] Displaying trunk question: { questionId: "q1", ... }
[QuestionnaireForm] handleAnswer called for trunk question: { questionId: "q1", value: "John", ... }
[QuestionnaireForm] Updated formData with trunk question: { questionId: "q1", updatedDataKeys: [...], ... }
[QuestionnaireForm] formData state updated with sector questions: { ... } (if any sector questions exist)
```

When submitting:
```
[QuestionnaireForm] Submitting form data: {
  totalKeys: 15,
  keys: ["sector", "q1", "q2", "q3", "q4", "r6", "r7", "r8", "r9", "r10", "q21", "q22", "q23", "q24"],
  sectorSpecificKeys: ["r6", "r7", "r8", "r9", "r10"],
  ...
}
```

## Key Questions to Answer

1. **Are q1, q2, q3 being displayed?** (Check "Displaying trunk question" logs)
2. **Are answers being captured?** (Check "handleAnswer called" logs)
3. **Is formData being updated?** (Check "Updated formData" logs)
4. **Is state persisting?** (Check "formData state updated" logs)
5. **What's in formData at submission?** (Check "Submitting form data" log)

## Next Steps

1. **Deploy these changes** to production
2. **Run the test** with console open
3. **Share the console logs** - they will reveal exactly where q1-q3 data is being lost
4. **Fix the identified issue** based on the logs

The comprehensive logging will pinpoint the exact problem!

