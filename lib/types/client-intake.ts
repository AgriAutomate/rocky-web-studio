import type { QuestionnaireFormData } from "./questionnaire";

/**
 * Client Record Type
 * 
 * Extends QuestionnaireFormData with additional client management fields
 * for tracking client status, PDF generation, and sales pipeline.
 */
export interface ClientRecord extends QuestionnaireFormData {
  /** Unique identifier (UUID) */
  id: string;
  
  /** Timestamp when record was created */
  createdAt: Date;
  
  /** Timestamp when record was last updated */
  updatedAt: Date;
  
  /** PDF generation status */
  pdf_generation_status: 'pending' | 'processing' | 'completed' | 'failed';
  
  /** URL to generated PDF (if available) */
  pdf_url: string | null;
  
  /** Timestamp when PDF was generated */
  pdf_generated_at: Date | null;
  
  /** Current stage in sales pipeline */
  sales_stage: 'lead' | 'qualified' | 'proposal' | 'won' | 'lost';
  
  /** User ID or email of assigned sales rep/staff member */
  assigned_to: string | null;
  
  /** Internal notes about the client */
  notes: string | null;
}

/**
 * Type guard to check if an object is a ClientRecord
 */
export function isClientRecord(obj: any): obj is ClientRecord {
  return (
    obj &&
    typeof obj.id === 'string' &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date &&
    typeof obj.pdf_generation_status === 'string' &&
    ['pending', 'processing', 'completed', 'failed'].includes(obj.pdf_generation_status) &&
    typeof obj.sales_stage === 'string' &&
    ['lead', 'qualified', 'proposal', 'won', 'lost'].includes(obj.sales_stage)
  );
}
