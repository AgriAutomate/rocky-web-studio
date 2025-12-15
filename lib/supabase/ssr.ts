import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Create a Supabase SSR client bound to Next.js request cookies.
 *
 * Use this in App Router route handlers when you need `supabase.auth.getUser()`
 * to work off the user's session cookie (RLS-safe, anon-key).
 */
export async function createSsrSupabaseClient<Db>(): Promise<SupabaseClient<Db>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Db>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });
}

