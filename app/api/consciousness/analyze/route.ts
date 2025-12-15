import { NextResponse, type NextRequest } from "next/server";

import type { ConsciousnessJourney, Database } from "@/types/consciousness";
import { createSsrSupabaseClient } from "@/lib/supabase/ssr";

export const runtime = "nodejs";

type AnalyzeRequestBody = {
  current_consciousness_level: number;
  desired_consciousness_level: number;
  context?: string;
};

type PerplexityChatCompletion = {
  id?: string;
  choices?: Array<{
    message?: {
      role?: string;
      content?: string;
    };
  }>;
  // Keep extra fields for storage/debugging.
  [key: string]: unknown;
};

type AnalyzeResponseBody = {
  id: string;
  journey: ConsciousnessJourney;
  analysis: Record<string, any>;
  sunoPrompt: string;
};

const LEVEL_MIN = 2;
const LEVEL_MAX = 18;

const FALLBACK_PROMPT = "See CONSCIOUSNESS_SCALE_IMPLEMENTATION.md";

function loadSpacePromptFromMarkdown(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("node:fs") as typeof import("node:fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("node:path") as typeof import("node:path");
    const filePath = path.join(process.cwd(), "CONSCIOUSNESS_SCALE_IMPLEMENTATION.md");
    const md = fs.readFileSync(filePath, "utf8") as string;

    // Use the first fenced block as the canonical prompt.
    const start = md.indexOf("```");
    if (start === -1) return FALLBACK_PROMPT;
    const afterStart = start + 3;
    const end = md.indexOf("```", afterStart);
    if (end === -1) return FALLBACK_PROMPT;

    const prompt = md.slice(afterStart, end).trim();
    return prompt || FALLBACK_PROMPT;
  } catch {
    return FALLBACK_PROMPT;
  }
}

function isIntInRange(value: unknown, min: number, max: number): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
  );
}

