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

    // STEP 3: GENERATE PDF (8-10 seconds)
    let pdfBuffer: Uint8Array;
    try {
      pdfBuffer = await generatePdfReport(reportData);
    } catch (err) {
      await logger.error("PDF generation failed", { error: String(err) });
      // Treat as gateway timeout for the client
      return NextResponse.json(
        {
          success: false,
          error: "We had trouble generating your report. Please try again in a moment.",
        },
        { status: 504 }
      );
    }

    const pdfGeneratedAt = new Date().toISOString();
    const nodeBuffer = Buffer.from(pdfBuffer);
    const pdfBase64 = nodeBuffer.toString("base64");

    // STEP 4: UPLOAD PDF TO STORAGE (2-3 seconds, optional)
    const clientId = crypto.randomUUID();
    const fileName = `${clientId}-report-${reportData.generatedDate}.pdf`;
    const pdfUrl = await uploadPdfToStorage(fileName, nodeBuffer).catch((err) => {
      void logger.error("PDF upload threw", { error: String(err), clientId });
      return null as string | null;
    });

    // STEP 5: SEND EMAIL (3-5 seconds)
    const resend = new Resend(env.RESEND_API_KEY);
    try {
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
            filename: "RockyWebStudio-Deep-Dive-Report.pdf",
            content: pdfBase64,
            contentType: "application/pdf",
          },
        ],
      });
    } catch (emailError) {
      // Do not fail the overall request; log for manual follow-up.
      await logger.error("Resend email send failed", { error: String(emailError), clientId });
    }

    // STEP 6: STORE IN SUPABASE (non-blocking best-effort)
    void (async () => {
      const storedId = await storeQuestionnaireResponse(formData, pdfUrl, clientId, pdfGeneratedAt).catch((err) => {
        void logger.error("storeQuestionnaireResponse threw", { error: String(err) });
        return null;
      });

      if (storedId) {
        await updateEmailSentTimestamp(storedId, pdfGeneratedAt).catch((err) => {
          void logger.error("updateEmailSentTimestamp threw", { error: String(err), clientId: storedId });
        });
      }
    })();

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
