# Testing Prompt: PDF Form Responses Fix

Use this prompt to systematically test the PDF form responses fix:

---

**Test the PDF form responses fix by working through this checklist:**

1. **Submit a complete questionnaire:**
   - Fill out all questions in the questionnaire form
   - Include questions from trunk (q1, q2, q3, q4), sector-specific questions (h6-h10, t6-t10, r6-r10, p6-p10, e6-e12, etc.), and leaves (q21, q22, q23, q24)
   - Submit the form

2. **Check server logs:**
   - Look for the log entry: "All form responses for PDF generation"
   - Verify the log shows:
     - `totalKeys` is greater than 1 (should have many question IDs)
     - `keys` array includes: q1, q2, q3, q4, q23, q24, q21, q22, sector, and sector-specific IDs
     - Not just mapped fields like firstName, businessName

3. **Verify PDF generation:**
   - Check that PDF was generated successfully (no errors in logs)
   - Download the PDF from email attachment or storage

4. **Inspect PDF content:**
   - Open the PDF and navigate to "Your Questionnaire Responses" section
   - Verify it shows ALL questions (not just sector):
     - Trunk questions (q1, q2, q3, q4)
     - Sector-specific questions (h6-h10, t6-t10, r6-r10, p6-p10, e6-e12, etc.)
     - Leaves questions (q21, q22, q23, q24)
   - Verify question labels are human-readable (not just IDs like "q1")
   - Verify response values are formatted correctly:
     - Arrays show as comma-separated lists
     - Radio options show the selected option label
     - Text fields show the actual text entered

5. **Test with different sectors:**
   - Submit questionnaires for different sectors (hospitality, healthcare, retail, etc.)
   - Verify sector-specific questions appear correctly in each PDF
   - Verify the sector mapping works (form sector value → config sector)

6. **Edge cases:**
   - Test with optional fields left empty (should not appear in PDF)
   - Test with checkbox arrays (multiple selections)
   - Test with events-entertainment sector and equipment questions conditional logic

**Expected Result:**
- PDF "Your Questionnaire Responses" section displays all questions with responses
- Question labels are readable (e.g., "What should we call you?" not "q1")
- All question types (text, radio, checkbox, textarea) format correctly
- Sector-specific questions appear based on selected sector

**If issues found:**
- Check server logs for what's actually in `allFormResponses`
- Verify `formResponses` is being sent from frontend
- Verify backend is using `body.formResponses` correctly
- Check PDF component filtering logic

