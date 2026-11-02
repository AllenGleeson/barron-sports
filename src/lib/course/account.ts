import { useEffect, useState, useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { QuizGrade } from "@/lib/course/curriculum";
import {
  COURSE_ID,
  ENROLMENT_COLUMNS,
  enrolmentFromRows,
  NO_ENROLMENT,
  PAYMENT_COLUMNS,
  paymentFromRow,
  type CourseEnrolment,
} from "@/lib/course/enrolment";
import type { LearnProgress } from "@/lib/course/progress";

/**
 * Learner accounts for the online course, using Supabase Auth (email + password).
 * A learner can only change their own name and password. Their enrolment and payments
 * are read from `course_enrolments` / `course_payments`, and their progress from
 * `/api/course/progress/`; only the server writes any of them.
 */
export type Learner = { id: string; email: string; name: string };

export type LearnerAuth =
  | { status: "loading" }
  | { status: "unconfigured" }
  | { status: "signed-out" }
  | { status: "signed-in"; learner: Learner };

export const MIN_PASSWORD_LENGTH = 8;

const LOADING: LearnerAuth = { status: "loading" };

let state: LearnerAuth = LOADING;
let started = false;
const listeners = new Set<() => void>();

function setState(next: LearnerAuth) {
  state = next;
  listeners.forEach((listener) => listener());
}

function fromSession(session: Session | null): LearnerAuth {
  if (!session) return { status: "signed-out" };
  const { user } = session;
  const name = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
  return { status: "signed-in", learner: { id: user.id, email: user.email ?? "", name } };
}

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

/** The current learner sign-in. "loading" during prerender and until Supabase answers. */
export function useLearnerAuth() {
  return useSyncExternalStore(subscribe, () => state, () => LOADING);
}

function friendlyError(error: { code?: string; message: string }) {
  switch (error.code) {
    case "invalid_credentials":
      return "That email and password don't match.";
    case "user_already_exists":
    case "email_exists":
      return "An account already uses this email. Sign in instead.";
    case "weak_password":
      return `Choose a stronger password (at least ${MIN_PASSWORD_LENGTH} characters).`;
    case "same_password":
      return "The new password must be different from the current one.";
    case "email_not_confirmed":
      return "Please confirm your email address first, using the link we sent you.";
    case "over_email_send_rate_limit":
      return "Too many attempts. Please wait a few minutes and try again.";
    default:
      return error.message;
  }
}

const NOT_SET_UP = "Accounts aren't set up yet. Please try again later.";

/** Creates an account. Returns an error message, "confirm" if an email link is needed, or null. */
export async function registerLearner(name: string, email: string, password: string) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return NOT_SET_UP;
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { full_name: name.trim() } },
  });
  if (error) return friendlyError(error);
  // With "Confirm email" on in Supabase, there's no session until the link is clicked.
  return data.session ? null : "confirm";
}

export async function signInLearner(email: string, password: string) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return NOT_SET_UP;
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  return error ? friendlyError(error) : null;
}

export async function signOutLearner() {
  await getSupabaseBrowser()?.auth.signOut();
}

export async function updateLearnerName(name: string) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return NOT_SET_UP;
  const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
  return error ? friendlyError(error) : null;
}

