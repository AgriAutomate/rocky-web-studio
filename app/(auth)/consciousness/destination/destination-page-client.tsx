"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  getConsciousnessSupabaseBrowserClient,
  hasConsciousnessSupabaseEnv,
} from "@/lib/consciousness/supabase";
import { useConsciousnessStore } from "@/lib/consciousness/store";
import { cn } from "@/lib/utils";
import type { ConsciousnessLevel } from "@/types/consciousness";

const FALLBACK_LEVELS: ConsciousnessLevel[] = [
  {
    level: 2,
    name: "Shame",
    description: "Despair, unworthiness, collapse.",
    characteristics: ["despair", "unworthiness", "collapse"],
    energy_level: 1,
    color_hex: "#7c2d12",
  },
  {
    level: 4,
    name: "Guilt",
    description: "Regret, shame projection, vulnerability.",
    characteristics: ["regret", "vulnerability", "self-blame"],
    energy_level: 2,
    color_hex: "#9a3412",
  },
  {
    level: 6,
    name: "Apathy",
    description: "Indifference, numbness, pause, futility.",
    characteristics: ["numbness", "pause", "futility"],
    energy_level: 3,
    color_hex: "#6b7280",
  },
  {
    level: 8,
    name: "Fear",
    description: "Anxiety, worry, uncertainty, building.",
    characteristics: ["anxiety", "worry", "uncertainty"],
    energy_level: 7,
    color_hex: "#2563eb",
  },
  {
    level: 10,
    name: "Anger",
    description: "Power, assertion, truth-telling, strength.",
    characteristics: ["assertion", "truth-telling", "strength"],
    energy_level: 8,
    color_hex: "#dc2626",
  },
  {
    level: 12,
    name: "Desire",
    description: "Ambition, wanting, striving, growth.",
    characteristics: ["ambition", "striving", "growth"],
    energy_level: 7,
    color_hex: "#f59e0b",
  },
  {
    level: 14,
    name: "Reason",
    description: "Understanding, clarity, logic, balance.",
    characteristics: ["clarity", "logic", "balance"],
    energy_level: 5,
    color_hex: "#0ea5e9",
  },
  {
    level: 16,
    name: "Loving",
    description: "Compassion, acceptance, forgiveness.",
    characteristics: ["compassion", "acceptance", "forgiveness"],
    energy_level: 4,
    color_hex: "#16a34a",
  },
  {
    level: 18,
    name: "Joy",
    description: "Happiness, fulfillment, creation, presence.",
    characteristics: ["presence", "creation", "fulfillment"],
    energy_level: 4,
    color_hex: "#0f766e",
  },
];

function sortLevels(levels: ConsciousnessLevel[]) {
  return [...levels].sort((a, b) => a.level - b.level);
}

