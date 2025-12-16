import { FormData, TriageScore } from "./types";

function scoreBudget(budgetRange: string) {
  if (!budgetRange) return 0;
  if (budgetRange.includes("100k") || budgetRange.includes("80")) return 30;
  if (budgetRange.includes("50")) return 20;
  if (budgetRange.includes("20")) return 10;
  return 5;
}

function scoreTimeline(timeline: string) {
  if (!timeline) return 0;
  if (timeline.toLowerCase().includes("rush") || timeline.includes("30")) return 25;
  if (timeline.includes("60") || timeline.toLowerCase().includes("2-3")) return 18;
  if (timeline.toLowerCase().includes("flex")) return 10;
  return 8;
}

function scoreSector(sector: string) {
  if (!sector) return 0;
  if (["healthcare", "finance", "government"].includes(sector.toLowerCase())) return 15;
  if (["ecommerce", "saas"].includes(sector.toLowerCase())) return 12;
  return 8;
}

function scoreEngagement(contactPreference: string, subscribe: boolean) {
  let score = 0;
  if (contactPreference === "call") score += 10;
  if (subscribe) score += 5;
  return score;
}

function normalise(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function grade(score: number): TriageScore["grade"] {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  return "D";
}

function priority(score: number): TriageScore["priority"] {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

export function computeTriage(form: FormData): TriageScore {
  let score = 0;
  const reasoning: string[] = [];

  const budgetScore = scoreBudget(form.budgetRange);
  score += budgetScore;
  reasoning.push(`Budget fit: +${budgetScore}`);

  const timeScore = scoreTimeline(form.timeline);
  score += timeScore;
  reasoning.push(`Timeline: +${timeScore}`);

  const sectorScore = scoreSector(form.sector);
  score += sectorScore;
  reasoning.push(`Sector priority: +${sectorScore}`);

  const engagementScore = scoreEngagement(form.contactPreference, form.subscribe);
  score += engagementScore;
  reasoning.push(`Engagement intent: +${engagementScore}`);

  if (form.goals.trim().length > 40) {
    score += 8;
    reasoning.push("Clear goals provided: +8");
  }
  if (form.challenges.trim().length > 30) {
    score += 6;
    reasoning.push("Challenges described: +6");
  }
  if (form.projectType.toLowerCase().includes("full") || form.projectType.toLowerCase().includes("build")) {
    score += 6;
    reasoning.push("Full build scope: +6");
  }

  const finalScore = normalise(score);
  const g = grade(finalScore);
  const p = priority(finalScore);

  return {
    grade: g,
    score: finalScore,
    reasoning,
    priority: p,
  };
}
