import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { createSsrSupabaseClient } from "@/lib/supabase/ssr";
import type { ConsciousnessJourney, Database } from "@/types/consciousness";

type GenerationStatus = "pending" | "complete" | "failed";

type JourneyGetResponseBody = {
  journey: ConsciousnessJourney;
  readyToPlay: boolean;
  generationStatus: GenerationStatus;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(id: string) {
  return UUID_RE.test(id);
}

function toJourney(row: Database["public"]["Tables"]["consciousness_journeys"]["Row"]): ConsciousnessJourney {
  return {
    id: row.id,
    user_id: row.user_id,
    current_consciousness_level: (row.current_consciousness_level ?? 0) as number,
    desired_consciousness_level: (row.desired_consciousness_level ?? 0) as number,
    perplexity_analysis: (row.perplexity_analysis as Record<string, any> | null) ?? {},
    perplexity_prompt: row.perplexity_prompt ?? "",
    suno_generation_id: row.suno_generation_id,
    song_url: row.song_url,
    user_perceived_shift: row.user_perceived_shift,
    saved_to_library: row.saved_to_library,
    is_favorite: row.is_favorite,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function computeGenerationStatus(journey: ConsciousnessJourney): GenerationStatus {
  const songUrl = (journey.song_url ?? "").trim();
  if (songUrl) return "complete";

  const sunoStatus = (journey.perplexity_analysis as any)?.suno?.status;
  if (sunoStatus === "failed") return "failed";

  // Fallback: if we stored a failure message, treat as failed.
  const shift = (journey.user_perceived_shift ?? "").toLowerCase();
  if (shift.startsWith("suno generation failed")) return "failed";

  return "pending";
}

/**
 * GET /api/consciousness/journey/:id
 *
 * Read-only fetch for a single Consciousness Journey.
 * - Requires authentication (401)
 * - Requires ownership (403 if exists but not owned)
 * - Returns 404 if not found
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id || !isValidUuid(id)) {
      return NextResponse.json({ error: "Invalid journey id" }, { status: 400 });
    }

    const supabase = await createSsrSupabaseClient<Database>();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("consciousness.journey auth error:", authError);
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    type JourneyRow = Database["public"]["Tables"]["consciousness_journeys"]["Row"];

    // Try user-scoped fetch first (fast path, respects RLS)
    const { data: rowRaw, error: rowError } = await supabase
      .from("consciousness_journeys")
      .select("*")
      .eq("id", id)
      .single();

    if (rowRaw) {
      const journey = toJourney(rowRaw as unknown as JourneyRow);
      const readyToPlay = (journey.song_url ?? "").trim().length > 0;
      const generationStatus = computeGenerationStatus(journey);

      const responseBody: JourneyGetResponseBody = {
        journey,
        readyToPlay,
        generationStatus,
      };
      return NextResponse.json(responseBody, { status: 200 });
    }

    if (rowError) {
      // Not-found vs RLS-denied is indistinguishable from the anon client.
      // We'll do a safe existence check using service role to return 403 when it exists but isn't owned.
      console.error("consciousness.journey fetch error:", rowError);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && serviceKey) {
      const admin = createClient<Database>(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data: existsRow } = await admin
        .from("consciousness_journeys")
        .select("id,user_id")
        .eq("id", id)
        .maybeSingle();

      if (existsRow && existsRow.user_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  } catch (error) {
    console.error("consciousness.journey unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

