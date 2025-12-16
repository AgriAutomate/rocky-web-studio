import { FormData } from "@/lib/types";

export interface SectorSolution {
  solution: string;
  pitch: string;
  budgetRange: string;
}

export const SolutionMap: Record<
  "hospitality" | "trades" | "retail" | "professional",
  SectorSolution
> = {
  hospitality: {
    solution: "Bookings + POS unification",
    pitch: "Streamline bookings, table turns, and POS/PMS data for faster turns and fewer no-shows.",
    budgetRange: "$40k - $90k",
  },
  trades: {
    solution: "Job scheduling + quoting accelerator",
    pitch: "Dispatch, quoting, and routing in one flow; reduce site time and improve win rates.",
    budgetRange: "$30k - $80k",
  },
  retail: {
    solution: "Commerce + inventory alignment",
    pitch: "Unify catalog, fulfillment, and loyalty to lift AOV and repeat purchases.",
    budgetRange: "$35k - $85k",
  },
  professional: {
    solution: "Client portal + delivery enablement",
    pitch: "Proposals, delivery, and reporting in one portal to shorten cycles and improve retention.",
    budgetRange: "$45k - $95k",
  },
};

export function getSectorRecommendation(sector: string, answers: FormData) {
  const fallback: SectorSolution = {
    solution: "Discovery + roadmap",
    pitch: "Clarify goals, systems, and delivery plan before build.",
    budgetRange: "$20k - $50k",
  };

  const map: Record<string, SectorSolution> = SolutionMap;
  const rec = map[sector] ?? fallback;
  return {
    solution: rec.solution,
    estimatedBudget: rec.budgetRange,
    pitch: rec.pitch,
    context: answers.goals ?? "",
  };
}

export function calculatePriority(sector: string, budget: string, timeline: string): "A" | "B" | "C" | "D" {
  let score = 0;

  if (timeline === "rush") score += 30;
  else if (timeline === "60-90") score += 22;
  else if (timeline === "90-120") score += 12;
  else score += 8;

  if (budget.includes("100") || budget.includes("100k") || budget === "100k+") score += 30;
  else if (budget.includes("50")) score += 20;
  else if (budget.includes("20")) score += 12;
  else score += 8;

  if (["hospitality", "retail"].includes(sector)) score += 10;
  if (sector === "professional") score += 8;
  if (sector === "trades") score += 8;

  if (score >= 60) return "A";
  if (score >= 45) return "B";
  if (score >= 30) return "C";
  return "D";
}

export function extractTopPainPoint(sector: string, answers: FormData): string {
  // Prefer sector-specific notes if present
  const sectorNotes = answers.sectorAnswers ?? {};
  const sectorKeys = Object.keys(sectorNotes);
  if (sectorKeys.length) {
    const key = sectorKeys[0]!;
    const first = sectorNotes[key];
    if (first) return String(first);
  }

  // Fallback to universal challenges/goals
  if (answers.challenges) return answers.challenges;
  if (answers.goals) return answers.goals;
  return `Pain point not provided for ${sector}`;
}
