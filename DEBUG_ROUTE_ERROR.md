# Debugging Route HTML Error Page Issue

## Problem
The `/api/questionnaire/submit` route is returning HTML error pages instead of JSON, even though we've wrapped everything in try-catch blocks.

## Root Cause Analysis

When Next.js renders an HTML error page for an API route, it means:
1. **The error is happening BEFORE the route handler runs** - This could be:
   - Module import errors (when Next.js loads the route file)
   - Route initialization errors
   - Next.js internal errors

2. **The error is NOT being caught by our try-catch** - This suggests:
   - The error happens during module evaluation (before `POST` function runs)
   - Next.js catches it at a framework level
   - Our handler never gets a chance to return JSON

## How to Debug

### Step 1: Check Dev Server Logs
Look at the terminal where `npm run dev` is running. You should see error messages there.

### Step 2: Check for Module Import Errors
Run the import test script:
```bash
node scripts/test-imports.js
```

This will test if any imports are failing.

### Step 3: Check Environment Variables
The most likely cause is missing environment variables causing `env.RESEND_API_KEY` to throw during validation.

Check if `.env.local` exists and has all required variables:
```bash
# Windows PowerShell
Get-Content .env.local
```

Required variables:
- `RESEND_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Step 4: Check Challenge Library
The challenge library loads markdown files. If files are missing, it might cause errors.

Check if all challenge files exist:
```bash
# Windows PowerShell
Get-ChildItem lib\data\challenges\*.md
```

Should have:
- `01-operating-costs.md`
- `02-cash-flow.md`
- `03-compliance.md`
- `04-digital-transform.md`
- `05-cybersecurity.md`
- `06-labour.md`
- `07-demand.md`
- `08-market-access.md`
- `09-connectivity.md`
- `10-leadership.md`

## Most Likely Fix

**Missing environment variables** - When `env.RESEND_API_KEY` is accessed, it validates environment variables. If they're missing, it throws an error. However, this error should be caught by our try-catch.

**If environment variables are missing:**
1. Copy `.env.local.example` to `.env.local`
2. Fill in all required values
3. Restart dev server: `npm run dev`

## Next Steps

1. **Check dev server logs** - Look for the actual error message
2. **Run import test** - `node scripts/test-imports.js`
3. **Verify environment variables** - Ensure `.env.local` exists and is complete
4. **Restart dev server** - After fixing environment variables

## If Still Failing

If the route still returns HTML after fixing environment variables, the error is likely:
- A module import error that happens at build/load time
- A Next.js framework issue
- A syntax error that TypeScript didn't catch

In this case, check:
- Next.js version compatibility
- Node.js version compatibility
- Any recent changes to dependencies
