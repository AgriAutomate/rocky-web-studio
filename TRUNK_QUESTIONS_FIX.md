# Trunk Questions (q1-q3) Fix

## Root Cause Identified ✅

The form was skipping questions q1, q2, q3 when the user first selected a sector. The issue was in the `handleAnswer()` function for sector selection.

### The Bug

**Location:** `components/QuestionnaireForm.tsx:291-292`

**Problem Code:**
```typescript
if (selectedSector !== branchSector) {
  setCurrentStep(trunkQuestions.length); // Start at first sector question
}
```

**What Was Happening:**
1. User is on step 0 (sector question)
2. User selects a sector (e.g., "hospitality")
3. `selectedSector` is `null` (initial state)
4. `branchSector` is "hospitality"
5. `null !== "hospitality"` is `true`
6. Code sets `currentStep` to `trunkQuestions.length` (5)
7. This skips steps 1, 2, 3, 4 (q1, q2, q3, q4) and jumps directly to sector questions!

### The Fix

**Fixed Code:**
```typescript
// Reset current step ONLY if sector is CHANGING (not when first selecting)
// This prevents skipping q1, q2, q3 when user first selects a sector
if (selectedSector && selectedSector !== branchSector) {
  setCurrentStep(trunkQuestions.length); // Start at first sector question
}
// If this is the first sector selection, continue with normal flow (don't skip questions)
```

**What Happens Now:**
1. User is on step 0 (sector question)
2. User selects a sector (e.g., "hospitality")
3. `selectedSector` is `null` (initial state)
4. `branchSector` is "hospitality"
5. `null && null !== "hospitality"` is `false` (short-circuit)
6. Code does NOT reset the step
7. User continues to step 1 (q1), then step 2 (q2), then step 3 (q3), then step 4 (q4)
8. Only when user CHANGES from one sector to another will it reset to sector questions

## Expected Behavior After Fix

**Question Flow:**
1. Question 1: Sector selection (step 0)
2. Question 2: "What should we call you" (q1, step 1) ✅
3. Question 3: "Website or social link" (q2, step 2) ✅
4. Question 4: "What are your goals?" (q3, step 3) ✅
5. Question 5: "Biggest challenges right now?" (q4, step 4) ✅
6. Questions 6-10: Sector-specific questions (steps 5-9)
7. Questions 11-14: Leaves questions (q21-q24, steps 10-13)

## Testing Checklist

- [ ] Fill out questionnaire from start
- [ ] Select a sector
- [ ] Verify q1 appears after sector selection
- [ ] Verify q2 appears after q1
- [ ] Verify q3 appears after q2
- [ ] Verify q4 appears after q3
- [ ] Verify sector-specific questions appear after q4
- [ ] Check form submission - q1, q2, q3 should be in formData
- [ ] Check database - q1, q2, q3 should be stored
- [ ] Check PDF - q1, q2, q3 should appear in "Your Questionnaire Responses"

## Files Modified

- `components/QuestionnaireForm.tsx` - Fixed sector selection logic to not skip trunk questions

