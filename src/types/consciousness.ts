import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * JSON type compatible with Supabase/PostgREST payloads.
 *
 * Note: `@supabase/supabase-js` does not export `Json` as a public type in this
 * repo's installed version, so we define it here.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Consciousness level reference row used by the Consciousness Journey Portal.
 *
 * Note: The DB allows some fields to be nullable; this interface is the
 * "application-facing" shape per product requirements.
 */
export interface ConsciousnessLevel {
  /** Consciousness scale level (2-18). */
  level: number;
  /** Display name (e.g. "Shame", "Reason"). */
  name: string;
  /** Short description of the level. */
  description: string;
  /** Array of characteristics/traits. */
  characteristics: string[];
  /** Energy level (1-10). */
  energy_level: number;
  /** Hex color (e.g. "#0f766e"). */
  color_hex: string;
}

/**
 * A single generated journey for a user.
 *
 * This is typically what you render in UI lists and detail pages.
 */
export interface ConsciousnessJourney {
  /** Journey id (UUID). */
  id: string;
  /** Owner user id (UUID; `auth.users.id`). */
  user_id: string;
  /** Current consciousness level (2-18). */
  current_consciousness_level: number;
  /** Desired consciousness level (2-18). */
  desired_consciousness_level: number;
  /** Perplexity response payload (stored as JSON). */
  perplexity_analysis: Record<string, any>;
  /** The prompt sent to Perplexity to produce `perplexity_analysis`. */
  perplexity_prompt: string;
  /** Suno generation id (nullable). */
  suno_generation_id: string | null;
  /** Suno audio URL (nullable). */
  song_url: string | null;
  /** Optional notes on user-perceived shift (nullable). */
  user_perceived_shift: string | null;
  /** Whether saved to the user's library. */
  saved_to_library: boolean;
  /** Whether marked as favorite. */
  is_favorite: boolean;
  /** ISO timestamp string. */
  created_at: string;
  /** ISO timestamp string. */
  updated_at: string;
}

/**
 * Aggregate progress metrics (typically per-day) for a user.
 */
export interface ConsciousnessProgress {
  /** Progress row id (UUID). */
  id: string;
  /** Owner user id (UUID; `auth.users.id`). */
  user_id: string;
  /** Calendar date (YYYY-MM-DD). */
  date: string;
  /** Average current level for the period. */
  average_current_level: number;
  /** Average desired level for the period. */
  average_desired_level: number;
  /** Number of sessions today. */
  sessions_today: number;
  /** Trend direction. */
  trend: "ascending" | "stable" | "descending";
  /** Monthly sessions count. */
  monthly_sessions: number;
  /** ISO timestamp string. */
  created_at: string;
}

/**
 * API response returned by the consciousness generation endpoint.
 */
export interface ConsciousnessResponse {
  /** The stored journey row. */
  journey: ConsciousnessJourney;
  /** Parsed analysis payload (often the Perplexity response). */
  analysis: Record<string, any>;
  /** The prompt used to generate a Suno track. */
  sunoPrompt: string;
  /** Estimated duration in seconds. */
  estimatedDuration: number;
}

/**
 * Supabase Database type for the Consciousness Journey Portal.
 *
 * Use this to type Supabase clients and RLS row-level helpers:
 * `SupabaseClient<Database>`.
 */
export type Database = {
  public: {
    Tables: {
      /** Lookup/reference table for the 2-18 consciousness levels. */
      consciousness_levels_reference: {
        Row: {
          id: string;
          level: number;
          name: string;
          description: string | null;
          characteristics: string[] | null;
          energy_level: number | null;
          color_hex: string | null;
        };
        Insert: {
          id?: string;
          level: number;
          name: string;
          description?: string | null;
          characteristics?: string[] | null;
          energy_level?: number | null;
          color_hex?: string | null;
        };
        Update: {
          id?: string;
          level?: number;
          name?: string;
          description?: string | null;
          characteristics?: string[] | null;
          energy_level?: number | null;
          color_hex?: string | null;
        };
        Relationships: [];
      };

      /** User journeys for the consciousness portal. */
      consciousness_journeys: {
        Row: {
          id: string;
          user_id: string;
          current_consciousness_level: number | null;
          desired_consciousness_level: number | null;
          perplexity_analysis: Json | null;
          perplexity_prompt: string | null;
          suno_generation_id: string | null;
          song_url: string | null;
          user_perceived_shift: string | null;
          saved_to_library: boolean;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_consciousness_level?: number | null;
          desired_consciousness_level?: number | null;
          perplexity_analysis?: Json | null;
          perplexity_prompt?: string | null;
          suno_generation_id?: string | null;
          song_url?: string | null;
          user_perceived_shift?: string | null;
          saved_to_library?: boolean;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          current_consciousness_level?: number | null;
          desired_consciousness_level?: number | null;
          perplexity_analysis?: Json | null;
          perplexity_prompt?: string | null;
          suno_generation_id?: string | null;
          song_url?: string | null;
          user_perceived_shift?: string | null;
          saved_to_library?: boolean;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      /** Per-user progress/aggregation table. */
      consciousness_progress: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          average_current_level: number | null;
          average_desired_level: number | null;
          sessions_today: number;
          trend: "ascending" | "stable" | "descending" | null;
          monthly_sessions: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          average_current_level?: number | null;
          average_desired_level?: number | null;
          sessions_today?: number;
          trend?: "ascending" | "stable" | "descending" | null;
          monthly_sessions?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          average_current_level?: number | null;
          average_desired_level?: number | null;
          sessions_today?: number;
          trend?: "ascending" | "stable" | "descending" | null;
          monthly_sessions?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

/**
 * Typed Supabase client helper for the consciousness portal.
 */
export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Convenience helper for getting the Row type of a public table.
 */
export type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
