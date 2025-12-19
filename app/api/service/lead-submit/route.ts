import { NextRequest, NextResponse } from "next/server";
import { storeServiceLead } from "@/lib/utils/supabase-client";

// Module load logging - confirms this route is being used
console.log('[SERVICE_LEAD] API route module for /api/service/lead-submit loaded');

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
async function triggerN8nWebhook(leadId: string, formData: any): Promise<void> {
  const webhookUrl = process.env.N8N_SERVICE_LEAD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    const logger = await getLogger();
    await logger.info("[SERVICE_LEAD] N8N_SERVICE_LEAD_WEBHOOK_URL not set - skipping webhook trigger", {
      leadId,
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
        leadId,
        formData,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const logger = await getLogger();
      await logger.error("[SERVICE_LEAD] n8n webhook request failed", {
        leadId,
        status: response.status,
        statusText: response.statusText,
        webhookUrl: webhookUrl.substring(0, 50) + "...", // Log partial URL for security
      });
    } else {
      const logger = await getLogger();
      await logger.info("[SERVICE_LEAD] n8n webhook triggered successfully", {
        leadId,
      });
    }
  } catch (error) {
    const logger = await getLogger();
    await logger.error("[SERVICE_LEAD] n8n webhook trigger error", {
      leadId,
      error: String(error),
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    // Don't throw - webhook failures should not block the response
  }
}

/**
 * Trigger n8n duplicate detection webhook asynchronously (non-blocking)
 * Must be called immediately after lead creation to catch duplicates within 1 minute
 */
async function triggerDuplicateDetectionWebhook(leadId: string, formData: any): Promise<void> {
  const webhookUrl = process.env.N8N_DUPLICATE_DETECTION_WEBHOOK_URL;
  
  if (!webhookUrl) {
    const logger = await getLogger();
    await logger.info("[SERVICE_LEAD] N8N_DUPLICATE_DETECTION_WEBHOOK_URL not set - skipping duplicate detection webhook trigger", {
      leadId,
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
        leadId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const logger = await getLogger();
      await logger.error("[SERVICE_LEAD] n8n duplicate detection webhook request failed", {
        leadId,
        status: response.status,
        statusText: response.statusText,
        webhookUrl: webhookUrl.substring(0, 50) + "...",
      });
    } else {
      const logger = await getLogger();
      await logger.info("[SERVICE_LEAD] n8n duplicate detection webhook triggered successfully", {
        leadId,
      });
    }
  } catch (error) {
    const logger = await getLogger();
    await logger.error("[SERVICE_LEAD] n8n duplicate detection webhook trigger error", {
      leadId,
      error: String(error),
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    // Don't throw - webhook failures should not block the response
  }
}

/**
 * Trigger n8n lead scoring webhook asynchronously (non-blocking)
 */
async function triggerLeadScoringWebhook(leadId: string, formData: any): Promise<void> {
  const webhookUrl = process.env.N8N_LEAD_SCORING_WEBHOOK_URL;
  
  if (!webhookUrl) {
    const logger = await getLogger();
    await logger.info("[SERVICE_LEAD] N8N_LEAD_SCORING_WEBHOOK_URL not set - skipping lead scoring webhook trigger", {
      leadId,
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
        leadId,
        email: formData.email,
        firstName: formData.firstName,
        serviceType: formData.serviceType,
        urgency: formData.urgency,
        utm_source: formData.utm_source || null,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const logger = await getLogger();
      await logger.error("[SERVICE_LEAD] n8n lead scoring webhook request failed", {
        leadId,
        status: response.status,
        statusText: response.statusText,
        webhookUrl: webhookUrl.substring(0, 50) + "...",
      });
    } else {
      const logger = await getLogger();
      await logger.info("[SERVICE_LEAD] n8n lead scoring webhook triggered successfully", {
        leadId,
      });
    }
  } catch (error) {
    const logger = await getLogger();
    await logger.error("[SERVICE_LEAD] n8n lead scoring webhook trigger error", {
      leadId,
      error: String(error),
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    // Don't throw - webhook failures should not block the response
  }
}

/**
 * Validate service lead form data
 */
function validateServiceLeadData(body: any): { success: true; data: any } | { success: false; error: string; details: any } {
  const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    return {
      success: false,
      error: `Missing required fields: ${missingFields.join(', ')}`,
      details: { missingFields },
    };
  }

  // Validate email format (basic)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return {
      success: false,
      error: 'Invalid email format',
      details: { field: 'email' },
    };
  }

  return {
    success: true,
    data: {
      firstName: body.firstName?.trim(),
      lastName: body.lastName?.trim(),
      email: body.email?.trim().toLowerCase(),
      phone: body.phone?.trim(),
      serviceType: body.serviceType || null,
      urgency: body.urgency || null,
      location: body.location || null,
      description: body.description || null,
    },
  };
}

/**
 * POST handler for service lead submission
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
    const validationResult = validateServiceLeadData(body);

    if (!validationResult.success) {
      await logger.error("[SERVICE_LEAD] Validation failed", { 
        error: validationResult.error,
        details: validationResult.details,
      });
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error,
          details: validationResult.details,
        },
        { status: 400 }
      );
    }

    const formData = validationResult.data;

    await logger.info("[SERVICE_LEAD] Service lead form validated", {
      email: formData.email,
      serviceType: formData.serviceType,
      urgency: formData.urgency,
    });

    // STEP 2: SAVE TO SUPABASE
    let leadId: string | null = null;
    try {
      leadId = await storeServiceLead(formData);

      if (!leadId) {
        await logger.error("[SERVICE_LEAD] Failed to store service lead - leadId is null", {
          email: formData.email,
        });
        return NextResponse.json(
          {
            success: false,
            error: "Failed to save service lead",
          },
          { status: 500 }
        );
      }

      await logger.info("[SERVICE_LEAD] Service lead stored successfully", {
        leadId,
        email: formData.email,
      });
    } catch (dbError) {
      await logger.error("[SERVICE_LEAD] Database error storing service lead", {
        error: String(dbError),
        errorMessage: dbError instanceof Error ? dbError.message : String(dbError),
        email: formData.email,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Failed to save service lead",
        },
        { status: 500 }
      );
    }

    // STEP 3: TRIGGER N8N WEBHOOKS (non-blocking)
    // Fire and forget - don't wait for response
    
    // CRITICAL: Trigger duplicate detection FIRST to catch duplicates within 1 minute
    // This must run immediately after lead creation to meet success metrics
    void triggerDuplicateDetectionWebhook(leadId, formData).catch((err) => {
      console.error('[SERVICE_LEAD] n8n duplicate detection webhook trigger failed (non-blocking)', err);
    });
    
    // Trigger service lead intake webhook
    void triggerN8nWebhook(leadId, formData).catch((err) => {
      // Error already logged in triggerN8nWebhook
      console.error('[SERVICE_LEAD] n8n webhook trigger failed (non-blocking)', err);
    });
    
    // Trigger lead scoring webhook
    void triggerLeadScoringWebhook(leadId, formData).catch((err) => {
      console.error('[SERVICE_LEAD] n8n lead scoring webhook trigger failed (non-blocking)', err);
    });

    // STEP 4: RETURN SUCCESS IMMEDIATELY
    await logger.info("[SERVICE_LEAD] Service lead submission processed successfully", {
      leadId,
      email: formData.email,
    });

    return NextResponse.json(
      {
        success: true,
        leadId: Number(leadId), // Convert string ID to number
        message: "Thank you! We will be in touch shortly.",
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
    console.error('[SERVICE_LEAD] Unhandled error in POST /api/service/lead-submit', err);

    // Try to log with logger, but don't let logging failure prevent JSON response
    try {
      const logger = await getLogger();
      await logger.error("[SERVICE_LEAD] Unhandled service lead submission error", {
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
