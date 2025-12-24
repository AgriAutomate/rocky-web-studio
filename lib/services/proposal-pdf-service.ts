/**
 * Proposal PDF Generation Service
 * 
 * Generates proposal PDFs using react-pdf/renderer from ProposalData
 */

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { ProposalPDFDocument } from '@/lib/pdf/ProposalPDFDocument';
import type { ProposalData } from '@/lib/types/proposal';
import { logger } from '@/lib/utils/logger';

/**
 * Generate proposal PDF from ProposalData
 * 
 * @param data - Shaped ProposalData object from proposal-data-service
 * @returns Promise<Buffer> - PDF buffer ready to be returned as response
 * 
 * @throws Error if PDF generation fails
 */
export async function generateProposalPdf(
  data: ProposalData
): Promise<Buffer> {
  try {
    await logger.info("Generating proposal PDF", {
      proposalId: data.metadata.proposalId,
      businessName: data.client.businessName,
    });

    // Create the PDF document element using React.createElement
    const pdfDocumentElement = React.createElement(ProposalPDFDocument, {
      data,
    });

    // Render to PDF buffer
    const pdfBuffer = await renderToBuffer(pdfDocumentElement as any);

    await logger.info("Proposal PDF generated successfully", {
      proposalId: data.metadata.proposalId,
      pdfSize: pdfBuffer.length,
      businessName: data.client.businessName,
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    await logger.error("Failed to generate proposal PDF", {
      proposalId: data?.metadata?.proposalId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
