/**
 * Supabase Client Configuration
 *
 * Provides typed Supabase client instances for both client and server environments
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export function hasPublicSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function getPublicSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }
  if (!supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
  }

  return { supabaseUrl, supabaseAnonKey };
}

/**
 * Supabase client for client-side usage
 * Uses the anon key for public access with RLS policies
 */
let _browserClient: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (_browserClient) return _browserClient;
  const { supabaseUrl, supabaseAnonKey } = getPublicSupabaseEnv();
  _browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return _browserClient;
}

/**
 * Create a Supabase client for server-side usage
 * Can optionally use service role key for admin operations
 */
export function createServerSupabaseClient(useServiceRole = false) {
  // When using service role, prefer SUPABASE_URL from lib/env.ts, otherwise fall back to NEXT_PUBLIC_SUPABASE_URL
  const supabaseUrl = useServiceRole 
    ? (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)
    : process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key = useServiceRole ? process.env.SUPABASE_SERVICE_ROLE_KEY : supabaseAnonKey;

  if (!supabaseUrl) {
    throw new Error(
      useServiceRole
        ? "Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable"
        : "Missing NEXT_PUBLIC_SUPABASE_URL environment variable"
    );
  }

  if (!key) {
    throw new Error(
      useServiceRole
        ? "Missing SUPABASE_SERVICE_ROLE_KEY environment variable"
        : "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable"
    );
  }

  return createClient<Database>(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
