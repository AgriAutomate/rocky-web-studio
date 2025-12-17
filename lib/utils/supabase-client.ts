import { createServerSupabaseClient } from "@/lib/supabase/client";
import type { QuestionnaireFormData } from "@/lib/types/questionnaire";
import { logger } from "@/lib/utils/logger";

const QUESTIONNAIRE_BUCKET = "questionnaire-reports";

/**
 * Upload a generated PDF buffer to Supabase Storage.
 *
 * @param fileName - The storage key (e.g. `clientId-report-2025-12-16.pdf`).
 * @param buffer - The PDF buffer to upload.
 * @returns Public URL of the uploaded file, or null if upload fails.
 */
export async function uploadPdfToStorage(
  fileName: string,
  buffer: Buffer
): Promise<string | null> {
  try {
    const supabase = createServerSupabaseClient(true);
    const objectPath = `rockywebstudio/${fileName}`;

    const { error } = await (supabase as any)
      .storage
      .from(QUESTIONNAIRE_BUCKET)
      .upload(objectPath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (error) {
      await logger.error("Supabase PDF upload failed", { error: error.message, fileName });
      return null;
    }

    const { data } = await (supabase as any)
      .storage
      .from(QUESTIONNAIRE_BUCKET)
      .getPublicUrl(objectPath);

    return data?.publicUrl ?? null;
  } catch (err) {
    await logger.error("Supabase storage error during PDF upload", { error: String(err), fileName });
    return null;
  }
}

/**
 * Store the questionnaire response in Supabase.
 * This is non-critical (failures are logged but don't block the request).
 */
export async function storeQuestionnaireResponse(
  formData: QuestionnaireFormData,
  pdfUrl: string | null,
  clientId?: string,
  pdfGeneratedAt?: string
): Promise<string | null> {
  try {
    const supabase = createServerSupabaseClient(true);
    
    // Validate required fields before attempting insert
    const requiredFields = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      businessName: formData.businessName,
      businessEmail: formData.businessEmail,
      businessPhone: formData.businessPhone,
      sector: formData.sector,
      employeeCount: formData.employeeCount,
      selectedPainPoints: formData.selectedPainPoints,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || (Array.isArray(value) && value.length === 0))
      .map(([key]) => key);

    if (missingFields.length > 0) {
      await logger.error("Missing required fields for Supabase insert", {
        clientId,
        businessName: formData.businessName,
        missingFields,
      });
      return null;
    }

    const insertPayload: Record<string, any> = {
      // Optional external reference for the client/report
      first_name: formData.firstName,
      last_name: formData.lastName,
      business_name: formData.businessName,
      business_email: formData.businessEmail,
      business_phone: formData.businessPhone,
      sector: formData.sector,
      employee_count: formData.employeeCount,
      pain_points: formData.selectedPainPoints,
    };

    // Add optional fields only if they have values
    if (clientId) {
      insertPayload.client_id = clientId;
    }
    if (formData.annualRevenue) {
      insertPayload.annual_revenue = formData.annualRevenue;
    }
    if (formData.budget) {
      insertPayload.budget_range = formData.budget;
    }
    if (formData.timelineToImplement) {
      insertPayload.timeline = formData.timelineToImplement;
    }
    if (pdfUrl) {
      insertPayload.pdf_url = pdfUrl;
    }
    if (pdfGeneratedAt) {
      insertPayload.pdf_generated_at = pdfGeneratedAt;
    }

    await logger.info("Attempting to store questionnaire response", {
      clientId,
      businessName: formData.businessName,
      hasPdfUrl: !!pdfUrl,
      payloadKeys: Object.keys(insertPayload),
      payloadPreview: {
        first_name: insertPayload.first_name,
        business_name: insertPayload.business_name,
        business_email: insertPayload.business_email,
        sector: insertPayload.sector,
        pain_points_count: Array.isArray(insertPayload.pain_points) ? insertPayload.pain_points.length : 0,
      },
    });

    const { data, error } = await (supabase as any)
      .from("questionnaire_responses")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error) {
      await logger.error("Failed to store questionnaire response in Supabase", { 
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        errorHint: error.hint,
        clientId,
        businessName: formData.businessName,
        businessEmail: formData.businessEmail,
        insertPayloadKeys: Object.keys(insertPayload),
        fullError: JSON.stringify(error),
      });
      return null;
    }

    if (!data) {
      await logger.error("Supabase insert returned no data object", {
        clientId,
        businessName: formData.businessName,
        hasError: !!error,
        errorMessage: error?.message,
      });
      return null;
    }

    // Extract ID - Supabase returns { id: ... } when using .single()
    const recordId = data?.id;

    if (!recordId) {
      await logger.error("Supabase insert succeeded but returned no ID", {
        clientId,
        businessName: formData.businessName,
        dataType: typeof data,
        dataIsArray: Array.isArray(data),
        dataStructure: JSON.stringify(data, null, 2),
        dataKeys: data ? Object.keys(data) : [],
        rawData: data,
      });
      return null;
    }

    await logger.info("Successfully stored questionnaire response", {
      clientId,
      storedId: recordId,
      businessName: formData.businessName,
      businessEmail: formData.businessEmail,
    });

    return String(recordId); // Ensure we return a string
  } catch (err) {
    await logger.error("Unexpected error storing questionnaire response in Supabase", { 
      error: String(err),
      errorMessage: err instanceof Error ? err.message : String(err),
      errorStack: err instanceof Error ? err.stack : undefined,
      clientId,
      businessName: formData.businessName,
      businessEmail: formData.businessEmail,
    });
    return null;
  }
}

/**
 * Update the email-sent timestamp for a questionnaire response record.
 */
export async function updateEmailSentTimestamp(
  clientId: string,
  timestamp: string
): Promise<void> {
  try {
    const supabase = createServerSupabaseClient(true);
    const { error } = await (supabase as any)
      .from("questionnaire_responses")
      .update({ email_sent_at: timestamp })
      .eq("id", clientId);

    if (error) {
      await logger.error("Failed to update email sent timestamp", { error: error.message, clientId });
    }
  } catch (err) {
    await logger.error("Unexpected error updating email sent timestamp", { error: String(err), clientId });
  }
}
