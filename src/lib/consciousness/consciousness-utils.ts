export type JourneyDirection = "upward" | "downward" | "neutral";

type LevelMeta = {
  level: number;
  name: string;
  description: string;
  color_hex: string;
};

/**
 * Canonical 9-level Hawkins mapping used by the portal (2–18, step 2).
 * Colors match the spec used across portal components.
 */
export const CONSCIOUSNESS_LEVELS: ReadonlyArray<LevelMeta> = [
  { level: 2, name: "Shame", description: "Despair, unworthiness, collapse.", color_hex: "#8B0000" },
  { level: 4, name: "Guilt", description: "Regret, shame projection, vulnerability.", color_hex: "#FF4500" },
  { level: 6, name: "Apathy", description: "Indifference, numbness, pause, futility.", color_hex: "#FFD700" },
  { level: 8, name: "Fear", description: "Anxiety, worry, uncertainty, building.", color_hex: "#FFA500" },
  { level: 10, name: "Anger", description: "Power, assertion, truth-telling, strength.", color_hex: "#FF6347" },
  { level: 12, name: "Desire", description: "Ambition, wanting, striving, growth.", color_hex: "#FFD700" },
  { level: 14, name: "Reason", description: "Understanding, clarity, logic, balance.", color_hex: "#4169E1" },
  { level: 16, name: "Loving", description: "Compassion, acceptance, forgiveness.", color_hex: "#9370DB" },
  { level: 18, name: "Joy", description: "Happiness, fulfillment, creation, presence.", color_hex: "#FFFFFF" },
] as const;

function findMeta(level: number): LevelMeta | null {
  return CONSCIOUSNESS_LEVELS.find((l) => l.level === level) ?? null;
}

/**
 * Validate that a level is a portal-valid Hawkins value:
 * integer, in [2..18], even (2-step ladder).
 */
export function isValidLevel(level: number): boolean {
  return (
    typeof level === "number" &&
    Number.isInteger(level) &&
    level >= 2 &&
    level <= 18 &&
    level % 2 === 0
  );
}

/**
 * Convert number to level name.
 * Returns "Unknown" if invalid/unmapped.
 */
export function getLevelName(level: number): string {
  return findMeta(level)?.name ?? "Unknown";
}

/**
 * Return description text for a level.
 * Returns empty string if invalid/unmapped.
 */
export function getLevelDescription(level: number): string {
  return findMeta(level)?.description ?? "";
}

/**
 * Return hex color code for a level.
 * Returns a safe fallback if invalid/unmapped.
 */
export function getLevelColor(level: number): string {
  return findMeta(level)?.color_hex ?? "#0f766e";
}

/**
 * Return absolute distance between levels.
 * If either level is invalid, returns 0.
 */
export function calculateJourneyDistance(
  currentLevel: number,
  desiredLevel: number
): number {
  if (!isValidLevel(currentLevel) || !isValidLevel(desiredLevel)) return 0;
  return Math.abs(desiredLevel - currentLevel);
}

/**
 * Determine if a journey goes up/down/same.
 * If either level is invalid, returns "neutral".
 */
export function getJourneyDirection(
  currentLevel: number,
  desiredLevel: number
): JourneyDirection {
  if (!isValidLevel(currentLevel) || !isValidLevel(desiredLevel)) return "neutral";
  const d = desiredLevel - currentLevel;
  if (d > 0) return "upward";
  if (d < 0) return "downward";
  return "neutral";
}

/**
 * Convert seconds to MM:SS format.
 */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

/**
 * Return array of intermediate consciousness levels including endpoints.
 * Example: 8 → 14 => [8, 10, 12, 14]
 *
 * If inputs are invalid, returns [].
 */
export function getIntermediateSteps(
  currentLevel: number,
  desiredLevel: number
): number[] {
  if (!isValidLevel(currentLevel) || !isValidLevel(desiredLevel)) return [];
  if (currentLevel === desiredLevel) return [currentLevel];

  const step = desiredLevel > currentLevel ? 2 : -2;
  const out: number[] = [];
  for (let v = currentLevel; step > 0 ? v <= desiredLevel : v >= desiredLevel; v += step) {
    out.push(v);
  }
  return out;
}

/**
 * Estimate song duration (seconds) based on journey distance.
 * - small jumps (0–2): 2–3 min
 * - medium (4–6): ~3–4 min
 * - large (>=8): 4–5 min
 */
export function estimateJourneyDuration(distance: number): number {
  const d = Math.max(0, Math.floor(distance));
  if (d <= 2) return 150; // 2:30
  if (d <= 6) return 210; // 3:30
  return 270; // 4:30
}

export type ValidateConsciousnessInputResult = { valid: boolean; errors: string[] };

/**
 * Full validation of journey inputs.
 */
export function validateConsciousnessInput(
  current: number,
  desired: number,
  context?: string
): ValidateConsciousnessInputResult {
  const errors: string[] = [];

  if (!isValidLevel(current)) {
    errors.push("Current level must be an even integer between 2 and 18.");
  }
  if (!isValidLevel(desired)) {
    errors.push("Desired level must be an even integer between 2 and 18.");
  }

  const note = typeof context === "string" ? context.trim() : "";
  if (note.length > 1000) {
    errors.push("Context is too long (max 1000 characters).");
  }

  return { valid: errors.length === 0, errors };
}

