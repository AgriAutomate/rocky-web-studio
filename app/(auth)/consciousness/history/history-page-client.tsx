"use client";

import * as React from "react";
import Link from "next/link";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getConsciousnessSupabaseBrowserClient } from "@/lib/consciousness/supabase";
import { useConsciousnessStore } from "@/lib/consciousness/store";
import { cn } from "@/lib/utils";
import type { ConsciousnessJourney, ConsciousnessLevel } from "@/types/consciousness";

type SortKey = "date_desc" | "date_asc" | "favorites" | "recent_plays";
type FilterKey = "all" | "up" | "down";
type ViewMode = "grid" | "list";

type PlayMeta = {
  count: number;
  lastPlayedAt: string | null;
  durationSec: number | null;
};

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

const PAGE_SIZE = 10;

function sortLevels(levels: ConsciousnessLevel[]) {
  return [...levels].sort((a, b) => a.level - b.level);
}

function deltaLabel(delta: number) {
  if (!Number.isFinite(delta) || delta === 0) return "0";
  return `${delta > 0 ? "+" : ""}${delta}`;
}

function stepsCount(delta: number) {
  return Math.round(Math.abs(delta) / 2);
}

function formatTime(seconds: number | null | undefined) {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function relativeTime(iso: string) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "—";
  const delta = Date.now() - t;
  const mins = Math.floor(delta / 60000);
  if (mins < 1) return "just now";
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

function buildJourneyThumb(fromHex: string, toHex: string) {
  return `linear-gradient(135deg, ${fromHex}, ${toHex})`;
}

function levelColor(levels: ConsciousnessLevel[], level: number, fallback: string) {
  return levels.find((l) => l.level === level)?.color_hex ?? fallback;
}

function levelName(levels: ConsciousnessLevel[], level: number) {
  return levels.find((l) => l.level === level)?.name ?? `Level ${level}`;
}

function extractSunoPrompt(journey: ConsciousnessJourney): string | null {
  const anyAnalysis = journey.perplexity_analysis as any;
  const parsed = anyAnalysis?.parsed;
  const prompt = parsed?.sunoPrompt;
  if (typeof prompt === "string" && prompt.trim()) return prompt.trim();
  return null;
}

export function HistoryPageClient() {
  const router = useRouter();
  const setGenerationState = useConsciousnessStore((s) => s.setGenerationState);
  const clearJourney = useConsciousnessStore((s) => s.clearJourney);

  const [levels, setLevels] = React.useState<ConsciousnessLevel[] | null>(null);
  const [journeys, setJourneys] = React.useState<ConsciousnessJourney[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [view, setView] = React.useState<ViewMode>("grid");
  const [sort, setSort] = React.useState<SortKey>("date_desc");
  const [filter, setFilter] = React.useState<FilterKey>("all");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  const [selected, setSelected] = React.useState<Set<string>>(() => new Set());
  const [confirmDelete, setConfirmDelete] = React.useState<{
    open: boolean;
    ids: string[];
  }>({ open: false, ids: [] });

  // Persist view/sort/filter
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("consciousness:history:ui");
      if (!raw) return;
      const parsed = JSON.parse(raw) as any;
      if (parsed?.view === "grid" || parsed?.view === "list") setView(parsed.view);
      if (
        parsed?.sort === "date_desc" ||
        parsed?.sort === "date_asc" ||
        parsed?.sort === "favorites" ||
        parsed?.sort === "recent_plays"
      )
        setSort(parsed.sort);
      if (parsed?.filter === "all" || parsed?.filter === "up" || parsed?.filter === "down")
        setFilter(parsed.filter);
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(
        "consciousness:history:ui",
        JSON.stringify({ view, sort, filter })
      );
    } catch {
      // ignore
    }
  }, [view, sort, filter]);

  // Load levels + saved journeys
  React.useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const consciousnessSupabase = getConsciousnessSupabaseBrowserClient();
        const {
          data: { user },
          error: authError,
        } = await consciousnessSupabase.auth.getUser();

        if (authError) {
          console.error("history auth error:", authError);
        }
        if (!user) {
          throw new Error("Unauthorized");
        }

        const [levelsRes, journeysRes] = await Promise.all([
          consciousnessSupabase
            .from("consciousness_levels_reference")
            .select("level,name,description,characteristics,energy_level,color_hex")
            .order("level", { ascending: true }),
          consciousnessSupabase
            .from("consciousness_journeys")
            .select(
              "id,user_id,current_consciousness_level,desired_consciousness_level,perplexity_analysis,perplexity_prompt,suno_generation_id,song_url,user_perceived_shift,saved_to_library,is_favorite,created_at,updated_at"
            )
            .eq("user_id", user.id)
            .eq("saved_to_library", true)
            .order("created_at", { ascending: false }),
        ]);

        if (levelsRes.error) throw levelsRes.error;
        if (journeysRes.error) throw journeysRes.error;

        const normalizedLevels: ConsciousnessLevel[] = (levelsRes.data ?? [])
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

        setLevels(normalizedLevels.length ? normalizedLevels : FALLBACK_LEVELS);
        setJourneys((journeysRes.data as unknown as ConsciousnessJourney[]) ?? []);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || "Failed to load saved journeys.");
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

  const scale = sortLevels(levels ?? FALLBACK_LEVELS);

  // Derived list (filter + search + sort)
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = journeys.slice();

    // Filter direction
    if (filter === "up") {
      list = list.filter((j) => (j.desired_consciousness_level ?? 0) > (j.current_consciousness_level ?? 0));
    } else if (filter === "down") {
      list = list.filter((j) => (j.desired_consciousness_level ?? 0) < (j.current_consciousness_level ?? 0));
    }

    // Search by level names
    if (q) {
      list = list.filter((j) => {
        const from = levelName(scale, j.current_consciousness_level);
        const to = levelName(scale, j.desired_consciousness_level);
        return `${from} ${to}`.toLowerCase().includes(q);
      });
    }

    // Sort
    if (sort === "date_desc") {
      list.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    } else if (sort === "date_asc") {
      list.sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
    } else if (sort === "favorites") {
      list.sort((a, b) => {
        const fav = Number(Boolean(b.is_favorite)) - Number(Boolean(a.is_favorite));
        if (fav !== 0) return fav;
        return Date.parse(b.created_at) - Date.parse(a.created_at);
      });
    } else if (sort === "recent_plays") {
      list.sort((a, b) => {
        const ap = getPlayMeta(a.id).lastPlayedAt;
        const bp = getPlayMeta(b.id).lastPlayedAt;
        const at = ap ? Date.parse(ap) : 0;
        const bt = bp ? Date.parse(bp) : 0;
        if (bt !== at) return bt - at;
        return Date.parse(b.created_at) - Date.parse(a.created_at);
      });
    }

    return list;
  }, [filter, journeys, scale, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.max(1, Math.min(page, totalPages));

  React.useEffect(() => {
    // If filters change, keep page valid.
    if (pageSafe !== page) setPage(pageSafe);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const paged = React.useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageSafe]);

  const allOnPageSelected = paged.length > 0 && paged.every((j) => selected.has(j.id));
  const anySelected = selected.size > 0;

  async function toggleFavorite(id: string) {
    try {
      const res = await fetch(`/api/consciousness/library/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggleIsFavorite: true }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Update failed.");
      setJourneys((prev) => prev.map((j) => (j.id === id ? (json.journey as any) : j)));
    } catch (e) {
      console.error("favorite toggle error:", e);
    }
  }

  async function deleteJourneys(ids: string[]) {
    if (ids.length === 0) return;
    try {
      const consciousnessSupabase = getConsciousnessSupabaseBrowserClient();
      const {
        data: { user },
      } = await consciousnessSupabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const { error: delError } = await consciousnessSupabase
        .from("consciousness_journeys")
        .delete()
        .in("id", ids)
        .eq("user_id", user.id);

      if (delError) throw delError;

      setJourneys((prev) => prev.filter((j) => !ids.includes(j.id)));
      setSelected((prev) => {
        const next = new Set(prev);
        for (const id of ids) next.delete(id);
        return next;
      });
    } catch (e) {
      console.error("delete error:", e);
    }
  }

  function onPlay(j: ConsciousnessJourney) {
    router.push(`/consciousness/experience?journeyId=${encodeURIComponent(j.id)}`);
  }

  async function copyLink(id: string) {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/consciousness/experience?journeyId=${encodeURIComponent(id)}`
      );
    } catch (e) {
      console.error("copy link error:", e);
    }
  }

  async function regenerate(j: ConsciousnessJourney) {
    const prompt = extractSunoPrompt(j);
    if (!prompt) {
      // Best effort: send them back to Destination to regenerate from scratch.
      clearJourney();
      router.push("/consciousness/destination");
      return;
    }

    setGenerationState({
      journeyId: j.id,
      sunoPrompt: prompt,
      sunoGenerationId: null,
      pollUrl: null,
      estimatedWaitTime: null,
    });

    router.push("/consciousness/journey");
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        for (const j of paged) next.delete(j.id);
      } else {
        for (const j of paged) next.add(j.id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Your library
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Saved journeys you can replay, favorite, and manage.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Step 5 of 6</Badge>
          <Badge variant="secondary">{journeys.length} saved</Badge>
        </div>
      </div>

      {/* Controls */}
      <Card className="border-border/80">
        <CardHeader className="pb-0">
          <CardTitle className="text-base">Search & filter</CardTitle>
          <CardDescription>Find journeys by level names and patterns.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by level name (e.g. Fear, Reason)…"
                className="w-full sm:max-w-sm"
              />

              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={filter}
                  onValueChange={(v) => {
                    setFilter(v as FilterKey);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All journeys</SelectItem>
                    <SelectItem value="up">Upward (+)</SelectItem>
                    <SelectItem value="down">Downward (-)</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sort}
                  onValueChange={(v) => {
                    setSort(v as SortKey);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">Date (newest)</SelectItem>
                    <SelectItem value="date_asc">Date (oldest)</SelectItem>
                    <SelectItem value="favorites">Favorites</SelectItem>
                    <SelectItem value="recent_plays">Recent plays</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={view === "grid" ? "default" : "outline"}
                onClick={() => setView("grid")}
              >
                Grid
              </Button>
              <Button
                type="button"
                variant={view === "list" ? "default" : "outline"}
                onClick={() => setView("list")}
              >
                List
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={toggleSelectAllOnPage}
                disabled={paged.length === 0}
              >
                {allOnPageSelected ? "Unselect page" : "Select page"}
              </Button>

              <Button
                type="button"
                variant="destructive"
                disabled={!anySelected}
                onClick={() => setConfirmDelete({ open: true, ids: Array.from(selected) })}
              >
                Delete selected ({selected.size})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="rounded-2xl border border-border bg-muted/40 p-6 text-sm text-muted-foreground">
          Loading saved journeys…
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {!loading && !error && filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-muted/30 p-8">
          <div className="text-lg font-semibold text-foreground">
            No journeys saved yet.
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Create your first journey and save it to your library.
          </div>
          <div className="mt-4">
            <Button asChild>
              <Link href="/consciousness/start">Create your first journey</Link>
            </Button>
          </div>
        </div>
      ) : null}

      {/* List */}
      {!loading && !error && filtered.length > 0 ? (
        <div
          className={cn(
            view === "grid"
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-3"
          )}
        >
          {paged.map((j) => {
            const from = j.current_consciousness_level;
            const to = j.desired_consciousness_level;
            const fromName = levelName(scale, from);
            const toName = levelName(scale, to);
            const fromColor = levelColor(scale, from, "#0f766e");
            const toColor = levelColor(scale, to, "#059669");
            const thumb = buildJourneyThumb(fromColor, toColor);

            const delta = to - from;
            const meta = getPlayMeta(j.id);

            return (
              <div
                key={j.id}
                className={cn(
                  "group rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
                  view === "list" ? "flex flex-col gap-3 sm:flex-row sm:items-center" : ""
                )}
                role="button"
                tabIndex={0}
                onClick={() => onPlay(j)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onPlay(j);
                }}
              >
                <div className={cn("flex items-start gap-3", view === "list" ? "flex-1" : "")}>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selected.has(j.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelect(j.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4"
                      aria-label="Select journey"
                    />
                    <div
                      className={cn(
                        "h-12 w-12 shrink-0 rounded-xl border border-border",
                        view === "list" ? "sm:h-14 sm:w-14" : ""
                      )}
                      style={{ backgroundImage: thumb }}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {fromName} → {toName}
                      </span>
                      {j.is_favorite ? <Badge>Favorite</Badge> : null}
                      <Badge variant="outline">
                        {deltaLabel(delta)} ({stepsCount(delta)} steps)
                      </Badge>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>Created {relativeTime(j.created_at)}</span>
                      <span>Plays: {meta.count}</span>
                      <span>Duration: {formatTime(meta.durationSec)}</span>
                      {meta.lastPlayedAt ? <span>Last played {relativeTime(meta.lastPlayedAt)}</span> : null}
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    "mt-3 flex flex-wrap items-center gap-2",
                    view === "list" ? "sm:mt-0 sm:justify-end" : ""
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button type="button" variant="outline" onClick={() => onPlay(j)}>
                    Quick play
                  </Button>

                  <Button
                    type="button"
                    variant={j.is_favorite ? "default" : "outline"}
                    onClick={() => toggleFavorite(j.id)}
                    aria-label="Toggle favorite"
                  >
                    ★
                  </Button>

                  <details className="relative">
                    <summary
                      className={cn(
                        "list-none",
                        "cursor-pointer rounded-md border border-border bg-background px-3 py-2 text-sm",
                        "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      )}
                    >
                      ⋯
                    </summary>
                    <div className="absolute right-0 z-10 mt-2 w-44 rounded-xl border border-border bg-popover p-2 shadow-lg">
                      <button
                        type="button"
                        className="w-full rounded-md px-2 py-2 text-left text-sm text-foreground hover:bg-accent"
                        onClick={() => copyLink(j.id)}
                      >
                        Copy link
                      </button>
                      <button
                        type="button"
                        className="w-full rounded-md px-2 py-2 text-left text-sm text-foreground hover:bg-accent"
                        onClick={() => regenerate(j)}
                      >
                        Regenerate
                      </button>
                      <button
                        type="button"
                        className="w-full rounded-md px-2 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                        onClick={() => setConfirmDelete({ open: true, ids: [j.id] })}
                      >
                        Delete
                      </button>
                    </div>
                  </details>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Pagination */}
      {!loading && !error && filtered.length > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(pageSafe - 1) * PAGE_SIZE + 1}–{Math.min(pageSafe * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageSafe <= 1}
            >
              Prev
            </Button>
            <Badge variant="outline">
              Page {pageSafe} / {totalPages}
            </Badge>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageSafe >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {/* Delete confirmation */}
      <Dialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete journey{confirmDelete.ids.length > 1 ? "s" : ""}?</DialogTitle>
            <DialogDescription>
              This will permanently delete {confirmDelete.ids.length} journey
              {confirmDelete.ids.length > 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDelete({ open: false, ids: [] })}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                const ids = confirmDelete.ids.slice();
                setConfirmDelete({ open: false, ids: [] });
                await deleteJourneys(ids);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

