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

function energyLabel(n: number) {
  if (n >= 8) return "High";
  if (n >= 5) return "Steady";
  return "Low";
}

export function StartPageClient() {
  const router = useRouter();

  const currentConsciousnessLevel = useConsciousnessStore(
    (s) => s.currentConsciousnessLevel
  );
  const setCurrentConsciousnessLevel = useConsciousnessStore(
    (s) => s.setCurrentConsciousnessLevel
  );
  const unlockStep = useConsciousnessStore((s) => s.unlockStep);

  const [levels, setLevels] = React.useState<ConsciousnessLevel[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
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
      } catch (e: any) {
        if (!active) return;
        setLevels(FALLBACK_LEVELS);
        setLoadError(
          hasConsciousnessSupabaseEnv()
            ? "Couldn’t load the scale from Supabase (table/RLS/auth). Showing the built‑in scale for now."
            : "Supabase isn’t configured (missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). Showing the built‑in scale for now."
        );
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const list = levels ?? FALLBACK_LEVELS;
  const sorted = sortLevels(list);

  const selectedLevel =
    currentConsciousnessLevel !== null
      ? sorted.find((l) => l.level === currentConsciousnessLevel) ?? null
      : null;

  const sliderValue = selectedLevel?.level ?? 10;
  const gradient = buildScaleGradient(sorted);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Where are you right now?
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select your current consciousness level (2–18). This isn’t about judging
            your state—just locating it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Step 1 of 6</Badge>
          {selectedLevel ? (
            <Badge
              className="border-transparent text-primary-foreground"
              style={{ backgroundColor: selectedLevel.color_hex }}
            >
              Level {selectedLevel.level}: {selectedLevel.name}
            </Badge>
          ) : (
            <Badge variant="secondary">Select a level to continue</Badge>
          )}
        </div>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          {loadError}
        </div>
      ) : null}

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-lg">Current level</CardTitle>
          <CardDescription>
            Drag the slider or tap a level below. The slider snaps to the 9 scale
            levels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <div
              className="rounded-2xl border border-border bg-background p-4"
              style={{
                boxShadow: selectedLevel
                  ? `0 0 0 3px ${selectedLevel.color_hex}22`
                  : undefined,
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">Selected</div>
                <div className="text-sm font-medium text-foreground">
                  {selectedLevel ? (
                    <>
                      Level {selectedLevel.level} — {selectedLevel.name}
                    </>
                  ) : (
                    "Not selected yet"
                  )}
                </div>
              </div>

              <div className="mt-3">
                <input
                  aria-label="Current consciousness level"
                  type="range"
                  min={2}
                  max={18}
                  step={2}
                  value={sliderValue}
                  onChange={(e) =>
                    setCurrentConsciousnessLevel(Number(e.target.value))
                  }
                  className={cn(
                    "h-4 w-full cursor-pointer appearance-none rounded-full border border-border",
                    "transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                  style={{
                    backgroundImage: gradient,
                    accentColor: selectedLevel?.color_hex ?? undefined,
                  }}
                />

                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>2</span>
                  <span>18</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-border/80">
                <CardHeader className="pb-0">
                  <CardTitle className="text-base">Meaning</CardTitle>
                  <CardDescription>
                    What this level tends to feel like and signal.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {selectedLevel ? (
                    <div className="space-y-3">
                      <div
                        className="h-2 w-full rounded-full"
                        style={{
                          backgroundImage: `linear-gradient(90deg, ${selectedLevel.color_hex}, ${selectedLevel.color_hex}aa)`,
                        }}
                      />
                      <p className="text-sm text-foreground">
                        {selectedLevel.description || "—"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Choose a level to see its meaning.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/80">
                <CardHeader className="pb-0">
                  <CardTitle className="text-base">
                    Energy & characteristics
                  </CardTitle>
                  <CardDescription>
                    A quick snapshot of energy, emotions, and traits.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {selectedLevel ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium text-foreground">
                          Energy
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedLevel.energy_level}/10 ({energyLabel(selectedLevel.energy_level)})
                        </div>
                      </div>

                      <div className="grid grid-cols-10 gap-1">
                        {Array.from({ length: 10 }).map((_, i) => {
                          const filled = i < selectedLevel.energy_level;
                          return (
                            <div
                              key={i}
                              className={cn(
                                "h-2 rounded-sm border border-border/70 transition-colors",
                                filled ? "" : "bg-muted"
                              )}
                              style={
                                filled
                                  ? { backgroundColor: selectedLevel.color_hex }
                                  : undefined
                              }
                            />
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(selectedLevel.characteristics ?? []).length ? (
                          selectedLevel.characteristics.map((c) => (
                            <Badge key={c} variant="secondary">
                              {c}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No characteristics listed.
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Choose a level to see its energy and characteristics.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-foreground">
                  All levels
                </div>
                <div className="text-xs text-muted-foreground">
                  Tap a level to jump the slider.
                </div>
              </div>
              {loading ? (
                <span className="text-xs text-muted-foreground">Loading…</span>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {sorted.map((l) => {
                const active = l.level === selectedLevel?.level;
                return (
                  <button
                    key={l.level}
                    type="button"
                    onClick={() => setCurrentConsciousnessLevel(l.level)}
                    className={cn(
                      "group rounded-xl border px-3 py-3 text-left transition-all",
                      "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "border-transparent bg-accent"
                        : "border-border bg-background"
                    )}
                    style={
                      active
                        ? { boxShadow: `0 0 0 2px ${l.color_hex}55` }
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-muted-foreground">
                        Level {l.level}
                      </div>
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: l.color_hex }}
                      />
                    </div>
                    <div className="mt-1 text-sm font-medium text-foreground">
                      {l.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/consciousness")}
            >
              Back
            </Button>

            <Button
              type="button"
              disabled={!selectedLevel}
              onClick={() => {
                if (!selectedLevel) return;
                unlockStep(1);
                router.push("/consciousness/destination");
              }}
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

