# Comet Browser Test: Submit Error Persistence Fix

## Test Objective
Verify that `submitError` clears correctly when navigating between questions, especially when navigating backward (Q10 → Q9).

---

## Test Steps

### **Setup: Trigger a Submit Error**

1. Navigate to: `https://www.rockywebstudio.com.au/questionnaire`
2. Wait for page to load completely
3. Open browser console (F12 → Console tab)

### **Part 1: Create Submit Error Scenario**

4. Complete the questionnaire quickly (you can skip some required fields or use invalid data to trigger a validation error):
   - **Step 1 (Sector):** Select "Event Management & Entertainment"
   - **Step 2 (Name):** Enter "Test User"
   - **Step 3 (Goals):** Select at least one goal
   - **Step 4 (Challenges):** Select at least one challenge
   - Continue through questions 5-10
   - **Step 11 (Budget - q21):** Select "$5,000 - $10,000"
   - **Step 12 (Timeline - q22):** Select "60-90 days"
   - **Step 13 (Email - q23):** Enter "test@example.com"
   - **Step 14 (Phone - q24):** Leave empty (optional)
   - Click "Submit" button

5. **Expected:** If validation fails, you should see a submit error message like "Validation failed. Please check all required fields are completed correctly."

6. **Record:** Note the exact error message shown

### **Part 2: Test Error Clearing on Backward Navigation**

7. Click the "Previous" button (or "← Back" button) to navigate from the current step back to the previous question

8. **Verify:** The submit error message should **disappear immediately** when you navigate backward

9. **Continue navigating backward:**
   - Click "Previous" button multiple times (e.g., go from Q14 → Q13 → Q12 → Q11)
   - **Verify:** Submit error should NOT appear on any previous questions

10. **Record:** Note whether the error cleared or persisted

### **Part 3: Test Error Clearing on Forward Navigation**

11. Navigate forward again:
    - Click "Next" button multiple times to go forward through questions
    - **Verify:** Submit error should NOT appear on any questions when navigating forward

12. **Record:** Note whether the error appears on any forward navigation

### **Part 4: Test Error Clearing on Field Change**

13. If you still see the submit error, try changing a field value:
    - Select a different option for any question (e.g., change budget selection)
    - **Verify:** Submit error should clear when you change any field value

14. **Record:** Note whether changing a field value clears the error

### **Part 5: Test Complete Fresh Submission**

15. Clear localStorage to start fresh:
    - Open browser console (F12)
    - Run: `localStorage.clear()`
    - Refresh the page

16. Complete the entire questionnaire with valid data:
    - Fill in all required fields correctly
    - Navigate through all questions
    - Submit the form

17. **If submission succeeds:** Form should redirect to confirmation page

18. **If submission fails:** 
    - Note the error message
    - Try navigating backward (Q10 → Q9)
    - **Verify:** Error should clear when navigating
    - Navigate forward again and check if error persists

---

## Expected Results

### ✅ **PASSING Criteria:**

1. **Backward Navigation:**
   - ✅ Submit error clears immediately when clicking "Previous" button
   - ✅ Error does NOT appear on previous questions after navigation
   - ✅ User can navigate backward freely without seeing stale errors

2. **Forward Navigation:**
   - ✅ Submit error does NOT appear when navigating forward after clearing
   - ✅ Navigation works smoothly without error persistence

3. **Field Changes:**
   - ✅ Changing any field value clears submit error
   - ✅ Form allows user to make corrections without error persistence

4. **Console Logs:**
   - ✅ No React warnings about state updates
   - ✅ No errors in console

### ❌ **FAILING Criteria:**

1. **Backward Navigation:**
   - ❌ Submit error persists when navigating backward
   - ❌ Error appears on previous questions (Q9, Q8, etc.)
   - ❌ Error message remains visible after clicking "Previous"

2. **Forward Navigation:**
   - ❌ Error appears on forward navigation
   - ❌ Error persists across multiple question steps

3. **Field Changes:**
   - ❌ Changing field values doesn't clear error
   - ❌ Error persists after user makes corrections

---

## Specific Test Case: Q10 → Q9 Navigation

**Critical Test Scenario:**

1. Complete questions 1-9
2. On Question 10 (final question):
   - Fill in the required fields
   - Click "Submit"
3. **If error appears:**
   - Click "Previous" button to go back to Question 9
   - **VERIFY:** Error message should disappear immediately
   - Question 9 should show normally without any error banner

**Expected:** Error clears immediately when navigating from Q10 to Q9

**If Failing:** Error persists on Q9 even after navigating backward

---

## Browser Console Checks

While testing, check the browser console (F12 → Console) for:

1. **React State Updates:**
   - Look for any warnings about state updates
   - Check if `setSubmitError(null)` is being called

2. **Validation Errors:**
   - Look for validation error logs
   - Note any unexpected errors

3. **Network Errors:**
   - Check Network tab for failed API requests
   - Note any 4xx or 5xx errors

---

## Test Data

**For a complete valid submission test:**

- **Sector:** Event Management & Entertainment
- **Name:** Test User
- **Goals:** Select at least one (e.g., "Increase Online Visibility")
- **Challenges:** Select at least one (e.g., "Operating Costs")
- **Business Model (e6):** Select "Equipment hire (wet/dry hire)"
- Continue with equipment questions
- **Budget (q21):** Select "$5,000 - $10,000"
- **Timeline (q22):** Select "60-90 days"
- **Email (q23):** Enter a valid email (e.g., "test@example.com")
- **Phone (q24):** Optional - can leave empty or enter "0412 345 678"

---

## Success Criteria

**Test PASSES if:**
- ✅ Submit error clears immediately on backward navigation (Q10 → Q9)
- ✅ Submit error does NOT persist on any previous questions
- ✅ Submit error clears on forward navigation
- ✅ Submit error clears when changing field values
- ✅ No console errors or warnings

**Test FAILS if:**
- ❌ Submit error persists when navigating backward
- ❌ Error appears on previous questions after navigation
- ❌ Error doesn't clear when changing fields
- ❌ Console shows errors or warnings related to state updates

---

## Report Format

After testing, provide:

1. **Navigation Test Results:**
   - [ ] Backward navigation (Q10 → Q9): PASS / FAIL
   - [ ] Forward navigation: PASS / FAIL
   - [ ] Field change clearing: PASS / FAIL

2. **Error Behavior:**
   - When did the submit error appear? (Which step/question)
   - Did the error clear when navigating backward? (Yes/No)
   - Did the error persist on previous questions? (Yes/No)

3. **Console Output:**
   - Any errors or warnings in console?
   - Screenshot or copy of console logs if errors present

4. **Screenshots:**
   - Screenshot showing error on Q10 (before navigation)
   - Screenshot showing Q9 after navigating backward (should have no error)

---

## Notes

- The fix uses a `useEffect` hook that watches `currentStep` and clears `submitError` whenever the step changes
- This is more reliable than explicit `setSubmitError(null)` calls in navigation handlers
- The error should clear immediately, not on the next render cycle

