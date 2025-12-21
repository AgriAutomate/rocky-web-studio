import { readFileSync, existsSync } from "fs";
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
      // Check if file exists before reading
      if (!existsSync(filePath)) {
        console.error(`Challenge file not found: ${filePath}`);
        // Create a fallback challenge to prevent complete failure
        library[challengeNumber] = {
          number: num,
          title: `Challenge ${num}`,
          sections: [`Challenge ${num} content not available`],
          roiTimeline: "TBD",
          projectCostRange: "TBD",
        };
        continue;
      }

      const content = readFileSync(filePath, "utf-8");
      const challenge = parseChallengeMarkdown(content, num);
      library[challengeNumber] = challenge;
    } catch (error) {
      console.error(`Failed to load challenge ${challengeNumber} from ${filename}:`, error);
      // Create fallback challenge to prevent complete failure
      library[challengeNumber] = {
        number: num,
        title: `Challenge ${num}`,
        sections: [`Challenge ${num} content not available`],
        roiTimeline: "TBD",
        projectCostRange: "TBD",
      };
    }
  }

  return library;
}

/**
 * Challenge library loaded from markdown files.
 * Lazy-loaded to prevent module load failures from crashing the API route.
 */
let CHALLENGE_LIBRARY_CACHE: Record<string, ChallengeDetail> | null = null;

function getChallengeLibrary(): Record<string, ChallengeDetail> {
  if (CHALLENGE_LIBRARY_CACHE === null) {
    try {
      CHALLENGE_LIBRARY_CACHE = loadChallengeLibrary();
    } catch (error) {
      console.error("Failed to load challenge library:", error);
      // Return empty library to prevent complete failure
      CHALLENGE_LIBRARY_CACHE = {};
    }
  }
  return CHALLENGE_LIBRARY_CACHE;
}

// Export as a getter function instead of a constant to prevent module load failures
export function getChallengeLibraryExport(): Record<string, ChallengeDetail> {
  return getChallengeLibrary();
}

// For backward compatibility, export a getter that looks like a constant
// This prevents module load errors while maintaining compatibility
export const CHALLENGE_LIBRARY = new Proxy({} as Record<string, ChallengeDetail>, {
  get(_target, prop) {
    const library = getChallengeLibrary();
    return library[prop as string];
  },
  ownKeys() {
    return Object.keys(getChallengeLibrary());
  },
  has(_target, prop) {
    return prop in getChallengeLibrary();
  },
  getOwnPropertyDescriptor(_target, prop) {
    const library = getChallengeLibrary();
    if (prop in library) {
      return {
        enumerable: true,
        configurable: true,
        value: library[prop as string],
      };
    }
    return undefined;
  },
});

/**
 * Export challenge details lookup function for compatibility.
 * Returns challenges sorted numerically by challenge number.
 */
export function getChallengeDetails(ids: number[]): ChallengeDetail[] {
  if (!ids || ids.length === 0) {
    return [];
  }

  const library = getChallengeLibrary();
  const details = ids
    .map((id) => {
      const key = String(id);
      const base = library[key];
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
    .filter((c): c is ChallengeDetail => Boolean(c))
    .sort((a, b) => a.number - b.number); // Sort numerically by challenge number

  return details;
}

/**
 * Get all available challenge IDs from the library.
 * Useful for validation and debugging.
 */
export function getAllChallengeIds(): number[] {
  const library = getChallengeLibrary();
  return Object.keys(library).map((key) => parseInt(key, 10));
}

/**
 * Verify that a challenge ID exists in the library.
 */
export function challengeExists(id: number): boolean {
  const library = getChallengeLibrary();
  return library[String(id)] !== undefined;
}
