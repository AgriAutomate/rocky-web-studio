import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import * as React from "react";
import { validateQuestionnaireFormSafe, formatValidationErrors } from "@/lib/utils/validators";
import { getTopChallengesForSector, formatSectorName } from "@/lib/utils/sector-mapping";
import { getChallengeDetails } from "@/lib/utils/pain-point-mapping";
import { generatePdfReport, type ReportData } from "@/lib/pdf/generateClientReport";
import {
  storeQuestionnaireResponse,
  uploadPdfToStorage,
  updateEmailSentTimestamp,
} from "@/lib/utils/supabase-client";
import ClientAcknowledgementEmail from "@/lib/email/ClientAcknowledgementEmail";
import { env } from "@/lib/env";
import { logger } from "@/lib/utils/logger";

const RESEND_FROM = "noreply@rockywebstudio.com.au";

/**
 * Handle questionnaire submissions and orchestrate report generation,
 * storage, and email delivery.
 */
export async function POST(request: NextRequest) {
  const start = Date.now();

  try {
    // STEP 1: PARSE & VALIDATE (target ~100ms)
    const rawBody = await request.json();
    const validationResult = validateQuestionnaireFormSafe(rawBody);

    if (!validationResult.success) {
      const details = formatValidationErrors(validationResult.error);
      await logger.error("Questionnaire validation failed", { details });
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details,
        },
        { status: 400 }
      );
    }

    const formData = validationResult.data;

    // STEP 2: GENERATE REPORT DATA (target ~100ms)
    const topChallengeIds = getTopChallengesForSector(formData.sector);
    const challengeDetails = getChallengeDetails(topChallengeIds);

    const reportData: ReportData = {
      clientName: formData.firstName,
      businessName: formData.businessName,
      sector: formatSectorName(formData.sector as any),
      topChallenges: challengeDetails,
      generatedDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    };

    // STEP 3: GENERATE PDF (8-10 seconds, but don't block on failure)
    let pdfBuffer: Uint8Array | null = null;
    let pdfBase64: string | null = null;
    let pdfGeneratedAt: string | null = null;
    
    try {
      pdfBuffer = await generatePdfReport(reportData);
      const nodeBuffer = Buffer.from(pdfBuffer);
      pdfGeneratedAt = new Date().toISOString();
      pdfBase64 = nodeBuffer.toString("base64");
      await logger.info("PDF generated successfully", { 
        size: pdfBuffer.length,
        clientName: reportData.clientName,
      });
    } catch (err) {
      // Log error but continue - we'll still store data and send email
      await logger.error("PDF generation failed - continuing without PDF", { 
        error: String(err),
        errorMessage: err instanceof Error ? err.message : String(err),
        clientName: reportData.clientName,
        businessName: reportData.businessName,
      });
      // Don't return error - continue with submission without PDF
    }

    // STEP 4: UPLOAD PDF TO STORAGE (2-3 seconds, optional - only if PDF was generated)
    const clientId = crypto.randomUUID();
    let pdfUrl: string | null = null;
    if (pdfBuffer) {
      const nodeBuffer = Buffer.from(pdfBuffer);
      const fileName = `${clientId}-report-${reportData.generatedDate}.pdf`;
      pdfUrl = await uploadPdfToStorage(fileName, nodeBuffer).catch((err) => {
        void logger.error("PDF upload threw", { error: String(err), clientId });
        return null as string | null;
      });
    }

    // STEP 5: SEND EMAIL (3-5 seconds)
    const resend = new Resend(env.RESEND_API_KEY);
    try {
      const emailOptions: Parameters<typeof resend.emails.send>[0] = {
        from: RESEND_FROM,
        to: formData.businessEmail,
        subject: `Your Custom Deep-Dive Report – ${formData.businessName}`,
        react: React.createElement(ClientAcknowledgementEmail, {
          clientFirstName: formData.firstName,
          businessName: formData.businessName,
          sector: reportData.sector,
        }),
      };

      // Only attach PDF if generation succeeded
      if (pdfBase64) {
        emailOptions.attachments = [
          {
            filename: "RockyWebStudio-Deep-Dive-Report.pdf",
            content: pdfBase64,
            contentType: "application/pdf",
          },
        ];
      }

      await resend.emails.send(emailOptions);
      await logger.info("Email sent successfully", { 
        clientId,
        hasPdfAttachment: !!pdfBase64,
      });
    } catch (emailError) {
      // Do not fail the overall request; log for manual follow-up.
      await logger.error("Resend email send failed", { 
        error: String(emailError),
        errorMessage: emailError instanceof Error ? emailError.message : String(emailError),
        clientId,
      });
    }

    // STEP 6: STORE IN SUPABASE (non-blocking best-effort, but we await to catch errors)
    const storedId = await storeQuestionnaireResponse(
      formData, 
      pdfUrl, 
      clientId, 
      pdfGeneratedAt ?? undefined
    ).catch(async (err) => {
      await logger.error("storeQuestionnaireResponse failed", { 
        error: String(err), 
        errorMessage: err instanceof Error ? err.message : String(err),
        clientId,
        businessName: formData.businessName,
      });
      return null;
    });

    if (storedId && pdfGeneratedAt) {
      await updateEmailSentTimestamp(storedId, pdfGeneratedAt).catch((err) => {
        void logger.error("updateEmailSentTimestamp failed", { 
          error: String(err), 
          clientId: storedId 
        });
      });
    } else {
      await logger.error("Failed to store questionnaire response - storedId is null", {
        clientId,
        businessName: formData.businessName,
        businessEmail: formData.businessEmail,
      });
    }

    // STEP 7: RETURN RESPONSE (50ms)
    const durationMs = Date.now() - start;
    await logger.info("Questionnaire processed successfully", {
      clientId,
      durationMs,
      sector: formData.sector,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! Your report has been sent to your email.",
      clientId,
      pdfGeneratedAt,
    });
  } catch (err) {
    await logger.error("Unhandled questionnaire submission error", { error: String(err) });

    return NextResponse.json(
      {
        success: false,
        error: "An error occurred processing your request",
        // In production you might omit details; keep for now for easier debugging.
        details: process.env.NODE_ENV === "production" ? undefined : String(err),
      },
      { status: 500 }
    );
  }
}
