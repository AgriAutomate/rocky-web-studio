# Feature Flags Implementation Guide
**Date:** January 23, 2025  
**Purpose:** Safe rollout of new features  
**Status:** Ready for Week 0 Implementation

## Overview

Feature flags allow gradual rollout and easy rollback of new features. This guide implements a simple feature flag system using environment variables (can upgrade to Vercel Edge Config or Upstash later if needed).

---

## Implementation Strategy

### Phase 1: Simple Environment Variables (Week 0)
- Use `.env.local` for feature flags
- Simple boolean checks in code
- Fast to implement, sufficient for start

### Phase 2: Upgrade if Needed (Future)
- Vercel Edge Config (if using Vercel)
- Upstash Redis (if need dynamic flags)
- LaunchDarkly (if need advanced features)

---

## Feature Flags Needed

### 1. AI Assistant Chatbot
- **Flag:** `NEXT_PUBLIC_FEATURE_AI_ASSISTANT`
- **Purpose:** Control AI chatbot visibility
- **Values:** `true` | `false`
- **Default:** `false` (enable in Week 2-3)

### 2. Case Studies System
- **Flag:** `NEXT_PUBLIC_FEATURE_CASE_STUDIES`
- **Purpose:** Control case studies pages
- **Values:** `true` | `false`
- **Default:** `false` (enable in Week 3-4)

### 3. Case Studies Admin
- **Flag:** `FEATURE_CASE_STUDIES_ADMIN`
- **Purpose:** Control admin UI access
- **Values:** `true` | `false`
- **Default:** `false` (enable in Week 3-4)
- **Note:** Server-side only (not public)

---

## Implementation Code

### 1. Create Feature Flags Utility

**File:** `lib/feature-flags.ts`

```typescript
/**
 * Feature Flags Configuration
 * 
 * Simple feature flag system using environment variables.
 * Can be upgraded to Vercel Edge Config or Upstash if needed.
 */

export const featureFlags = {
  /**
   * AI Assistant Chatbot
   * Controls visibility of /api/ai-assistant chatbot
   */
  aiAssistant: process.env.NEXT_PUBLIC_FEATURE_AI_ASSISTANT === 'true',
  
  /**
   * Case Studies Public Pages
   * Controls visibility of /case-studies pages
   */
  caseStudies: process.env.NEXT_PUBLIC_FEATURE_CASE_STUDIES === 'true',
  
  /**
   * Case Studies Admin UI
   * Controls access to /admin/case-studies
   * Server-side only (not exposed to client)
   */
  caseStudiesAdmin: process.env.FEATURE_CASE_STUDIES_ADMIN === 'true',
} as const;

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof featureFlags): boolean {
  return featureFlags[feature];
}

/**
 * Get all enabled features (for debugging)
 */
export function getEnabledFeatures(): string[] {
  return Object.entries(featureFlags)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);
}
```

---

### 2. Usage in Components

**Example: AI Assistant Component**

```typescript
// components/AIAssistant.tsx
import { isFeatureEnabled } from '@/lib/feature-flags';

export function AIAssistant() {
  // Check if feature is enabled
  if (!isFeatureEnabled('aiAssistant')) {
    return null; // Don't render if disabled
  }
  
  // ... rest of component
}
```

**Example: Case Studies Page**

```typescript
// app/case-studies/page.tsx
import { isFeatureEnabled } from '@/lib/feature-flags';
import { notFound } from 'next/navigation';

export default function CaseStudiesPage() {
  if (!isFeatureEnabled('caseStudies')) {
    notFound(); // Return 404 if feature disabled
  }
  
  // ... rest of page
}
```

---

### 3. Usage in API Routes

**Example: AI Assistant API**

```typescript
// app/api/ai-assistant/route.ts
import { isFeatureEnabled } from '@/lib/feature-flags';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Check if feature is enabled
  if (!isFeatureEnabled('aiAssistant')) {
    return NextResponse.json(
      { error: 'Feature not available' },
      { status: 503 }
    );
  }
  
  // ... rest of API logic
}
```

**Example: Case Studies Admin API**

```typescript
// app/api/case-studies/route.ts
import { isFeatureEnabled } from '@/lib/feature-flags';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Server-side only flag
  if (!process.env.FEATURE_CASE_STUDIES_ADMIN) {
    return NextResponse.json(
      { error: 'Feature not available' },
      { status: 503 }
    );
  }
  
  // ... rest of API logic
}
```

---

### 4. Usage in Middleware (Optional)

**File:** `middleware.ts` (if you want route-level protection)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isFeatureEnabled } from '@/lib/feature-flags';

