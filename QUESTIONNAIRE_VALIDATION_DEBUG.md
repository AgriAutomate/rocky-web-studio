# Questionnaire Validation Error Debug Guide

**Issue:** "Validation failed" error on Step 10

---

## 🔍 Potential Issues Identified

### **Issue 1: Conditional Question Logic & Step Counting** ⚠️

**Problem:** 
When equipment questions are skipped (e7, e8, e8b, e11, e12), the step count changes but the question order might not align correctly, causing Step 10 to reference the wrong question.

**Location:** `components/QuestionnaireForm.tsx`

**Code Flow:**
1. `filteredSectorQuestions` filters out equipment questions if service-only
2. `getCurrentQuestion()` uses filtered list
3. `totalSteps` calculation uses filtered list
4. BUT: Step numbering might misalign

**Fix Needed:**
- Verify that `getCurrentQuestion()` correctly maps `currentStep` to filtered questions
- Ensure step calculation accounts for skipped questions

---

### **Issue 2: Validation on Skipped Questions** ⚠️

**Problem:**
If a question is skipped due to conditional logic but `formData` still has an empty value for it, validation might fail.

**Example:**
- User selects "services-only" → e7, e8, e8b, e11, e12 are skipped
- But `formData.e7` might be `undefined` or `""`
- If validation runs on a skipped question, it could fail

**Fix Needed:**
- Ensure skipped questions are completely removed from `formData`
- Skip validation for questions that shouldn't be shown

---

### **Issue 3: Required Field Validation** ⚠️

**Problem:**
Questions marked as `required: true` will fail validation if empty, even if they're conditionally skipped.

**Location:** `components/QuestionnaireForm.tsx:268-287`

**Current Validation Logic:**
```typescript
const validateCurrentQuestion = (): boolean => {
  if (!currentQuestion) return true;

  const value = formData[currentQuestion.id];

  if (currentQuestion.required && (!value || (Array.isArray(value) && value.length === 0))) {
    setErrors({ ...errors, [currentQuestion.id]: "This field is required" });
    return false;
  }

  if (currentQuestion.validation && value) {
    const isValid = currentQuestion.validation(value);
    if (!isValid) {
      setErrors({ ...errors, [currentQuestion.id]: "Invalid value" });
      return false;
    }
  }

  return true;
};
```

**Issue:**
- Doesn't check if question should be skipped
- Always validates `required` fields even if conditionally hidden

**Fix Needed:**
- Add check: `if (shouldSkipQuestion(currentQuestion.id)) return true;`
- Ensure skipped questions bypass validation

---

### **Issue 4: Question ID Mismatch at Step 10** ⚠️

**Problem:**
Step 10 might be referencing a question that:
1. Doesn't exist in `filteredSectorQuestions`
2. Was skipped but still counted in step number
3. Has incorrect validation rules

**Questions That Could Be at Step 10:**
- For events-entertainment with equipment: e10 (Special requirements) - Step 10
- For events-entertainment service-only: e9 (Required booking features) - Step 10
- For other sectors: Various sector-specific questions

**Fix Needed:**
- Add logging to see which question is at Step 10
- Verify question exists in filtered list
- Check if question should be validated

---

### **Issue 5: Validation Function Error** ⚠️

**Problem:**
Custom validation functions might throw errors or return unexpected values.

**Location:** `app/lib/questionnaireConfig.ts`

**Example Validation Functions:**
```typescript
const required = (v: any) => {
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return !!v;
};

const validBudget = (v: any) => {
  return typeof v === "string" && ["800-5k", "5k-10k", "10k-15k", "15k-25k"].includes(v);
};
```

**Issue:**
- If validation function throws error, validation fails silently
- No try/catch around validation function call

**Fix Needed:**
- Wrap validation in try/catch
- Handle validation errors gracefully

---

## 🛠️ Recommended Fixes

### **Fix 1: Add Skip Check to Validation**

