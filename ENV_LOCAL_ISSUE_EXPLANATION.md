# Why .env.local Isn't Being Used - Root Cause Analysis

## The Problem

The `/api/questionnaire/submit` route is returning HTML error pages instead of JSON, even though we've wrapped everything in try-catch blocks.

## Root Cause

**The error is happening during MODULE IMPORT, before our route handler code runs.**

### What's Happening:

1. **Next.js loads the route module** (`app/api/questionnaire/submit/route.ts`)
2. **During module import**, one of the imported modules tries to access environment variables
3. **If `.env.local` is missing or incomplete**, the validation throws an error
4. **Next.js catches this import-time error** and renders an HTML error page
5. **Our try-catch never runs** because the error happens before the handler function executes

### The Code Flow:

```typescript
// This runs at MODULE LOAD TIME (before POST handler)
import { env } from "@/lib/env";  // ← If this throws, Next.js catches it

// Later, when request comes in:
export async function POST(req: NextRequest) {
  try {
    // This never runs if import failed above
  } catch {
    // This never catches import-time errors
  }
}
```

## Why `.env.local` Matters

The `lib/env.ts` file uses a Proxy that validates environment variables **lazily** (only when accessed), BUT:

1. **If `.env.local` doesn't exist** → `process.env.RESEND_API_KEY` is undefined
2. **When `env.RESEND_API_KEY` is accessed** → Zod validation fails
3. **Validation throws an error** → Next.js catches it at module load time
4. **HTML error page rendered** → Our JSON handler never gets a chance

## Current Status

### ✅ What We've Fixed:

1. **Made `env` and `logger` lazy imports** - They're now imported inside the handler, not at module load time
2. **Added module load logging** - `console.log('[Questionnaire] API route module loaded')`
3. **Wrapped handler in try-catch** - All execution errors return JSON
4. **Verified single route handler** - No conflicts or middleware interference

### ❌ What's Still Failing:

**The error is happening BEFORE our handler runs**, which means:
- One of the **static imports** is failing (not `env` or `logger` - those are now lazy)
- Possible culprits:
  - `@/lib/utils/pain-point-mapping` → imports challenge library → might fail if markdown files are missing
  - `@/lib/pdf/generateClientReport` → might have import-time errors
  - `@/lib/email/ClientAcknowledgementEmail` → React component import might fail
  - Other utility imports

## The Solution

### Option 1: Ensure `.env.local` Exists (Quick Fix)

```bash
# Copy template
cp .env.local.example .env.local

# Or sync from main project
powershell -ExecutionPolicy Bypass -File .\scripts\sync-env-local.ps1

# Fill in required variables:
# RESEND_API_KEY=re_...
# SUPABASE_URL=https://...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Then restart dev server:**
```bash
npm run dev
```

### Option 2: Make ALL Imports Lazy (Better Fix)

Move ALL potentially failing imports inside the handler:

```typescript
// Instead of:
import { generatePdfReport } from "@/lib/pdf/generateClientReport";

// Do:
async function getPdfGenerator() {
  const { generatePdfReport } = await import("@/lib/pdf/generateClientReport");
  return generatePdfReport;
}
```

### Option 3: Add Import-Time Error Handling (Best Fix)

Wrap the entire route file in a try-catch at module level:

```typescript
// At top of route.ts
let routeHandler: typeof POST;

try {
  // All imports here
  routeHandler = async function POST(req: NextRequest) {
    // Handler code
  };
} catch (importError) {
  // Fallback handler that always returns JSON
  routeHandler = async function POST(req: NextRequest) {
    return NextResponse.json(
      { success: false, error: "Module load error: " + String(importError) },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  };
}

export { routeHandler as POST };
```

## For the Engineer

### The Real Issue:

**Next.js is catching module import errors and rendering HTML error pages before our handler can return JSON.**

### Why `.env.local` is Relevant:

- If `.env.local` is missing → environment validation fails
- If validation fails during import → Next.js renders HTML
- Our try-catch can't catch import-time errors

### What to Check:

1. **Does `.env.local` exist?**
   ```bash
   Test-Path .env.local
   ```

2. **Are required variables set?**
   ```bash
   Get-Content .env.local | Select-String "RESEND_API_KEY|SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY"
   ```

3. **Check dev server logs** for:
   - Module load log: `[Questionnaire] API route module loaded`
   - Import errors
   - Environment validation errors

4. **Run import test:**
   ```bash
   node scripts/test-imports.js
   ```

### Recommended Fix:

**Make the route file handle import errors gracefully:**

```typescript
// Wrap entire module in try-catch
let POST: typeof import("next/server").NextRequest;

try {
  // All imports
  const { NextRequest, NextResponse } = await import("next/server");
  // ... other imports
  
  POST = async function(req: NextRequest) {
    // Handler code
  };
} catch (importError) {
  // Fallback: always return JSON even on import error
  POST = async function(req: NextRequest) {
    const { NextResponse } = await import("next/server");
    return NextResponse.json(
      { 
        success: false, 
        error: `Module load failed: ${importError instanceof Error ? importError.message : String(importError)}` 
      },
      { 
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      }
    );
  };
}

export { POST };
```

## Summary

- **`.env.local` IS being used** - the issue is it might be missing or incomplete
- **The error happens at module import time** - before our handler runs
- **Next.js catches import errors** - renders HTML instead of letting us return JSON
- **Solution**: Ensure `.env.local` exists OR make all imports lazy OR wrap module in try-catch

The route code is correct - the issue is Next.js's error handling for import-time failures.
