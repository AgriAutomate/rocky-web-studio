import { branchMap, questionOrderForSector, Sector } from "@/app/lib/questionnaireConfig";
import { FormData } from "@/lib/types";

const trunkIds = ["q1", "q2", "q3", "q4", "q5"];
const leavesIds = ["q21", "q22", "q23", "q24"];

function allIdsForSector(sector: Exclude<Sector, "universal">) {
  return questionOrderForSector(sector);
}

export function isQuestionRelevant(questionId: string, sector: string): boolean {
  if (trunkIds.includes(questionId) || leavesIds.includes(questionId)) return true;
  const sec = sector as Exclude<Sector, "universal">;
  return branchMap[sec]?.includes(questionId) ?? false;
}

export function getNextQuestion(
  currentId: string,
  sector: string,
  _answers: FormData
): string | null {
  const sec = sector as Exclude<Sector, "universal">;
  const order = allIdsForSector(sec);
  const idx = order.indexOf(currentId);
  if (idx === -1) return order[0] ?? null;
  return order[idx + 1] ?? null;
}

export function getPreviousQuestion(currentId: string, sector: string): string | null {
  const sec = sector as Exclude<Sector, "universal">;
  const order = allIdsForSector(sec);
  const idx = order.indexOf(currentId);
  if (idx === -1) return order[0] ?? null;
  return order[idx - 1] ?? null;
}

export function getProgressPercentage(currentId: string, sector: string): number {
  const sec = sector as Exclude<Sector, "universal">;
  const order = allIdsForSector(sec);
  const idx = order.indexOf(currentId);
  if (idx === -1 || order.length === 0) return 0;
  return Math.round(((idx + 1) / order.length) * 100);
}
