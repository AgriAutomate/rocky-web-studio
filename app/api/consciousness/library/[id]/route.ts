import { NextResponse, type NextRequest } from "next/server";

import { createSsrSupabaseClient } from "@/lib/supabase/ssr";
import type { ConsciousnessJourney, Database } from "@/types/consciousness";

type PatchBody = {
  /**
   * If provided, sets saved_to_library to this value.
   * If omitted and no other instructions are given, the endpoint toggles saved_to_library.
   */
  saved_to_library?: boolean;

  /**
   * If provided, sets is_favorite to this value.
   * If omitted, is_favorite is left unchanged (unless toggleIsFavorite is true).
   */
  is_favorite?: boolean;

  /** Toggle saved_to_library (ignored if saved_to_library is explicitly provided). */
  toggleSavedToLibrary?: boolean;

  /** Toggle is_favorite (ignored if is_favorite is explicitly provided). */
  toggleIsFavorite?: boolean;
};

type PatchResponseBody = {
  id: string;
  journey: ConsciousnessJourney;
};

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

/**
 * PATCH /api/consciousness/library/:id
 *
 * Toggles/sets library flags on a journey.
 * - Requires authentication (401 if not logged in)
 * - Requires ownership (403 if not the journey owner)
 */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSsrSupabaseClient<Database>();

    // Auth (same pattern as analyze/generate)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("consciousness.library auth error:", authError);
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing journey id" }, { status: 400 });
    }

    // Best-effort body parse; empty body means "toggle saved_to_library"
    let body: PatchBody = {};
    try {
      body = (await req.json()) as PatchBody;
    } catch {
      body = {};
    }

    // Load journey (RLS should help, but enforce explicitly)
    type JourneyRow = Database["public"]["Tables"]["consciousness_journeys"]["Row"];
    const { data: journeyRowRaw, error: loadError } = await supabase
      .from("consciousness_journeys")
      .select("*")
      .eq("id", id)
      .single();

    if (loadError || !journeyRowRaw) {
      console.error("consciousness.library failed to load journey:", loadError);
      return NextResponse.json({ error: "Journey not found" }, { status: 404 });
    }

    const journeyRow = journeyRowRaw as unknown as JourneyRow;

    if (journeyRow.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const hasExplicitSaved = typeof body.saved_to_library === "boolean";
    const hasExplicitFav = typeof body.is_favorite === "boolean";
    const toggleSaved =
      body.toggleSavedToLibrary === true ||
      (!hasExplicitSaved && !hasExplicitFav && body.toggleIsFavorite !== true);
    const toggleFav = body.toggleIsFavorite === true;

    const nextSaved = hasExplicitSaved
      ? body.saved_to_library
      : toggleSaved
        ? !journeyRow.saved_to_library
        : journeyRow.saved_to_library;

    const nextFav = hasExplicitFav
      ? body.is_favorite
      : toggleFav
        ? !journeyRow.is_favorite
        : journeyRow.is_favorite;

    const { data: updatedRaw, error: updateError } = await supabase
      .from("consciousness_journeys")
      .update({
        saved_to_library: nextSaved,
        is_favorite: nextFav,
      })
      .eq("id", id)
      .eq("user_id", user.id) // extra guard
      .select("*")
      .single();

    if (updateError || !updatedRaw) {
      console.error("consciousness.library update failed:", updateError);
      return NextResponse.json({ error: "Failed to update journey" }, { status: 500 });
    }

    const updated = updatedRaw as unknown as JourneyRow;

    const responseBody: PatchResponseBody = {
      id: updated.id,
      journey: toJourney(updated),
    };

    return NextResponse.json(responseBody, { status: 200 });
  } catch (error) {
    console.error("consciousness.library unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

