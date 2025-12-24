/**
 * Proposal PDF Generator Service
 * 
 * This service generates proposal PDFs from questionnaire response data,
 * including audit results and discovery tree information.
 * 
 * This is a wrapper that:
 * 1. Fetches and shapes data using proposal-data-service
 * 2. Generates PDF using proposal-pdf-service
 */

import { getProposalData } from "@/lib/services/proposal-data-service";
import { generateProposalPdf as generatePdfFromData } from "@/lib/services/proposal-pdf-service";
import { logger } from "@/lib/utils/logger";

/**
 * Generate a proposal PDF from questionnaire response data
 * 
 * @param responseData - Complete questionnaire response record including:
 *   - Basic fields (business_name, first_name, sector, etc.)
 *   - audit_results (JSONB) - Website audit data
 *   - discovery_tree (JSONB) - Discovery tree data
 *   - sector_specific_data (JSONB) - Sector-specific answers
 *   - business_profile (JSONB) - Business profile data
 *   - goals (JSONB) - Selected goals
 *   - primary_offers (JSONB) - Primary offers
 * 
 * @returns Promise<Buffer> - PDF buffer ready to be returned as response
 * 
 * @throws Error if PDF generation fails
 */
export async function generateProposalPdf(
  responseData: any
): Promise<Buffer> {
  try {
    await logger.info("Generating proposal PDF", {
      questionnaireResponseId: responseData.id,
      businessName: responseData.business_name,
    });

    // Step 1: Fetch and shape data into ProposalData
    const proposalData = await getProposalData(responseData.id);

    // Step 2: Generate PDF from ProposalData
    const pdfBuffer = await generatePdfFromData(proposalData);

    await logger.info("Proposal PDF generated successfully", {
      questionnaireResponseId: responseData.id,
      bufferSize: pdfBuffer.length,
      businessName: responseData.business_name,
    });

    return pdfBuffer;
  } catch (error) {
    await logger.error("Failed to generate proposal PDF", {
      questionnaireResponseId: responseData?.id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
