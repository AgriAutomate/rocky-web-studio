import { NextResponse, type NextRequest } from "next/server";

import { createSsrSupabaseClient } from "@/lib/supabase/ssr";
import type { ConsciousnessProgress, Database } from "@/types/consciousness";

type ProgressSummary = {
  totalSessions: number;
  currentWeekAverage: number;
  overallTrend: "ascending" | "stable" | "descending";
  mostCommonJourney: string | null;
  lowestLevelReached: number | null;
  highestLevelReached: number | null;
  consistencyScore: number; // 0–100
};

type ProgressResponseBody = {
  records: ConsciousnessProgress[];
  summary: ProgressSummary | null;
};

const DEFAULT_DAYS = 30;
const MAX_DAYS = 365;

function toIsoDate(d: Date) {
  // YYYY-MM-DD
  return d.toISOString().slice(0, 10);
}

function clampDays(value: string | null): number {
  if (!value) return DEFAULT_DAYS;
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_DAYS;
  const int = Math.floor(n);
  if (int < 1 || int > MAX_DAYS) return DEFAULT_DAYS;
  return int;
}

function avg(values: Array<number | null | undefined>): number | null {
  const filtered = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (filtered.length === 0) return null;
  return filtered.reduce((a, b) => a + b, 0) / filtered.length;
}

function mapProgressRow(
  row: Database["public"]["Tables"]["consciousness_progress"]["Row"]
): ConsciousnessProgress {
  return {
    id: row.id,
    user_id: row.user_id,
    date: row.date,
    average_current_level: row.average_current_level ?? 0,
    average_desired_level: row.average_desired_level ?? 0,
    sessions_today: row.sessions_today ?? 0,
    trend: (row.trend ?? "stable") as "ascending" | "stable" | "descending",
    monthly_sessions: row.monthly_sessions ?? 0,
    created_at: row.created_at,
  };
}

/**
 * GET /api/consciousness/progress
 *
 * Returns the authenticated user's progress stats from `consciousness_progress`.
 * Supports optional `days` query param (default 30, max 365).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSsrSupabaseClient<Database>();

    // Auth (same pattern as analyze/generate)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("consciousness.progress auth error:", authError);
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const days = clampDays(request.nextUrl.searchParams.get("days"));

    const today = new Date();
    const from = new Date(today);
    from.setDate(today.getDate() - (days - 1));

    const fromDate = toIsoDate(from);
    const toDate = toIsoDate(today);

    type ProgressRow = Database["public"]["Tables"]["consciousness_progress"]["Row"];

    const { data: rowsRaw, error: fetchError } = await supabase
      .from("consciousness_progress")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", fromDate)
      .lte("date", toDate)
      .order("date", { ascending: false });

    if (fetchError) {
      console.error("consciousness.progress fetch error:", fetchError);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    const rows = (rowsRaw ?? []) as unknown as ProgressRow[];
    const records = rows.map(mapProgressRow);

    if (rows.length === 0) {
      const responseBody: ProgressResponseBody = { records: [], summary: null };
      return NextResponse.json(responseBody, { status: 200 });
    }

    // Derived metrics
    const totalSessions = rows.reduce((sum, r) => sum + (r.sessions_today ?? 0), 0);

    // Current week average: use last 7 days (robust in absence of full week boundaries)
    const last7 = new Date(today);
    last7.setDate(today.getDate() - 6);
    const last7Iso = toIsoDate(last7);
    const last7Rows = rows.filter((r) => r.date >= last7Iso);
    const currentWeekAverage = avg(last7Rows.map((r) => r.average_current_level)) ?? 0;

    // Overall trend: compare older half vs newer half of the window.
    const asc = [...rows].reverse(); // oldest -> newest
    const mid = Math.floor(asc.length / 2);
    const older = asc.slice(0, mid);
    const newer = asc.slice(mid);
    const olderAvg = avg(older.map((r) => r.average_current_level));
    const newerAvg = avg(newer.map((r) => r.average_current_level));
    let overallTrend: "ascending" | "stable" | "descending" = "stable";
    if (olderAvg != null && newerAvg != null) {
      const delta = newerAvg - olderAvg;
      if (delta > 0.1) overallTrend = "ascending";
      else if (delta < -0.1) overallTrend = "descending";
    }

    // Most common journey: based on rounded (avg_current_level, avg_desired_level) pairs
    const counts = new Map<string, number>();
    for (const r of rows) {
      if (typeof r.average_current_level !== "number" || typeof r.average_desired_level !== "number") continue;
      const c = r.average_current_level;
      const d = r.average_desired_level;
      if (!Number.isFinite(c) || !Number.isFinite(d)) continue;
      const label = `${Math.round(c)} → ${Math.round(d)}`;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    let mostCommonJourney: string | null = null;
    let best = 0;
    for (const [label, count] of counts.entries()) {
      if (count > best) {
        best = count;
        mostCommonJourney = label;
      }
    }

    const currentLevels = rows
      .map((r) => r.average_current_level)
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    const lowestLevelReached = currentLevels.length ? Math.min(...currentLevels) : null;
    const highestLevelReached = currentLevels.length ? Math.max(...currentLevels) : null;

    const activeDays = rows.filter((r) => (r.sessions_today ?? 0) > 0).length;
    const consistencyScore = Math.round((activeDays / days) * 100);

    const summary: ProgressSummary = {
      totalSessions,
      currentWeekAverage,
      overallTrend,
      mostCommonJourney,
      lowestLevelReached,
      highestLevelReached,
      consistencyScore,
    };

    const responseBody: ProgressResponseBody = { records, summary };
    return NextResponse.json(responseBody, { status: 200 });
  } catch (error) {
    console.error("consciousness.progress unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

