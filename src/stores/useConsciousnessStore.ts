"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { ConsciousnessJourney } from "@/types/consciousness";

export type GenerationStatus =
  | "idle"
  | "analyzing"
  | "generating"
  | "complete"
  | "error";

export type JourneyDirection = "upward" | "downward" | "neutral";

type JourneyGetResponse = {
  journey: ConsciousnessJourney;
  readyToPlay: boolean;
  generationStatus: "pending" | "complete" | "failed";
};

export type ConsciousnessState = {
  currentConsciousnessLevel: number | null;
  desiredConsciousnessLevel: number | null;

  currentJourneyId: string | null;
  currentJourney: ConsciousnessJourney | null;
  journeyHistory: ConsciousnessJourney[];

  generationStatus: GenerationStatus;
  contextNotes: string;
  loadingProgress: number; // 0-100
  error: string | null;
};

export type ConsciousnessActions = {
  setCurrentLevel: (level: number) => void;
  setDesiredLevel: (level: number) => void;
  setJourneyContext: (notes: string) => void;

  startAnalysis: () => void;
  setGenerationStatus: (status: GenerationStatus) => void;
  setLoadingProgress: (progress: number) => void;

  setCurrentJourney: (journey: ConsciousnessJourney) => void;
  addToHistory: (journey: ConsciousnessJourney) => void;

  setError: (error: string | null) => void;
  reset: () => void;

  loadJourney: (id: string) => Promise<void>;
};

export type ConsciousnessDerived = {
  journeyDistance: () => number;
  journeyDirection: () => JourneyDirection;
  isJourneyValid: () => boolean;
};

export type ConsciousnessStore = ConsciousnessState &
  ConsciousnessActions &
  ConsciousnessDerived;

const HISTORY_LIMIT = 50;
const STORAGE_KEY = "consciousness-portal-store";

function clampInt(n: number, min: number, max: number) {
  const v = Math.floor(n);
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function normalizeLevel(level: number) {
  // Snap to valid Hawkins step levels (2,4,...,18) while allowing callers to pass any int.
  const v = clampInt(level, 2, 18);
  return v % 2 === 0 ? v : v - 1;
}

function clampProgress(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function devLog(...args: any[]) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
}

const initialState: ConsciousnessState = {
  currentConsciousnessLevel: null,
  desiredConsciousnessLevel: null,
  currentJourneyId: null,
  currentJourney: null,
  journeyHistory: [],
  generationStatus: "idle",
  contextNotes: "",
  loadingProgress: 0,
  error: null,
};

export const useConsciousnessStore = create<ConsciousnessStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentLevel: (level) => {
        set({ error: null, currentConsciousnessLevel: normalizeLevel(level) });
      },

      setDesiredLevel: (level) => {
        set({ error: null, desiredConsciousnessLevel: normalizeLevel(level) });
      },

      setJourneyContext: (notes) => {
        set({ error: null, contextNotes: String(notes ?? "") });
      },

      startAnalysis: () => {
        set({
          error: null,
          generationStatus: "analyzing",
          loadingProgress: 0,
        });
      },

      setGenerationStatus: (status) => {
        set({ generationStatus: status });
      },

      setLoadingProgress: (progress) => {
        set({ loadingProgress: clampProgress(progress) });
      },

      setCurrentJourney: (journey) => {
        set({
          error: null,
          currentJourney: journey,
          currentJourneyId: journey.id,
        });
      },

      addToHistory: (journey) => {
        set((s) => {
          const next = [journey, ...s.journeyHistory.filter((j) => j.id !== journey.id)];
          return { journeyHistory: next.slice(0, HISTORY_LIMIT) };
        });
      },

      setError: (error) => {
        set({ error });
      },

      reset: () => {
        // Clear everything, including persisted fields (persist middleware will store the new state).
        set({ ...initialState });
      },

      loadJourney: async (id) => {
        const journeyId = String(id ?? "").trim();
        if (!journeyId) {
          set({ error: "Missing journey id" });
          return;
        }

        set({ error: null, loadingProgress: 10 });

        try {
          const res = await fetch(
            `/api/consciousness/journey/${encodeURIComponent(journeyId)}`,
            { method: "GET" }
          );
          const json = (await res.json().catch(() => ({}))) as Partial<JourneyGetResponse>;
          if (!res.ok) {
            set({ error: (json as any)?.error || "Failed to load journey", loadingProgress: 0 });
            return;
          }

          if (!json.journey) {
            set({ error: "Journey not found", loadingProgress: 0 });
            return;
          }

          const journey = json.journey;

          // Map API generation status to store status
          let status: GenerationStatus = "idle";
          if (json.generationStatus === "complete" || (json.readyToPlay && journey.song_url)) {
            status = "complete";
          } else if (json.generationStatus === "failed") {
            status = "error";
          } else {
            status = "generating";
          }

          set({
            currentJourneyId: journey.id,
            currentJourney: journey,
            currentConsciousnessLevel: journey.current_consciousness_level ?? null,
            desiredConsciousnessLevel: journey.desired_consciousness_level ?? null,
            generationStatus: status,
            loadingProgress: 100,
          });

          get().addToHistory(journey);
        } catch (e: any) {
          devLog("useConsciousnessStore.loadJourney error:", e);
          set({ error: e?.message || "Failed to load journey", loadingProgress: 0 });
        }
      },

      journeyDistance: () => {
        const c = get().currentConsciousnessLevel;
        const d = get().desiredConsciousnessLevel;
        if (typeof c !== "number" || typeof d !== "number") return 0;
        return d - c;
      },

      journeyDirection: () => {
        const dist = get().journeyDistance();
        if (dist > 0) return "upward";
        if (dist < 0) return "downward";
        return "neutral";
      },

      isJourneyValid: () => {
        const c = get().currentConsciousnessLevel;
        const d = get().desiredConsciousnessLevel;
        return typeof c === "number" && typeof d === "number";
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentConsciousnessLevel: state.currentConsciousnessLevel,
        desiredConsciousnessLevel: state.desiredConsciousnessLevel,
        contextNotes: state.contextNotes,
        journeyHistory: state.journeyHistory.slice(0, HISTORY_LIMIT),
      }),
    }
  )
);

