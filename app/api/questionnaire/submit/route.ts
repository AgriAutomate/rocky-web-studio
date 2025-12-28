import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import * as React from "react";
import { validateQuestionnaireFormSafe, formatValidationErrors } from "@/lib/utils/validators";
import { getTopChallengesForSector, formatSectorName } from "@/lib/utils/sector-mapping";
import { getChallengeDetails } from "@/lib/utils/pain-point-mapping";
import { painPointsToChallengeIds } from "@/lib/utils/pain-point-to-challenge";
import { storeQuestionnaireResponse, updateEmailSentTimestamp, uploadPdfToStorage } from "@/lib/utils/supabase-client";
import ClientAcknowledgementEmail from "@/lib/email/ClientAcknowledgementEmail";
import { generatePDFFromComponents } from "@/lib/pdf/generateFromComponents";
import { buildCQAdvantageSection } from "@/backend-workflow/services/pdf-content-builder";
import { getSector } from "@/backend-workflow/types/sectors";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { env } from "@/lib/env";
import { auditWebsiteAsync } from "@/lib/services/audit-service";
import { normalizeUrl, isValidUrl } from "@/lib/utils/audit-utils";
import type { Sector } from "@/lib/types/questionnaire";

// Lazy import for Supabase client (only when needed)
async function getSupabaseClient() {
  return createServerSupabaseClient(true);
}

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

    // Build complete form responses object - use formResponses from body if provided, otherwise fall back to rawBodyForExtraction
    // The formResponses field contains the raw formData with all question IDs (q1, q2, q3, q23, q24, q21, q22, sector, etc.)
    // This is sent from the frontend specifically for PDF generation
    // MUST be declared before it's used for goals/offers extraction
    const allFormResponses: Record<string, any> = body.formResponses || rawBodyForExtraction;

    // Extract goals and primary offers from allFormResponses (q3 and q5)
    // Use allFormResponses which contains body.formResponses with raw question IDs
    // These are checkbox arrays in the form but not in the validated formData type
    const selectedGoals = Array.isArray(allFormResponses.q3) 
      ? allFormResponses.q3 
      : (allFormResponses.q3 ? [allFormResponses.q3] : []);
    
    const selectedPrimaryOffers = Array.isArray(allFormResponses.q5) 
      ? allFormResponses.q5 
      : (allFormResponses.q5 ? [allFormResponses.q5] : []);

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

    // Log allFormResponses for debugging
    await logger.info("All form responses for PDF generation", {
      responseId: "pending", // Will be set later, but log early
      totalKeys: Object.keys(allFormResponses).length,
      keys: Object.keys(allFormResponses),
      preview: Object.keys(allFormResponses).reduce((acc, key) => {
        const value = allFormResponses[key];
        if (Array.isArray(value)) {
          acc[key] = `[Array: ${value.length} items]`;
        } else if (typeof value === 'string' && value.length > 50) {
          acc[key] = value.substring(0, 50) + '...';
        } else {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>),
      rawBodyKeys: Object.keys(rawBodyForExtraction),
      rawBodyKeyCount: Object.keys(rawBodyForExtraction).length,
    });

    const reportData = {
      clientName: (allFormResponses.q1 as string) || formData.businessName || "Client",
      businessName: formData.businessName,
      sector: formatSectorName(formData.sector as any),
      topChallenges: challengeDetails, // All selected challenges
      selectedGoals: selectedGoals, // All selected goals
      selectedPrimaryOffers: selectedPrimaryOffers, // All selected primary offers
      generatedDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      cqAdvantage, // CQ Advantage section data
      allFormResponses, // Include ALL form responses for PDF
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
      // Extract sector-specific data, goals, and primary offers from allFormResponses
      // Use allFormResponses (which contains body.formResponses with raw question IDs) instead of rawBodyForExtraction
      // These are collected in the form but not in the validated formData type
      const sectorSpecificData: Record<string, any> = {};
      const sectorKeys = ['h6', 'h7', 'h8', 'h9', 'h10', 't6', 't7', 't8', 't9', 't10', 
                          'r6', 'r7', 'r8', 'r9', 'r10', 'p6', 'p7', 'p8', 'p9', 'p10',
                          'e6', 'e7', 'e8', 'e8b', 'e9', 'e10', 'e11', 'e12',
                          'hc6', 'hc7', 'hc8', 'hc9', 'hc10',
                          're6', 're7', 're8', 're9', 're10'];
      
      sectorKeys.forEach(key => {
        if (allFormResponses[key] !== undefined) {
          sectorSpecificData[key] = allFormResponses[key];
        }
      });
      
      // Log sector-specific data extraction for debugging
      await logger.info("Extracting sector-specific data for database storage", {
        totalSectorKeys: sectorKeys.length,
        foundKeys: Object.keys(sectorSpecificData),
        foundCount: Object.keys(sectorSpecificData).length,
        allFormResponsesHasKeys: sectorKeys.some(key => allFormResponses[key] !== undefined),
      });

      // Attach extracted data to formData for storage
      const formDataWithExtras = {
        ...formData,
        sectorSpecificData: Object.keys(sectorSpecificData).length > 0 ? sectorSpecificData : undefined,
        goals: selectedGoals.length > 0 ? selectedGoals : undefined,
        primaryOffers: selectedPrimaryOffers.length > 0 ? selectedPrimaryOffers : undefined,
      };

      responseId = await storeQuestionnaireResponse(
        formDataWithExtras as any,
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

    // STEP 3a: TRIGGER AND WAIT FOR WEBSITE AUDIT (BEFORE PDF generation)
    // If website URL provided (q2), trigger audit and wait for completion before generating PDF
    // Use allFormResponses which contains body.formResponses with raw question IDs
    const websiteUrl = allFormResponses.q2;
    let auditDataForPDF: any = {
      status: "not_requested",
      websiteUrl: null,
      results: null,
      error: null,
    };

    if (websiteUrl && typeof websiteUrl === "string" && websiteUrl.trim()) {
      try {
        // Store website URL in database
        const supabase = await getSupabaseClient();
        await (supabase as any)
          .from("questionnaire_responses")
          .update({ website_url: websiteUrl.trim() })
          .eq("id", responseId)
          .then((result: any) => {
            if (result.error) {
              void logger.error("Failed to update website_url", {
                responseId,
                error: result.error.message,
              });
            }
          });

        // Validate and normalize URL
        const normalizedUrl = normalizeUrl(websiteUrl.trim());
        if (!isValidUrl(normalizedUrl)) {
          throw new Error(`Invalid URL format: ${websiteUrl.trim()}`);
        }

        await logger.info("Starting audit before PDF generation", {
          responseId,
          websiteUrl: normalizedUrl,
        });

        // Call audit service directly and wait for completion
        // This ensures the audit completes before PDF generation
        try {
          await auditWebsiteAsync(responseId, normalizedUrl);
          
          // Fetch completed audit results
          const supabase = await getSupabaseClient();
          const { data: auditResponse, error: auditQueryError } = await (supabase as any)
            .from("questionnaire_responses")
            .select("audit_results, audit_status, audit_error, audit_completed_at, website_url")
            .eq("id", responseId)
            .single();
          
          if (auditQueryError) {
            throw new Error(`Failed to fetch audit results: ${auditQueryError.message}`);
          }

          if (auditResponse) {
            if (auditResponse.audit_status === "completed" && auditResponse.audit_results) {
              auditDataForPDF = {
                status: "completed",
                websiteUrl: auditResponse.website_url || normalizedUrl,
                results: auditResponse.audit_results,
                error: null,
              };
              await logger.info("Audit completed successfully", {
                responseId,
                hasResults: !!auditResponse.audit_results,
              });
            } else if (auditResponse.audit_status === "failed") {
              auditDataForPDF = {
                status: "failed",
                websiteUrl: auditResponse.website_url || normalizedUrl,
                results: auditResponse.audit_results || null,
                error: auditResponse.audit_error || "Audit failed",
              };
              await logger.info("Audit failed", {
                responseId,
                error: auditResponse.audit_error,
              });
            } else {
              // Still pending/running (shouldn't happen if we awaited)
              auditDataForPDF = {
                status: auditResponse.audit_status || "running",
                websiteUrl: auditResponse.website_url || normalizedUrl,
                results: null,
                error: null,
              };
              await logger.info("Audit still in progress", {
                responseId,
                status: auditResponse.audit_status,
              });
            }
          }
        } catch (auditError) {
          // Audit failed - set error status but don't block PDF generation
          await logger.error("Audit execution failed", {
            responseId,
            error: auditError instanceof Error ? auditError.message : String(auditError),
          });
          
          auditDataForPDF = {
            status: "failed",
            websiteUrl: normalizedUrl,
            results: null,
            error: auditError instanceof Error ? auditError.message : "Audit failed",
          };
        }
      } catch (auditTriggerError) {
        // Don't fail PDF generation if audit trigger fails
        await logger.error("Failed to trigger or wait for website audit", {
          responseId,
          error: auditTriggerError instanceof Error ? auditTriggerError.message : String(auditTriggerError),
        });
        
        // Set audit data to indicate error
        auditDataForPDF = {
          status: "failed",
          websiteUrl: websiteUrl.trim(),
          results: null,
          error: auditTriggerError instanceof Error ? auditTriggerError.message : "Failed to trigger audit",
        };
      }
    }

    let pdfBuffer: Buffer | null = null;
    let pdfUrl: string | null = null;
    try {
      // Log reportData before PDF generation
      await logger.info("Generating PDF with report data", {
        responseId,
        reportDataKeys: Object.keys(reportData),
        allFormResponsesKeys: reportData.allFormResponses ? Object.keys(reportData.allFormResponses) : [],
        allFormResponsesCount: reportData.allFormResponses ? Object.keys(reportData.allFormResponses).length : 0,
        allFormResponsesPreview: reportData.allFormResponses ? Object.keys(reportData.allFormResponses).reduce((acc, key) => {
          const value = reportData.allFormResponses[key];
          if (Array.isArray(value)) {
            acc[key] = `[Array: ${value.length} items]`;
          } else if (typeof value === 'string' && value.length > 100) {
            acc[key] = value.substring(0, 100) + '...';
          } else {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>) : {},
      });

      pdfBuffer = await generatePDFFromComponents('questionnaire-report', {
        ...reportData,
        auditData: auditDataForPDF || { status: "pending", websiteUrl: websiteUrl || null, results: null, error: null }, // Always include audit data
      });
      await logger.info("PDF generated successfully", {
        responseId,
        pdfSize: pdfBuffer.length,
      });

      // STEP 3a: UPLOAD PDF TO SUPABASE STORAGE
      const fileName = `${responseId}-${reportData.generatedDate}.pdf`;
      pdfUrl = await uploadPdfToStorage(fileName, pdfBuffer);
      
      if (pdfUrl) {
        await logger.info("PDF uploaded to Supabase Storage", {
          responseId,
          pdfUrl,
          fileName,
        });

        // Update response record with PDF URL
        const supabase = await getSupabaseClient();
        await (supabase as any)
          .from("questionnaire_responses")
          .update({
            pdf_url: pdfUrl,
            pdf_generated_at: new Date().toISOString(),
          })
          .eq("id", responseId)
          .then((result: any) => {
            if (result.error) {
              void logger.error("Failed to update PDF URL in database", {
                responseId,
                error: result.error.message,
              });
            }
          });
      } else {
        await logger.info("PDF upload to storage failed, will use base64 for email", {
          responseId,
        });
      }
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
          clientFirstName: (allFormResponses.q1 as string) || formData.businessName || "Client",
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

    // Note: Audit trigger moved to STEP 3a (before PDF generation) to ensure status exists

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
    const logger = await getLogger();
    
    // Check if this is a validation error from Zod (shouldn't happen, but handle gracefully)
    if (error && typeof error === 'object' && 'issues' in error) {
      const details = formatValidationErrors(error as any);
      await logger.error("Questionnaire validation error (unexpected)", { details });
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details,
        },
        { 
          status: 400,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }
    
    // Extract error details
    const err =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : { name: 'UnknownError', message: String(error), stack: undefined };

    // Log with requested format
    console.error('[Questionnaire] Unhandled error in POST /api/questionnaire/submit', err);

    // Try to log with logger, but don't let logging failure prevent JSON response
    try {
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
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { 
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }
    );
  }
}
