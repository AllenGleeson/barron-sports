import { useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase/client";

/**
 * Admin sign-in with Supabase Auth. An account is an admin when its
 * `app_metadata.role` is "admin". Only Supabase (SQL or the service key) can
 * set app_metadata, so users can't make themselves admins.
 *
 * This only decides what the admin UI shows. Database access rules must
 * check the same role, because anything in the browser can be bypassed.
 */
export type AdminAuth =
  | { status: "loading" }
  | { status: "unconfigured" }
  | { status: "signed-out" }
  | { status: "signed-in"; email: string; isAdmin: boolean };

const LOADING: AdminAuth = { status: "loading" };

let state: AdminAuth = LOADING;
let started = false;
const listeners = new Set<() => void>();

function setState(next: AdminAuth) {
  state = next;
  listeners.forEach((listener) => listener());
}

function fromSession(session: Session | null): AdminAuth {
  if (!session) return { status: "signed-out" };
  return {
    status: "signed-in",
    email: session.user.email ?? "",
    isAdmin: session.user.app_metadata?.role === "admin",
  };
}

/** Starts listening to Supabase once; it reports the current session straight away. */
function start() {
  if (started) return;
  started = true;
  const supabase = getSupabaseBrowser();
  if (!supabase) {
    setState({ status: "unconfigured" });
    return;
  }
  supabase.auth.onAuthStateChange((_event, session) => setState(fromSession(session)));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
  };
}

/** The current admin sign-in state. "loading" during prerender and until Supabase answers. */
export function useAdminAuth() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => LOADING,
  );
}

/** Signs in; returns an error message to show, or null on success. */
export async function signInAdmin(email: string, password: string) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return "Sign-in isn't set up yet.";
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (!error) return null;
  if (error.code === "invalid_credentials") return "That email and password don't match.";
  if (error.code === "email_not_confirmed") return "This account's email address hasn't been confirmed.";
  return error.message;
}

export async function signOutAdmin() {
  await getSupabaseBrowser()?.auth.signOut();
}
