export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Server-side Sentry initialization
    await import("./sentry.config");
  }
  
  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge runtime Sentry initialization (if needed)
    // Edge runtime has limited support, so we'll skip for now
  }
}