/** Emails a link to /course/reset-password. Always "succeeds" so it doesn't reveal accounts. */
export async function requestPasswordReset(email: string) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return NOT_SET_UP;
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/course/reset-password/`,
  });
  if (error?.code === "over_email_send_rate_limit") return friendlyError(error);
  return null;
}

/**
 * Starts the session from an invite or reset link sent by the server. Those links carry
 * the tokens in the URL hash, which this site's browser client doesn't read by itself.
 * Returns an error message, or null when there was nothing to do or it worked.
 */
export async function sessionFromLinkHash() {
  const supabase = getSupabaseBrowser();
  const hash = new URLSearchParams(window.location.hash.slice(1));
  if (!supabase || (!hash.get("access_token") && !hash.get("error"))) return null;
  // Remove the tokens from the address bar either way.
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
  if (hash.get("error")) {
    return hash.get("error_code") === "otp_expired"
      ? "This link has expired or has already been used."
      : (hash.get("error_description") ?? "This link didn't work.");
  }
  const { error } = await supabase.auth.setSession({
    access_token: hash.get("access_token") ?? "",
    refresh_token: hash.get("refresh_token") ?? "",
  });
  return error ? "This link has expired or has already been used." : null;
}

/** Sets a new password for the signed-in user (after a reset or invite link). */
export async function setNewPassword(password: string) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return { error: NOT_SET_UP, isAdmin: false };
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) return { error: friendlyError(error), isAdmin: false };
  return { error: null, isAdmin: data.user?.app_metadata?.role === "admin" };
}

/** Checks the current password by signing in again, then sets the new one. */
export async function changeLearnerPassword(email: string, current: string, next: string) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return NOT_SET_UP;
  const check = await supabase.auth.signInWithPassword({ email, password: current });
  if (check.error) return "Your current password isn't right.";
  const { error } = await supabase.auth.updateUser({ password: next });
  return error ? friendlyError(error) : null;
}

/** Calls a course route; throws an Error with the server's message on failure. */
async function courseCall<T>(path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/course/${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("You seem to be offline. Check your connection and try again.");
  }
  const result = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(result.error ?? "Your progress couldn't be saved. Please try again.");
  return result;
}

export type ProgressResponse = {
  progress: LearnProgress;
  /** Answers to prefill each quiz with while testing, by lesson slug; null otherwise. */
  prefill: Record<string, Record<string, string>> | null;
};

/** The learner's saved progress. Only works once they have access to the course. */
export function fetchCourseProgress() {
  return courseCall<ProgressResponse>("progress/");
}

/** Marks a lesson's reading or film done; returns the updated progress. */
export async function saveLessonStep(lesson: string, step: "read" | "watched") {
  const { progress } = await courseCall<{ progress: LearnProgress }>("progress/", { lesson, step });
  return progress;
}

export type QuizSubmission = { grade: QuizGrade; progress: LearnProgress; completedAt: string | null };

/** Sends quiz answers to be graded and saved. Passing the last quiz completes the course. */
export function submitQuizAnswers(lesson: string, answers: Record<string, string>) {
  return courseCall<QuizSubmission>("quiz/", { lesson, answers });
}

export type ProgressState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | ({ status: "ready" } & ProgressResponse);

/** The learner's progress, loaded once when `enabled` (i.e. they have access). */
export function useCourseProgress(enabled: boolean): ProgressState {
  const [state, setState] = useState<ProgressState>({ status: "loading" });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetchCourseProgress()
      .then((result) => {
        if (!cancelled) setState({ status: "ready", ...result });
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ status: "error", message: error.message });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return state;
}

export type EnrolmentState = { loading: true } | { loading: false; enrolment: CourseEnrolment };

/** The learner's enrolment from Supabase. Pass a new `reloadKey` to fetch it again. */
export function useCourseEnrolment(userId: string | null, reloadKey = 0): EnrolmentState {
  const [result, setResult] = useState<{ key: string; enrolment: CourseEnrolment } | null>(null);
  const key = `${userId}:${reloadKey}`;

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!userId || !supabase) return;
    let cancelled = false;
    void Promise.all([
      supabase
        .from("course_enrolments")
        .select(ENROLMENT_COLUMNS)
        .eq("user_id", userId)
        .eq("course_id", COURSE_ID)
        .maybeSingle(),
      supabase
        .from("course_payments")
        .select(PAYMENT_COLUMNS)
        .eq("user_id", userId)
        .eq("course_id", COURSE_ID),
    ]).then(([enrolment, payments]) => {
      if (cancelled) return;
      const rows = (payments.data ?? []).map((row) => paymentFromRow(row));
      setResult({ key, enrolment: enrolmentFromRows(enrolment.data, rows) });
    });
    return () => {
      cancelled = true;
    };
  }, [key, userId]);

  if (!userId) return { loading: false, enrolment: NO_ENROLMENT };
  return result?.key === key ? { loading: false, enrolment: result.enrolment } : { loading: true };
}
