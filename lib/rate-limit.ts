/**
 * Rate Limiting for AI Assistant
 * 
 * Simple in-memory rate limiting (10 requests per minute per IP)
 * For production, consider using Upstash Redis
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const RATE_LIMIT_MAX = 10; // 10 requests per minute

/**
 * Check if request is within rate limit
 * 
 * @param identifier - IP address or user identifier
 * @returns Rate limit result
 */
export function checkRateLimit(identifier: string): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });

    // Clean up old entries periodically
    if (rateLimitStore.size > 1000) {
      for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetAt) {
          rateLimitStore.delete(key);
        }
      }
    }

    return {
      success: true,
      limit: RATE_LIMIT_MAX,
      remaining: RATE_LIMIT_MAX - 1,
      reset: now + RATE_LIMIT_WINDOW,
    };
  }

  // Check if limit exceeded
  if (entry.count >= RATE_LIMIT_MAX) {
    return {
      success: false,
      limit: RATE_LIMIT_MAX,
      remaining: 0,
      reset: entry.resetAt,
    };
  }

  // Increment count
  entry.count += 1;
  rateLimitStore.set(identifier, entry);

  return {
    success: true,
    limit: RATE_LIMIT_MAX,
    remaining: RATE_LIMIT_MAX - entry.count,
    reset: entry.resetAt,
  };
}

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
  // Try various headers for IP address
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',');
    return ips[0]?.trim() || 'unknown';
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to a default identifier
  return 'unknown';
}