```typescript
const validateCurrentQuestion = (): boolean => {
  if (!currentQuestion) return true;

  // Skip validation if question should be hidden (conditional logic)
  if (selectedSector === 'events-entertainment' && !shouldShowEquipmentQuestions) {
    if (['e7', 'e8', 'e8b', 'e11', 'e12'].includes(currentQuestion.id)) {
      return true; // Skip validation for hidden questions
    }
  }

  const value = formData[currentQuestion.id];

  if (currentQuestion.required && (!value || (Array.isArray(value) && value.length === 0))) {
    setErrors({ ...errors, [currentQuestion.id]: "This field is required" });
    return false;
  }

  if (currentQuestion.validation && value) {
    try {
      const isValid = currentQuestion.validation(value);
      if (!isValid) {
        setErrors({ ...errors, [currentQuestion.id]: "Invalid value" });
        return false;
      }
    } catch (error) {
      console.error(`Validation error for ${currentQuestion.id}:`, error);
      setErrors({ ...errors, [currentQuestion.id]: "Validation error occurred" });
      return false;
    }
  }

  return true;
};
```

### **Fix 2: Debug Logging**

Add temporary logging to identify the issue:

```typescript
const validateCurrentQuestion = (): boolean => {
  if (!currentQuestion) return true;

  console.log('[Validation] Current question:', {
    step: currentStep,
    questionId: currentQuestion.id,
    questionLabel: currentQuestion.label,
    required: currentQuestion.required,
    hasValue: !!formData[currentQuestion.id],
    value: formData[currentQuestion.id],
  });

  // ... rest of validation
};
```

### **Fix 3: Verify Question Exists**

Add check to ensure question is in filtered list:

```typescript
const getCurrentQuestion = (): QuestionConfig | null => {
  // Show trunk questions first
  if (currentStep < trunkQuestions.length) {
    return trunkQuestions[currentStep] || null;
  }
  
  // Show sector-specific questions after sector is selected (using filtered list)
  if (selectedSector) {
    const sectorStep = currentStep - trunkQuestions.length;
    if (sectorStep >= 0 && sectorStep < filteredSectorQuestions.length) {
      const question = filteredSectorQuestions[sectorStep];
      if (!question) {
        console.error('[Question] Question not found at step:', {
          currentStep,
          sectorStep,
          filteredLength: filteredSectorQuestions.length,
          sectorQuestions: sectorQuestions.length,
        });
      }
      return question || null;
    }
  }
  
  // ... rest of function
};
```

---

## 🔍 Debugging Steps

### **Step 1: Identify the Question at Step 10**

Add console logging:
```typescript
console.log('[Debug] Step 10 Details:', {
  currentStep,
  currentQuestion: currentQuestion?.id,
  currentQuestionLabel: currentQuestion?.label,
  formData: formData,
  selectedSector,
  shouldShowEquipmentQuestions,
  filteredSectorQuestionsLength: filteredSectorQuestions.length,
});
```

### **Step 2: Check Browser Console**

1. Open browser console (F12 or Ctrl+Shift+J)
2. Navigate to Step 10
3. Look for:
   - `[Validation]` logs
   - `[Debug]` logs
   - Error messages
   - Which question ID is failing

### **Step 3: Check Network Tab**

1. Open Network tab in DevTools
2. Try to proceed past Step 10
3. Look for:
   - Failed API calls to `/api/questionnaire/submit`
   - Response body showing validation errors
   - HTTP status codes (400, 422, 500)

### **Step 4: Check Form Data**

Add temporary logging before validation:
```typescript
console.log('[Form Data] Current form data:', JSON.stringify(formData, null, 2));
```

---

## 🎯 Immediate Action Items

1. **Add debug logging** to identify which question is failing
2. **Fix validation logic** to skip hidden questions
3. **Add try/catch** around validation functions
4. **Verify question exists** in filtered list
5. **Check browser console** for exact error message

---

## 📝 Questions to Answer

1. **Which question is at Step 10?**
   - Check browser console logs
   - Look at question label/text

2. **Is it a required field?**
   - Check if `currentQuestion.required === true`

3. **Does it have a validation function?**
   - Check if `currentQuestion.validation` exists

4. **Is the question supposed to be shown?**
   - Verify conditional logic isn't hiding it incorrectly

5. **What's the exact error message?**
   - Browser console will show the actual error

---

**Next Step:** Add debug logging and check browser console for exact error details.