function buildScaleGradient(levels: ConsciousnessLevel[]) {
  const sorted = sortLevels(levels);
  if (sorted.length === 0) return "linear-gradient(90deg, #0f766e, #059669)";
  const n = sorted.length - 1;
  const stops = sorted.map((l, i) => {
    const pct = n === 0 ? 0 : (i / n) * 100;
    return `${l.color_hex} ${pct.toFixed(2)}%`;
  });
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function xForLevel(level: number) {
  // Map 2..18 -> 8..92 (padding so dots don't clip)
  const t = clamp01((level - 2) / (18 - 2));
  return 8 + t * 84;
}

function deltaLabel(delta: number) {
  if (!Number.isFinite(delta) || delta === 0) return "0";
  return `${delta > 0 ? "+" : ""}${delta}`;
}

function stepsCount(delta: number) {
  return Math.round(Math.abs(delta) / 2);
}

function safeString(v: unknown) {
  if (typeof v === "string") return v;
  return "";
}

export function DestinationPageClient() {
  const router = useRouter();

  const current = useConsciousnessStore((s) => s.currentConsciousnessLevel);
  const desired = useConsciousnessStore((s) => s.desiredConsciousnessLevel);
  const contextNote = useConsciousnessStore((s) => s.contextNote);

  const setDesired = useConsciousnessStore((s) => s.setDesiredConsciousnessLevel);
  const setContextNote = useConsciousnessStore((s) => s.setContextNote);
  const setGenerationState = useConsciousnessStore((s) => s.setGenerationState);
  const unlockStep = useConsciousnessStore((s) => s.unlockStep);

  const [levels, setLevels] = React.useState<ConsciousnessLevel[] | null>(null);
  const [loadingLevels, setLoadingLevels] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<{
    journeyId: string;
    sunoGenerationId: string;
    pollUrl: string;
    estimatedWaitTime: number;
  } | null>(null);

  React.useEffect(() => {
    let active = true;

    async function load() {
      setLoadingLevels(true);
      setLoadError(null);
      try {
        const supabase = getConsciousnessSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("consciousness_levels_reference")
          .select("level,name,description,characteristics,energy_level,color_hex")
          .order("level", { ascending: true });

        if (error) throw error;

        const normalized: ConsciousnessLevel[] = (data ?? [])
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

        if (!active) return;
        setLevels(normalized.length ? normalized : FALLBACK_LEVELS);
      } catch (e) {
        if (!active) return;
        setLevels(FALLBACK_LEVELS);
        setLoadError(
          hasConsciousnessSupabaseEnv()
            ? "Couldn’t load the scale from Supabase (table/RLS/auth). Showing the built‑in scale for now."
            : "Supabase isn’t configured (missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). Showing the built‑in scale for now."
        );
      } finally {
        if (!active) return;
        setLoadingLevels(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const list = levels ?? FALLBACK_LEVELS;
  const sorted = sortLevels(list);
  const gradient = buildScaleGradient(sorted);

  const currentLevel = current
    ? sorted.find((l) => l.level === current) ?? null
    : null;
  const desiredLevel = desired
    ? sorted.find((l) => l.level === desired) ?? null
    : null;

  const delta = (desired ?? 0) - (current ?? 0);

  const currentValue = current ?? 10;
  const desiredValue = desiredLevel?.level ?? 14;

  const x1 = xForLevel(currentValue);
  const x2 = xForLevel(desiredValue);
  const xm = (x1 + x2) / 2;
  const arcHeight = 8; // smaller is taller arc
  const yBase = 30;

  const canGenerate = Boolean(currentLevel && desiredLevel);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Where do you want to go?
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a destination level. You can choose the same level (self-reinforcement),
            move up, or move down.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Step 2 of 6</Badge>
          {currentLevel ? (
            <Badge
              className="border-transparent text-primary-foreground"
              style={{ backgroundColor: currentLevel.color_hex }}
            >
              Current: {currentLevel.level} {currentLevel.name}
            </Badge>
          ) : (
            <Badge variant="destructive">Select Start first</Badge>
          )}
          {desiredLevel ? (
            <Badge
              className="border-transparent text-primary-foreground"
              style={{ backgroundColor: desiredLevel.color_hex }}
            >
              Desired: {desiredLevel.level} {desiredLevel.name}
            </Badge>
          ) : (
            <Badge variant="secondary">Choose a destination</Badge>
          )}
        </div>
      </div>

      {!currentLevel ? (
        <div className="rounded-2xl border border-border bg-muted/40 p-4">
          <div className="text-sm font-medium text-foreground">
            You haven’t selected your current level yet.
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Go back to Start to choose your current state first.
          </div>
          <div className="mt-3">
            <Button type="button" onClick={() => router.push("/consciousness/start")}>
              Go to Start
            </Button>
          </div>
        </div>
      ) : null}

      {loadError ? (
        <div className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          {loadError}
        </div>
      ) : null}

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-lg">Your journey</CardTitle>
          <CardDescription>
            Current is read-only. Move the destination slider to shape the arc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Dual sliders */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-foreground">Current</div>
                <div className="text-sm text-muted-foreground">
                  {currentLevel ? (
                    <>
                      Level {currentLevel.level} — {currentLevel.name}
                    </>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
              <div className="mt-3">
                <input
                  aria-label="Current consciousness level (read-only)"
                  type="range"
                  min={2}
                  max={18}
                  step={2}
                  value={currentValue}
                  disabled
                  className={cn(
                    "h-4 w-full cursor-not-allowed appearance-none rounded-full border border-border opacity-80",
                    "focus-visible:outline-none"
                  )}
                  style={{
                    backgroundImage: gradient,
                    accentColor: currentLevel?.color_hex ?? undefined,
                  }}
                />
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>2</span>
                  <span>18</span>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl border border-border bg-background p-4"
              style={{
                boxShadow: desiredLevel ? `0 0 0 3px ${desiredLevel.color_hex}22` : undefined,
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-foreground">Destination</div>
                <div className="text-sm text-muted-foreground">
                  {desiredLevel ? (
                    <>
                      Level {desiredLevel.level} — {desiredLevel.name}
                    </>
                  ) : (
                    "Not selected yet"
                  )}
                </div>
              </div>
              <div className="mt-3">
                <input
                  aria-label="Desired consciousness level"
                  type="range"
                  min={2}
                  max={18}
                  step={2}
                  value={desiredValue}
                  onChange={(e) => setDesired(Number(e.target.value))}
                  className={cn(
                    "h-4 w-full cursor-pointer appearance-none rounded-full border border-border",
                    "transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                  style={{
                    backgroundImage: gradient,
                    accentColor: desiredLevel?.color_hex ?? undefined,
                  }}
                />
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>2</span>
                  <span>18</span>
                </div>
              </div>
            </div>
          </div>

          {/* Arc visualization */}
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">
                  Journey arc
                </div>
                <div className="text-xs text-muted-foreground">
                  Distance: {deltaLabel(delta)} levels ({stepsCount(delta)} steps)
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {loadingLevels ? "Loading levels…" : "Live preview"}
              </div>
            </div>

            <div className="mt-3">
              <svg
                viewBox="0 0 100 36"
                className="h-28 w-full"
                role="img"
                aria-label="Journey arc visualization"
              >
                <defs>
                  <linearGradient id="journeyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop
                      offset="0%"
                      stopColor={currentLevel?.color_hex ?? "#0f766e"}
                    />
                    <stop
                      offset="100%"
                      stopColor={desiredLevel?.color_hex ?? "#059669"}
                    />
                  </linearGradient>
                </defs>

                {/* baseline */}
                <line
                  x1="8"
                  y1={yBase}
                  x2="92"
                  y2={yBase}
                  stroke="currentColor"
                  className="text-border"
                  strokeWidth="1"
                />

                {/* arc */}
                <path
                  d={`M ${x1} ${yBase} Q ${xm} ${arcHeight} ${x2} ${yBase}`}
                  fill="none"
                  stroke="url(#journeyGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* start / end points */}
                <circle
                  cx={x1}
                  cy={yBase}
                  r="3.5"
                  fill={currentLevel?.color_hex ?? "#0f766e"}
                />
                <circle
                  cx={x2}
                  cy={yBase}
                  r="3.5"
                  fill={desiredLevel?.color_hex ?? "#059669"}
                  opacity={desiredLevel ? 1 : 0.35}
                />
              </svg>
            </div>
          </div>

          {/* Level descriptions */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/80">
              <CardHeader className="pb-0">
                <CardTitle className="text-base">Current meaning</CardTitle>
                <CardDescription>
                  {currentLevel ? `Level ${currentLevel.level} — ${currentLevel.name}` : "—"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {currentLevel ? (
                  <div className="space-y-3">
                    <div
                      className="h-2 w-full rounded-full"
                      style={{
                        backgroundImage: `linear-gradient(90deg, ${currentLevel.color_hex}, ${currentLevel.color_hex}aa)`,
                      }}
                    />
                    <p className="text-sm text-foreground">
                      {currentLevel.description || "—"}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select your current level on the Start step.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardHeader className="pb-0">
                <CardTitle className="text-base">Destination meaning</CardTitle>
                <CardDescription>
                  {desiredLevel ? `Level ${desiredLevel.level} — ${desiredLevel.name}` : "—"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {desiredLevel ? (
                  <div className="space-y-3">
                    <div
                      className="h-2 w-full rounded-full"
                      style={{
                        backgroundImage: `linear-gradient(90deg, ${desiredLevel.color_hex}, ${desiredLevel.color_hex}aa)`,
                      }}
                    />
                    <p className="text-sm text-foreground">
                      {desiredLevel.description || "—"}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Choose a destination to see its meaning.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Context */}
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">
                  Optional context
                </div>
                <div className="text-xs text-muted-foreground">
                  Why are you seeking this shift? (You can skip this.)
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="justify-start text-muted-foreground hover:text-foreground"
                onClick={() => setContextNote("")}
              >
                Skip context
              </Button>
            </div>

            <div className="mt-3">
              <Textarea
                value={contextNote}
                onChange={(e) => setContextNote(e.target.value)}
                placeholder="Example: I’m feeling stuck in fear around work. I want to move into clarity and steadiness so I can take the next step."
              />
            </div>
          </div>

          {/* Actions */}
          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
              <div className="font-medium">Generation started</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Job: {success.sunoGenerationId} • ETA ~{success.estimatedWaitTime}s
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Poll URL: <span className="font-mono">{success.pollUrl}</span>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/consciousness/start")}
            >
              Back
            </Button>

            <Button
              type="button"
              disabled={!canGenerate || busy}
              onClick={async () => {
                if (!currentLevel || !desiredLevel) return;

                setBusy(true);
                setError(null);
                setSuccess(null);

                try {
                  const analyzeRes = await fetch("/api/consciousness/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      current_consciousness_level: currentLevel.level,
                      desired_consciousness_level: desiredLevel.level,
                      context: safeString(contextNote).trim() || undefined,
                    }),
                  });

                  const analyzeJson = await analyzeRes.json().catch(() => ({}));
                  if (!analyzeRes.ok) {
                    throw new Error(
                      analyzeJson?.error ||
                        analyzeJson?.message ||
                        "Failed to analyze journey."
                    );
                  }

                  const journeyId =
                    (analyzeJson?.journey?.id as string | undefined) ??
                    (analyzeJson?.id as string | undefined);
                  const sunoPrompt = analyzeJson?.sunoPrompt as string | undefined;

                  if (!journeyId || !sunoPrompt) {
                    throw new Error("Analyze response missing journey id or Suno prompt.");
                  }

                  const generateRes = await fetch("/api/consciousness/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ journeyId, sunoPrompt }),
                  });

                  const generateJson = await generateRes.json().catch(() => ({}));
                  if (!generateRes.ok) {
                    throw new Error(
                      generateJson?.error ||
                        generateJson?.message ||
                        "Failed to start Suno generation."
                    );
                  }

                  const sunoGenerationId = generateJson?.sunoGenerationId as string | undefined;
                  const pollUrl = generateJson?.pollUrl as string | undefined;
                  const estimatedWaitTime = Number(generateJson?.estimatedWaitTime ?? 0) || 0;

                  if (!sunoGenerationId || !pollUrl) {
                    throw new Error("Generate response missing generation id or poll URL.");
                  }

                  setGenerationState({
                    journeyId,
                    sunoPrompt,
                    sunoGenerationId,
                    pollUrl,
                  });

                  // Mark Destination as complete → unlock Journey step.
                  unlockStep(2);

                  setSuccess({
                    journeyId,
                    sunoGenerationId,
                    pollUrl,
                    estimatedWaitTime,
                  });
                } catch (e: any) {
                  setError(e?.message || "Something went wrong.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Generating…" : "Generate Song"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

