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

    // Legacy block check (keep for backward compatibility)
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
  }

  const response = await handlers.POST!(request);

  if (isSigninPath && ip) {
    const status = response.status;
    const success = status >= 200 && status < 300;

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
  }

  return response;
}

