import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

/**
 * Supabase client for Route Handlers, acting as the signed-in visitor (read from the
 * session cookies the browser client sets). Access rules apply as normal.
 * Returns null when Supabase isn't configured.
 */
export async function getSupabaseForRequest(): Promise<SupabaseClient | null> {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        for (const { name, value, options } of list) cookieStore.set(name, value, options);
      },
    },
  });
}

/** The signed-in user, checked with Supabase Auth (not just read from the cookie). */
export async function getRequestUser() {
  const supabase = await getSupabaseForRequest();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}

let adminClient: SupabaseClient | null = null;

/**
 * Supabase client with the secret key. It bypasses access rules, so use it only in
 * server code, only for writes the visitor isn't allowed to make themselves
 * (e.g. recording a confirmed payment). Returns null when the key isn't set.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) return null;
  adminClient ??= createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}
