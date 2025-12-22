import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { generatePDFFromComponents } from "@/lib/pdf/generateFromComponents";
import { uploadPdfToStorage } from "@/lib/utils/supabase-client";
// import { computeResponseSummary } from "@/backend-workflow/services/pdf-content-builder"; // Not used in this implementation
import { formatSectorName } from "@/lib/utils/sector-mapping";
import { getChallengeDetails } from "@/lib/utils/pain-point-mapping";
import { painPointsToChallengeIds } from "@/lib/utils/pain-point-to-challenge";
import { Resend } from "resend";
import * as React from "react";
import ClientAcknowledgementEmail from "@/lib/email/ClientAcknowledgementEmail";
import { env } from "@/lib/env";
import type { QuestionnaireFormData } from "@/lib/types/questionnaire";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const RESEND_FROM = "noreply@rockywebstudio.com.au";

/**
 * PDF Generation Webhook
 * 
 * Accepts a responseId and generates a PDF for that questionnaire response.
 * Updates the response record with PDF status and URL.
 * Optionally sends email with PDF attachment.
 * 
 * POST /api/webhooks/pdf-generate
 * Body: { responseId: string, sendEmail?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { responseId, sendEmail = true } = body;

    if (!responseId) {
      return NextResponse.json(
        { success: false, error: "responseId is required" },
        { status: 400 }
      );
    }

    // Initialize Supabase client with service role
    const supabase = createServerSupabaseClient(true);

    // Fetch the questionnaire response
    const { data: response, error: fetchError } = await supabase
      .from("questionnaire_responses")
      .select("*")
      .eq("id", responseId)
      .single();

    if (fetchError || !response) {
      console.error("Error fetching response:", fetchError);
      return NextResponse.json(
        { success: false, error: "Response not found" },
        { status: 404 }
      );
    }

    // Type assertion for response data
    const responseData = response as any;

    // Prepare form data for PDF generation
    const formData: QuestionnaireFormData = {
      firstName: responseData.first_name || "",
      lastName: responseData.last_name || "",
      businessName: responseData.business_name || "",
      businessEmail: responseData.business_email || "",
      businessPhone: responseData.business_phone || "",
      sector: (responseData.sector as any) || "other",
      annualRevenue: "",
      employeeCount: "",
      yearsInBusiness: "",
      selectedPainPoints: (responseData.pain_points as any[]) || [],
      currentDigitalMaturity: "basic",
      primaryGoal: "growth",
      budget: "5k-15k",
      timelineToImplement: "flexible",
      isDecisionMaker: true,
      agreeToContact: true,
      subscribeToNewsletter: false,
    };

    // Generate report data
    const allChallengeIds = formData.selectedPainPoints && formData.selectedPainPoints.length > 0
      ? painPointsToChallengeIds(formData.selectedPainPoints, 100)
      : [];

    const challengeDetails = getChallengeDetails(allChallengeIds);

    const reportData = {
      clientName: formData.firstName,
      businessName: formData.businessName,
      sector: formatSectorName(formData.sector as any),
      topChallenges: challengeDetails,
      generatedDate: new Date().toISOString().slice(0, 10),
    };

    // Generate PDF
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generatePDFFromComponents('questionnaire-report', reportData);
    } catch (pdfError) {
      console.error("PDF generation failed:", pdfError);
      
      // Update status to 'failed' (if field exists)
      // await supabase
      //   .from("questionnaire_responses")
      //   .update({ pdf_generation_status: 'failed' })
      //   .eq("id", responseId);

      return NextResponse.json(
        { success: false, error: "PDF generation failed", details: String(pdfError) },
        { status: 500 }
      );
    }

    // Upload PDF to Supabase Storage
    const fileName = `${responseId}-${reportData.generatedDate}.pdf`;
    const pdfUrl = await uploadPdfToStorage(fileName, pdfBuffer);

    if (!pdfUrl) {
      console.error("Failed to upload PDF to storage");
      return NextResponse.json(
        { success: false, error: "Failed to upload PDF to storage" },
        { status: 500 }
      );
    }

    // Update response with PDF URL and timestamp
    const updatePayload: Record<string, any> = {
      pdf_url: pdfUrl, // Supabase Storage public URL
      pdf_generated_at: new Date().toISOString(),
      // pdf_generation_status: 'completed' // Field may not exist yet
    };
    
    const { error: updateError } = await (supabase as any)
      .from("questionnaire_responses")
      .update(updatePayload)
      .eq("id", responseId);

    if (updateError) {
      console.error("Error updating response:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update response", details: updateError.message },
        { status: 500 }
      );
    }

    // Send email if requested
    if (sendEmail) {
      try {
        const resend = new Resend(env.RESEND_API_KEY);
        
        // Convert PDF buffer to base64 for email attachment
        const pdfBase64 = pdfBuffer.toString('base64');
        
        await resend.emails.send({
          from: RESEND_FROM,
          to: formData.businessEmail,
          subject: `Your Custom Deep-Dive Report – ${formData.businessName}`,
          react: React.createElement(ClientAcknowledgementEmail, {
            clientFirstName: formData.firstName,
            businessName: formData.businessName,
            sector: reportData.sector,
          }),
          attachments: [
            {
              filename: `RockyWebStudio-Deep-Dive-Report-${reportData.generatedDate}.pdf`,
              content: pdfBase64,
              contentType: "application/pdf",
            },
          ],
        });

        // Update email_sent_at
        await (supabase as any)
          .from("questionnaire_responses")
          .update({ email_sent_at: new Date().toISOString() })
          .eq("id", responseId);
      } catch (emailError) {
        console.error("Email send failed:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      pdf_url: pdfUrl, // Supabase Storage public URL
      responseId,
      message: "PDF generated successfully",
    });

  } catch (error) {
    console.error("PDF generation webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
