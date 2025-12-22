import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import * as React from "react";
import { validateQuestionnaireFormSafe, formatValidationErrors } from "@/lib/utils/validators";
import { getTopChallengesForSector, formatSectorName } from "@/lib/utils/sector-mapping";
import { getChallengeDetails } from "@/lib/utils/pain-point-mapping";
import { painPointsToChallengeIds } from "@/lib/utils/pain-point-to-challenge";
import { storeQuestionnaireResponse, updateEmailSentTimestamp } from "@/lib/utils/supabase-client";
import ClientAcknowledgementEmail from "@/lib/email/ClientAcknowledgementEmail";
import { generatePDFFromComponents } from "@/lib/pdf/generateFromComponents";
import { buildCQAdvantageSection } from "@/backend-workflow/services/pdf-content-builder";
import { getSector } from "@/backend-workflow/types/sectors";
import { env } from "@/lib/env";
import type { Sector } from "@/lib/types/questionnaire";

// Module load logging - confirms this route is being used
console.log('[Questionnaire] API route module for /api/questionnaire/submit loaded');

// Force dynamic rendering - prevents Next.js from trying to statically analyze this route during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const RESEND_FROM = "noreply@rockywebstudio.com.au";

// Lazy import helpers - import modules only when needed to prevent load-time errors
async function getLogger() {
  const { logger } = await import("@/lib/utils/logger");
  return logger;
}

/**
 * Trigger n8n webhook asynchronously (non-blocking)
 */
