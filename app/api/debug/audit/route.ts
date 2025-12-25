import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/client";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Debug Audit Status API
 * 
 * GET /api/debug/audit?id=response-id
 * 
 * Returns audit status information for a questionnaire response.
 * Useful for debugging without generating a PDF.
 * 
 * Returns: JSON with audit status, timestamps, and results
 */
export async function GET(request: NextRequest) {
  try {
    // Get response ID from query parameters
    const { searchParams } = new URL(request.url);
    const responseId = searchParams.get("id");

    // Validate input
    if (!responseId) {
      return NextResponse.json(
        {
          error: "id parameter is required",
          details: "Please provide a questionnaire response ID: ?id=response-id",
        },
        { status: 400 }
      );
    }

    // Initialize Supabase client with service role
    const supabase = createServerSupabaseClient(true);

    // Query questionnaire_responses table
    const { data: response, error: fetchError } = await (supabase as any)
      .from("questionnaire_responses")
      .select("id, audit_status, audit_started_at, audit_completed_at, audit_results, audit_error, website_url")
      .eq("id", responseId)
      .single();

    if (fetchError) {
      console.error("[Debug Audit] Database error:", fetchError);
      // Check if it's a "not found" error
      if (fetchError.code === "PGRST116" || fetchError.message?.includes("No rows")) {
        return NextResponse.json(
          {
            error: "Questionnaire response not found",
            details: `No response found with ID: ${responseId}`,
          },
          { status: 404 }
        );
      }
      return NextResponse.json(
        {
          error: "Failed to fetch questionnaire response",
          details: fetchError.message,
        },
        { status: 500 }
      );
    }

    if (!response) {
      return NextResponse.json(
        {
          error: "Questionnaire response not found",
          details: `No response found with ID: ${responseId}`,
        },
        { status: 404 }
      );
    }

    // Log the audit status check
    console.log('🔍 [DEBUG] Checking audit status:', {
      responseId: response.id,
      auditStatus: response.audit_status,
      timestamp: new Date().toISOString()
    });

    // Build response
    const debugResponse = {
      responseId: response.id,
      auditStatus: response.audit_status || null,
      auditStartedAt: response.audit_started_at || null,
      auditCompletedAt: response.audit_completed_at || null,
      hasAuditResults: !!response.audit_results,
      auditError: response.audit_error || null,
      websiteUrl: response.website_url || null,
      results: response.audit_results ? {
        // Include key fields from audit results without exposing full object
        hasPerformance: !!response.audit_results.performance,
        hasTechStack: !!response.audit_results.techStack,
        hasSeo: !!response.audit_results.seo,
        hasRecommendations: !!response.audit_results.recommendations,
        recommendationCount: Array.isArray(response.audit_results.recommendations) 
          ? response.audit_results.recommendations.length 
          : 0,
        // Include performance scores if available
        performanceScore: response.audit_results.performance?.overallScore ||
          response.audit_results.performance?.mobileScore ||
          response.audit_results.performance?.desktopScore ||
          null,
        // Include platform if available
        platform: response.audit_results.techStack?.cms?.name ||
          response.audit_results.techStack?.frameworks?.[0]?.name ||
          null,
      } : null,
    };

    return NextResponse.json(debugResponse, { status: 200 });
  } catch (error) {
    console.error("[Debug Audit] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
