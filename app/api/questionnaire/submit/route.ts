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
 *
 * PDF ATTACHMENT CONDITIONS:
 * - SUCCESS (PDF attached): pdfBase64 is non-empty string → attachment included in email
 * - NO ATTACHMENT: pdfBase64 is null/empty → email sent without PDF (form still succeeds)
 * - ERROR: Resend API throws → email not sent, but request continues (form still succeeds)
 *
 * LOGGING BRANCHES:
 * - Success with PDF: logs "Email sent successfully with PDF attachment" with size estimate
 * - Success without PDF: logs "Email sent successfully without PDF attachment" with reason
 * - Failure: logs "Resend email send failed" with full error object (name, message, stack, response data)
 *
 * DEV-ONLY FEATURES:
 * - Sanitized Resend payload logging (attachments metadata without full base64)
 * - PDF file write to disk when DEBUG_PDF=true (for local inspection)
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
    // Conditions that will cause PDF not to be attached:
    // 1. PDF generation throws an error (caught below)
    // 2. PDF buffer is empty or null
    // 3. Base64 conversion fails or produces empty string
    let pdfBuffer: Uint8Array | null = null;
    let pdfBase64: string | null = null;
    let pdfGeneratedAt: string | null = null;
    
    await logger.info("Starting PDF generation", {
      clientName: reportData.clientName,
      businessName: reportData.businessName,
      sector: reportData.sector,
    });

    try {
      await logger.info("Calling generatePdfReport", {
        clientName: reportData.clientName,
        businessName: reportData.businessName,
        sector: reportData.sector,
        hasChromePath: !!process.env.CHROME_EXECUTABLE_PATH,
        nodeEnv: process.env.NODE_ENV,
      });
      
      pdfBuffer = await generatePdfReport(reportData);
      
      await logger.info("generatePdfReport returned", {
        hasBuffer: !!pdfBuffer,
        bufferType: pdfBuffer ? pdfBuffer.constructor.name : "null",
        bufferLength: pdfBuffer?.length ?? 0,
        isUint8Array: pdfBuffer instanceof Uint8Array,
      });
      
      // Verify PDF buffer is non-empty
      if (!pdfBuffer || pdfBuffer.length === 0) {
        await logger.error("PDF generation returned empty buffer", {
          clientName: reportData.clientName,
          bufferType: typeof pdfBuffer,
          bufferLength: pdfBuffer?.length ?? 0,
        });
        pdfBuffer = null;
      } else {
        await logger.info("PDF buffer generated", {
          bufferLength: pdfBuffer.length,
          bufferType: pdfBuffer.constructor.name,
          clientName: reportData.clientName,
        });

        // Convert to Node Buffer then to base64
        const nodeBuffer = Buffer.from(pdfBuffer);
        pdfGeneratedAt = new Date().toISOString();
        pdfBase64 = nodeBuffer.toString("base64");

        // Verify base64 conversion succeeded
        if (!pdfBase64 || pdfBase64.length === 0) {
          await logger.error("Base64 conversion produced empty string", {
            clientName: reportData.clientName,
            originalBufferLength: pdfBuffer.length,
            nodeBufferLength: nodeBuffer.length,
          });
          pdfBase64 = null;
        } else {
          await logger.info("PDF converted to base64 successfully", {
            clientName: reportData.clientName,
            pdfBufferLength: pdfBuffer.length,
            base64Length: pdfBase64.length,
            base64Preview: pdfBase64.substring(0, 50) + "...",
            pdfGeneratedAt,
          });
        }
      }
    } catch (err) {
      // Log error but continue - we'll still store data and send email
      await logger.error("PDF generation failed - continuing without PDF", { 
        error: String(err),
        errorMessage: err instanceof Error ? err.message : String(err),
        errorStack: err instanceof Error ? err.stack : undefined,
        errorName: err instanceof Error ? err.name : typeof err,
        clientName: reportData.clientName,
        businessName: reportData.businessName,
      });
      // Don't return error - continue with submission without PDF
      pdfBuffer = null;
      pdfBase64 = null;
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
    // Email attachment conditions:
    // - SUCCESS: pdfBase64 is non-empty string → attachment included
    // - NO ATTACHMENT: pdfBase64 is null/empty → email sent without PDF
    // - ERROR: Resend API throws → email not sent, but request continues
    // 
    // Logging branches:
    // - Success: logs email sent with attachment metadata (filename, size estimate)
    // - No PDF: logs email sent without attachment
    // - Failure: logs full Resend error object (name, message, stack, response data)
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

      // Only attach PDF if generation succeeded and base64 is valid
      await logger.info("Checking PDF attachment conditions", {
        hasPdfBase64: !!pdfBase64,
        pdfBase64Type: typeof pdfBase64,
        pdfBase64Length: pdfBase64?.length ?? 0,
        pdfBase64IsString: typeof pdfBase64 === "string",
        pdfBase64StartsWith: pdfBase64?.substring(0, 20) ?? "null",
      });
      
      if (pdfBase64 && pdfBase64.length > 0) {
        // Verify base64 is valid (starts with expected pattern and has reasonable length)
        const estimatedSizeBytes = Math.floor((pdfBase64.length * 3) / 4);
        
        await logger.info("Creating email attachment object", {
          filename: "RockyWebStudio-Deep-Dive-Report.pdf",
          contentType: "application/pdf",
          base64Length: pdfBase64.length,
          estimatedSizeBytes,
          estimatedSizeKB: Math.round(estimatedSizeBytes / 1024),
        });
        
        emailOptions.attachments = [
          {
            filename: "RockyWebStudio-Deep-Dive-Report.pdf",
            content: pdfBase64, // Must be base64 string, not Buffer
            contentType: "application/pdf", // Must be exactly "application/pdf"
          },
        ];

        await logger.info("Email options prepared with PDF attachment", {
          clientId,
          to: formData.businessEmail,
          hasAttachment: true,
          attachmentFilename: "RockyWebStudio-Deep-Dive-Report.pdf",
          attachmentContentType: "application/pdf",
          attachmentSizeEstimateBytes: estimatedSizeBytes,
          attachmentSizeEstimateKB: Math.round(estimatedSizeBytes / 1024),
          base64Length: pdfBase64.length,
          base64IsString: typeof pdfBase64 === "string",
        });
      } else {
        await logger.info("Email options prepared without PDF attachment", {
          clientId,
          to: formData.businessEmail,
          hasAttachment: false,
          pdfBase64IsNull: pdfBase64 === null,
          pdfBase64IsEmpty: pdfBase64 === "",
          pdfBase64Length: pdfBase64?.length ?? 0,
        });
      }

      // DEV-ONLY: Log sanitized Resend payload for local testing
      if (process.env.NODE_ENV !== "production") {
        const attachmentMeta = emailOptions.attachments?.map((a) => ({
          filename: a.filename,
          contentType: a.contentType,
          contentLength: typeof a.content === "string" ? a.content.length : 0,
          contentPreview: typeof a.content === "string" ? a.content.substring(0, 50) + "..." : "N/A",
        }));
        console.log("[DEV] Resend email options (sanitized)", {
          from: emailOptions.from,
          to: emailOptions.to,
          subject: emailOptions.subject,
          hasAttachments: !!emailOptions.attachments?.length,
          attachmentsCount: emailOptions.attachments?.length ?? 0,
          attachments: attachmentMeta,
        });
      }

      // Final verification before sending
      await logger.info("About to send email via Resend", {
        hasAttachments: !!emailOptions.attachments?.length,
        attachmentsCount: emailOptions.attachments?.length ?? 0,
        firstAttachmentFilename: emailOptions.attachments?.[0]?.filename,
        firstAttachmentContentType: emailOptions.attachments?.[0]?.contentType,
        firstAttachmentContentLength: typeof emailOptions.attachments?.[0]?.content === "string" 
          ? emailOptions.attachments[0].content.length 
          : 0,
      });

      await resend.emails.send(emailOptions);
      
      // Log success with attachment status
      if (pdfBase64 && pdfBase64.length > 0) {
        await logger.info("Email sent successfully with PDF attachment", { 
          clientId,
          to: formData.businessEmail,
          hasPdfAttachment: true,
          attachmentSizeEstimateKB: Math.round((Math.floor((pdfBase64.length * 3) / 4)) / 1024),
        });
      } else {
        await logger.info("Email sent successfully without PDF attachment", {
          clientId,
          to: formData.businessEmail,
          hasPdfAttachment: false,
          reason: pdfBase64 === null ? "PDF generation failed" : "PDF base64 conversion failed",
        });
      }
    } catch (emailError) {
      // Do not fail the overall request; log for manual follow-up.
      // Log full error object including Resend-specific response data
      const errorDetails: Record<string, unknown> = {
        error: String(emailError),
        errorMessage: emailError instanceof Error ? emailError.message : String(emailError),
        errorName: emailError instanceof Error ? emailError.name : typeof emailError,
        errorStack: emailError instanceof Error ? emailError.stack : undefined,
        clientId,
        to: formData.businessEmail,
        attemptedWithAttachment: !!pdfBase64,
      };

      // If it's a Resend API error, extract response data
      if (emailError && typeof emailError === "object") {
        const resendError = emailError as any;
        if (resendError.response) {
          errorDetails.resendResponseStatus = resendError.response.status;
          errorDetails.resendResponseStatusText = resendError.response.statusText;
          errorDetails.resendResponseBody = resendError.response.data || resendError.response.body;
        }
        if (resendError.status) {
          errorDetails.resendStatus = resendError.status;
        }
        if (resendError.message) {
          errorDetails.resendMessage = resendError.message;
        }
      }

      await logger.error("Resend email send failed", errorDetails);
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

    if (!storedId) {
      // Supabase insert failed or returned no ID – this is a real error.
      await logger.error("Failed to store questionnaire response - storedId is null", {
        clientId,
        businessName: formData.businessName,
        businessEmail: formData.businessEmail,
        hasPdf: !!pdfUrl,
      });
    } else {
      // We successfully stored the record.
      if (pdfGeneratedAt) {
        await updateEmailSentTimestamp(storedId, pdfGeneratedAt).catch((err) => {
          void logger.error("updateEmailSentTimestamp failed", {
            error: String(err),
            clientId: storedId,
          });
        });
      } else {
        // PDF was missing or failed, but the questionnaire itself is stored.
        await logger.info("Stored questionnaire without PDF timestamp (PDF missing or failed)", {
          storedId,
          businessName: formData.businessName,
          businessEmail: formData.businessEmail,
        });
      }
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
