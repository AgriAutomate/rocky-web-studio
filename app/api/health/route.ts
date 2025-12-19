import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { getLogger } from "@/lib/logging";

const logger = getLogger("api.health");

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  checks: {
    database: {
      status: "ok" | "error";
      message?: string;
    };
    openai: {
      status: "ok" | "error";
      message?: string;
    };
    mobile_message: {
      status: "ok" | "error";
      message?: string;
    };
  };
  timestamp: string;
}

/**
 * GET /api/health
 * 
 * Health check endpoint that verifies:
 * - Database connectivity
 * - OpenAI API key presence
 * - Mobile Message API key presence
 */
export async function GET() {
  const checks: HealthCheckResult["checks"] = {
    database: { status: "error" },
    openai: { status: "error" },
    mobile_message: { status: "error" },
  };

  let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";

  // Check database connectivity
  try {
    const supabase = createServerSupabaseClient(true);
    const { error } = await supabase.from("chat_conversations").select("id").limit(1);
    
    if (error) {
      // Table might not exist yet, but connection works
      if (error.code === "42P01") {
        checks.database = {
          status: "ok",
          message: "Database connected (tables may not exist yet)",
        };
      } else {
        throw error;
      }
    } else {
      checks.database = {
        status: "ok",
        message: "Database connected and accessible",
      };
    }
  } catch (error) {
    logger.error("Database health check failed", undefined, error);
    checks.database = {
      status: "error",
      message: error instanceof Error ? error.message : "Database connection failed",
    };
    overallStatus = "unhealthy";
  }

  // Check OpenAI API key
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && openaiKey.length > 0 && openaiKey.startsWith("sk-")) {
    checks.openai = {
      status: "ok",
      message: "OpenAI API key configured",
    };
  } else {
    checks.openai = {
      status: "error",
      message: "OpenAI API key not configured or invalid",
    };
    overallStatus = overallStatus === "healthy" ? "degraded" : overallStatus;
  }

  // Check Mobile Message API key or credentials
  const mobileMessageApiKey = process.env.MOBILE_MESSAGE_API_KEY;
  const mobileMessageUsername = process.env.MOBILE_MESSAGE_API_USERNAME;
  const mobileMessagePassword = process.env.MOBILE_MESSAGE_API_PASSWORD;

  if (
    (mobileMessageApiKey && mobileMessageApiKey.length > 0) ||
    (mobileMessageUsername && mobileMessagePassword)
  ) {
    checks.mobile_message = {
      status: "ok",
      message: mobileMessageApiKey
        ? "Mobile Message API key configured"
        : "Mobile Message credentials configured",
    };
  } else {
    checks.mobile_message = {
      status: "error",
      message: "Mobile Message API key or credentials not configured",
    };
    overallStatus = overallStatus === "healthy" ? "degraded" : overallStatus;
  }

  const result: HealthCheckResult = {
    status: overallStatus,
    checks,
    timestamp: new Date().toISOString(),
  };

  const statusCode = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 200 : 503;

  return NextResponse.json(result, { status: statusCode });
}
