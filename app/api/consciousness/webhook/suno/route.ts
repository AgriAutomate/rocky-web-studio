import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/consciousness";

export const runtime = "nodejs";

type SunoWebhookBody = {
  generation_id: string;
  status: "complete" | "failed" | "pending";
  song_url?: string;
  audio_url?: string;
  error?: string;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function getWebhookSecretHeader(req: NextRequest): string | null {
  return (
    req.headers.get("x-suno-webhook-secret") ??
    req.headers.get("x-webhook-secret") ??
    req.headers.get("x-signature") ??
    null
  );
}

/**
 * POST /api/consciousness/webhook/suno
 *
 * Receives async callbacks from Suno (or an n8n wrapper) and updates the
 * corresponding `consciousness_journeys` row by `suno_generation_id`.
 *
 * Security:
 * - Optional shared-secret validation (set `SUNO_WEBHOOK_SECRET`).
 *
 * Idempotency:
 * - Duplicate webhook calls are safe; we only write changes when needed.
 */
export async function POST(req: NextRequest) {
  const safeAck = () => NextResponse.json({ acknowledged: true }, { status: 200 });

  try {
    // 1) Optional secret validation
    const expectedSecret =
      process.env.SUNO_WEBHOOK_SECRET || process.env.N8N_WEBHOOK_SECRET || "";
    if (expectedSecret) {
      const provided = getWebhookSecretHeader(req);
      if (!provided || provided !== expectedSecret) {
        console.error("consciousness.webhook.suno invalid secret");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // 2) Parse body
    let body: SunoWebhookBody;
    try {
      body = (await req.json()) as SunoWebhookBody;
    } catch {
      console.error("consciousness.webhook.suno invalid JSON");
      return safeAck();
    }

    if (!isNonEmptyString(body.generation_id)) {
      console.error("consciousness.webhook.suno missing generation_id");
      return safeAck();
    }

    const generationId = body.generation_id.trim();

    // 3) Lookup by suno_generation_id
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      console.error("consciousness.webhook.suno missing Supabase service env vars");
      return safeAck();
    }

    // Service role: webhook is server-to-server and needs to bypass RLS safely.
    const supabase = createClient<Database>(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    type JourneyRow = Database["public"]["Tables"]["consciousness_journeys"]["Row"];
    const { data: journeyRaw, error: findError } = await supabase
      .from("consciousness_journeys")
      .select("*")
      .eq("suno_generation_id", generationId)
      .single();

    if (findError || !journeyRaw) {
      console.error("consciousness.webhook.suno journey not found", {
        generationId,
        findError,
      });
      // Do not expose details to webhook caller; acknowledge to avoid retries spiraling.
      return safeAck();
    }

    const journey = journeyRaw as unknown as JourneyRow;

    // 4) Idempotent update
    const status = body.status;
    const songUrl = (body.song_url || body.audio_url || "").trim();
    const errorMsg = (body.error || "").trim();

    const nextSongUrl =
      status === "complete" && songUrl ? songUrl : status === "failed" ? null : journey.song_url;

    // Store webhook status + error in `perplexity_analysis` for traceability.
    const existingAnalysis = (journey.perplexity_analysis ?? {}) as any;
    const nextAnalysis = {
      ...existingAnalysis,
      suno: {
        ...(existingAnalysis?.suno ?? {}),
        last_webhook_at: new Date().toISOString(),
        status,
        generation_id: generationId,
        song_url: status === "complete" ? songUrl : undefined,
        error: status === "failed" ? (errorMsg || "Unknown error") : undefined,
        raw: body,
      },
    };

    const needsSongUpdate =
      (journey.song_url ?? null) !== (nextSongUrl ?? null) ||
      JSON.stringify(existingAnalysis?.suno ?? null) !== JSON.stringify(nextAnalysis.suno ?? null);

    if (!needsSongUpdate) {
      console.log("consciousness.webhook.suno duplicate/no-op", {
        generationId,
        status,
      });
      return safeAck();
    }

    const updatePayload: Database["public"]["Tables"]["consciousness_journeys"]["Update"] = {
      song_url: nextSongUrl,
      perplexity_analysis: nextAnalysis as any,
      // optionally surface failures in a human-readable field
      user_perceived_shift:
        status === "failed"
          ? `Suno generation failed: ${errorMsg || "Unknown error"}`
          : journey.user_perceived_shift,
    };

    const { error: updateError } = await supabase
      .from("consciousness_journeys")
      .update(updatePayload)
      .eq("id", journey.id);

    if (updateError) {
      console.error("consciousness.webhook.suno failed to update journey", {
        generationId,
        updateError,
      });
      return safeAck();
    }

    console.log("consciousness.webhook.suno updated", { generationId, status });
    return safeAck();
  } catch (error) {
    console.error("consciousness.webhook.suno unexpected error:", error);
    return NextResponse.json({ acknowledged: true }, { status: 200 });
  }
}

