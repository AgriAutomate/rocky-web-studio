import { createServerSupabaseClient } from "@/lib/supabase/client";
import type { QuestionnaireFormData } from "@/lib/types/questionnaire";
import { logger } from "@/lib/utils/logger";
import { painPointsToChallengeIds } from "@/lib/utils/pain-point-to-challenge";

const QUESTIONNAIRE_BUCKET = "rockywebstudio";
const QUESTIONNAIRE_STORAGE_PATH = "questionnaire-reports";

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
    await logger.info("Uploading PDF to storage", {
      bucket: QUESTIONNAIRE_BUCKET,
      fileName,
      bufferSize: buffer.length,
      storagePath: QUESTIONNAIRE_STORAGE_PATH,
    });

    const supabase = createServerSupabaseClient(true);
    // Path format: questionnaire-reports/[filename].pdf
    const objectPath = `${QUESTIONNAIRE_STORAGE_PATH}/${fileName}`;

    await logger.info("Attempting Supabase storage upload", {
      bucket: QUESTIONNAIRE_BUCKET,
      objectPath,
      bufferLength: buffer.length,
      contentType: "application/pdf",
    });

    const { data: uploadData, error } = await (supabase as any)
      .storage
      .from(QUESTIONNAIRE_BUCKET)
      .upload(objectPath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (error) {
      await logger.error("Supabase PDF upload failed", {
        error: error.message,
        errorCode: error.statusCode,
        errorDetails: error.error,
        fileName,
        bucket: QUESTIONNAIRE_BUCKET,
        objectPath,
        bufferSize: buffer.length,
        fullError: JSON.stringify(error),
      });
      return null;
    }

    await logger.info("PDF upload succeeded, getting public URL", {
      fileName,
      bucket: QUESTIONNAIRE_BUCKET,
      objectPath,
      uploadData: uploadData ? JSON.stringify(uploadData) : "null",
    });

    const { data: urlData } = await (supabase as any)
      .storage
      .from(QUESTIONNAIRE_BUCKET)
      .getPublicUrl(objectPath);

    const publicUrl = urlData?.publicUrl ?? null;

    if (!publicUrl) {
      await logger.error("Failed to get public URL after successful upload", {
        fileName,
        bucket: QUESTIONNAIRE_BUCKET,
        objectPath,
        urlData: urlData ? JSON.stringify(urlData) : "null",
      });
      return null;
    }

    await logger.info("PDF upload succeeded", {
      fileName,
      publicUrl,
      bucket: QUESTIONNAIRE_BUCKET,
      objectPath,
    });

    return publicUrl;
  } catch (err) {
    await logger.error("Supabase storage error during PDF upload", {
      error: String(err),
      errorMessage: err instanceof Error ? err.message : String(err),
      errorStack: err instanceof Error ? err.stack : undefined,
      fileName,
      bucket: QUESTIONNAIRE_BUCKET,
      bufferSize: buffer.length,
    });
    return null;
  }
}

/**
 * Store the questionnaire response in Supabase.
 * This is non-critical (failures are logged but don't block the request).
 */
