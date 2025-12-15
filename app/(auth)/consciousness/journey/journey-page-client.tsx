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
import { getConsciousnessSupabaseBrowserClient } from "@/lib/consciousness/supabase";
import { useConsciousnessStore } from "@/lib/consciousness/store";
import { cn } from "@/lib/utils";
import type { ConsciousnessLevel } from "@/types/consciousness";

type UiPhase = "ANALYZING" | "GENERATING" | "READY" | "ERROR";

type JourneyStatus = "pending" | "complete" | "failed";

const FALLBACK_LEVELS: ConsciousnessLevel[] = [
  { level: 2, name: "Shame", description: "Despair, unworthiness, collapse.", characteristics: ["despair"], energy_level: 1, color_hex: "#7c2d12" },
  { level: 4, name: "Guilt", description: "Regret, shame projection, vulnerability.", characteristics: ["regret"], energy_level: 2, color_hex: "#9a3412" },
  { level: 6, name: "Apathy", description: "Indifference, numbness, pause, futility.", characteristics: ["numbness"], energy_level: 3, color_hex: "#6b7280" },
  { level: 8, name: "Fear", description: "Anxiety, worry, uncertainty, building.", characteristics: ["anxiety"], energy_level: 7, color_hex: "#2563eb" },
  { level: 10, name: "Anger", description: "Power, assertion, truth-telling, strength.", characteristics: ["assertion"], energy_level: 8, color_hex: "#dc2626" },
  { level: 12, name: "Desire", description: "Ambition, wanting, striving, growth.", characteristics: ["ambition"], energy_level: 7, color_hex: "#f59e0b" },
  { level: 14, name: "Reason", description: "Understanding, clarity, logic, balance.", characteristics: ["clarity"], energy_level: 5, color_hex: "#0ea5e9" },
  { level: 16, name: "Loving", description: "Compassion, acceptance, forgiveness.", characteristics: ["compassion"], energy_level: 4, color_hex: "#16a34a" },
  { level: 18, name: "Joy", description: "Happiness, fulfillment, creation, presence.", characteristics: ["presence"], energy_level: 4, color_hex: "#0f766e" },
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

function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-foreground",
        className
      )}
      aria-hidden="true"
    />
  );
}

function SkeletonLine({ w = "w-full" }: { w?: string }) {
  return <div className={cn("h-4 rounded-md bg-muted animate-pulse", w)} />;
}

