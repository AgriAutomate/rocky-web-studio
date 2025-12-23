import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { auditWebsiteAsync } from "@/lib/services/audit-service";
import { isValidUrl, normalizeUrl } from "@/lib/utils/audit-utils";
import { logger } from "@/lib/utils/logger";
import type {
  AuditRequest,
  AuditResponse,
  AuditFetchResponse,
  WebsiteAuditResult,
} from "@/lib/types/audit";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Vercel timeout safeguard: Maximum execution time for this serverless function (60 seconds)
 * 
 * This is a safety measure to prevent function timeouts. Since we use a fire-and-forget pattern:
 * - POST handler triggers auditWebsiteAsync() without awaiting
 * - POST returns 202 Accepted immediately (< 1 second typically)
 * - Audit runs asynchronously in the background (may take 10-30 seconds)
 * 
 * The maxDuration ensures that if the POST handler itself takes longer than expected (e.g., 
 * database queries, idempotency checks), Vercel will terminate it gracefully rather than 
 * hitting the default timeout.
 * 
 * Note: This does NOT affect the background auditWebsiteAsync() execution, which runs 
 * independently. The audit status tracking (pending → running → completed/failed) ensures 
 * we can track audit progress even if the POST handler completes quickly.
 */
export const maxDuration = 60;