async function triggerN8nWebhook(responseId: string, formData: any): Promise<void> {
  const webhookUrl = process.env.N8N_QUESTIONNAIRE_WEBHOOK_URL;
  
  if (!webhookUrl) {
    const logger = await getLogger();
    await logger.info("N8N_QUESTIONNAIRE_WEBHOOK_URL not set - skipping webhook trigger", {
      responseId,
    });
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        responseId,
        formData,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const logger = await getLogger();
      await logger.error("n8n webhook request failed", {
        responseId,
        status: response.status,
        statusText: response.statusText,
        webhookUrl: webhookUrl.substring(0, 50) + "...", // Log partial URL for security
      });
    } else {
      const logger = await getLogger();
      await logger.info("n8n webhook triggered successfully", {
        responseId,
      });
    }
  } catch (error) {
    const logger = await getLogger();
    await logger.error("n8n webhook trigger error", {
      responseId,
      error: String(error),
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    // Don't throw - webhook failures should not block the response
  }
}

/**
 * POST handler for questionnaire submission
 */
export async function POST(req: NextRequest) {
  try {
    // Validate HTTP method
    if (req.method && req.method !== "POST") {
      return NextResponse.json(
        { success: false, error: "Method not allowed" },
        { 
          status: 405,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }

    const logger = await getLogger();

    // STEP 1: PARSE & VALIDATE
    const body = await req.json();
    
    // Extract UTM parameters from query string or body
    const url = new URL(req.url);
    const utmSource = url.searchParams.get('utm_source') || body.utm_source || null;
    const utmCampaign = url.searchParams.get('utm_campaign') || body.utm_campaign || null;
    
    // Store raw body for goals/offers extraction (before validation)
    const rawBodyForExtraction = { ...body };
    
    const validationResult = validateQuestionnaireFormSafe(body);

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

    // STEP 2: GENERATE REPORT DATA (for email and PDF)
    // Use ALL selected pain points, not just top 3 from sector
    const allChallengeIds = formData.selectedPainPoints && formData.selectedPainPoints.length > 0
      ? painPointsToChallengeIds(formData.selectedPainPoints, 100) // Get ALL challenges (high limit)
      : getTopChallengesForSector(formData.sector); // Fallback to sector-based if no pain points selected
    
    const challengeDetails = getChallengeDetails(allChallengeIds);

    // Extract goals and primary offers from raw body (q3 and q5)
    // These are checkbox arrays in the form but not in the validated formData type
    const selectedGoals = Array.isArray(rawBodyForExtraction.q3) 
      ? rawBodyForExtraction.q3 
      : (rawBodyForExtraction.q3 ? [rawBodyForExtraction.q3] : []);
    
    const selectedPrimaryOffers = Array.isArray(rawBodyForExtraction.q5) 
      ? rawBodyForExtraction.q5 
      : (rawBodyForExtraction.q5 ? [rawBodyForExtraction.q5] : []);

    // Map form sector to backend-workflow sector slug
    // Form uses simple slugs (e.g., "healthcare", "hospitality")
    // Backend-workflow uses specific slugs (e.g., "healthcare-allied-health", "hospitality-retail")
    const sectorSlugMap: Record<string, string> = {
      "healthcare": "healthcare-allied-health",
      "hospitality": "hospitality-retail",
      "retail": "hospitality-retail",
      "construction": "trades-construction",
      "agriculture": "agriculture-rural",
      "professional-services": "professional-services",
      "fitness-wellness": "fitness-wellness",
      "real-estate-property": "real-estate-property",
      "education-training": "education-training",
      "government-council": "government-council",
      "automotive-mechanical": "automotive-mechanical",
      "arts-creative": "arts-creative",
      "veterans-defence": "veterans-defence",
      "non-profit-community": "non-profit-community",
      "transport-logistics": "transport-logistics",
      "events-entertainment": "events-entertainment",
    };
    
    const backendSectorSlug = sectorSlugMap[formData.sector] || formData.sector;
    const sectorDefinition = getSector(backendSectorSlug);
    
    // Build CQ Advantage section if sector definition has strategic intelligence
    const cqAdvantage = sectorDefinition 
      ? buildCQAdvantageSection(sectorDefinition)
      : null;

    const reportData = {
      clientName: formData.firstName,
      businessName: formData.businessName,
      sector: formatSectorName(formData.sector as any),
      topChallenges: challengeDetails, // All selected challenges
      selectedGoals: selectedGoals, // All selected goals
      selectedPrimaryOffers: selectedPrimaryOffers, // All selected primary offers
      generatedDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      cqAdvantage, // CQ Advantage section data
    };

    // Validate sector exists
    if (!formData.sector) {
      await logger.error("Missing sector in form data", { 
        formDataKeys: Object.keys(formData),
      });
      return NextResponse.json(
        {
          success: false,
          error: "Sector is required",
        },
        { status: 400 }
      );
    }

    // Validate sector is a valid Sector type
    const validSectors: Sector[] = [
      "healthcare", "manufacturing", "mining", "agriculture", 
      "retail", "hospitality", "professional-services", "construction", "other"
    ];
    if (!validSectors.includes(formData.sector as Sector)) {
      await logger.error("Invalid sector value", {
        receivedSector: formData.sector,
        validSectors,
      });
      return NextResponse.json(
        {
          success: false,
          error: `Invalid sector: ${formData.sector}. Must be one of: ${validSectors.join(", ")}`,
        },
        { status: 400 }
      );
    }

    await logger.info("Questionnaire form validated", {
      businessName: formData.businessName,
      businessEmail: formData.businessEmail,
      sector: formData.sector,
    });

    // STEP 2: SAVE TO SUPABASE
    let responseId: string | null = null;
    try {
      responseId = await storeQuestionnaireResponse(
        formData,
        utmSource,
        utmCampaign
      );

      if (!responseId) {
        await logger.error("Failed to store questionnaire response - responseId is null", {
          businessName: formData.businessName,
          businessEmail: formData.businessEmail,
        });
        
        // In development, return more details
        const isDev = process.env.NODE_ENV !== 'production';
        return NextResponse.json(
          {
            success: false,
            error: "Failed to save questionnaire response",
            ...(isDev && {
              debug: "storeQuestionnaireResponse returned null - check server logs for details",
              hint: "Common causes: RLS blocking, missing env vars, or table doesn't exist",
            }),
          },
          { status: 500 }
        );
      }

      await logger.info("Questionnaire response stored successfully", {
        responseId,
        businessName: formData.businessName,
      });
    } catch (dbError) {
      await logger.error("Database error storing questionnaire response", {
        error: String(dbError),
        errorMessage: dbError instanceof Error ? dbError.message : String(dbError),
        errorStack: dbError instanceof Error ? dbError.stack : undefined,
        businessName: formData.businessName,
      });
      
      // In development, return error details
      const isDev = process.env.NODE_ENV !== 'production';
      return NextResponse.json(
        {
          success: false,
          error: "Failed to save questionnaire response",
          ...(isDev && {
            debug: dbError instanceof Error ? dbError.message : String(dbError),
            hint: "Check Vercel function logs for full Supabase error details",
          }),
        },
        { status: 500 }
      );
    }

    // STEP 3: GENERATE PDF FROM SUPABASE COMPONENTS
    let pdfBuffer: Buffer | null = null;
    try {
      pdfBuffer = await generatePDFFromComponents('questionnaire-report', reportData);
      await logger.info("PDF generated successfully", {
        responseId,
        pdfSize: pdfBuffer.length,
      });
    } catch (pdfError) {
      // Log error but continue - email will be sent without PDF
      await logger.error("PDF generation failed", {
        error: String(pdfError),
        errorMessage: pdfError instanceof Error ? pdfError.message : String(pdfError),
        responseId,
      });
      // Continue to send email without PDF
    }

    // STEP 4: SEND EMAIL VIA RESEND WITH PDF ATTACHMENT
    const resend = new Resend(env.RESEND_API_KEY);
    try {
      const emailConfig: any = {
        from: RESEND_FROM,
        to: formData.businessEmail,
        subject: `Your Custom Deep-Dive Report – ${formData.businessName}`,
        react: React.createElement(ClientAcknowledgementEmail, {
          clientFirstName: formData.firstName,
          businessName: formData.businessName,
          sector: reportData.sector,
        }),
      };

      // Attach PDF if generated successfully
      if (pdfBuffer) {
        const pdfBase64 = pdfBuffer.toString('base64');
        emailConfig.attachments = [
          {
            filename: `RockyWebStudio-Deep-Dive-Report-${reportData.generatedDate}.pdf`,
            content: pdfBase64,
            contentType: "application/pdf",
          },
        ];
      }

      await resend.emails.send(emailConfig);

      // Update email_sent_at timestamp
      await updateEmailSentTimestamp(responseId, new Date().toISOString()).catch((err) => {
        void logger.error("updateEmailSentTimestamp failed", { 
          error: String(err), 
          responseId 
        });
      });

      await logger.info("Questionnaire email sent successfully", {
        responseId,
        businessEmail: formData.businessEmail,
        hasPdfAttachment: !!pdfBuffer,
      });
    } catch (emailError) {
      // Do not fail the overall request; log for manual follow-up
      await logger.error("Resend email send failed", { 
        error: String(emailError), 
        responseId,
        businessEmail: formData.businessEmail,
      });
    }

    // STEP 4: TRIGGER N8N WEBHOOK (non-blocking, for PDF generation)
    // Fire and forget - don't wait for response
    // This will handle PDF generation and attachment in the future
    void triggerN8nWebhook(responseId, formData).catch((err) => {
      // Error already logged in triggerN8nWebhook
      console.error('[Questionnaire] n8n webhook trigger failed (non-blocking)', err);
    });

    // STEP 5: RETURN SUCCESS IMMEDIATELY
    await logger.info("Questionnaire submission processed successfully", {
      responseId,
      sector: formData.sector,
    });

    return NextResponse.json(
      {
        success: true,
        responseId: responseId, // Keep as string (matches database BIGSERIAL)
        message: "Thank you! We are processing your questionnaire.",
      },
      { 
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }
    );
  } catch (error: unknown) {
    // Extract error details
    const err =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : { name: 'UnknownError', message: String(error), stack: undefined };

    // Log with requested format
    console.error('[Questionnaire] Unhandled error in POST /api/questionnaire/submit', err);

    // Try to log with logger, but don't let logging failure prevent JSON response
    try {
      const logger = await getLogger();
      await logger.error("Unhandled questionnaire submission error", {
        error: err.message,
        errorStack: err.stack,
        errorName: err.name,
      });
    } catch {
      // Logger failed, but we already logged to console above
    }

    // ALWAYS return JSON, never HTML
    return NextResponse.json(
      {
        success: false,
        error: err.message ?? 'Internal Server Error',
      },
      { 
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }
    );
  }
}