export function middleware(request: NextRequest) {
  // Protect case studies routes
  if (request.nextUrl.pathname.startsWith('/case-studies')) {
    if (!isFeatureEnabled('caseStudies')) {
      return NextResponse.redirect(new URL('/404', request.url));
    }
  }
  
  // Protect case studies admin
  if (request.nextUrl.pathname.startsWith('/admin/case-studies')) {
    if (!process.env.FEATURE_CASE_STUDIES_ADMIN) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/case-studies/:path*', '/admin/case-studies/:path*'],
};
```

---

## Environment Variables Setup

### Development (.env.local)

```bash
# Feature Flags
NEXT_PUBLIC_FEATURE_AI_ASSISTANT=false
NEXT_PUBLIC_FEATURE_CASE_STUDIES=false
FEATURE_CASE_STUDIES_ADMIN=false
```

### Staging (.env.staging)

```bash
# Feature Flags
NEXT_PUBLIC_FEATURE_AI_ASSISTANT=true
NEXT_PUBLIC_FEATURE_CASE_STUDIES=true
FEATURE_CASE_STUDIES_ADMIN=true
```

### Production (.env.production)

```bash
# Feature Flags
NEXT_PUBLIC_FEATURE_AI_ASSISTANT=true
NEXT_PUBLIC_FEATURE_CASE_STUDIES=true
FEATURE_CASE_STUDIES_ADMIN=true
```

**Note:** In Vercel, set these in Project Settings → Environment Variables

---

## Rollout Schedule

### Week 0: Setup
- [ ] Create `lib/feature-flags.ts`
- [ ] Add environment variables
- [ ] All flags set to `false`

### Week 2-3: AI Assistant
- [ ] Enable `NEXT_PUBLIC_FEATURE_AI_ASSISTANT=true` in staging
- [ ] Test thoroughly
- [ ] Enable in production
- [ ] Monitor for issues

### Week 3-4: Case Studies
- [ ] Enable `NEXT_PUBLIC_FEATURE_CASE_STUDIES=true` in staging
- [ ] Enable `FEATURE_CASE_STUDIES_ADMIN=true` in staging
- [ ] Test thoroughly
- [ ] Enable in production

---

## Rollback Procedure

If issues occur:

1. **Immediate Rollback:**
   ```bash
   # Set flag to false in Vercel
   NEXT_PUBLIC_FEATURE_AI_ASSISTANT=false
   ```

2. **Redeploy:**
   - Vercel will auto-redeploy on env var change
   - Or trigger manual redeploy

3. **Verify:**
   - Check feature is disabled
   - Verify no errors in logs

---

## Testing

### Unit Tests

```typescript
// __tests__/feature-flags.test.ts
import { isFeatureEnabled, featureFlags } from '@/lib/feature-flags';

describe('Feature Flags', () => {
  beforeEach(() => {
    // Reset env vars
    delete process.env.NEXT_PUBLIC_FEATURE_AI_ASSISTANT;
  });
  
  it('should return false when feature is disabled', () => {
    expect(isFeatureEnabled('aiAssistant')).toBe(false);
  });
  
  it('should return true when feature is enabled', () => {
    process.env.NEXT_PUBLIC_FEATURE_AI_ASSISTANT = 'true';
    expect(isFeatureEnabled('aiAssistant')).toBe(true);
  });
});
```

---

## Future Upgrades

### Option 1: Vercel Edge Config

If you need dynamic flags without redeploy:

```typescript
import { get } from '@vercel/edge-config';

export async function getFeatureFlag(flag: string): Promise<boolean> {
  const value = await get(flag);
  return value === true;
}
```

### Option 2: Upstash Redis

If you need real-time flag updates:

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getFeatureFlag(flag: string): Promise<boolean> {
  const value = await redis.get(`feature:${flag}`);
  return value === 'true';
}
```

---

## Checklist

### Week 0 Implementation
- [ ] Create `lib/feature-flags.ts`
- [ ] Add environment variables to `.env.local`
- [ ] Add environment variables to Vercel
- [ ] Test feature flag utility
- [ ] Document rollout schedule

### Week 2-3: AI Assistant
- [ ] Add feature flag check to AI Assistant component
- [ ] Add feature flag check to API route
- [ ] Test with flag disabled
- [ ] Test with flag enabled
- [ ] Enable in staging
- [ ] Enable in production

### Week 3-4: Case Studies
- [ ] Add feature flag check to case studies pages
- [ ] Add feature flag check to admin UI
- [ ] Add feature flag check to API routes
- [ ] Test with flag disabled
- [ ] Test with flag enabled
- [ ] Enable in staging
- [ ] Enable in production

---

**Created:** January 23, 2025  
**Status:** Ready for Week 0 Implementation  
**Complexity:** 🟢 LOW (simple env vars, can upgrade later)

