# PDF Data Validation & Debugging Fixes

## Issue Identified
The PDF generation may be failing because there's no data/information to populate the PDF. This document outlines the fixes added to validate and log the data flow.

## Data Flow Validation Points Added

### 1. Form Data Validation (route.ts)
**Location:** `app/api/questionnaire/submit/route.ts`

**Added checks:**
- ✅ Log all form data received (sector, firstName, lastName, businessName, etc.)
- ✅ Validate sector exists
- ✅ Validate sector is a valid Sector enum value
- ✅ Validate challenge IDs were found for sector
- ✅ Validate challenge details were retrieved
- ✅ Return clear error messages if validation fails

**Key validations:**
```typescript
// Check sector exists
if (!formData.sector) {
  return error: "Sector is required"
}

// Check sector is valid
if (!validSectors.includes(formData.sector)) {
  return error: "Invalid sector: {sector}"
}

// Check challenges found
if (topChallengeIds.length === 0) {
  return error: "No challenges found for sector"
}

// Check challenge details retrieved
if (challengeDetails.length === 0) {
  return error: "Failed to retrieve challenge details"
}
```

### 2. PDF Generation Validation (generateClientReport.ts)
**Location:** `lib/pdf/generateClientReport.ts`

**Added checks:**
- ✅ Validate reportData exists
- ✅ Validate businessName exists
- ✅ Validate topChallenges array is not empty
- ✅ Validate sector exists
- ✅ Log HTML template generation with challenge details
- ✅ Log HTML template result (length, has challenges)

**Key validations:**
```typescript
if (!reportData || !reportData.businessName) {
  throw new Error("Invalid reportData: businessName is required");
}
if (!reportData.topChallenges || reportData.topChallenges.length === 0) {
  throw new Error("Invalid reportData: topChallenges array is empty");
}
if (!reportData.sector) {
  throw new Error("Invalid reportData: sector is required");
}
```

### 3. Enhanced Logging Throughout Flow

**Logging points added:**
1. **Form data received** - Log all form fields
2. **Sector validation** - Log sector value and type
3. **Challenge IDs lookup** - Log sector → challenge IDs mapping
4. **Challenge details** - Log retrieved challenge details
5. **Report data prepared** - Log final report data structure
6. **HTML template generation** - Log before/after template generation
7. **PDF buffer generation** - Log buffer details

## Potential Issues to Check

### Issue 1: Sector Not Being Set
**Symptom:** `formData.sector` is undefined or null

**Check:**
- Form question with `id="sector"` is being answered
- `handleAnswer` function is setting `formData.sector` correctly
- Sector value matches expected enum values

**Fix:** Ensure form collects sector from question `id="sector"`

### Issue 2: Sector Mapping Returns Empty Array
**Symptom:** `getTopChallengesForSector()` returns `[]`

**Check:**
- Sector value matches keys in `sectorChallengeMap`
- Sector is one of: `healthcare`, `manufacturing`, `mining`, `agriculture`, `retail`, `hospitality`, `professional-services`, `construction`, `other`

**Fix:** Ensure `mapSectorToApiFormat()` maps form sectors correctly

### Issue 3: Challenge Details Not Retrieved
**Symptom:** `getChallengeDetails()` returns empty array

**Check:**
- Challenge IDs exist in `CHALLENGE_LIBRARY` (keys "1" through "10")
- Challenge IDs are valid numbers

**Fix:** Verify sectorChallengeMap has correct challenge IDs

### Issue 4: Empty Challenges Array Passed to PDF
**Symptom:** `reportData.topChallenges` is empty

**Check:**
- All validation steps pass
- Challenge details array has items

**Fix:** PDF generation will now throw error if empty (prevents silent failure)

## Testing Checklist

After deploying these fixes:

1. **Submit test form** with valid data
2. **Check logs** for:
   - "Form data received" - verify all fields present
   - "Top challenge IDs for sector" - verify IDs found
   - "Challenge details retrieved" - verify details found
   - "Report data prepared" - verify topChallengesCount > 0
   - "Generating HTML template for PDF" - verify challenges present
   - "HTML template generated" - verify HTML length > 0

3. **If validation fails:**
   - Check error message (will be specific about what's missing)
   - Check logs for exact values received
   - Verify sector mapping is correct

## Expected Log Output (Success)

```
[INFO] Form data received: { sector: "professional-services", ... }
[INFO] Top challenge IDs for sector: { challengeIds: [2, 4, 10], ... }
[INFO] Challenge details retrieved: { challengeDetailsCount: 3, ... }
[INFO] Report data prepared: { topChallengesCount: 3, ... }
[INFO] Generating HTML template for PDF: { challengesCount: 3, ... }
[INFO] HTML template generated: { htmlLength: 12345, ... }
[INFO] PDF buffer generated: { bufferLength: 45678, ... }
```

## Expected Log Output (Failure)

```
[ERROR] Missing sector in form data: { formDataKeys: [...] }
OR
[ERROR] Invalid sector value: { receivedSector: "xxx", validSectors: [...] }
OR
[ERROR] No challenges found for sector: { sector: "xxx" }
OR
[ERROR] Challenge details array is empty: { challengeIds: [...] }
OR
[ERROR] Invalid reportData: topChallenges array is empty
```

## Next Steps

1. Deploy these changes
2. Submit a test form
3. Check logs to see exactly where data flow breaks
4. Fix the root cause based on log output
