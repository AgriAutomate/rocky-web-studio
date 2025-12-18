import { readFileSync } from "fs";
import { join } from "path";

/**
 * Challenge detail structure matching the PDF template requirements.
 */
export interface ChallengeDetail {
  number: number;
  title: string;
  sections: string[];
  roiTimeline: string;
  projectCostRange: string;
}

/**
 * Parse a challenge markdown file and extract structured data.
 */
function parseChallengeMarkdown(content: string, challengeNumber: number): ChallengeDetail {
  // Extract title (first line after #)
  const titleMatch = content.match(/^# Challenge \d+: (.+)$/m);
  const title = titleMatch?.[1] ?? `Challenge ${challengeNumber}`;

  // Extract problem sections (lines under "## Problem Sections")
  const sectionsMatch = content.match(/## Problem Sections\s*\n([\s\S]*?)(?=\n## |$)/);
  const sectionsText = sectionsMatch?.[1] ?? "";
  const sections = sectionsText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  // Extract ROI Timeline
  const roiMatch = content.match(/## ROI Timeline\s*\n(.+?)(?=\n## |$)/);
  const roiTimeline = roiMatch?.[1]?.trim() ?? "";

  // Extract Project Cost Range
  const costMatch = content.match(/## Project Cost Range\s*\n(.+?)(?=\n## |$)/);
  const projectCostRange = costMatch?.[1]?.trim() ?? "";

  return {
    number: challengeNumber,
    title,
    sections,
    roiTimeline,
    projectCostRange,
  };
}

/**
 * Load all challenge markdown files and build the CHALLENGE_LIBRARY.
 * This function reads markdown files from the challenges directory.
 */
function loadChallengeLibrary(): Record<string, ChallengeDetail> {
  const challengesDir = join(process.cwd(), "lib", "data", "challenges");
  const library: Record<string, ChallengeDetail> = {};

  // Challenge file mapping: challenge number -> filename
  const challengeFiles: Record<number, string> = {
    1: "01-operating-costs.md",
    2: "02-cash-flow.md",
    3: "03-compliance.md",
    4: "04-digital-transform.md",
    5: "05-cybersecurity.md",
    6: "06-labour.md",
    7: "07-demand.md",
    8: "08-market-access.md",
    9: "09-connectivity.md",
    10: "10-leadership.md",
  };

  for (const [challengeNumber, filename] of Object.entries(challengeFiles)) {
    const num = parseInt(challengeNumber, 10);
    const filePath = join(challengesDir, filename);

    try {
      const content = readFileSync(filePath, "utf-8");
      const challenge = parseChallengeMarkdown(content, num);
      library[challengeNumber] = challenge;
    } catch (error) {
      console.error(`Failed to load challenge ${challengeNumber} from ${filename}:`, error);
      // Continue loading other challenges even if one fails
    }
  }

  return library;
}

/**
 * Challenge library loaded from markdown files.
 * This is populated at module load time.
 */
export const CHALLENGE_LIBRARY: Record<string, ChallengeDetail> = loadChallengeLibrary();

/**
 * Export challenge details lookup function for compatibility.
 */
export function getChallengeDetails(ids: number[]): ChallengeDetail[] {
  if (!ids || ids.length === 0) {
    return [];
  }

  const details = ids
    .map((id) => {
      const key = String(id);
      const base = CHALLENGE_LIBRARY[key];
      if (!base) {
        console.warn(`Challenge ID ${id} not found in CHALLENGE_LIBRARY`);
        return null;
      }
      return {
        number: base.number,
        title: base.title,
        sections: base.sections,
        roiTimeline: base.roiTimeline,
        projectCostRange: base.projectCostRange,
      } as ChallengeDetail;
    })
    .filter((c): c is ChallengeDetail => Boolean(c));

  return details;
}

/**
 * Get all available challenge IDs from the library.
 * Useful for validation and debugging.
 */
export function getAllChallengeIds(): number[] {
  return Object.keys(CHALLENGE_LIBRARY).map((key) => parseInt(key, 10));
}

/**
 * Verify that a challenge ID exists in the library.
 */
export function challengeExists(id: number): boolean {
  return CHALLENGE_LIBRARY[String(id)] !== undefined;
}
