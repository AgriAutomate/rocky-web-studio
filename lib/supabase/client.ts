/**
 * Supabase Client Configuration
 *
 * Provides typed Supabase client instances for both client and server environments
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

/**
 * Supabase client for client-side usage
 * Uses the anon key for public access with RLS policies
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Create a Supabase client for server-side usage
 * Can optionally use service role key for admin operations
 */
export function createServerSupabaseClient(useServiceRole = false) {
  const key = useServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : supabaseAnonKey;

  if (!key) {
    throw new Error(
      useServiceRole
        ? 'Missing SUPABASE_SERVICE_ROLE_KEY environment variable'
        : 'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable'
    );
  }

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  return createClient<Database>(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
