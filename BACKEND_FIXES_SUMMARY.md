# Backend Fixes for Sector-Specific Data Storage

## Issue #2 Fixed: Sector-Specific Data Not Stored in Database ✅

### Problem
Sector-specific questions (h6-h10) were being submitted from the frontend but NOT stored in the `sector_specific_data` column in the database.

### Root Cause
The backend was using `rawBodyForExtraction` (which is just a copy of `body` containing mapped fields) instead of `allFormResponses` (which contains `body.formResponses` with raw question IDs).

### Fix Applied
Updated all references to use `allFormResponses` instead of `rawBodyForExtraction`:

1. **Sector-specific data extraction** (line ~270):
   - Changed from: `rawBodyForExtraction[key]`
   - Changed to: `allFormResponses[key]`
   - Added all sector question IDs (h6-h10, t6-t10, r6-r10, p6-p10, e6-e12, hc6-hc10, re6-re10)

2. **Goals extraction** (line ~147):
   - Changed from: `rawBodyForExtraction.q3`
   - Changed to: `allFormResponses.q3`

3. **Primary offers extraction** (line ~151):
   - Changed from: `rawBodyForExtraction.q5`
   - Changed to: `allFormResponses.q5`

4. **Website URL extraction** (line ~352):
   - Changed from: `rawBodyForExtraction.q2`
   - Changed to: `allFormResponses.q2`

5. **Client name extraction** (lines ~211, ~555):
   - Changed from: `rawBodyForExtraction.q1`
   - Changed to: `allFormResponses.q1`

### Added Debug Logging
Added logging to track sector-specific data extraction:
```typescript
await logger.info("Extracting sector-specific data for database storage", {
  totalSectorKeys: sectorKeys.length,
  foundKeys: Object.keys(sectorSpecificData),
  foundCount: Object.keys(sectorSpecificData).length,
  allFormResponsesHasKeys: sectorKeys.some(key => allFormResponses[key] !== undefined),
});
```

## Issue #1: Trunk Questions (q1-q4) Missing ⚠️

### Problem
Trunk questions (q1, q2, q3, q4) are not being included in form submissions. Server logs show only: sector, h6-h10, q21-q24.

### Status
**Frontend Issue** - The debug logging added to `QuestionnaireForm.tsx` will help identify why q1-q4 aren't being stored in `formData` state.

### Next Steps
1. Test with the new debug logging enabled
2. Check browser console logs when answering q1-q4
3. Verify if `handleAnswer()` is being called for these questions
4. Verify if `formData` state is updating correctly

### Expected Behavior
When answering trunk questions, console should show:
- `[QuestionnaireForm] handleAnswer called for sector question:` (if it's a sector question)
- `[QuestionnaireForm] Updated formData with sector question:` (if it's a sector question)
- `[QuestionnaireForm] formData state updated with sector questions:` (if formData changes)

For trunk questions (q1-q4), the logs might not show "sector question" but should still show formData updates.

## Testing Checklist

- [ ] Submit new questionnaire with all questions answered
- [ ] Check server logs for "Extracting sector-specific data for database storage"
- [ ] Verify `foundKeys` includes h6-h10 (for hospitality)
- [ ] Check database - `sector_specific_data` column should contain JSON with h6-h10
- [ ] Check browser console for trunk question (q1-q4) logging
- [ ] Verify q1-q4 are included in form submission

## Files Modified

- `app/api/questionnaire/submit/route.ts` - Updated to use `allFormResponses` for all raw question ID extractions

