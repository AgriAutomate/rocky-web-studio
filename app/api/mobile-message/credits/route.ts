import { NextRequest, NextResponse } from "next/server";
import { fetchMobileMessageCredits } from "@/lib/mobile-message/credits";
import { checkRateLimit } from "@/lib/api/rate-limit-middleware";
import { RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Check rate limit: 60 requests per hour per IP
  const rateLimitResponse = await checkRateLimit(request, {
    limit: RATE_LIMITS.CREDITS_CHECK.limit,
    windowSeconds: RATE_LIMITS.CREDITS_CHECK.windowSeconds,
    keyPrefix: RATE_LIMITS.CREDITS_CHECK.keyPrefix,
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const result = await fetchMobileMessageCredits();
  return NextResponse.json(result, { status: result.success ? 200 : 502 });
}


