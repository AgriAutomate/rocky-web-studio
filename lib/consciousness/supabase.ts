/**
 * Consciousness Portal Supabase client (browser).
 *
 * This is separate from `lib/supabase/client.ts` because that file is typed
 * against `types/supabase.ts`, which currently doesn’t include the new
 * consciousness portal tables yet.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/consciousness";

export function hasConsciousnessSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function getPublicSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

let _client: SupabaseClient<Database> | null = null;

export function getConsciousnessSupabaseBrowserClient(): SupabaseClient<Database> {
  if (_client) return _client;
  const { supabaseUrl, supabaseAnonKey } = getPublicSupabaseEnv();
  _client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return _client;
}


