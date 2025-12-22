/**
 * Client Intake Types
 * 
 * Type definitions for questionnaire responses and client records.
 * Re-exports from lib/types for backend workflow consistency.
 */

// Re-export ClientRecord from lib/types
export type { ClientRecord, isClientRecord } from "@/lib/types/client-intake";

// Re-export QuestionnaireFormData as QuestionnaireResponse for consistency
export type { QuestionnaireFormData as QuestionnaireResponse } from "@/lib/types/questionnaire";

// Also export QuestionnaireFormData for backward compatibility
export type { QuestionnaireFormData } from "@/lib/types/questionnaire";