export function JourneyPageClient() {
  const router = useRouter();

  const current = useConsciousnessStore((s) => s.currentConsciousnessLevel);
  const desired = useConsciousnessStore((s) => s.desiredConsciousnessLevel);
  const contextNote = useConsciousnessStore((s) => s.contextNote);

  const journeyId = useConsciousnessStore((s) => s.journeyId);
  const sunoPrompt = useConsciousnessStore((s) => s.sunoPrompt);
  const sunoGenerationId = useConsciousnessStore((s) => s.sunoGenerationId);
  const estimatedWaitTime = useConsciousnessStore((s) => s.estimatedWaitTime);
  const perplexityPrompt = useConsciousnessStore((s) => s.perplexityPrompt);
  const analysis = useConsciousnessStore((s) => s.analysis);

  const setGenerationState = useConsciousnessStore((s) => s.setGenerationState);
  const setGenerationStatus = useConsciousnessStore((s) => s.setGenerationStatus);
  const incrementPollingAttempts = useConsciousnessStore((s) => s.incrementPollingAttempts);
  const clearJourney = useConsciousnessStore((s) => s.clearJourney);
  const unlockStep = useConsciousnessStore((s) => s.unlockStep);
  const pollingAttempts = useConsciousnessStore((s) => s.pollingAttempts);

  const [levels, setLevels] = React.useState<ConsciousnessLevel[] | null>(null);
  const [uiPhase, setUiPhase] = React.useState<UiPhase>("ANALYZING");
  const [error, setError] = React.useState<string | null>(null);

  const [journeyStatus, setJourneyStatus] = React.useState<JourneyStatus>("pending");
  const [readyToPlay, setReadyToPlay] = React.useState(false);

  const [startedAt, setStartedAt] = React.useState<number>(() => Date.now());
  const [pollTimer, setPollTimer] = React.useState<ReturnType<typeof setInterval> | null>(null);
  const [now, setNow] = React.useState<number>(() => Date.now());

  // Load scale (for colors + arc)
  React.useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = getConsciousnessSupabaseBrowserClient();
        const { data } = await supabase
          .from("consciousness_levels_reference")
          .select("level,name,description,characteristics,energy_level,color_hex")
          .order("level", { ascending: true });

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
      } catch {
        if (!active) return;
        setLevels(FALLBACK_LEVELS);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const scale = sortLevels(levels ?? FALLBACK_LEVELS);
  const gradient = buildScaleGradient(scale);

  const currentLevel =
    current !== null ? scale.find((l) => l.level === current) ?? null : null;
  const desiredLevel =
    desired !== null ? scale.find((l) => l.level === desired) ?? null : null;

  const delta = (desired ?? 0) - (current ?? 0);
  const x1 = xForLevel(current ?? 10);
  const x2 = xForLevel(desired ?? 14);
  const xm = (x1 + x2) / 2;

  const canRun = Boolean(currentLevel && desiredLevel);

  // Ensure prerequisites are set; if not, send the user back.
  React.useEffect(() => {
    if (!canRun) {
      router.replace("/consciousness/destination");
    }
  }, [canRun, router]);

  const startPolling = React.useCallback(
    (id: string) => {
      if (pollTimer) {
        clearInterval(pollTimer);
      }

      const timer = setInterval(async () => {
        try {
          incrementPollingAttempts();
          const res = await fetch(`/api/consciousness/journey/${encodeURIComponent(id)}`, {
            method: "GET",
          });
          const json = await res.json().catch(() => ({}));

          if (!res.ok) {
            throw new Error(json?.error || "Failed to fetch journey status.");
          }

          const status = (json?.generationStatus as JourneyStatus | undefined) ?? "pending";
          const ready = Boolean(json?.readyToPlay);
          setJourneyStatus(status);
          setReadyToPlay(ready);

          if (status === "failed") {
            setGenerationStatus("failed");
            setUiPhase("ERROR");
            setError("Song generation failed. You can retry generation.");
            clearInterval(timer);
            return;
          }

          if (ready || status === "complete") {
            setGenerationStatus("ready");
            setUiPhase("READY");
            clearInterval(timer);

            // Unlock Experience step and auto-advance.
            unlockStep(3);
            setTimeout(() => {
              router.push("/consciousness/experience");
            }, 900);
          }
        } catch (e: any) {
          console.error("journey poll error:", e);
          setGenerationStatus("error");
          setUiPhase("ERROR");
          setError(e?.message || "Unable to check generation status.");
        }
      }, 3000);

      setPollTimer(timer);
    },
    [incrementPollingAttempts, pollTimer, router, setGenerationStatus, unlockStep]
  );

  const runAnalyzeThenGenerate = React.useCallback(async () => {
    if (!currentLevel || !desiredLevel) return;

    setError(null);
    setUiPhase("ANALYZING");
    setGenerationStatus("analyzing");
    setStartedAt(Date.now());

    try {
      // Analyze
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
        throw new Error(analyzeJson?.error || "Analysis failed.");
      }

      const nextJourneyId =
        (analyzeJson?.journey?.id as string | undefined) ??
        (analyzeJson?.id as string | undefined);
      const nextSunoPrompt = analyzeJson?.sunoPrompt as string | undefined;
      const nextPerplexityPrompt = analyzeJson?.journey?.perplexity_prompt as string | undefined;
      const nextAnalysis = (analyzeJson?.analysis as Record<string, any> | undefined) ?? null;

      if (!nextJourneyId || !nextSunoPrompt) {
        throw new Error("Analyze response missing journey id or Suno prompt.");
      }

      setGenerationState({
        journeyId: nextJourneyId,
        sunoPrompt: nextSunoPrompt,
        perplexityPrompt: nextPerplexityPrompt ?? null,
        analysis: nextAnalysis,
      });

      // Generate
      setUiPhase("GENERATING");
      setGenerationStatus("generating");

      const genRes = await fetch("/api/consciousness/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journeyId: nextJourneyId, sunoPrompt: nextSunoPrompt }),
      });
      const genJson = await genRes.json().catch(() => ({}));
      if (!genRes.ok) {
        throw new Error(genJson?.error || "Failed to start generation.");
      }

      const nextSunoGenerationId = genJson?.sunoGenerationId as string | undefined;
      const nextPollUrl = genJson?.pollUrl as string | undefined;
      const nextEta = Number(genJson?.estimatedWaitTime ?? 0) || null;

      if (!nextSunoGenerationId) {
        throw new Error("Generate response missing generation id.");
      }

      setGenerationState({
        sunoGenerationId: nextSunoGenerationId,
        pollUrl: nextPollUrl ?? null,
        estimatedWaitTime: nextEta,
      });

      // Journey step is now "in progress"; keep the user here and poll.
      unlockStep(2);
      startPolling(nextJourneyId);
    } catch (e: any) {
      console.error("journey run error:", e);
      setGenerationStatus("error");
      setUiPhase("ERROR");
      setError(e?.message || "Something went wrong.");
    }
  }, [
    contextNote,
    currentLevel,
    desiredLevel,
    setGenerationState,
    setGenerationStatus,
    startPolling,
    unlockStep,
  ]);

  const runGenerateOnly = React.useCallback(async () => {
    if (!journeyId || !sunoPrompt) return;
    setError(null);
    setUiPhase("GENERATING");
    setGenerationStatus("generating");
    setStartedAt(Date.now());

    try {
      const genRes = await fetch("/api/consciousness/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journeyId, sunoPrompt }),
      });
      const genJson = await genRes.json().catch(() => ({}));
      if (!genRes.ok) {
        throw new Error(genJson?.error || "Failed to start generation.");
      }

      const nextSunoGenerationId = genJson?.sunoGenerationId as string | undefined;
      const nextPollUrl = genJson?.pollUrl as string | undefined;
      const nextEta = Number(genJson?.estimatedWaitTime ?? 0) || null;

      if (!nextSunoGenerationId) {
        throw new Error("Generate response missing generation id.");
      }

      setGenerationState({
        sunoGenerationId: nextSunoGenerationId,
        pollUrl: nextPollUrl ?? null,
        estimatedWaitTime: nextEta,
      });

      startPolling(journeyId);
    } catch (e: any) {
      console.error("journey generate error:", e);
      setGenerationStatus("error");
      setUiPhase("ERROR");
      setError(e?.message || "Generation failed.");
    }
  }, [journeyId, setGenerationState, setGenerationStatus, startPolling, sunoPrompt]);

  // Auto-start logic:
  // - If we already have a journey id and generation id → just poll.
  // - If we have journey id + sunoPrompt but no generation id → generate then poll.
  // - Else → analyze + generate then poll.
  React.useEffect(() => {
    if (!canRun) return;

    if (journeyId && sunoGenerationId) {
      setUiPhase("GENERATING");
      setGenerationStatus("generating");
      startPolling(journeyId);
      return;
    }

    if (journeyId && sunoPrompt && !sunoGenerationId) {
      runGenerateOnly();
      return;
    }

    runAnalyzeThenGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRun]);

  React.useEffect(() => {
    return () => {
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [pollTimer]);

  // Ticker for smooth ETA/progress updates
  React.useEffect(() => {
    if (uiPhase !== "ANALYZING" && uiPhase !== "GENERATING") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [uiPhase]);

  const elapsedSeconds = Math.floor((now - startedAt) / 1000);
  const eta = estimatedWaitTime ?? 240;
  const remaining = Math.max(0, eta - elapsedSeconds);
  const fakePct = clamp01(elapsedSeconds / eta);

  const acknowledgement =
    (analysis && typeof (analysis as any).acknowledgement === "string"
      ? String((analysis as any).acknowledgement)
      : "") || "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Your journey is forming
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We’ll analyze your path, generate a Suno prompt, then create your song.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Step 3 of 6</Badge>
          {currentLevel ? (
            <Badge
              className="border-transparent text-primary-foreground"
              style={{ backgroundColor: currentLevel.color_hex }}
            >
              Current: {currentLevel.level} {currentLevel.name}
            </Badge>
          ) : null}
          {desiredLevel ? (
            <Badge
              className="border-transparent text-primary-foreground"
              style={{ backgroundColor: desiredLevel.color_hex }}
            >
              Desired: {desiredLevel.level} {desiredLevel.name}
            </Badge>
          ) : null}
        </div>
      </div>

      {/* Arc */}
      <div className="rounded-2xl border border-border bg-background p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium text-foreground">Journey arc</div>
            <div className="text-xs text-muted-foreground">
              Distance: {deltaLabel(delta)} levels ({stepsCount(delta)} steps)
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Journey ID:{" "}
            <span className="font-mono">{journeyId ? journeyId.slice(0, 8) : "—"}</span>
          </div>
        </div>

        <div className="mt-3">
          <svg viewBox="0 0 100 36" className="h-28 w-full" role="img" aria-label="Journey arc">
            <defs>
              <linearGradient id="journeyGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={currentLevel?.color_hex ?? "#0f766e"} />
                <stop offset="100%" stopColor={desiredLevel?.color_hex ?? "#059669"} />
              </linearGradient>
            </defs>

            <line x1="8" y1="30" x2="92" y2="30" stroke="currentColor" className="text-border" strokeWidth="1" />
            <path
              d={`M ${x1} 30 Q ${xm} 8 ${x2} 30`}
              fill="none"
              stroke="url(#journeyGradient2)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx={x1} cy="30" r="3.5" fill={currentLevel?.color_hex ?? "#0f766e"} />
            <circle cx={x2} cy="30" r="3.5" fill={desiredLevel?.color_hex ?? "#059669"} />
          </svg>
        </div>

        <div className="mt-3">
          <div
            className="h-2 w-full rounded-full border border-border"
            style={{ backgroundImage: gradient }}
          />
        </div>
      </div>

      {/* Status card */}
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-lg">
            {uiPhase === "ANALYZING"
              ? "Analyzing your consciousness journey…"
              : uiPhase === "GENERATING"
                ? "Creating your personal consciousness song…"
                : uiPhase === "READY"
                  ? "Your song is ready!"
                  : "Something went wrong"}
          </CardTitle>
          <CardDescription>
            {uiPhase === "ANALYZING"
              ? "Perplexity is mapping your journey and creating a Suno prompt."
              : uiPhase === "GENERATING"
                ? "Suno is generating your track asynchronously."
                : uiPhase === "READY"
                  ? "We’ll take you to the listening experience next."
                  : "You can retry without losing your selections."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {uiPhase === "ANALYZING" ? (
            <div className="flex items-center gap-3">
              <Spinner />
              <div className="text-sm text-muted-foreground">
                Contacting Perplexity… (this usually takes a few seconds)
              </div>
            </div>
          ) : null}

          {uiPhase === "GENERATING" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Spinner />
                  <div className="text-sm text-muted-foreground">
                    Status:{" "}
                    <span className="font-medium text-foreground">
                      {journeyStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  ETA ~{remaining}s
                </div>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-[width] duration-500"
                  style={{ width: `${Math.round(fakePct * 100)}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Generating… {Math.round(fakePct * 100)}%
                {sunoGenerationId ? (
                  <>
                    {" "}
                    • Job: <span className="font-mono">{sunoGenerationId.slice(0, 10)}</span>
                  </>
                ) : null}
                {readyToPlay ? (
                  <>
                    {" "}
                    • <span className="text-foreground">Ready</span>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}

          {uiPhase === "READY" ? (
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <div className="text-sm font-medium text-foreground">
                Your song is ready. Let’s listen.
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                If auto-advance doesn’t happen, use the button below.
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Button type="button" onClick={() => router.push("/consciousness/experience")}>
                  Go to Experience
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/consciousness/history")}>
                  View History
                </Button>
              </div>
            </div>
          ) : null}

          {uiPhase === "ERROR" ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error || "An error occurred."}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  onClick={() => {
                    // Retry from the best available state
                    if (journeyId && sunoPrompt) runGenerateOnly();
                    else runAnalyzeThenGenerate();
                  }}
                >
                  Retry
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    clearJourney();
                    router.push("/consciousness/destination");
                  }}
                >
                  Back to Destination
                </Button>
              </div>
            </div>
          ) : null}

          {/* Perplexity prompt + analysis */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/80">
              <CardHeader className="pb-0">
                <CardTitle className="text-base">Perplexity prompt</CardTitle>
                <CardDescription>What we send for analysis.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {perplexityPrompt ? (
                  <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-background p-3 text-xs text-foreground">
                    {perplexityPrompt}
                  </pre>
                ) : uiPhase === "ANALYZING" ? (
                  <div className="space-y-2">
                    <SkeletonLine />
                    <SkeletonLine w="w-5/6" />
                    <SkeletonLine w="w-2/3" />
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">—</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardHeader className="pb-0">
                <CardTitle className="text-base">What it understood</CardTitle>
                <CardDescription>Perplexity’s analysis (best-effort).</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {acknowledgement ? (
                  <p className="text-sm text-foreground">{acknowledgement}</p>
                ) : analysis ? (
                  <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-background p-3 text-xs text-foreground">
                    {JSON.stringify(analysis, null, 2)}
                  </pre>
                ) : uiPhase === "ANALYZING" ? (
                  <div className="space-y-2">
                    <SkeletonLine />
                    <SkeletonLine w="w-4/6" />
                    <SkeletonLine w="w-3/6" />
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">—</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Footer actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                clearJourney();
                router.push("/consciousness/destination");
              }}
            >
              Back
            </Button>

            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Polling: {pollingAttempts}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => {
                  if (journeyId) startPolling(journeyId);
                }}
              >
                Refresh status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

