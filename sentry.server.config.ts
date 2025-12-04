import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Set environment
  environment: process.env.NODE_ENV || "development",
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Ignore certain errors
  ignoreErrors: [
    "InvalidRequestError", // Stripe errors
    "NetworkError",
  ],
  
  // Filter out sensitive data
  beforeSend(event) {
    if (!process.env.SENTRY_DSN) {
      return null;
    }
    
    // Sanitize sensitive data from event
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        const sensitiveHeaders = [
          "authorization",
          "cookie",
          "x-api-key",
          "stripe-signature",
        ];
        sensitiveHeaders.forEach((header) => {
          if (event.request?.headers?.[header]) {
            event.request.headers[header] = "[REDACTED]";
          }
        });
      }
      
      // Remove sensitive query params
      if (event.request.query_string) {
        const query = new URLSearchParams(event.request.query_string);
        const sensitiveParams = ["password", "token", "secret", "apiKey"];
        sensitiveParams.forEach((param) => {
          if (query.has(param)) {
            query.set(param, "[REDACTED]");
          }
        });
        event.request.query_string = query.toString();
      }
    }
    
    // Sanitize user data
    if (event.user) {
      const { email, ...userWithoutPII } = event.user;
      event.user = userWithoutPII;
    }
    
    // Sanitize extra context
    if (event.extra) {
      const sensitiveKeys = [
        "password",
        "secret",
        "token",
        "apiKey",
        "authorization",
        "email",
        "phone",
        "phoneNumber",
      ];
      
      const sanitizeObject = (obj: Record<string, unknown>): Record<string, unknown> => {
        const sanitized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
          const lowerKey = key.toLowerCase();
          if (sensitiveKeys.some((sk) => lowerKey.includes(sk))) {
            sanitized[key] = "[REDACTED]";
          } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            sanitized[key] = sanitizeObject(value as Record<string, unknown>);
          } else {
            sanitized[key] = value;
          }
        }
        return sanitized;
      };
      
      event.extra = sanitizeObject(event.extra);
    }
    
    return event;
  },
});

