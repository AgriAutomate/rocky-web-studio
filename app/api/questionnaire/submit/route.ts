import { NextRequest, NextResponse } from "next/server";
import { validateQuestionnaireFormSafe, formatValidationErrors } from "@/lib/utils/validators";
import { storeQuestionnaireResponse } from "@/lib/utils/supabase-client";
import type { Sector } from "@/lib/types/questionnaire";

// Module load logging - confirms this route is being used
console.log('[Questionnaire] API route module for /api/questionnaire/submit loaded');

// Force dynamic rendering - prevents Next.js from trying to statically analyze this route during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

    // STEP 3: TRIGGER N8N WEBHOOK (non-blocking)
    // Fire and forget - don't wait for response
    void triggerN8nWebhook(responseId, formData).catch((err) => {
      // Error already logged in triggerN8nWebhook
      console.error('[Questionnaire] n8n webhook trigger failed (non-blocking)', err);
    });

    // STEP 4: RETURN SUCCESS IMMEDIATELY
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
