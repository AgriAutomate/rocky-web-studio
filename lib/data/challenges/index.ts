import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Challenge detail structure matching the PDF template requirements.
 */
export interface ChallengeDetail {
  number: number;
  title: string;
  sections: string[];
  problems: string[]; // Broken down into bullet points
  solutions: string[]; // Actionable solutions for tick-and-flick approval
  roiTimeline: string;
  projectCostRange: string;
}

/**
 * Break long paragraphs into bullet points by splitting on sentence boundaries only.
 * Keeps complete sentences together and avoids splitting on commas or mid-sentence.
 */
function breakIntoBulletPoints(text: string): string[] {
  if (!text || text.trim().length === 0) return [];
  
  // First, normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  // Split only on sentence boundaries (period, exclamation, question mark followed by space and capital letter)
  // This ensures we only split complete sentences, not fragments
  const sentences = text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  // If we have very long sentences (>200 chars), we can optionally split on semicolons
  // but only if they're clearly separating independent clauses
  const bullets: string[] = [];
  for (const sentence of sentences) {
    if (sentence.length > 200 && sentence.includes(';')) {
      // Split on semicolons only if both parts are substantial
      const parts = sentence.split(/\s*;\s+/);
      const validParts = parts.filter(p => p.trim().length > 30); // Only keep substantial parts
      if (validParts.length > 1) {
        bullets.push(...validParts.map(p => p.trim()));
      } else {
        bullets.push(sentence);
      }
    } else {
      bullets.push(sentence);
    }
  }
  
  // Filter out very short fragments (likely from parsing errors)
  return bullets.filter(b => b.length > 20 && b.match(/[a-zA-Z]/)); // At least 20 chars and contains letters
}

/**
 * Extract solutions from text that mentions "Rocky Web Studio addresses" or similar patterns.
 */
function extractSolutions(text: string): string[] {
  if (!text) return [];
  
  // Look for solution patterns
  const solutionPatterns = [
    /Rocky Web Studio addresses this through\s+([^.]*(?:\.[^.]*)*)/i,
    /addresses this through\s+([^.]*(?:\.[^.]*)*)/i,
    /solutions? include\s+([^.]*(?:\.[^.]*)*)/i,
    /we provide\s+([^.]*(?:\.[^.]*)*)/i,
  ];
  
  let solutionsText = "";
  for (const pattern of solutionPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      solutionsText = match[1];
      break;
    }
  }
  
  if (!solutionsText) return [];
  
  // Split solutions by common separators
  const solutions = solutionsText
    .split(/(?:\s*\([^)]+\)\s*)?\s*,\s*(?=[A-Z])|(?:\s+and\s+)(?=[A-Z])/i)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.match(/^(and|or|with|including)$/i));
  
  // Clean up solution text (remove parentheticals, format)
  return solutions
    .map(s => {
      // Remove parenthetical cost/time details for cleaner bullets
      s = s.replace(/\s*\([^)]+\)\s*/g, ' ');
      // Capitalize first letter
      return s.charAt(0).toUpperCase() + s.slice(1).trim();
    })
    .filter(s => s.length > 15); // Only keep substantial solutions
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
  
  // Keep original sections for backward compatibility
  const sections = sectionsText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
  
  // Break down into problems (bullet points)
  const problems: string[] = [];
  const solutions: string[] = [];
  
  // Process each paragraph - split on double newlines to get actual paragraphs
  const paragraphs = sectionsText
    .split(/\n\s*\n/)
    .map(p => p.replace(/\n/g, ' ').trim()) // Replace single newlines with spaces
    .filter(p => p.length > 0);
  
  for (const paragraph of paragraphs) {
    // Check if this paragraph contains solutions
    if (paragraph.match(/Rocky Web Studio|addresses this|solutions? include|we provide/i)) {
      const extracted = extractSolutions(paragraph);
      solutions.push(...extracted);
    } else {
      // This is a problem paragraph - break it into bullets
      // Only split on sentence boundaries, keep complete thoughts together
      const bullets = breakIntoBulletPoints(paragraph);
      if (bullets.length > 0) {
        problems.push(...bullets);
      } else {
        // Fallback: if parsing fails, use the whole paragraph as one bullet
        problems.push(paragraph);
      }
    }
  }
  
  // If no solutions extracted, try to extract from the full text
  if (solutions.length === 0) {
    const allSolutions = extractSolutions(sectionsText);
    solutions.push(...allSolutions);
  }
  
  // Fallback: if still no solutions, use a generic message
  if (solutions.length === 0) {
    solutions.push("Custom solution tailored to your business needs");
  }

  // Extract ROI Timeline
  const roiMatch = content.match(/## ROI Timeline\s*\n(.+?)(?=\n## |$)/);
  const roiTimeline = roiMatch?.[1]?.trim() ?? "";

  // Extract Project Cost Range
  const costMatch = content.match(/## Project Cost Range\s*\n(.+?)(?=\n## |$)/);
  const projectCostRange = costMatch?.[1]?.trim() ?? "";

  return {
    number: challengeNumber,
    title,
    sections, // Keep for backward compatibility
    problems: problems.length > 0 ? problems : (sections.length > 0 ? sections : ["Challenge details not available"]), // Fallback to sections if parsing fails
    solutions: solutions.length > 0 ? solutions : ["Custom solution tailored to your business needs"],
    roiTimeline: roiTimeline || "TBD",
    projectCostRange: projectCostRange || "TBD",
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
          problems: [`Challenge ${num} content not available`],
          solutions: ["Custom solution tailored to your business needs"],
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
        problems: [`Challenge ${num} content not available`],
        solutions: ["Custom solution tailored to your business needs"],
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
        problems: base.problems || base.sections, // Fallback for backward compatibility
        solutions: base.solutions || ["Custom solution tailored to your business needs"],
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
