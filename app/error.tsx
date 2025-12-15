'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Capture error to Sentry
    Sentry.captureException(error, {
      tags: {
        errorBoundary: true,
      },
      extra: {
        digest: error.digest,
      },
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error boundary caught an error:', error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">
          Something went wrong
        </h1>
        <p className="mt-4 text-muted-foreground">
          We're sorry, but something unexpected happened. Please try again.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
          >
            Go Home
          </Link>
        </div>
        {process.env.NODE_ENV !== 'production' && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-muted p-4 text-xs text-foreground">
              {error.toString()}
              {error.stack && `\n\n${error.stack}`}
              {error.digest && `\n\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

