import { handlers } from "@/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { getLogger } from "@/lib/logging";
import { checkRateLimit } from "@/lib/api/rate-limit-middleware";
import { RATE_LIMITS, getClientIp as getClientIpUtil } from "@/lib/rate-limit";

const { GET } = handlers;
export { GET };

const authLogger = getLogger("auth.rateLimit");

const ATTEMPTS_KEY = (ip: string) => `auth:signin:attempts:${ip}`;
const BLOCK_KEY = (ip: string) => `auth:signin:block:${ip}`;

const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_SECONDS = 15 * 60; // 15 minutes
const BLOCK_SECONDS = 30 * 60; // 30 minutes

// Check if KV is configured
const isKvConfigured = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

function getClientIp(request: NextRequest): string | null {
  const ip = getClientIpUtil(request);
  return ip === "unknown" ? null : ip;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const isSigninPath = request.nextUrl.pathname.endsWith("/signin");

  if (isSigninPath && ip) {
    // Use global rate limiting utility for consistency
    const rateLimitResponse = await checkRateLimit(request, {
      limit: RATE_LIMITS.AUTH_SIGNIN.limit,
      windowSeconds: RATE_LIMITS.AUTH_SIGNIN.windowSeconds,
      keyPrefix: RATE_LIMITS.AUTH_SIGNIN.keyPrefix,
    });

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Legacy block check (keep for backward compatibility) - only if KV is configured
    if (isKvConfigured) {
      try {
        const now = Date.now();
        const blockedUntil = await kv.get<number>(BLOCK_KEY(ip));

        if (blockedUntil && blockedUntil > now) {
          authLogger.warn("Blocked sign-in attempt due to legacy rate limit", {
            ip,
            blockedUntil,
          });
          return NextResponse.json(
            { error: "Too many failed login attempts. Please try again later." },
            { 
              status: 429,
              headers: {
                "Retry-After": Math.ceil((blockedUntil - now) / 1000).toString(),
              },
            }
          );
        }
      } catch (error: any) {
        // Log KV error but don't block the request
        authLogger.warn("KV error in legacy block check, continuing", {
          error: error?.message,
          ip,
        });
      }
    }
  }

  let response: Response;
  try {
    if (!handlers.POST) {
      authLogger.error("NextAuth POST handler is not available");
      return NextResponse.json(
        { error: "Authentication service not configured. Please contact support." },
        { status: 500 }
      );
    }
    response = await handlers.POST(request);
  } catch (error: any) {
    authLogger.error("Error in NextAuth handler", {
      error: error?.message,
      stack: error?.stack,
      path: request.nextUrl.pathname,
    });
    // Return a proper error response instead of throwing
    return NextResponse.json(
      { error: "Authentication service error. Please try again." },
      { status: 500 }
    );
  }

  if (isSigninPath && ip && isKvConfigured) {
    const status = response.status;
    const success = status >= 200 && status < 300;

    try {
      if (success) {
        // Clear any previous attempts and blocks
        await kv.del(ATTEMPTS_KEY(ip));
        await kv.del(BLOCK_KEY(ip));
        authLogger.info("Successful sign-in, cleared rate limit counters", {
          ip,
        });
      } else {
        const attempts = await kv.incr(ATTEMPTS_KEY(ip));
        // Ensure TTL window is applied
        await kv.expire(ATTEMPTS_KEY(ip), ATTEMPT_WINDOW_SECONDS);

        authLogger.warn("Failed admin login attempt", {
          ip,
          attempts,
          status,
        });

        if (attempts >= MAX_ATTEMPTS) {
          const blockUntil = Date.now() + BLOCK_SECONDS * 1000;
          await kv.set(BLOCK_KEY(ip), blockUntil, { ex: BLOCK_SECONDS });
          authLogger.warn("IP temporarily blocked due to repeated failures", {
            ip,
            blockUntil,
          });
        }
      }
    } catch (error: any) {
      // Log KV error but don't affect the response
      authLogger.warn("KV error in rate limit tracking, continuing", {
        error: error?.message,
        ip,
        success,
      });
    }
  }

  return response;
}

