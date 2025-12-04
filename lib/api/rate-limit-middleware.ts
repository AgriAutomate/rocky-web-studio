import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getLogger } from "@/lib/logging";

const rateLimitMiddlewareLogger = getLogger("rateLimit.middleware");

export interface RateLimitConfig {
  limit: number;
  windowSeconds: number;
  keyPrefix: string;
  identifierExtractor?: (request: NextRequest) => string;
}

/**
 * Middleware to enforce rate limiting on API routes
 * 
 * @param config - Rate limit configuration
 * @returns NextResponse with 429 status if limit exceeded, or null if allowed
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  // Extract identifier (IP by default, or custom extractor)
  const identifier = config.identifierExtractor
    ? config.identifierExtractor(request)
    : getClientIp(request);

  // Check rate limit
  const result = await rateLimit(
    identifier,
    config.limit,
    config.windowSeconds,
    config.keyPrefix
  );

  // If limit exceeded, return 429 response
  if (!result.allowed) {
    rateLimitMiddlewareLogger.warn("Rate limit exceeded", {
      identifier,
      limit: config.limit,
      windowSeconds: config.windowSeconds,
      retryAfter: result.retryAfter,
      path: request.nextUrl.pathname,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Rate limit exceeded",
        retryAfter: result.retryAfter,
        message: `Too many requests. Please try again in ${result.retryAfter} seconds.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": result.retryAfter?.toString() || "60",
          "X-RateLimit-Limit": config.limit.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.resetAt.toString(),
        },
      }
    );
  }

  // Request allowed, return null to continue
  return null;
}

