import type { PainPoint } from "@/lib/types/questionnaire";

/**
 * Maps pain points (from form q4) to challenge IDs (1-10) in CHALLENGE_LIBRARY.
 * 
 * This mapping connects user-selected challenges to the predefined challenge
 * content in the PDF report.
 */
export const painPointToChallengeMap: Record<PainPoint, number> = {
  "high-operating-costs": 1,        // → Challenge 1: "Reduce Operational Costs"
  "cash-flow-strain": 2,            // → Challenge 2: "Improve Revenue & Conversions"
  "regulatory-compliance": 3,       // → Challenge 3: "Complex Regulatory & Compliance Burdens"
  "digital-transformation": 4,      // → Challenge 4: "Modernise Digital Experience"
  "cybersecurity": 5,               // → Challenge 5: "Cybersecurity Threats"
  "labour-shortages": 6,            // → Challenge 6: "Labour Shortages & Rising Wage Costs"
  "reduced-demand": 7,              // → Challenge 7: "Brand & Market Positioning"
  "market-access": 8,               // → Challenge 8: "Innovation & New Service Development"
  "connectivity": 9,                // → Challenge 9: "Digital Connectivity Limitations"
  "lack-of-leadership": 10,         // → Challenge 10: "Team Capability & Culture"
};

/**
 * Convert user-selected pain points to challenge IDs for PDF generation.
 * 
 * @param painPoints - Array of pain points selected by user (from q4)
 * @param maxChallenges - Maximum number of challenges to return (default: 3)
 * @returns Array of challenge IDs (1-10) to include in PDF
 */
export function painPointsToChallengeIds(
  painPoints: PainPoint[],
  maxChallenges: number = 3
): number[] {
  if (!painPoints || painPoints.length === 0) {
    return [];
  }

  // Map pain points to challenge IDs
  const challengeIds = painPoints
    .map((painPoint) => painPointToChallengeMap[painPoint])
    .filter((id): id is number => id !== undefined);

  // Remove duplicates and limit to maxChallenges
  const uniqueIds = Array.from(new Set(challengeIds));
  return uniqueIds.slice(0, maxChallenges);
}

/**
 * Get challenge IDs from user selections.
 * Note: Sector fallback is handled in the API route, not here.
 * 
 * @param selectedPainPoints - User-selected pain points (from form)
 * @param maxChallenges - Maximum challenges to return
 * @returns Array of challenge IDs
 */
export function getUserChallengeIds(
  selectedPainPoints: PainPoint[] | undefined,
  maxChallenges: number = 3
): number[] {
  if (!selectedPainPoints || selectedPainPoints.length === 0) {
    return [];
  }

  return painPointsToChallengeIds(selectedPainPoints, maxChallenges);
}
