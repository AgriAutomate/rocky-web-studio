"use client";

import * as React from "react";
import Link from "next/link";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getConsciousnessSupabaseBrowserClient } from "@/lib/consciousness/supabase";
import type { ConsciousnessLevel, ConsciousnessProgress } from "@/types/consciousness";

type ProgressSummary = {
  totalSessions: number;
  currentWeekAverage: number;
  overallTrend: "ascending" | "stable" | "descending";
  mostCommonJourney: string | null;
  lowestLevelReached: number | null;
  highestLevelReached: number | null;
  consistencyScore: number;
};

type ProgressResponse = {
  records: ConsciousnessProgress[];
  summary: ProgressSummary | null;
};

type TimeframeKey = "week" | "month" | "quarter" | "all";

const TIMEFRAMES: Array<{ key: TimeframeKey; label: string; days: number }> = [
  { key: "week", label: "Week", days: 7 },
  { key: "month", label: "Month", days: 30 },
  { key: "quarter", label: "3 Months", days: 90 },
  { key: "all", label: "All Time", days: 365 },
];

const FALLBACK_LEVELS: ConsciousnessLevel[] = [
  { level: 2, name: "Shame", description: "", characteristics: [], energy_level: 1, color_hex: "#7c2d12" },
  { level: 4, name: "Guilt", description: "", characteristics: [], energy_level: 2, color_hex: "#9a3412" },
  { level: 6, name: "Apathy", description: "", characteristics: [], energy_level: 3, color_hex: "#6b7280" },
  { level: 8, name: "Fear", description: "", characteristics: [], energy_level: 7, color_hex: "#2563eb" },
  { level: 10, name: "Anger", description: "", characteristics: [], energy_level: 8, color_hex: "#dc2626" },
  { level: 12, name: "Desire", description: "", characteristics: [], energy_level: 7, color_hex: "#f59e0b" },
  { level: 14, name: "Reason", description: "", characteristics: [], energy_level: 5, color_hex: "#0ea5e9" },
  { level: 16, name: "Loving", description: "", characteristics: [], energy_level: 4, color_hex: "#16a34a" },
  { level: 18, name: "Joy", description: "", characteristics: [], energy_level: 4, color_hex: "#0f766e" },
];

function sortLevels(levels: ConsciousnessLevel[]) {
  return [...levels].sort((a, b) => a.level - b.level);
}

