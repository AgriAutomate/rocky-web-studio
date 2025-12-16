import { ZodError } from "zod";
import { questionnaireSchema, type QuestionnaireInput } from "@/lib/validators";

/**
 * Safely validate the questionnaire submission payload.
 * Returns either a typed value or a structured list of validation errors.
 */
export function validateQuestionnaireFormSafe(body: unknown): {
  success: true;
  data: QuestionnaireInput;
} | {
  success: false;
  error: ZodError;
} {
  const result = questionnaireSchema.safeParse(body);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, data: result.data };
}

/**
 * Convert Zod validation errors into a single human-readable string.
 */
export function formatValidationErrors(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join("; ");
}
