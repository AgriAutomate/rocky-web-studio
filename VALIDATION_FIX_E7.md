# Validation Fix for e7 Equipment Question

**Issue:** Validation error for e7 (Equipment catalog summary) when question should be skipped

**Root Cause:** The validation was checking `shouldShowEquipmentQuestions` directly, but should check if the question is actually in the filtered list returned by `getCurrentQuestion()`.

**Fix Applied:**
- Changed validation to check if question is in `filteredSectorQuestions` list
- If equipment question is NOT in filtered list, skip validation
- This ensures validation only runs for questions that are actually being shown

**Logic Flow:**
1. `getCurrentQuestion()` uses `filteredSectorQuestions` to determine which question to show
2. If `getCurrentQuestion()` returns e7, it means e7 is in `filteredSectorQuestions`
3. Validation now checks if e7 is in `filteredSectorQuestions` before validating
4. If e7 is NOT in the filtered list, validation is skipped

**Expected Behavior:**
- If user selects "services-only" or "event-planning" in e6, equipment questions are filtered out
- `getCurrentQuestion()` will NOT return e7 (it's not in filteredSectorQuestions)
- Validation check sees e7 is not in filtered list, so skips validation
- No validation error occurs

**If e7 IS being returned by getCurrentQuestion():**
- This means e7 is in the filtered list (user selected equipment-hire or packages)
- Validation should run (question is required)
- User needs to fill in the equipment catalog

**Note:** The error suggests e7 is being shown but empty. This is correct behavior if the user selected equipment-hire in e6 - e7 is required and should be filled in.