function avg(values: Array<number | null | undefined>): number | null {
  const xs = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function snapLevel(v: number) {
  const n = Math.round(v / 2) * 2;
  return clamp(n, 2, 18);
}

function formatDateLabel(iso: string) {
  // iso: YYYY-MM-DD
  const t = Date.parse(`${iso}T00:00:00Z`);
  if (!Number.isFinite(t)) return iso;
  return new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatWeekLabel(iso: string) {
  // iso: YYYY-MM-DD
  const t = Date.parse(`${iso}T00:00:00Z`);
  if (!Number.isFinite(t)) return iso;
  const d = new Date(t);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function trendIcon(t: ProgressSummary["overallTrend"] | null) {
  if (t === "ascending") return "↑";
  if (t === "descending") return "↓";
  return "＝";
}

function levelName(levels: ConsciousnessLevel[], level: number | null | undefined) {
  const n = typeof level === "number" ? level : 0;
  return levels.find((l) => l.level === n)?.name ?? `Level ${n || "—"}`;
}

function levelColor(levels: ConsciousnessLevel[], level: number | null | undefined) {
  const n = typeof level === "number" ? level : 0;
  return levels.find((l) => l.level === n)?.color_hex ?? "#0f766e";
}

function makeCsv(records: ConsciousnessProgress[]) {
  const header = [
    "date",
    "average_current_level",
    "average_desired_level",
    "sessions_today",
    "monthly_sessions",
    "trend",
  ];
  const rows = records.map((r) => [
    r.date,
    String(r.average_current_level ?? ""),
    String(r.average_desired_level ?? ""),
    String(r.sessions_today ?? ""),
    String(r.monthly_sessions ?? ""),
    String(r.trend ?? ""),
  ]);
  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

function csvEscape(v: string) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

export function ProgressPageClient() {
  const [timeframe, setTimeframe] = React.useState<TimeframeKey>("month");
  const [levels, setLevels] = React.useState<ConsciousnessLevel[] | null>(null);

  const [records, setRecords] = React.useState<ConsciousnessProgress[]>([]);
  const [summary, setSummary] = React.useState<ProgressSummary | null>(null);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Persist timeframe
    try {
      const raw = localStorage.getItem("consciousness:progress:timeframe");
      if (raw === "week" || raw === "month" || raw === "quarter" || raw === "all") {
        setTimeframe(raw);
      }
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem("consciousness:progress:timeframe", timeframe);
    } catch {
      // ignore
    }
  }, [timeframe]);

  React.useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const consciousnessSupabase = getConsciousnessSupabaseBrowserClient();
        // Ensure user is authenticated (helps show a clean error instead of chart noise)
        const {
          data: { user },
        } = await consciousnessSupabase.auth.getUser();
        if (!user) {
          throw new Error("Unauthorized");
        }

        const days = TIMEFRAMES.find((t) => t.key === timeframe)?.days ?? 30;
        const [levelsRes, progressRes] = await Promise.all([
          consciousnessSupabase
            .from("consciousness_levels_reference")
            .select("level,name,description,characteristics,energy_level,color_hex")
            .order("level", { ascending: true }),
          fetch(`/api/consciousness/progress?days=${days}`, { method: "GET" }),
        ]);

        const levelsNormalized: ConsciousnessLevel[] = (levelsRes.data ?? [])
          .map((row) => ({
            level: row.level,
            name: row.name,
            description: row.description ?? "",
            characteristics: row.characteristics ?? [],
            energy_level: row.energy_level ?? 5,
            color_hex: row.color_hex ?? "#0f766e",
          }))
          .filter((l) => l.level >= 2 && l.level <= 18)
          .filter((l) => l.level % 2 === 0);

        const progressJson = (await progressRes.json().catch(() => ({}))) as Partial<ProgressResponse>;
        if (!progressRes.ok) {
          throw new Error((progressJson as any)?.error || "Failed to load progress.");
        }

        if (!active) return;
        setLevels(levelsNormalized.length ? levelsNormalized : FALLBACK_LEVELS);
        setRecords(progressJson.records ?? []);
        setSummary(progressJson.summary ?? null);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || "Failed to load progress.");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [timeframe]);

  const scale = sortLevels(levels ?? FALLBACK_LEVELS);

  const chartData = React.useMemo(() => {
    // API returns newest -> oldest, chart expects ascending.
    return [...records]
      .slice()
      .reverse()
      .map((r) => ({
        date: r.date,
        dateLabel: formatDateLabel(r.date),
        current: r.average_current_level ?? 0,
        desired: r.average_desired_level ?? 0,
        sessions: r.sessions_today ?? 0,
        trend: r.trend ?? "stable",
      }));
  }, [records]);

  const currentAvg = avg(records.map((r) => r.average_current_level)) ?? 0;
  const desiredAvg = avg(records.map((r) => r.average_desired_level)) ?? 0;

  // Weekly sessions aggregation
  const weeklyData = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const r of records) {
      const iso = r.date;
      const t = Date.parse(`${iso}T00:00:00Z`);
      if (!Number.isFinite(t)) continue;
      const d = new Date(t);
      // Week bucket: Monday start
      const day = (d.getUTCDay() + 6) % 7; // 0=Mon
      const monday = new Date(d);
      monday.setUTCDate(d.getUTCDate() - day);
      const key = monday.toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + (r.sessions_today ?? 0));
    }
    return Array.from(map.entries())
      .sort((a, b) => Date.parse(a[0]) - Date.parse(b[0]))
      .map(([weekStart, sessions]) => ({
        weekStart,
        label: formatWeekLabel(weekStart),
        sessions,
      }));
  }, [records]);

  // Pair heatmap: snapped (avg_current, avg_desired)
  const pairs = React.useMemo(() => {
    const levelsList = scale.map((l) => l.level);
    const counts = new Map<string, number>();
    for (const r of records) {
      const c = typeof r.average_current_level === "number" ? r.average_current_level : null;
      const d = typeof r.average_desired_level === "number" ? r.average_desired_level : null;
      if (c == null || d == null) continue;
      const cs = snapLevel(c);
      const ds = snapLevel(d);
      const key = `${cs}:${ds}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    let max = 0;
    for (const v of counts.values()) max = Math.max(max, v);

    const startCounts = new Map<number, number>();
    const destCounts = new Map<number, number>();
    for (const [key, v] of counts.entries()) {
      const [csStr, dsStr] = key.split(":");
      const cs = Number(csStr);
      const ds = Number(dsStr);
      startCounts.set(cs, (startCounts.get(cs) ?? 0) + v);
      destCounts.set(ds, (destCounts.get(ds) ?? 0) + v);
    }

    const bestStart = [...startCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const bestDest = [...destCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return { levelsList, counts, max, bestStart, bestDest };
  }, [records, scale]);

  const insights = React.useMemo(() => {
    const s = summary;
    if (!s) return [];
    const lines: string[] = [];
    if (s.overallTrend === "ascending") lines.push("You’re trending upward overall.");
    if (s.overallTrend === "descending") lines.push("You’re trending downward overall.");
    if (s.overallTrend === "stable") lines.push("Your trend is stable overall.");
    if (s.mostCommonJourney) lines.push(`Your most frequent journey is ${s.mostCommonJourney}.`);
    if (s.consistencyScore >= 70) lines.push("You’ve been consistent recently.");
    if (s.consistencyScore < 40) lines.push("Consistency is low—consider smaller, more frequent sessions.");
    return lines;
  }, [summary]);

  const trendStroke = "#0f766e";
  const desiredStroke = "#2563eb";

  const gradientStops = React.useMemo(() => {
    const sorted = sortLevels(scale);
    if (sorted.length === 0) return [{ offset: "0%", color: "#dc2626" }, { offset: "100%", color: "#ffffff" }];
    const n = sorted.length - 1;
    return sorted.map((l, i) => ({
      offset: `${n === 0 ? 0 : (i / n) * 100}%`,
      color: l.color_hex,
    }));
  }, [scale]);

  const canExport = records.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Progress
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your consciousness evolution over time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Step 6 of 6</Badge>
          <Select value={timeframe} onValueChange={(v) => setTimeframe(v as TimeframeKey)}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              {TIMEFRAMES.map((t) => (
                <SelectItem key={t.key} value={t.key}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            disabled={!canExport}
            onClick={() => {
              const csv = makeCsv(records);
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `consciousness-progress-${timeframe}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download CSV
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={!summary}
            onClick={async () => {
              if (!summary) return;
              const text = [
                "Consciousness Progress Summary (anonymized)",
                `Timeframe: ${TIMEFRAMES.find((t) => t.key === timeframe)?.label ?? timeframe}`,
                `Total journeys: ${summary.totalSessions}`,
                `Current avg: ${currentAvg.toFixed(2)}`,
                `Desired avg: ${desiredAvg.toFixed(2)}`,
                `Trend: ${summary.overallTrend}`,
                `Consistency: ${summary.consistencyScore}%`,
                `Most common: ${summary.mostCommonJourney ?? "—"}`,
                `Range: ${summary.lowestLevelReached?.toFixed(2) ?? "—"} → ${summary.highestLevelReached?.toFixed(2) ?? "—"}`,
              ].join("\n");
              try {
                await navigator.clipboard.writeText(text);
              } catch {
                // ignore
              }
            }}
          >
            Share summary
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-muted/40 p-6 text-sm text-muted-foreground">
          Loading progress…
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {error}
          <div className="mt-3">
            <Button asChild variant="outline">
              <Link href="/consciousness/start">Create a journey</Link>
            </Button>
          </div>
        </div>
      ) : null}

      {!loading && !error && records.length === 0 ? (
        <div className="rounded-2xl border border-border bg-muted/30 p-8">
          <div className="text-lg font-semibold text-foreground">No progress data yet.</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Once you’ve generated journeys, your progress timeline will appear here.
          </div>
          <div className="mt-4">
            <Button asChild>
              <Link href="/consciousness/start">Create your first journey</Link>
            </Button>
          </div>
        </div>
      ) : null}

      {!loading && !error && records.length > 0 ? (
        <>
          {/* Metric cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total journeys</CardTitle>
                <CardDescription>Sessions in this timeframe</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-foreground">
                  {summary?.totalSessions ?? 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Current average</CardTitle>
                <CardDescription>Avg current level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-foreground">
                  {currentAvg.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Desired average</CardTitle>
                <CardDescription>Avg desired level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-foreground">
                  {desiredAvg.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Trend direction</CardTitle>
                <CardDescription>Older vs newer half</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-semibold text-foreground">
                    {trendIcon(summary?.overallTrend ?? "stable")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {summary?.overallTrend ?? "stable"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Consistency</CardTitle>
                <CardDescription>% active days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-foreground">
                  {summary?.consistencyScore ?? 0}%
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Most common journey</CardTitle>
                <CardDescription>Snapped averages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold text-foreground">
                  {summary?.mostCommonJourney ?? "—"}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Lowest reached</CardTitle>
                <CardDescription>Avg current min</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-foreground">
                  {summary?.lowestLevelReached != null
                    ? summary.lowestLevelReached.toFixed(2)
                    : "—"}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Highest reached</CardTitle>
                <CardDescription>Avg current max</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-foreground">
                  {summary?.highestLevelReached != null
                    ? summary.highestLevelReached.toFixed(2)
                    : "—"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trend chart */}
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-lg">Consciousness trend over time</CardTitle>
              <CardDescription>
                Current average vs desired average (levels 2–18).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[340px] w-full rounded-2xl border border-border bg-background p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 16, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hawkLine" x1="0" y1="0" x2="1" y2="0">
                        {gradientStops.map((s) => (
                          <stop key={s.offset} offset={s.offset} stopColor={s.color} />
                        ))}
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} />
                    <YAxis
                      domain={[2, 18]}
                      ticks={[2, 4, 6, 8, 10, 12, 14, 16, 18]}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 12,
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      formatter={(value: any, name: any) => [
                        Number(value).toFixed(2),
                        name === "current" ? "Current avg" : "Desired avg",
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="current"
                      stroke="url(#hawkLine)"
                      strokeWidth={3}
                      dot={{ r: 2 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="desired"
                      stroke={desiredStroke}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Patterns */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="text-lg">Journey pairs heatmap</CardTitle>
                <CardDescription>
                  Counts of snapped (avg current → avg desired) pairs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <div className="min-w-[520px]">
                    <div className="grid grid-cols-[80px_repeat(9,1fr)] gap-2">
                      <div className="text-xs text-muted-foreground">Start \\ Dest</div>
                      {pairs.levelsList.map((lvl) => (
                        <div key={`x-${lvl}`} className="text-center text-xs text-muted-foreground">
                          {lvl}
                        </div>
                      ))}

                      {pairs.levelsList.map((from) => (
                        <React.Fragment key={`row-${from}`}>
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: levelColor(scale, from) }}
                              aria-hidden="true"
                            />
                            <span className="text-xs text-muted-foreground">{from}</span>
                          </div>
                          {pairs.levelsList.map((to) => {
                            const key = `${from}:${to}`;
                            const count = pairs.counts.get(key) ?? 0;
                            const intensity =
                              pairs.max > 0 ? clamp(count / pairs.max, 0, 1) : 0;
                            const bg = buildHeatColor(from, to, scale);
                            return (
                              <div
                                key={key}
                                title={`${from} → ${to}: ${count}`}
                                className="h-9 rounded-md border border-border"
                                style={{
                                  backgroundImage: bg,
                                  opacity: count === 0 ? 0.15 : 0.25 + intensity * 0.75,
                                }}
                              />
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>Most common start:</span>
                  <Badge variant="outline">
                    {pairs.bestStart ? `${pairs.bestStart} (${levelName(scale, pairs.bestStart)})` : "—"}
                  </Badge>
                  <span>Most common destination:</span>
                  <Badge variant="outline">
                    {pairs.bestDest ? `${pairs.bestDest} (${levelName(scale, pairs.bestDest)})` : "—"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="text-lg">Session frequency</CardTitle>
                <CardDescription>Journeys per week.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[340px] w-full rounded-2xl border border-border bg-background p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 16, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 12,
                        }}
                        formatter={(value: any) => [value, "Sessions"]}
                      />
                      <Bar dataKey="sessions" fill={trendStroke} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-lg">Insights</CardTitle>
              <CardDescription>Lightweight, generated from your stats.</CardDescription>
            </CardHeader>
            <CardContent>
              {insights.length ? (
                <ul className="list-disc space-y-2 pl-5 text-sm text-foreground">
                  {insights.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground">—</div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function buildHeatColor(from: number, to: number, levels: ConsciousnessLevel[]) {
  const a = levelColor(levels, from);
  const b = levelColor(levels, to);
  return `linear-gradient(135deg, ${a}, ${b})`;
}

