import type { ConsciousnessJourney } from "@/types/consciousness";

export type AnalyzeConsciousnessJourneyInput = {
  currentLevel: number;
  desiredLevel: number;
  context?: string;
};

export type AnalyzeConsciousnessJourneyResult = {
  /** Journey id created by the server. */
  journeyId: string;
  /** Stored journey row. */
  journey: ConsciousnessJourney;
  /** Best-effort extracted analysis payload. */
  analysis: Record<string, any>;
  /** Suno prompt string (already extracted by the API route). */
  sunoPrompt: string;
  /** Optional intermediate steps (if present in stored parsed payload). */
  intermediateStates: number[] | null;
  /** Optional acknowledgement/summary (if present). */
  acknowledgement: string | null;
  /** Client-side trace info. */
  meta: {
    spaceId: string | null;
  };
};

export class PerplexityClientError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, opts?: { status?: number; details?: unknown }) {
    super(message);
    this.name = "PerplexityClientError";
    this.status = opts?.status;
    this.details = opts?.details;
  }
}

type AnalyzeApiResponse = {
  id: string;
  journey: ConsciousnessJourney;
  analysis: Record<string, any>;
  sunoPrompt: string;
  error?: string;
  message?: string;
};

function isIntInRange(n: unknown, min: number, max: number): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= min && n <= max;
}

function normalizeLevel(n: number) {
  // Snap to 2,4,...,18
  const v = Math.max(2, Math.min(18, Math.floor(n)));
  return v % 2 === 0 ? v : v - 1;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function getSpaceId(): string | null {
  // Safe to read on client; it's NEXT_PUBLIC.
  return process.env.NEXT_PUBLIC_PERPLEXITY_SPACE_ID || null;
}

function extractIntermediateStates(journey: ConsciousnessJourney, analysis: Record<string, any>) {
  const a = analysis as any;
  if (Array.isArray(a?.intermediateStates)) return a.intermediateStates as number[];

  const parsed = (journey.perplexity_analysis as any)?.parsed;
  if (Array.isArray(parsed?.intermediateStates)) return parsed.intermediateStates as number[];

  return null;
}

function extractAcknowledgement(journey: ConsciousnessJourney, analysis: Record<string, any>) {
  const a = analysis as any;
  if (typeof a?.acknowledgement === "string" && a.acknowledgement.trim()) return a.acknowledgement.trim();

  const parsed = (journey.perplexity_analysis as any)?.parsed;
  if (typeof parsed?.acknowledgement === "string" && parsed.acknowledgement.trim())
    return parsed.acknowledgement.trim();

  return null;
}

export type AnalyzeOptions = {
  /**
   * Number of retries after the initial attempt.
   * Example: retries=2 => up to 3 total attempts.
   */
  retries?: number;
  /** Base delay for exponential backoff (ms). */
  retryDelayMs?: number;
  /** Abort request after this many ms. */
  timeoutMs?: number;
};

/**
 * analyzeConsciousnessJourney
 *
 * Client-side helper for calling the server route `POST /api/consciousness/analyze`.
 *
 * Notes:
 * - The Perplexity API key is never exposed client-side; the server route handles it.
 * - The “consciousness prompt” lives server-side in `CONSCIOUSNESS_SCALE_IMPLEMENTATION.md`.
 */
export async function analyzeConsciousnessJourney(
  currentLevel: number,
  desiredLevel: number,
  context?: string,
  options?: AnalyzeOptions
): Promise<AnalyzeConsciousnessJourneyResult> {
  const retries = Math.max(0, Math.min(5, Math.floor(options?.retries ?? 1)));
  const retryDelayMs = Math.max(150, Math.floor(options?.retryDelayMs ?? 450));
  const timeoutMs = Math.max(3000, Math.floor(options?.timeoutMs ?? 45000));

  const c = normalizeLevel(currentLevel);
  const d = normalizeLevel(desiredLevel);

  if (!isIntInRange(c, 2, 18) || !isIntInRange(d, 2, 18)) {
    throw new PerplexityClientError("Invalid consciousness levels (must be 2–18).");
  }

  const spaceId = getSpaceId();

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch("/api/consciousness/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(spaceId ? { "x-perplexity-space-id": spaceId } : {}),
        },
        body: JSON.stringify({
          current_consciousness_level: c,
          desired_consciousness_level: d,
          context: context?.trim() ? context.trim() : undefined,
        }),
        signal: controller.signal,
      });

      const json = (await res.json().catch(() => ({}))) as Partial<AnalyzeApiResponse>;

      if (!res.ok) {
        const message =
          (json as any)?.error ||
          (json as any)?.message ||
          `Analyze request failed (${res.status})`;
        throw new PerplexityClientError(message, { status: res.status, details: json });
      }

      if (!json?.journey || !json?.id || typeof json?.sunoPrompt !== "string") {
        throw new PerplexityClientError("Analyze response was missing required fields.", {
          status: res.status,
          details: json,
        });
      }

      const journey = json.journey;
      const analysis = (json.analysis ?? {}) as Record<string, any>;

      return {
        journeyId: json.id,
        journey,
        analysis,
        sunoPrompt: json.sunoPrompt,
        intermediateStates: extractIntermediateStates(journey, analysis),
        acknowledgement: extractAcknowledgement(journey, analysis),
        meta: { spaceId },
      };
    } catch (err: any) {
      lastError = err;

      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error("perplexity-client analyze error:", {
          attempt,
          message: err?.message,
          status: err?.status,
          err,
        });
      }

      // Abort errors or client-side errors: don't spam retries.
      const isAbort = err?.name === "AbortError";
      const status = err?.status as number | undefined;
      const retryable =
        !isAbort &&
        (status == null || status >= 500 || status === 429) &&
        attempt < retries;

      if (!retryable) {
        if (err instanceof PerplexityClientError) throw err;
        throw new PerplexityClientError(err?.message || "Analyze request failed.", {
          details: err,
        });
      }

      const backoff = retryDelayMs * Math.pow(2, attempt);
      const jitter = Math.floor(Math.random() * 150);
      await sleep(backoff + jitter);
    } finally {
      clearTimeout(timer);
    }
  }

  throw new PerplexityClientError("Analyze request failed after retries.", {
    details: lastError,
  });
}

