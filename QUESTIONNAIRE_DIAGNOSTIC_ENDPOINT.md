# 🔍 Questionnaire Diagnostic Endpoint

## Quick Diagnostic Test

I've created a diagnostic endpoint to help identify the issue.

### Test the Database Connection

**Visit this URL in your browser (or use curl):**
```
https://your-domain.com/api/questionnaire/test-db
```

Or locally:
```
http://localhost:3000/api/questionnaire/test-db
```

### What It Checks

1. **Environment Variables**
   - `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **Supabase Client Creation**
   - Can create client with service role key

3. **Table Access**
   - Can read from `questionnaire_responses` table

4. **Insert Test**
   - Attempts to insert a test record
   - Shows exact error if it fails
   - Cleans up test record if successful

5. **RLS Status**
   - Notes about Row Level Security (check manually)

### Expected Response

**If everything works:**
```json
{
  "timestamp": "2025-01-19T...",
  "checks": {
    "envVars": { "hasServiceRoleKey": true, ... },
    "clientCreation": { "success": true },
    "tableAccess": { "success": true },
    "insertTest": { "success": true, "insertedId": 123 }
  },
  "summary": {
    "allChecksPassed": true,
    "status": "OK"
  }
}
```

**If there's an issue:**
```json
{
  "checks": {
    "insertTest": {
      "success": false,
      "error": "permission denied for table questionnaire_responses",
      "errorCode": "42501",
      "errorDetails": "...",
      "fullError": "{ ... }"
    }
  },
  "summary": {
    "allChecksPassed": false,
    "status": "ISSUES FOUND"
  }
}
```

### Common Error Messages

- **"permission denied for table questionnaire_responses"**
  - **Fix:** RLS is blocking OR wrong API key
  - **Action:** Disable RLS or add service role policy

- **"relation 'questionnaire_responses' does not exist"**
  - **Fix:** Table doesn't exist
  - **Action:** Run migration in Supabase SQL Editor

- **"null value in column 'X' violates not-null constraint"**
  - **Fix:** Missing required field
  - **Action:** Check payload structure

- **"new row violates check constraint"**
  - **Fix:** Invalid status or sector value
  - **Action:** Check allowed values

### Next Steps

1. **Run the diagnostic endpoint** - It will show exactly what's wrong
2. **Check the `insertTest` error** - This is the actual Supabase error
3. **Fix based on error message** - Follow the fixes above

---

**This endpoint will tell you exactly what's failing!**
