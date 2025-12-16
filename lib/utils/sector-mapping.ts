import type { Sector } from "@/lib/types/questionnaire";
import { sectorChallengeMap } from "@/lib/utils/sectorMapping";

/**
 * Get the top 2-3 challenge IDs for a given sector based on the predefined mapping.
 */
export function getTopChallengesForSector(sector: Sector): number[] {
  const ids = sectorChallengeMap[sector];
  if (!ids || ids.length === 0) return [];
  // Ensure we only take the first 3 entries as "top" challenges
  return ids.slice(0, 3);
}

/**
 * Format a sector key (e.g. "professional-services") into a human-readable
 * label (e.g. "Professional Services").
 */
export function formatSectorName(sector: Sector): string {
  return sector
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
