/**
 * PDF Generator Utility
 * 
 * Re-exports PDF generation functions from lib/pdf/generateFromComponents.ts
 * for expected import paths in backend workflow.
 * 
 * This file provides the expected `app/backend-workflow/utils/pdf-generator.ts` location
 * while maintaining backward compatibility with `lib/pdf/generateFromComponents.ts`.
 */

// Re-export PDF generation function
export { generatePDFFromComponents } from "@/lib/pdf/generateFromComponents";
