import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import * as React from "react";
import { validateQuestionnaireFormSafe, formatValidationErrors } from "@/lib/utils/validators";
import { getTopChallengesForSector, formatSectorName } from "@/lib/utils/sector-mapping";
import { getChallengeDetails } from "@/lib/utils/pain-point-mapping";
// PDF generation moved to n8n workflow
// Local type for report data (used for email and storage)
interface ReportData {
  clientName: string;
  businessName: string;
  sector: string;
  topChallenges: Array<{
    number: number;
    title: string;
    sections: string[];
    roiTimeline: string;
    projectCostRange: string;
  }>;
  generatedDate: string;
}
import {
  storeQuestionnaireResponse,
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

    // STEP 3: PDF GENERATION - Now handled by n8n workflow
    // PDF generation has been moved to n8n. The workflow will be triggered
    // separately and will handle PDF creation, storage, and email delivery.
    const clientId = crypto.randomUUID();
    const pdfGeneratedAt = new Date().toISOString();

    // STEP 4: SEND EMAIL (3-5 seconds) - PDF attachment handled by n8n
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
        // PDF attachment will be handled by n8n workflow
      });
    } catch (emailError) {
      // Do not fail the overall request; log for manual follow-up.
      await logger.error("Resend email send failed", { error: String(emailError), clientId });
    }

    // STEP 6: STORE IN SUPABASE (non-blocking best-effort)
    // Extract UTM parameters from request
    const url = new URL(request.url);
    const utmSource = url.searchParams.get('utm_source') || null;
    const utmCampaign = url.searchParams.get('utm_campaign') || null;
    
    void (async () => {
      const storedId = await storeQuestionnaireResponse(formData, utmSource, utmCampaign).catch((err) => {
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