/**
 * GET /api/audit-website?questionnaireResponseId=...
 * 
 * Fetches stored audit results for a questionnaire response.
 * 
 * Returns:
 * - 200 with audit results if available
 * - 200 with error field if audit failed
 * - 404 if audit not yet completed or not found
 * - 400 if questionnaireResponseId missing
 * - 500 on server error
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const questionnaireResponseId = searchParams.get("questionnaireResponseId");

    if (!questionnaireResponseId) {
      return NextResponse.json(
        { error: "questionnaireResponseId query parameter is required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient(true);

    // Fetch questionnaire response with audit data (including status and website_url)
    const { data: response, error } = await (supabase as any)
      .from("questionnaire_responses")
      .select(
        "id, website_url, audit_results, audit_completed_at, audit_error, audit_status, audit_started_at"
      )
      .eq("id", questionnaireResponseId)
      .single();

    if (error) {
      console.error("[Audit] Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch audit results", details: error.message },
        { status: 500 }
      );
    }

    if (!response) {
      return NextResponse.json(
        { error: "Questionnaire response not found" },
        { status: 404 }
      );
    }

    // Check if audit has been completed successfully
    if (response.audit_completed_at && response.audit_results) {
      const auditResults = response.audit_results as WebsiteAuditResult;
      const fetchResponse: AuditFetchResponse = {
        questionnaireResponseId,
        audit: auditResults,
        auditCompletedAt: response.audit_completed_at,
        status: "completed",
        websiteUrl: response.website_url || undefined,
        // Extract warnings from audit results if present
        warnings: auditResults.warnings || undefined,
      };

      return NextResponse.json(fetchResponse, {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    // Check if audit failed
    if (response.audit_error || response.audit_status === "failed") {
      const auditResults = response.audit_results
        ? (response.audit_results as WebsiteAuditResult)
        : undefined;
      const fetchResponse: AuditFetchResponse = {
        questionnaireResponseId,
        error: response.audit_error || "Audit failed",
        auditError: response.audit_error || "Audit failed",
        status: "failed",
        websiteUrl: response.website_url || undefined,
        // Include partial audit results if they exist
        audit: auditResults,
        // Extract warnings from partial audit results if present
        warnings: auditResults?.warnings || undefined,
      };

      return NextResponse.json(fetchResponse, {
        status: 200, // 200 because audit completed (but failed)
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    // Check if audit is pending or running
    if (
      response.audit_status === "pending" ||
      response.audit_status === "running"
    ) {
      const fetchResponse: AuditFetchResponse = {
        questionnaireResponseId,
        status: response.audit_status === "running" ? "running" : "pending",
        websiteUrl: response.website_url || undefined,
        message:
          response.audit_status === "running"
            ? "Audit in progress. Please check again shortly."
            : "Audit queued. Please check again shortly.",
      };

      return NextResponse.json(fetchResponse, {
        status: 202, // 202 Accepted - audit in progress
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    // Check if no website URL provided (NOT_REQUESTED state)
    if (!response.website_url || response.website_url.trim() === "") {
      const fetchResponse: AuditFetchResponse = {
        questionnaireResponseId,
        status: "not_requested",
        message:
          "No website URL provided. Audit will run automatically when URL is provided.",
      };

      return NextResponse.json(fetchResponse, {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    // Fallback: Audit not yet completed (no status set, but URL exists)
    // This handles legacy rows without audit_status
    const fetchResponse: AuditFetchResponse = {
      questionnaireResponseId,
      status: "pending",
      websiteUrl: response.website_url || undefined,
      message: "Audit not yet completed. Please check again shortly.",
    };

    return NextResponse.json(fetchResponse, {
      status: 202, // 202 Accepted - assume pending
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    console.error("[Audit] GET error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audit-website
 * 
 * Triggers an asynchronous website audit.
 * Returns 202 Accepted immediately, audit runs in background.
 * 
 * Request Body:
 * {
 *   questionnaireResponseId: string | number,
 *   websiteUrl: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body: AuditRequest = await req.json();

    // Validate required fields
    if (!body.questionnaireResponseId) {
      return NextResponse.json(
        { error: "questionnaireResponseId is required" },
        { status: 400 }
      );
    }

    if (!body.websiteUrl) {
      return NextResponse.json(
        { error: "websiteUrl is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    if (!isValidUrl(body.websiteUrl)) {
      return NextResponse.json(
        { error: `Invalid URL format: ${body.websiteUrl}` },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeUrl(body.websiteUrl);

    const supabase = createServerSupabaseClient(true);

    // 24-hour idempotency check: Query for existing audit results
    // This prevents duplicate audits for the same URL within 24 hours, saving PageSpeed API quota
    const { data: existingResponse, error: queryError } = await (supabase as any)
      .from("questionnaire_responses")
      .select("id, audit_results, audit_completed_at, website_url, audit_error")
      .eq("id", body.questionnaireResponseId)
      .single();

    if (queryError) {
      console.error("[Audit] Error querying for existing audit:", queryError);
      // Continue with new audit if query fails (non-blocking)
    } else if (existingResponse) {
      // Check if we have a valid cached result:
      // 1. website_url matches the normalized URL (same site)
      // 2. audit_results exists (audit completed successfully)
      // 3. audit_completed_at is less than 24 hours old
      const urlMatches =
        existingResponse.website_url &&
        normalizeUrl(existingResponse.website_url) === normalizedUrl;
      const hasAuditResults = !!existingResponse.audit_results;
      const hasRecentCompletion =
        existingResponse.audit_completed_at &&
        new Date(existingResponse.audit_completed_at).getTime() > 0;

      if (urlMatches && hasAuditResults && hasRecentCompletion) {
        const completedAt = new Date(existingResponse.audit_completed_at);
        const now = new Date();
        const hoursSinceCompletion =
          (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60);

        // If audit completed less than 24 hours ago, return cached result
        // Adjust the 24-hour window by changing the threshold below if needed
        if (hoursSinceCompletion < 24) {
          await logger.info("Using cached audit result (idempotency)", {
            questionnaireResponseId: body.questionnaireResponseId,
            websiteUrl: normalizedUrl,
            hoursSinceCompletion: hoursSinceCompletion.toFixed(2),
          });

          // Return cached result matching GET handler's successful response format
          const cachedResponse: AuditFetchResponse & { cached: true } = {
            questionnaireResponseId: body.questionnaireResponseId,
            audit: existingResponse.audit_results as WebsiteAuditResult,
            auditCompletedAt: existingResponse.audit_completed_at,
            cached: true,
          };

          return NextResponse.json(cachedResponse, {
            status: 200, // 200 OK (not 202) because result is immediate
            headers: { "Content-Type": "application/json; charset=utf-8" },
          });
        }
        // If cache expired (> 24h), fall through to trigger new audit
      }
      // If URL doesn't match or no valid audit results, fall through to trigger new audit
    }

    // No valid cached result found - proceed with new audit
    // Set status to 'pending' and clear any previous error before triggering audit
    await (supabase as any)
      .from("questionnaire_responses")
      .update({
        audit_status: "pending",
        audit_error: null, // Clear any previous error
      })
      .eq("id", body.questionnaireResponseId);

    // Fire-and-forget: Start audit asynchronously
    // Don't await - return immediately with 202 Accepted
    auditWebsiteAsync(body.questionnaireResponseId, normalizedUrl).catch(
      (error) => {
        // Error already logged in auditWebsiteAsync
        console.error(
          "[Audit] Background audit failed:",
          error instanceof Error ? error.message : String(error)
        );
      }
    );

    await logger.info("Website audit triggered", {
      questionnaireResponseId: body.questionnaireResponseId,
      websiteUrl: normalizedUrl,
    });

    const response: AuditResponse = {
      success: true,
      questionnaireResponseId: body.questionnaireResponseId,
      message: "Audit started. Results will be available shortly.",
      auditStartedAt: new Date().toISOString(),
    };

    // Return 202 Accepted - request accepted but processing continues
    return NextResponse.json(response, {
      status: 202,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    console.error("[Audit] POST error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