function safeJsonParse(content: string): Record<string, any> | null {
  try {
    return JSON.parse(content) as Record<string, any>;
  } catch {
    // Try to salvage JSON wrapped in text by slicing first/last braces.
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(content.slice(start, end + 1)) as Record<string, any>;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function extractSunoPrompt(parsed: Record<string, any> | null, raw: string): string {
  if (parsed && typeof parsed.sunoPrompt === "string" && parsed.sunoPrompt.trim()) {
    return parsed.sunoPrompt.trim();
  }

  // Fallback: look for "Suno prompt:" style blocks.
  const match = raw.match(/Suno\\s*prompt\\s*:\\s*([\\s\\S]*?)$/i);
  if (match?.[1]) return match[1].trim();

  return "";
}

/**
 * POST /api/consciousness/analyze
 *
 * Authenticated endpoint that:
 * - validates inputs
 * - calls Perplexity for a consciousness journey analysis + Suno prompt
 * - persists the full Perplexity response + prompt in `consciousness_journeys`
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSsrSupabaseClient<Database>();

    // 1) Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("consciousness.analyze auth error:", authError);
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Parse body
    let body: AnalyzeRequestBody;
    try {
      body = (await req.json()) as AnalyzeRequestBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { current_consciousness_level, desired_consciousness_level, context } = body;

    // 3) Validate
    if (!isIntInRange(current_consciousness_level, LEVEL_MIN, LEVEL_MAX)) {
      return NextResponse.json(
        { error: "Invalid consciousness levels" },
        { status: 400 }
      );
    }
    if (!isIntInRange(desired_consciousness_level, LEVEL_MIN, LEVEL_MAX)) {
      return NextResponse.json(
        { error: "Invalid consciousness levels" },
        { status: 400 }
      );
    }

    // 4) Perplexity call
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    const perplexityModel = process.env.PERPLEXITY_MODEL || "sonar-reasoning";
    // Stored for traceability (Perplexity API does not currently accept space_id on chat completions).
    const perplexitySpaceId = process.env.PERPLEXITY_SPACE_ID || undefined;

    if (!perplexityApiKey) {
      return NextResponse.json(
        { error: "Server misconfigured: PERPLEXITY_API_KEY is not set" },
        { status: 500 }
      );
    }

    const outputContract = `
Return ONLY valid JSON with this shape:
{
  "acknowledgement": string,
  "intermediateStates": number[],
  "analysis": object,
  "sunoPrompt": string
}

Rules:
- sunoPrompt must follow the time-coded emotional arc format described.
- intermediateStates must include the key steps between current and desired (do not skip unrealistically).
- analysis should include any helpful structured fields (e.g. levelLabels, energyMapping, notes).
`.trim();

    const userPrompt = `
Current consciousness level: ${current_consciousness_level}
Desired consciousness level: ${desired_consciousness_level}
Optional context: ${context?.trim() ? context.trim() : "N/A"}
`.trim();

    const spacePrompt = loadSpacePromptFromMarkdown();
    const trace = perplexitySpaceId ? `Perplexity Space ID (trace): ${perplexitySpaceId}` : "";
    const promptSent = `${spacePrompt}\n\n${trace}\n\n${outputContract}\n\n${userPrompt}`.trim();

    const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${perplexityApiKey}`,
      },
      body: JSON.stringify({
        model: perplexityModel,
        messages: [
          { role: "system", content: promptSent },
          {
            role: "user",
            content: "Generate the consciousness journey analysis and Suno prompt now.",
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!perplexityResponse.ok) {
      const text = await perplexityResponse.text().catch(() => "");
      console.error("Perplexity API error:", perplexityResponse.status, text);
      return NextResponse.json(
        { error: "Perplexity request failed", status: perplexityResponse.status },
        { status: 502 }
      );
    }

    const perplexityJson = (await perplexityResponse.json()) as PerplexityChatCompletion;
    const content = perplexityJson.choices?.[0]?.message?.content ?? "";

    const parsed = content ? safeJsonParse(content) : null;
    const analysis = (parsed?.analysis && typeof parsed.analysis === "object"
      ? parsed.analysis
      : parsed ?? {}) as Record<string, any>;

    const sunoPrompt = extractSunoPrompt(parsed, content);

    // 5) Persist journey
    const insertPayload: Database["public"]["Tables"]["consciousness_journeys"]["Insert"] = {
      user_id: user.id,
      current_consciousness_level,
      desired_consciousness_level,
      perplexity_analysis: {
        space_id: perplexitySpaceId,
        model: perplexityModel,
        prompt_contract: outputContract,
        raw_completion: perplexityJson,
        parsed: parsed ?? null,
        content,
      } as unknown as Database["public"]["Tables"]["consciousness_journeys"]["Insert"]["perplexity_analysis"],
      perplexity_prompt: promptSent,
      suno_generation_id: null,
      song_url: null,
      user_perceived_shift: null,
      saved_to_library: false,
      is_favorite: false,
    };

    type JourneyRow = Database["public"]["Tables"]["consciousness_journeys"]["Row"];

    const { data: journeyRow, error: insertError } = await supabase
      .from("consciousness_journeys")
      .insert(insertPayload)
      .select("*")
      .single();

    if (insertError || !journeyRow) {
      console.error("Failed to insert consciousness_journeys:", insertError);
      return NextResponse.json({ error: "Failed to save journey" }, { status: 500 });
    }

    const journeyRowTyped = journeyRow as unknown as JourneyRow;

    const journey: ConsciousnessJourney = {
      id: journeyRowTyped.id,
      user_id: journeyRowTyped.user_id,
      current_consciousness_level:
        journeyRowTyped.current_consciousness_level ?? current_consciousness_level,
      desired_consciousness_level:
        journeyRowTyped.desired_consciousness_level ?? desired_consciousness_level,
      perplexity_analysis:
        (journeyRowTyped.perplexity_analysis as Record<string, any> | null) ?? {},
      perplexity_prompt: journeyRowTyped.perplexity_prompt ?? promptSent,
      suno_generation_id: journeyRowTyped.suno_generation_id,
      song_url: journeyRowTyped.song_url,
      user_perceived_shift: journeyRowTyped.user_perceived_shift,
      saved_to_library: journeyRowTyped.saved_to_library,
      is_favorite: journeyRowTyped.is_favorite,
      created_at: journeyRowTyped.created_at,
      updated_at: journeyRowTyped.updated_at,
    };

    const responseBody: AnalyzeResponseBody = {
      id: journey.id,
      journey,
      analysis,
      sunoPrompt,
    };

    return NextResponse.json(responseBody, { status: 200 });
  } catch (error) {
    console.error("consciousness.analyze unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

