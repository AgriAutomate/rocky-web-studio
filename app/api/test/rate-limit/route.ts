import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/api/rate-limit-middleware";
import { RATE_LIMITS } from "@/lib/rate-limit";

/**
 * Test endpoint to verify rate limiting
 * 
 * GET /api/test/rate-limit?endpoint=bookings|sms|credits|auth
 * 
 * Tests rate limiting for different endpoints
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint") || "bookings";

  let config;
  switch (endpoint) {
    case "bookings":
      config = {
        limit: RATE_LIMITS.BOOKING_CREATE.limit,
        windowSeconds: RATE_LIMITS.BOOKING_CREATE.windowSeconds,
        keyPrefix: RATE_LIMITS.BOOKING_CREATE.keyPrefix,
      };
      break;
    case "sms":
      config = {
        limit: RATE_LIMITS.SMS_SEND.limit,
        windowSeconds: RATE_LIMITS.SMS_SEND.windowSeconds,
        keyPrefix: RATE_LIMITS.SMS_SEND.keyPrefix,
      };
      break;
    case "credits":
      config = {
        limit: RATE_LIMITS.CREDITS_CHECK.limit,
        windowSeconds: RATE_LIMITS.CREDITS_CHECK.windowSeconds,
        keyPrefix: RATE_LIMITS.CREDITS_CHECK.keyPrefix,
      };
      break;
    case "auth":
      config = {
        limit: RATE_LIMITS.AUTH_SIGNIN.limit,
        windowSeconds: RATE_LIMITS.AUTH_SIGNIN.windowSeconds,
        keyPrefix: RATE_LIMITS.AUTH_SIGNIN.keyPrefix,
      };
      break;
    default:
      return NextResponse.json(
        {
          success: false,
          error: "Invalid endpoint. Use: bookings, sms, credits, or auth",
        },
        { status: 400 }
      );
  }

  // Check rate limit
  const rateLimitResponse = await checkRateLimit(request, config);

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Request allowed
  return NextResponse.json({
    success: true,
    message: "Rate limit check passed",
    endpoint,
    limit: config.limit,
    windowSeconds: config.windowSeconds,
  });
}

