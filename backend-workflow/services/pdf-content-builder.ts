/**
 * PDF Content Builder Service
 * 
 * Centralized service for building PDF content from questionnaire responses.
 * Provides functions for composing PDF templates and computing response summaries.
 */

import { generatePDFFromComponents } from "@/lib/pdf/generateFromComponents";
import type { QuestionnaireFormData } from "@/lib/types/questionnaire";
import { getChallengeDetails } from "@/lib/data/challenges";
import { painPointsToChallengeIds } from "@/lib/utils/pain-point-to-challenge";
import { formatSectorName } from "@/lib/utils/sector-mapping";
import type { SectorDefinition } from "@/backend-workflow/types/sectors";

/**
 * Response Summary Data
 * 
 * Structured data extracted from a questionnaire response
 * for use in PDF generation and reporting.
 */
export interface ResponseSummary {
  /** Client's first name */
  clientName: string;
  
  /** Business name */
  businessName: string;
  
  /** Formatted sector name */
  sector: string;
  
  /** Selected goals (array of goal slugs) */
  goals: string[];
  
  /** Selected challenges (array of challenge IDs) */
  challenges: number[];
  
  /** Challenge details with full information */
  challengeDetails: Array<{
    number: number;
    title: string;
    sections: string[];
    roiTimeline: string;
    projectCostRange: string;
  }>;
  
  /** Selected primary offers (array of offer slugs) */
  primaryOffers?: string[];
  
  /** Generation date (YYYY-MM-DD) */
  generatedDate: string;
}

/**
 * Compose PDF Template
 * 
 * Wrapper around the existing PDF generation function.
 * Generates a PDF from Supabase components using the specified template.
 * 
 * @param templateKey - Template key (e.g., 'questionnaire-report')
 * @param reportData - Report data to include in PDF
 * @returns PDF buffer
 */
export async function composePDFTemplate(
  templateKey: string,
  reportData: {
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
    selectedGoals?: string[];
    selectedPrimaryOffers?: string[];
    generatedDate: string;
  }
): Promise<Buffer> {
  return generatePDFFromComponents(templateKey, reportData);
}

/**
 * Build CQ Advantage Section
 * 
 * Creates the Central Queensland Advantage section content for PDF generation.
 * This section includes localized competitive intelligence that positions RWS services
 * as non-negotiable solutions for the client's specific market.
 * 
 * Structure:
 * - Heading: "The Central Queensland Advantage"
 * - Subheading: "The Local Reality" → uses cqInsiderInsight
 * - Subheading: "Where Your Competitors Are Failing" → uses localCompetitorFailure
 * - Subheading: "How You Win: The Non-Negotiable Upgrade" → uses rwsSurvivalKit
 * 
 * @param sectorDefinition - Sector definition with strategic intelligence
 * @param sectorSpecificOverride - Optional override for sector-specific custom copy
 * @returns Formatted CQ Advantage section content
 */
export function buildCQAdvantageSection(
  sectorDefinition: SectorDefinition,
  sectorSpecificOverride?: {
    cqInsiderInsight?: string;
    localCompetitorFailure?: string;
    rwsSurvivalKit?: string;
  }
): {
  cqInsiderInsight: string;
  localCompetitorFailure: string;
  rwsSurvivalKit: string;
} | null {
  // Return null if sector definition doesn't have strategic intelligence
  if (!sectorDefinition.cqInsiderInsight || !sectorDefinition.localCompetitorFailure || !sectorDefinition.rwsSurvivalKit) {
    return null;
  }

  // Use override if provided, otherwise use sector definition
  return {
    cqInsiderInsight: sectorSpecificOverride?.cqInsiderInsight || sectorDefinition.cqInsiderInsight,
    localCompetitorFailure: sectorSpecificOverride?.localCompetitorFailure || sectorDefinition.localCompetitorFailure,
    rwsSurvivalKit: sectorSpecificOverride?.rwsSurvivalKit || sectorDefinition.rwsSurvivalKit,
  };
}

/**
 * Compute Response Summary
 * 
 * Extracts and structures data from a questionnaire response
 * for use in PDF generation and reporting.
 * 
 * @param response - Questionnaire form data
 * @param rawBody - Raw request body (for extracting q3, q5 arrays)
 * @returns Structured response summary
 */
export function computeResponseSummary(
  response: QuestionnaireFormData,
  rawBody?: Record<string, any>
): ResponseSummary {
  // Extract goals and primary offers from raw body (q3 and q5)
  const selectedGoals = Array.isArray(rawBody?.q3) 
    ? rawBody.q3 
    : (rawBody?.q3 ? [rawBody.q3] : []);
  
  const selectedPrimaryOffers = Array.isArray(rawBody?.q5) 
    ? rawBody.q5 
    : (rawBody?.q5 ? [rawBody.q5] : []);

  // Map pain points to challenge IDs
  const challengeIds = response.selectedPainPoints && response.selectedPainPoints.length > 0
    ? painPointsToChallengeIds(response.selectedPainPoints, 100) // Get ALL challenges
    : [];

  // Get challenge details
  const challengeDetails = getChallengeDetails(challengeIds);

  // Format sector name
  const sector = formatSectorName(response.sector);

  return {
    clientName: response.firstName,
    businessName: response.businessName,
    sector,
    goals: selectedGoals,
    challenges: challengeIds,
    challengeDetails,
    primaryOffers: selectedPrimaryOffers,
    generatedDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
  };
}
