"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getConsciousnessSupabaseBrowserClient } from "@/lib/consciousness/supabase";
import { useConsciousnessStore } from "@/lib/consciousness/store";
import { cn } from "@/lib/utils";
import type { ConsciousnessJourney, ConsciousnessLevel } from "@/types/consciousness";

type JourneyGetResponse = {
  journey: ConsciousnessJourney;
  readyToPlay: boolean;
  generationStatus: "pending" | "complete" | "failed";
};

type PlayMeta = {
  count: number;
  lastPlayedAt: string | null;
  durationSec: number | null;
};

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

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function msAgoLabel(iso: string) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "—";
  const deltaMs = Date.now() - t;
  const mins = Math.floor(deltaMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function playKey(id: string) {
  return `consciousness:play:${id}`;
}

function getPlayMeta(id: string): PlayMeta {
  try {
    const raw = localStorage.getItem(playKey(id));
    if (!raw) return { count: 0, lastPlayedAt: null, durationSec: null };
    const parsed = JSON.parse(raw) as any;
    return {
      count: typeof parsed?.count === "number" ? parsed.count : 0,
      lastPlayedAt: typeof parsed?.lastPlayedAt === "string" ? parsed.lastPlayedAt : null,
      durationSec: typeof parsed?.durationSec === "number" ? parsed.durationSec : null,
    };
  } catch {
    return { count: 0, lastPlayedAt: null, durationSec: null };
  }
}

function setPlayMeta(id: string, next: Partial<PlayMeta>) {
  try {
    const prev = getPlayMeta(id);
    const merged: PlayMeta = {
      count: typeof next.count === "number" ? next.count : prev.count,
      lastPlayedAt:
        typeof next.lastPlayedAt === "string" ? next.lastPlayedAt : prev.lastPlayedAt,
      durationSec:
        typeof next.durationSec === "number" ? next.durationSec : prev.durationSec,
    };
    localStorage.setItem(playKey(id), JSON.stringify(merged));
  } catch {
    // ignore
  }
}

function extractSunoPromptFromJourney(journey: ConsciousnessJourney): string | null {
  const anyAnalysis = journey.perplexity_analysis as any;
  const parsed = anyAnalysis?.parsed;
  const prompt = parsed?.sunoPrompt;
  if (typeof prompt === "string" && prompt.trim()) return prompt.trim();
  return null;
}

function extractAnalysisSummary(journey: ConsciousnessJourney): string | null {
  const anyAnalysis = journey.perplexity_analysis as any;
  const parsed = anyAnalysis?.parsed;
  const ack = parsed?.acknowledgement;
  if (typeof ack === "string" && ack.trim()) return ack.trim();
  return null;
}

function Star({
  filled,
  onClick,
  label,
}: {
  filled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "h-9 w-9 rounded-md border border-border transition-colors",
        "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        filled ? "bg-primary text-primary-foreground" : "bg-background text-foreground"
      )}
    >
      ★
    </button>
  );
}

