import { Sector } from "@/lib/types/questionnaire";

/**
 * Maps each sector to the most relevant challenge identifiers (by index number from brief).
 * These identifiers can be used to pick detailed copy in the PDF/email.
 */
export const sectorChallengeMap: Record<Sector, number[]> = {
  healthcare: [3, 5, 6],
  manufacturing: [1, 6, 4],
  mining: [3, 5, 9],
  agriculture: [1, 8, 2],
  retail: [7, 4, 1],
  hospitality: [7, 6, 2],
  "professional-services": [2, 4, 10],
  construction: [1, 2, 3],
  other: [4, 1, 10],
};
