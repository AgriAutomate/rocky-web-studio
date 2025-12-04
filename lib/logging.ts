import * as Sentry from "@sentry/nextjs";

type LogLevel = "debug" | "info" | "warn" | "error";

type SafePrimitive = string | number | boolean | null;

export interface LogContext {
  requestId?: string;
  userId?: string;
  component?: string;
  operation?: string;
  [key: string]: unknown;
}

export interface LogEntry extends LogContext {
  level: LogLevel;
  msg: string;
  timestamp: string;
}

const SECRET_KEYS = ["password", "secret", "token", "apiKey", "authorization"];
const PII_KEYS = ["email", "phone", "phoneNumber"];

function sanitizeValue(key: string, value: unknown): SafePrimitive | Record<string, unknown> | undefined {
  const lowerKey = key.toLowerCase();

  if (SECRET_KEYS.some((k) => lowerKey.includes(k))) {
    return "[REDACTED_SECRET]";
  }
  if (PII_KEYS.some((k) => lowerKey.includes(k))) {
    return "[REDACTED_PII]";
  }

  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return {
      kind: "array",
      length: value.length,
    };
  }

  if (typeof value === "object") {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      obj[k] = sanitizeValue(k, v);
    }
    return obj;
  }

  return String(value);
}

function sanitizeContext(ctx?: LogContext): Record<string, unknown> {
  if (!ctx) return {};
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(ctx)) {
    if (value === undefined) continue;
    result[key] = sanitizeValue(key, value);
  }
  return result;
}

class Logger {
  private baseContext: LogContext;

  constructor(baseContext?: LogContext) {
    this.baseContext = baseContext ?? {};
  }

  child(extra: LogContext): Logger {
    return new Logger({ ...this.baseContext, ...extra });
  }

  private log(level: LogLevel, msg: string, context?: LogContext, error?: unknown): void {
    const timestamp = new Date().toISOString();
    const ctx = sanitizeContext({ ...this.baseContext, ...context });

    const entry: LogEntry & { error?: { message?: string; name?: string } } = {
      level,
      msg,
      timestamp,
      ...ctx,
    };

    if (error instanceof Error) {
      entry.error = {
        message: error.message,
        name: error.name,
      };
    }

    const json = JSON.stringify(entry);

    switch (level) {
      case "debug":
        if (process.env.NODE_ENV !== "production") {
          console.debug(json);
        }
        break;
      case "info":
        console.info(json);
        break;
      case "warn":
        console.warn(json);
        break;
      case "error":
        console.error(json);
        break;
    }
  }

  debug(msg: string, context?: LogContext): void {
    this.log("debug", msg, context);
  }

  info(msg: string, context?: LogContext): void {
    this.log("info", msg, context);
  }

  warn(msg: string, context?: LogContext): void {
    this.log("warn", msg, context);
  }

  error(msg: string, context?: LogContext, error?: unknown): void {
    this.log("error", msg, context, error);
    
    // Send errors to Sentry if configured
    if (error instanceof Error && (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN)) {
      Sentry.captureException(error, {
        tags: {
          component: this.baseContext.component || "unknown",
        },
        extra: sanitizeContext(context),
      });
    }
  }
}

export const logger = new Logger();

export function getLogger(component: string, baseContext?: Omit<LogContext, "component">): Logger {
  return new Logger({ component, ...(baseContext ?? {}) });
}


