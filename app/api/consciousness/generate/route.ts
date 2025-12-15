import { NextResponse, type NextRequest } from "next/server";

import { createSsrSupabaseClient } from "@/lib/supabase/ssr";
import type { Database } from "@/types/consciousness";

type GenerateRequestBody = {
  /** Journey id (UUID). */
  journeyId: string;
  /** Suno prompt (typically from Perplexity analysis). */
  sunoPrompt: string;
};

type GenerateTriggerResponseBody = {
  journeyId: string;
  sunoGenerationId: string;
  pollUrl: string;
  estimatedWaitTime: number;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * POST /api/consciousness/generate
 *
 * Authenticated endpoint that triggers Suno (async) via an external wrapper (e.g. n8n).
 * Only the journey owner may call it.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSsrSupabaseClient<Database>();

    // 1) Auth (same pattern as analyze)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("consciousness.generate auth error:", authError);
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Parse body
    let body: GenerateRequestBody;
    try {
      body = (await req.json()) as GenerateRequestBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!isNonEmptyString(body.journeyId) || !isNonEmptyString(body.sunoPrompt)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const journeyId = body.journeyId.trim();
    const sunoPrompt = body.sunoPrompt.trim();

    if (sunoPrompt.length < 20) {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
    }

    // 3) Load journey (RLS should scope to owner, but we also enforce explicitly)
    type JourneyRow = Database["public"]["Tables"]["consciousness_journeys"]["Row"];
    const { data: journeyRowRaw, error: journeyError } = await supabase
      .from("consciousness_journeys")
      .select("*")
      .eq("id", journeyId)
      .single();

    if (journeyError || !journeyRowRaw) {
      // If not found due to RLS, Supabase typically returns an error; treat as 404 to avoid leaking existence.
      console.error("consciousness.generate failed to load journey:", journeyError);
      return NextResponse.json({ error: "Journey not found" }, { status: 404 });
    }

    const journeyRow = journeyRowRaw as unknown as JourneyRow;

    // 4) Ownership enforcement (explicit)
    if (journeyRow.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 5) Trigger async generation via wrapper (n8n/Suno)
    const triggerUrl = process.env.N8N_CONSCIOUSNESS_GENERATE_WEBHOOK_URL;
    const triggerSecret = process.env.N8N_WEBHOOK_SECRET;

    if (!triggerUrl) {
      return NextResponse.json(
        { error: "Server misconfigured: N8N_CONSCIOUSNESS_GENERATE_WEBHOOK_URL is not set" },
        { status: 500 }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (triggerSecret) {
      headers["x-webhook-secret"] = triggerSecret;
    }

    const webhook_url = new URL("/api/consciousness/webhook/suno", req.nextUrl.origin).toString();

    const triggerPayload = {
      journeyId: journeyRow.id,
      userId: journeyRow.user_id,
      sunoPrompt,
      webhook_url,
      // Helpful context for the workflow
      current_consciousness_level: journeyRow.current_consciousness_level,
      desired_consciousness_level: journeyRow.desired_consciousness_level,
      requested_at: new Date().toISOString(),
    };

    const triggerRes = await fetch(triggerUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(triggerPayload),
    });

    const triggerText = await triggerRes.text().catch(() => "");
    let triggerJson: Record<string, any> | null = null;
    try {
      triggerJson = triggerText ? (JSON.parse(triggerText) as Record<string, any>) : null;
    } catch {
      triggerJson = null;
    }

    if (!triggerRes.ok) {
      console.error("consciousness.generate trigger error:", triggerRes.status, triggerText);
      return NextResponse.json(
        {
          error: "Failed to trigger Suno generation",
          status: triggerRes.status,
          details: triggerJson ?? triggerText,
        },
        { status: 502 }
      );
    }

    // 6) Extract generation id from wrapper response
    const sunoGenerationId =
      (triggerJson?.suno_generation_id as string | undefined) ??
      (triggerJson?.sunoGenerationId as string | undefined) ??
      (triggerJson?.generation_id as string | undefined) ??
      (triggerJson?.id as string | undefined);

    if (!isNonEmptyString(sunoGenerationId)) {
      console.error("consciousness.generate: missing suno generation id", { triggerJson, triggerText });
      return NextResponse.json(
        { error: "Suno generation did not return a generation id" },
        { status: 502 }
      );
    }

    // 7) Update DB row (async flow: song_url is null until webhook completes)
    const { error: updateError } = await supabase
      .from("consciousness_journeys")
      .update({
        suno_generation_id: sunoGenerationId,
        song_url: null,
      })
      .eq("id", journeyId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("consciousness.generate failed to update journey:", updateError);
      return NextResponse.json({ error: "Failed to update journey" }, { status: 500 });
    }

    const responseBody: GenerateTriggerResponseBody = {
      journeyId,
      sunoGenerationId,
      pollUrl: `/api/consciousness/status?journeyId=${encodeURIComponent(journeyId)}`,
      estimatedWaitTime: 240,
    };

    return NextResponse.json(responseBody, { status: 200 });
  } catch (error) {
    console.error("consciousness.generate unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