export function ExperiencePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const storeJourneyId = useConsciousnessStore((s) => s.journeyId);
  const storeSunoPrompt = useConsciousnessStore((s) => s.sunoPrompt);
  const contextNote = useConsciousnessStore((s) => s.contextNote);
  const clearJourney = useConsciousnessStore((s) => s.clearJourney);
  const reset = useConsciousnessStore((s) => s.reset);
  const setGenerationState = useConsciousnessStore((s) => s.setGenerationState);
  const unlockStep = useConsciousnessStore((s) => s.unlockStep);

  const journeyId = searchParams.get("journeyId") || storeJourneyId || "";

  const [levels, setLevels] = React.useState<ConsciousnessLevel[] | null>(null);
  const [journey, setJourney] = React.useState<ConsciousnessJourney | null>(null);
  const [journeyStatus, setJourneyStatus] = React.useState<
    "pending" | "complete" | "failed"
  >("pending");
  const [readyToPlay, setReadyToPlay] = React.useState(false);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Audio state
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [volume, setVolume] = React.useState(0.9);

  // Actions state
  const [busyAction, setBusyAction] = React.useState<
    null | "save" | "favorite" | "share" | "regenerate"
  >(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  // Rating (persisted per journey)
  const ratingKey = React.useMemo(
    () => (journeyId ? `consciousness:rating:${journeyId}` : null),
    [journeyId]
  );
  const [rating, setRating] = React.useState<number | null>(null);
  const [didResonate, setDidResonate] = React.useState<"yes" | "no" | null>(null);
  const [feedback, setFeedback] = React.useState("");

  React.useEffect(() => {
    unlockStep(4); // Experience reached → allow History
  }, [unlockStep]);

  React.useEffect(() => {
    if (!ratingKey) return;
    try {
      const raw = localStorage.getItem(ratingKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as any;
      if (typeof parsed?.rating === "number") setRating(parsed.rating);
      if (parsed?.didResonate === "yes" || parsed?.didResonate === "no") {
        setDidResonate(parsed.didResonate);
      }
      if (typeof parsed?.feedback === "string") setFeedback(parsed.feedback);
    } catch {
      // ignore
    }
  }, [ratingKey]);

  React.useEffect(() => {
    if (!ratingKey) return;
    try {
      localStorage.setItem(
        ratingKey,
        JSON.stringify({ rating, didResonate, feedback })
      );
    } catch {
      // ignore
    }
  }, [ratingKey, rating, didResonate, feedback]);

  // Load scale + journey
  React.useEffect(() => {
    let active = true;
    async function load() {
      if (!journeyId) {
        router.replace("/consciousness/journey");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [{ data }, journeyRes] = await Promise.all([
          getConsciousnessSupabaseBrowserClient()
            .from("consciousness_levels_reference")
            .select("level,name,description,characteristics,energy_level,color_hex")
            .order("level", { ascending: true }),
          fetch(`/api/consciousness/journey/${encodeURIComponent(journeyId)}`, {
            method: "GET",
          }),
        ]);

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

        const levelsList = normalized.length ? normalized : FALLBACK_LEVELS;

        const json = (await journeyRes.json().catch(() => ({}))) as Partial<JourneyGetResponse>;
        if (!journeyRes.ok) {
          throw new Error((json as any)?.error || "Failed to load journey.");
        }

        if (!active) return;

        setLevels(levelsList);
        setJourney(json.journey ?? null);
        setReadyToPlay(Boolean(json.readyToPlay));
        setJourneyStatus((json.generationStatus as any) ?? "pending");
      } catch (e: any) {
        if (!active) return;
        console.error("experience load error:", e);
        setError(e?.message || "Unable to load your experience.");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [journeyId, router]);

  // Keep audio element synced with volume
  React.useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
  }, [volume]);

  // Auto redirect if song not ready yet
  React.useEffect(() => {
    if (!loading && journey && (!journey.song_url || !readyToPlay)) {
      router.replace("/consciousness/journey");
    }
  }, [journey, readyToPlay, loading, router]);

  const scale = sortLevels(levels ?? FALLBACK_LEVELS);
  const currentLevel = journey
    ? scale.find((l) => l.level === journey.current_consciousness_level) ?? null
    : null;
  const desiredLevel = journey
    ? scale.find((l) => l.level === journey.desired_consciousness_level) ?? null
    : null;

  const delta = journey
    ? journey.desired_consciousness_level - journey.current_consciousness_level
    : 0;

  const x1 = xForLevel(journey?.current_consciousness_level ?? 10);
  const x2 = xForLevel(journey?.desired_consciousness_level ?? 14);
  const xm = (x1 + x2) / 2;

  const songUrl = (journey?.song_url ?? "").trim();
  const analysisSummary = journey ? extractAnalysisSummary(journey) : null;
  const sunoPromptUsed =
    storeSunoPrompt?.trim() ||
    (journey ? extractSunoPromptFromJourney(journey) : null) ||
    "";

  const intermediateStatesCount = journey
    ? Array.isArray((journey.perplexity_analysis as any)?.parsed?.intermediateStates)
      ? ((journey.perplexity_analysis as any)?.parsed?.intermediateStates as any[]).length
      : 0
    : 0;

  const authenticity =
    contextNote.trim().length > 0 && intermediateStatesCount > 0
      ? "High"
      : intermediateStatesCount > 0
        ? "Medium"
        : "Unknown";

  async function toggleFlag(kind: "save" | "favorite") {
    if (!journey) return;
    setBusyAction(kind);
    setNotice(null);
    try {
      const res = await fetch(`/api/consciousness/library/${journey.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          kind === "save"
            ? { toggleSavedToLibrary: true }
            : { toggleIsFavorite: true }
        ),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Update failed.");
      setJourney(json?.journey ?? journey);
    } catch (e: any) {
      console.error("toggle error:", e);
      setNotice(e?.message || "Unable to update.");
    } finally {
      setBusyAction(null);
    }
  }

  async function share() {
    if (!journey) return;
    setBusyAction("share");
    setNotice(null);
    try {
      const url = `${window.location.origin}/consciousness/experience?journeyId=${encodeURIComponent(
        journey.id
      )}`;
      await navigator.clipboard.writeText(url);
      setNotice("Share link copied to clipboard.");
    } catch (e) {
      setNotice("Couldn’t copy link. Your browser may block clipboard access.");
    } finally {
      setBusyAction(null);
    }
  }

  async function regenerate() {
    if (!journey) return;
    setBusyAction("regenerate");
    setNotice(null);
    try {
      const prompt = sunoPromptUsed.trim();
      if (!prompt) throw new Error("Missing Suno prompt. Please re-run analysis.");

      const res = await fetch("/api/consciousness/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journeyId: journey.id, sunoPrompt: prompt }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to trigger regeneration.");

      setGenerationState({
        journeyId: journey.id,
        sunoPrompt: prompt,
        sunoGenerationId: json?.sunoGenerationId ?? null,
        pollUrl: json?.pollUrl ?? null,
        estimatedWaitTime: Number(json?.estimatedWaitTime ?? 0) || null,
      });

      router.push("/consciousness/journey");
    } catch (e: any) {
      console.error("regenerate error:", e);
      setNotice(e?.message || "Unable to regenerate.");
    } finally {
      setBusyAction(null);
    }
  }

  function newJourney() {
    reset();
    router.push("/consciousness/start");
  }

  function seekTo(e: React.MouseEvent<HTMLDivElement>) {
    const el = audioRef.current;
    if (!el || duration <= 0) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const pct = clamp01((e.clientX - rect.left) / rect.width);
    el.currentTime = pct * duration;
  }

  const pct = duration > 0 ? clamp01(currentTime / duration) : 0;
  const idForMeta = journey?.id || journeyId;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Your consciousness song
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Listen, reflect, and save what resonates.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Step 4 of 6</Badge>
          <Badge variant="secondary">Authenticity: {authenticity}</Badge>
          <Badge variant="outline">Status: {journeyStatus}</Badge>
          {journey ? (
            <Badge variant="outline">
              Generated: {msAgoLabel(journey.updated_at || journey.created_at)}
            </Badge>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={() => router.push("/consciousness/journey")}>
              Back to Journey
            </Button>
            <Button type="button" variant="outline" onClick={() => newJourney()}>
              New Journey
            </Button>
          </div>
        </div>
      ) : null}

      {notice ? (
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
          {notice}
        </div>
      ) : null}

      {/* Journey header */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/80 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Player</CardTitle>
            <CardDescription>
              {journey ? (
                <>
                  {currentLevel ? (
                    <>
                      <span className="font-medium text-foreground">
                        {currentLevel.level} {currentLevel.name}
                      </span>
                      {" → "}
                    </>
                  ) : null}
                  {desiredLevel ? (
                    <span className="font-medium text-foreground">
                      {desiredLevel.level} {desiredLevel.name}
                    </span>
                  ) : null}
                  {" • "}
                  Distance {deltaLabel(delta)} ({stepsCount(delta)} steps)
                </>
              ) : (
                "Loading…"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Arc visualization */}
            <div className="rounded-2xl border border-border bg-background p-4">
              <svg viewBox="0 0 100 36" className="h-24 w-full" role="img" aria-label="Journey arc">
                <defs>
                  <linearGradient id="journeyGradientExperience" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={currentLevel?.color_hex ?? "#0f766e"} />
                    <stop offset="100%" stopColor={desiredLevel?.color_hex ?? "#059669"} />
                  </linearGradient>
                </defs>
                <line x1="8" y1="30" x2="92" y2="30" stroke="currentColor" className="text-border" strokeWidth="1" />
                <path
                  d={`M ${x1} 30 Q ${xm} 8 ${x2} 30`}
                  fill="none"
                  stroke="url(#journeyGradientExperience)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx={x1} cy="30" r="3.5" fill={currentLevel?.color_hex ?? "#0f766e"} />
                <circle cx={x2} cy="30" r="3.5" fill={desiredLevel?.color_hex ?? "#059669"} />
              </svg>
            </div>

            {/* Audio player */}
            <div className="rounded-2xl border border-border bg-background p-4">
              {!loading && !songUrl ? (
                <div className="text-sm text-muted-foreground">
                  Song is not ready yet. Returning to Journey…
                </div>
              ) : null}

              <audio
                ref={audioRef}
                src={songUrl || undefined}
                preload="metadata"
                onLoadedMetadata={() => {
                  const el = audioRef.current;
                  if (!el) return;
                  setDuration(el.duration || 0);
                  if (idForMeta && el.duration) {
                    setPlayMeta(idForMeta, { durationSec: el.duration });
                  }
                }}
                onTimeUpdate={() => {
                  const el = audioRef.current;
                  if (!el) return;
                  setCurrentTime(el.currentTime || 0);
                }}
                onPlay={() => {
                  setIsPlaying(true);
                  if (idForMeta) {
                    const meta = getPlayMeta(idForMeta);
                    setPlayMeta(idForMeta, {
                      count: meta.count + 1,
                      lastPlayedAt: new Date().toISOString(),
                    });
                  }
                }}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    disabled={!songUrl}
                    onClick={() => {
                      const el = audioRef.current;
                      if (!el) return;
                      if (el.paused) el.play();
                      else el.pause();
                    }}
                  >
                    {isPlaying ? "Pause" : "Play"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={!songUrl}
                    onClick={() => {
                      const el = audioRef.current;
                      if (!el) return;
                      el.currentTime = 0;
                      el.pause();
                    }}
                  >
                    Restart
                  </Button>

                  {songUrl ? (
                    <Button asChild type="button" variant="outline">
                      <a href={songUrl} download target="_blank" rel="noreferrer">
                        Download
                      </a>
                    </Button>
                  ) : null}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs text-muted-foreground tabular-nums">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Vol</Label>
                    <input
                      aria-label="Volume"
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-28"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div
                  role="slider"
                  aria-label="Seek"
                  onClick={seekTo}
                  className={cn(
                    "h-3 w-full cursor-pointer rounded-full border border-border bg-muted",
                    "transition-colors hover:bg-muted/70"
                  )}
                >
                  <div
                    className="h-3 rounded-full bg-primary transition-[width] duration-150"
                    style={{ width: `${Math.round(pct * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
            <CardDescription>Save and share your journey.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              type="button"
              variant={journey?.saved_to_library ? "default" : "outline"}
              disabled={!journey || busyAction !== null}
              onClick={() => toggleFlag("save")}
              className="w-full justify-start"
            >
              {journey?.saved_to_library ? "Saved to Library" : "Save to Library"}
            </Button>

            <Button
              type="button"
              variant={journey?.is_favorite ? "default" : "outline"}
              disabled={!journey || busyAction !== null}
              onClick={() => toggleFlag("favorite")}
              className="w-full justify-start"
            >
              {journey?.is_favorite ? "In Favorites" : "Add to Favorites"}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={!journey || busyAction !== null}
              onClick={share}
              className="w-full justify-start"
            >
              Share Journey
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={!journey || busyAction !== null}
              onClick={regenerate}
              className="w-full justify-start"
            >
              Regenerate
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={busyAction !== null}
              onClick={() => {
                clearJourney();
                newJourney();
              }}
              className="w-full justify-start"
            >
              New Journey
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Ratings */}
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-lg">Did this resonate?</CardTitle>
          <CardDescription>
            Rate the journey and optionally leave feedback (saved only in your browser for now).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  filled={(rating ?? 0) >= n}
                  onClick={() => setRating(n)}
                  label={`Rate ${n} star${n === 1 ? "" : "s"}`}
                />
              ))}
              <Button type="button" variant="ghost" onClick={() => setRating(null)}>
                Clear
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={didResonate === "yes" ? "default" : "outline"}
                onClick={() => setDidResonate("yes")}
              >
                Yes
              </Button>
              <Button
                type="button"
                variant={didResonate === "no" ? "default" : "outline"}
                onClick={() => setDidResonate("no")}
              >
                Not really
              </Button>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Optional feedback</Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What felt most true? What felt off? Anything you want the next song to emphasize?"
            />
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">Journey metadata</CardTitle>
            <CardDescription>Details used to generate your track.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
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
              {journey ? (
                <Badge variant="outline">
                  Created: {new Date(journey.created_at).toLocaleString()}
                </Badge>
              ) : null}
            </div>

            <div className="text-sm text-muted-foreground">
              Distance: {deltaLabel(delta)} ({stepsCount(delta)} steps)
            </div>

            {analysisSummary ? (
              <div className="rounded-xl border border-border bg-muted/40 p-3 text-sm text-foreground">
                <div className="mb-1 text-xs font-medium text-muted-foreground">
                  Perplexity summary
                </div>
                {analysisSummary}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">Suno prompt</CardTitle>
            <CardDescription>The prompt used to generate your track.</CardDescription>
          </CardHeader>
          <CardContent>
            {sunoPromptUsed ? (
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-background p-3 text-xs text-foreground">
                {sunoPromptUsed}
              </pre>
            ) : (
              <div className="text-sm text-muted-foreground">—</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" onClick={() => router.push("/consciousness/history")}>
          View History
        </Button>
        <Button type="button" onClick={() => router.push("/consciousness/progress")}>
          View Progress
        </Button>
      </div>
    </div>
  );
}

