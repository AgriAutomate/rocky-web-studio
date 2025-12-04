import { kv } from "@vercel/kv";
import { getLogger } from "@/lib/logging";

const rateLimitLogger = getLogger("rateLimit");

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp in seconds
  retryAfter?: number; // Seconds until limit resets
}

/**
 * Global rate limiting utility using Vercel KV
 * 
 * @param identifier - Unique identifier (IP address, user ID, phone number, etc.)
 * @param limit - Maximum number of requests allowed in the window
 * @param windowSeconds - Time window in seconds
 * @param keyPrefix - Optional prefix for KV key (default: "rate-limit")
 * @returns RateLimitResult indicating if request is allowed and remaining count
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number,
  keyPrefix: string = "rate-limit"
): Promise<RateLimitResult> {
  if (!identifier) {
    rateLimitLogger.warn("Rate limit called with empty identifier");
    return {
      allowed: true,
      remaining: limit,
      resetAt: Math.floor(Date.now() / 1000) + windowSeconds,
    };
  }

  const key = `${keyPrefix}:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const resetAt = now + windowSeconds;

  try {
    // Increment counter and get current count
    const count = await kv.incr(key);

    // Set expiration if this is the first request in the window
    if (count === 1) {
      await kv.expire(key, windowSeconds);
    }

    const remaining = Math.max(0, limit - count);
    const allowed = count <= limit;

    // Calculate retry after if limit exceeded
    const retryAfter = allowed ? undefined : windowSeconds;

    if (!allowed) {
      rateLimitLogger.warn("Rate limit exceeded", {
        identifier,
        limit,
        count,
        windowSeconds,
        keyPrefix,
      });
    }

    return {
      allowed,
      remaining,
      resetAt,
      retryAfter,
    };
  } catch (error) {
    // If KV fails, log error but allow request (fail open)
    rateLimitLogger.error("Rate limit check failed, allowing request", {
      identifier,
      error: error instanceof Error ? error.message : String(error),
    }, error);

    return {
      allowed: true,
      remaining: limit,
      resetAt: now + windowSeconds,
    };
  }
}

/**
 * Get client IP address from NextRequest
 * Handles x-forwarded-for header (Vercel provides this)
 */
export function getClientIp(request: { headers: Headers }): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const ip = xff.split(",")[0]?.trim();
    if (ip) return ip;
  }

  // Fallback to other headers
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) return xRealIp;

  // Last resort: return a default identifier
  return "unknown";
}

/**
 * Rate limit configuration for different endpoints
 */
export const RATE_LIMITS = {
  // Booking creation: 10 per minute per IP
  BOOKING_CREATE: {
    limit: 10,
    windowSeconds: 60, // 1 minute
    keyPrefix: "rate-limit:bookings",
  },
  
  // SMS sending: 100 per day per phone number
  SMS_SEND: {
    limit: 100,
    windowSeconds: 24 * 60 * 60, // 24 hours
    keyPrefix: "rate-limit:sms",
  },
  
  // Mobile Message credits check: 60 per hour per IP
  CREDITS_CHECK: {
    limit: 60,
    windowSeconds: 60 * 60, // 1 hour
    keyPrefix: "rate-limit:credits",
  },
  
  // Auth signin: 5 per 15 minutes per IP (already implemented, but using this for consistency)
  AUTH_SIGNIN: {
    limit: 5,
    windowSeconds: 15 * 60, // 15 minutes
    keyPrefix: "rate-limit:auth",
  },
} as const;

