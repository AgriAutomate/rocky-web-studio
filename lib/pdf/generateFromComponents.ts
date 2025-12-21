import React from 'react';
import { fetchPDFTemplate } from "./fetchComponents";
import { logger } from "@/lib/utils/logger";
import { renderToBuffer } from '@react-pdf/renderer';
import { QuestionnairePDFDocument } from './PDFDocument';

interface ReportData {
  clientName: string;
  businessName: string;
  sector: string;
  topChallenges: Array<{
    number: number;
    title: string;
    sections: string[];
    roiTimeline: string;
    projectCostRange: string;
  }>;
  generatedDate: string;
}

// Note: HTML formatting functions removed - using React PDF components instead

// Note: HTML assembly function removed - using React PDF components instead
// Future: Can add HTML-based PDF generation using Supabase components if needed

/**
 * Generate PDF from Supabase components using @react-pdf/renderer
 * 
 * This function:
 * 1. Fetches the template and components from Supabase
 * 2. Assembles the data
 * 3. Generates PDF using React PDF components
 * 4. Returns PDF buffer for email attachment
 */
export async function generatePDFFromComponents(
  templateKey: string,
  reportData: ReportData
): Promise<Buffer> {
  try {
    await logger.info("Generating PDF from Supabase components", {
      templateKey,
      businessName: reportData.businessName,
    });

    // 1. Fetch template (optional - for future component-based rendering)
    // For now, we'll use the React PDF component directly
    // But we can enhance this later to use Supabase components
    const template = await fetchPDFTemplate(templateKey);
    
    // 2. If template exists, we could fetch and use components
    // For now, we'll use the React PDF component with the report data
    if (template) {
      await logger.info("Template found, using component-based rendering", {
        templateKey,
        componentCount: template.component_keys.length,
      });
      
      // Future: Use components from Supabase to build PDF
      // For now, fall through to React PDF component
    }

    // 3. Generate PDF using React PDF
    // Create the PDF document element
    const pdfDocumentElement = React.createElement(QuestionnairePDFDocument, {
      clientName: reportData.clientName,
      businessName: reportData.businessName,
      sector: reportData.sector,
      generatedDate: reportData.generatedDate,
      topChallenges: reportData.topChallenges,
    });
    
    // Render to PDF buffer
    const pdfBuffer = await renderToBuffer(pdfDocumentElement as any);

    await logger.info("PDF generated successfully", {
      templateKey,
      pdfSize: pdfBuffer.length,
      businessName: reportData.businessName,
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    await logger.error("Failed to generate PDF from components", {
      error: String(error),
      templateKey,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Generate PDF using Puppeteer (if available)
 * 
 * This is a placeholder - you'll need to install puppeteer-core and @sparticuz/chromium
 * and configure it for your environment (Vercel vs local)
 * 
 * @param _html - HTML content to convert to PDF
 * @param _options - PDF generation options
 */
export async function generatePDFBufferFromHTML(
  _html: string,
  _options: {
    pageSize?: string;
    orientation?: string;
    margins?: { top: number; right: number; bottom: number; left: number };
  } = {}
): Promise<Buffer> {
  // This is a placeholder - implement based on your PDF library choice
  throw new Error(
    "PDF generation not yet implemented. " +
    "Choose a library: puppeteer, @react-pdf/renderer, or external API service."
  );
}
