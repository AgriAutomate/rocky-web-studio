'use client';

// This file ensures Sentry client-side initialization happens early
// The @sentry/nextjs SDK automatically loads sentry.client.config.ts
// but we import it here to ensure it's loaded before any errors occur
import '../sentry.client.config';

// This component doesn't render anything, it just ensures the import happens
export default function SentryInit() {
  return null;
}

