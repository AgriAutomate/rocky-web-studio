import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set environment
  environment: process.env.NODE_ENV || "development",
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Ignore certain errors
  ignoreErrors: [
    "top.GLOBALS",
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    "atomicFindClose",
    "fb_xd_fragment",
    "bmi_SafeAddOnload",
    "EBCallBackMessageReceived",
    "NetworkError",
    "Failed to fetch",
  ],
  
  // Filter out sensitive data
  beforeSend(event) {
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null;
    }
    
    // Sanitize user data
    if (event.user) {
      const { email, ...userWithoutPII } = event.user;
      event.user = userWithoutPII;
    }
    
    return event;
  },
  
  integrations: [
    // Only add replay integration in browser (not during SSR/build)
    ...(typeof window !== "undefined" && Sentry.replayIntegration
      ? [
          Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ]
      : []),
  ],
});