export async function storeQuestionnaireResponse(
  formData: QuestionnaireFormData,
  utmSource?: string | null,
  utmCampaign?: string | null
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
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      await logger.error("Missing required fields for Supabase insert", {
        businessName: formData.businessName,
        missingFields,
      });
      return null;
    }

    // Derive challenges from pain points (map pain points to challenge IDs)
    const challenges = formData.selectedPainPoints && formData.selectedPainPoints.length > 0
      ? painPointsToChallengeIds(formData.selectedPainPoints, 3)
      : [];

    const insertPayload: Record<string, any> = {
      // Required fields
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.businessEmail,
      phone: formData.businessPhone,
      company_name: formData.businessName,
      sector: formData.sector,
      pain_points: formData.selectedPainPoints || [],
      challenges: challenges,
      status: 'submitted',
    };

    // Add optional fields only if they have values
    if (formData.additionalContext) {
      insertPayload.job_description = formData.additionalContext;
    }
    if (utmSource) {
      insertPayload.utm_source = utmSource;
    }
    if (utmCampaign) {
      insertPayload.utm_campaign = utmCampaign;
    }

    await logger.info("Attempting to store questionnaire response", {
      businessName: formData.businessName,
      payloadKeys: Object.keys(insertPayload),
      payloadPreview: {
        first_name: insertPayload.first_name,
        last_name: insertPayload.last_name,
        email: insertPayload.email,
        company_name: insertPayload.company_name,
        sector: insertPayload.sector,
        pain_points_count: Array.isArray(insertPayload.pain_points) ? insertPayload.pain_points.length : 0,
        challenges_count: Array.isArray(insertPayload.challenges) ? insertPayload.challenges.length : 0,
        status: insertPayload.status,
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
        businessName: formData.businessName,
        businessEmail: formData.businessEmail,
        insertPayloadKeys: Object.keys(insertPayload),
        fullError: JSON.stringify(error),
      });
      return null;
    }

    if (!data) {
      await logger.error("Supabase insert returned no data object", {
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

/**
 * Store a service lead in Supabase.
 * 
 * @param formData - Service lead form data with the following fields:
 *   - firstName: string (required)
 *   - lastName: string (required)
 *   - email: string (required)
 *   - phone: string (required)
 *   - serviceType: string | null (optional)
 *   - urgency: 'today' | 'next_48h' | 'next_week' | null (optional)
 *   - location: string | null (optional)
 *   - description: string | null (optional)
 * @returns The ID of the inserted record as a string, or null if insertion failed
 */
export async function storeServiceLead(
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    serviceType?: string | null;
    urgency?: 'today' | 'next_48h' | 'next_week' | null;
    location?: string | null;
    description?: string | null;
  }
): Promise<string | null> {
  try {
    const supabase = createServerSupabaseClient(true);
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      await logger.error("[SERVICE_LEAD] Missing required fields for service lead insert", {
        hasFirstName: !!formData.firstName,
        hasLastName: !!formData.lastName,
        hasEmail: !!formData.email,
        hasPhone: !!formData.phone,
      });
      return null;
    }

    // Determine if urgent based on urgency field
    const isUrgent = formData.urgency === 'today';

    const insertPayload: Record<string, any> = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      status: 'new',
      is_urgent: isUrgent,
    };

    // Add optional fields only if they have values
    if (formData.serviceType) {
      insertPayload.service_type = formData.serviceType;
    }
    if (formData.urgency) {
      insertPayload.urgency = formData.urgency;
    }
    if (formData.location) {
      insertPayload.location = formData.location;
    }
    if (formData.description) {
      insertPayload.description = formData.description;
    }

    await logger.info("[SERVICE_LEAD] Attempting to store service lead", {
      email: formData.email,
      serviceType: formData.serviceType,
      urgency: formData.urgency,
      isUrgent,
      payloadKeys: Object.keys(insertPayload),
    });

    const { data, error } = await (supabase as any)
      .from("service_leads")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error) {
      await logger.error("[SERVICE_LEAD] Failed to store service lead in Supabase", { 
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        errorHint: error.hint,
        email: formData.email,
        insertPayloadKeys: Object.keys(insertPayload),
        fullError: JSON.stringify(error),
      });
      return null;
    }

    if (!data) {
      await logger.error("[SERVICE_LEAD] Supabase insert returned no data object", {
        email: formData.email,
        hasError: !!error,
        errorMessage: error?.message,
      });
      return null;
    }

    // Extract ID - Supabase returns { id: ... } when using .single()
    const recordId = data?.id;

    if (!recordId) {
      await logger.error("[SERVICE_LEAD] Supabase insert succeeded but returned no ID", {
        email: formData.email,
        dataType: typeof data,
        dataIsArray: Array.isArray(data),
        dataStructure: JSON.stringify(data, null, 2),
        dataKeys: data ? Object.keys(data) : [],
        rawData: data,
      });
      return null;
    }

    await logger.info("[SERVICE_LEAD] Successfully stored service lead", {
      storedId: recordId,
      email: formData.email,
      serviceType: formData.serviceType,
    });

    return String(recordId); // Ensure we return a string
  } catch (err) {
    await logger.error("[SERVICE_LEAD] Unexpected error storing service lead in Supabase", { 
      error: String(err),
      errorMessage: err instanceof Error ? err.message : String(err),
      errorStack: err instanceof Error ? err.stack : undefined,
      email: formData.email,
    });
    return null;
  }
}
