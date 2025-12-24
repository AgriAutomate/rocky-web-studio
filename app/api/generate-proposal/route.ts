import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { generateProposalPdf } from "@/lib/services/proposal-generator";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Generate Proposal PDF API
 * 
 * POST /api/generate-proposal
 * Body: { questionnaireResponseId: string }
 * 
 * Fetches complete questionnaire response (including audit_results and discovery_tree)
 * and generates a proposal PDF.
 * 
 * Returns: PDF file with Content-Type: application/pdf
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { questionnaireResponseId } = body;

    // Validate input
    if (!questionnaireResponseId) {
      return NextResponse.json(
        {
          error: "questionnaireResponseId is required",
          details: "Please provide a valid questionnaire response ID",
        },
        { status: 400 }
      );
    }

    // Initialize Supabase client with service role
    const supabase = createServerSupabaseClient(true);

    // Fetch complete questionnaire response record
    const { data: response, error: fetchError } = await (supabase as any)
      .from("questionnaire_responses")
      .select(
        "*, audit_results, discovery_tree, sector_specific_data, business_profile, goals, primary_offers"
      )
      .eq("id", questionnaireResponseId)
      .single();

    if (fetchError) {
      console.error("[Generate Proposal] Database error:", fetchError);
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
          details: `No response found with ID: ${questionnaireResponseId}`,
        },
        { status: 404 }
      );
    }

    // Generate PDF using the proposal service
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateProposalPdf(response);
    } catch (pdfError) {
      console.error("[Generate Proposal] PDF generation failed:", pdfError);
      return NextResponse.json(
        {
          error: "Failed to generate proposal PDF",
          details:
            pdfError instanceof Error ? pdfError.message : String(pdfError),
        },
        { status: 500 }
      );
    }

    // Validate PDF buffer
    if (!pdfBuffer || pdfBuffer.length === 0) {
      console.error("[Generate Proposal] PDF buffer is empty");
      return NextResponse.json(
        {
          error: "PDF generation failed",
          details: "Generated PDF buffer is empty",
        },
        { status: 500 }
      );
    }

    // Return PDF with proper headers
    const businessName = response.business_name || "proposal";
    const sanitizedBusinessName = businessName
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .toLowerCase();
    const fileName = `${sanitizedBusinessName}-proposal-${questionnaireResponseId}.pdf`;

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[Generate Proposal] Unexpected error:", error);
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
