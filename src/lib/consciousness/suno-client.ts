import { getConsciousnessSupabaseBrowserClient } from "@/lib/consciousness/supabase";

export type SunoGenerationStatus = "pending" | "complete" | "failed";

export type GenerateSongResponse = {
  journeyId: string;
  /** Generation id returned by the server/n8n/Suno pipeline. */
  generationId: string;
  /** Original field name returned by our API route. */
  sunoGenerationId: string;
  /** Optional polling URL returned by our API route (may be informational). */
  pollUrl: string;
  /** Estimated wait time in seconds (best-effort). */
  estimatedWaitTime: number;
};

export type FetchSongStatusResponse = {
  generationId: string;
  status: SunoGenerationStatus;
  songUrl: string | null;
  journeyId: string | null;
  error: string | null;
  updatedAt: string | null;
};

export type PollProgressUpdate = {
  generationId: string;
  attempt: number;
  elapsedMs: number;
  nextDelayMs: number | null;
  status: SunoGenerationStatus;
  songUrl: string | null;
  journeyId: string | null;
  /** 0–100 best-effort progress estimate. */
  progress: number | null;
};

export class SunoClientError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, opts?: { status?: number; details?: unknown }) {
    super(message);
    this.name = "SunoClientError";
    this.status = opts?.status;
    this.details = opts?.details;
  }
}

