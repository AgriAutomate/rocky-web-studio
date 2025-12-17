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
    const { data, error } = await (supabase as any)
      .from("questionnaire_responses")
      .insert({
        // Optional external reference for the client/report
        client_id: clientId ?? undefined,
        first_name: formData.firstName,
        last_name: formData.lastName,
        business_name: formData.businessName,
        business_email: formData.businessEmail,
        business_phone: formData.businessPhone,
        sector: formData.sector,
        annual_revenue: formData.annualRevenue,
        employee_count: formData.employeeCount,
        pain_points: formData.selectedPainPoints,
        budget_range: formData.budget,
        timeline: formData.timelineToImplement,
        pdf_url: pdfUrl,
        pdf_generated_at: pdfGeneratedAt ?? null,
        // email_sent_at is set later by updateEmailSentTimestamp
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      await logger.error("Failed to store questionnaire response in Supabase", { 
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        errorHint: error.hint,
        formDataKeys: Object.keys(formData),
      });
      return null;
    }

    if (!data || !data.id) {
      await logger.error("Supabase insert succeeded but returned no ID", {
        data,
        formDataKeys: Object.keys(formData),
      });
      return null;
    }

    return data.id;
  } catch (err) {
    await logger.error("Unexpected error storing questionnaire response in Supabase", { 
      error: String(err),
      errorMessage: err instanceof Error ? err.message : String(err),
      errorStack: err instanceof Error ? err.stack : undefined,
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