type GenerateApiResponse = {
  journeyId: string;
  sunoGenerationId: string;
  pollUrl: string;
  estimatedWaitTime: number;
  error?: string;
  message?: string;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function computeDelayMs(elapsedMs: number) {
  // Requirement: poll at 5s, then 10s, then 30s (max 5 minutes).
  if (elapsedMs < 60_000) return 5_000;
  if (elapsedMs < 180_000) return 10_000;
  return 30_000;
}

function estimateProgress(elapsedMs: number, etaSeconds?: number | null) {
  // Best-effort. If eta provided, use it; otherwise, use a gentle curve.
  const etaMs = etaSeconds && Number.isFinite(etaSeconds) ? etaSeconds * 1000 : 240_000;
  if (etaMs <= 0) return null;
  const pct = Math.max(0, Math.min(0.98, elapsedMs / etaMs));
  return Math.round(pct * 100);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * generateSong
 *
 * Client-side helper that triggers the async Suno/n8n generation pipeline
 * via `POST /api/consciousness/generate`.
 */
export async function generateSong(
  journeyId: string,
  sunoPrompt: string
): Promise<GenerateSongResponse> {
  const jid = String(journeyId ?? "").trim();
  const prompt = String(sunoPrompt ?? "").trim();

  if (!isNonEmptyString(jid) || !isNonEmptyString(prompt)) {
    throw new SunoClientError("Missing journeyId or sunoPrompt.");
  }

  const res = await fetch("/api/consciousness/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ journeyId: jid, sunoPrompt: prompt }),
  });

  const json = (await res.json().catch(() => ({}))) as Partial<GenerateApiResponse>;
  if (!res.ok) {
    throw new SunoClientError(
      (json as any)?.error || (json as any)?.message || `Generation request failed (${res.status})`,
      { status: res.status, details: json }
    );
  }

  if (!isNonEmptyString(json?.journeyId) || !isNonEmptyString(json?.sunoGenerationId)) {
    throw new SunoClientError("Generate response missing generation id.", {
      status: res.status,
      details: json,
    });
  }

  return {
    journeyId: json.journeyId,
    generationId: json.sunoGenerationId,
    sunoGenerationId: json.sunoGenerationId,
    pollUrl: String(json.pollUrl ?? ""),
    estimatedWaitTime: Number(json.estimatedWaitTime ?? 0) || 0,
  };
}

/**
 * fetchSongStatus
 *
 * Looks up the current status for a Suno generation id by querying the user's
 * `consciousness_journeys` row (RLS-protected) using the browser Supabase client.
 *
 * This avoids needing a separate “status by generation_id” API route.
 */
export async function fetchSongStatus(
  generationId: string
): Promise<FetchSongStatusResponse> {
  const gid = String(generationId ?? "").trim();
  if (!gid) {
    throw new SunoClientError("Missing generationId.");
  }

  const consciousnessSupabase = getConsciousnessSupabaseBrowserClient();
  const { data, error } = await consciousnessSupabase
    .from("consciousness_journeys")
    .select("id,suno_generation_id,song_url,perplexity_analysis,user_perceived_shift,updated_at")
    .eq("suno_generation_id", gid)
    .maybeSingle();

  if (error) {
    throw new SunoClientError("Failed to fetch song status.", { details: error });
  }

  if (!data) {
    // If the journey isn't visible (RLS) or doesn't exist, treat as pending to avoid leaking.
    return {
      generationId: gid,
      status: "pending",
      songUrl: null,
      journeyId: null,
      error: null,
      updatedAt: null,
    };
  }

  const songUrl = (data.song_url ?? "").trim() || null;
  if (songUrl) {
    return {
      generationId: gid,
      status: "complete",
      songUrl,
      journeyId: data.id ?? null,
      error: null,
      updatedAt: (data as any).updated_at ?? null,
    };
  }

  const sunoStatus = (data.perplexity_analysis as any)?.suno?.status;
  const shift = String(data.user_perceived_shift ?? "").toLowerCase();
  const failed =
    sunoStatus === "failed" || shift.startsWith("suno generation failed");

  return {
    generationId: gid,
    status: failed ? "failed" : "pending",
    songUrl: null,
    journeyId: data.id ?? null,
    error: failed ? (String(data.user_perceived_shift ?? "") || "Generation failed.") : null,
    updatedAt: (data as any).updated_at ?? null,
  };
}

export type PollSongGenerationOptions = {
  /** Called with status updates during polling. */
  onProgress?: (update: PollProgressUpdate) => void;
  /** Total max poll time (ms). Default: 5 minutes. */
  maxPollMs?: number;
  /** Optional ETA (seconds) used for progress estimation. */
  estimatedWaitTimeSeconds?: number | null;
  /** Extra jitter (ms) to avoid thundering herd. */
  jitterMs?: number;
};

/**
 * pollSongGeneration
 *
 * Polls status until complete/failed or timeout.
 * Schedule: 5s (first minute), 10s (next two minutes), 30s thereafter.
 * Max time: 5 minutes (default).
 */
export async function pollSongGeneration(
  generationId: string,
  onProgress?: (update: PollProgressUpdate) => void
): Promise<FetchSongStatusResponse> {
  return pollSongGenerationWithOptions(generationId, { onProgress });
}

export async function pollSongGenerationWithOptions(
  generationId: string,
  options?: PollSongGenerationOptions
): Promise<FetchSongStatusResponse> {
  const gid = String(generationId ?? "").trim();
  if (!gid) throw new SunoClientError("Missing generationId.");

  const started = Date.now();
  const maxPollMs = Math.max(10_000, Math.floor(options?.maxPollMs ?? 5 * 60_000));
  const jitterMs = Math.max(0, Math.floor(options?.jitterMs ?? 250));

  let attempt = 0;

  while (Date.now() - started < maxPollMs) {
    attempt += 1;
    const elapsedMs = Date.now() - started;

    let status: FetchSongStatusResponse;
    try {
      status = await fetchSongStatus(gid);
    } catch (e: any) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error("suno-client poll error:", e);
      }
      // Treat transient errors as pending until timeout.
      status = {
        generationId: gid,
        status: "pending",
        songUrl: null,
        journeyId: null,
        error: e?.message || "Temporary error while checking status.",
        updatedAt: null,
      };
    }

    const done = status.status === "complete";
    const failed = status.status === "failed";

    const nextDelayMs = done || failed ? null : computeDelayMs(elapsedMs);
    const progress = done
      ? 100
      : estimateProgress(elapsedMs, options?.estimatedWaitTimeSeconds ?? null);

    options?.onProgress?.({
      generationId: gid,
      attempt,
      elapsedMs,
      nextDelayMs,
      status: status.status,
      songUrl: status.songUrl,
      journeyId: status.journeyId,
      progress,
    });

    if (done) return status;
    if (failed) throw new SunoClientError(status.error || "Song generation failed.");

    const delay = (nextDelayMs ?? 30_000) + Math.floor(Math.random() * jitterMs);
    await sleep(delay);
  }

  throw new SunoClientError("Song generation timed out (over 5 minutes).");
}

