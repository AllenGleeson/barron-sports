import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { learnerCourse } from "@/lib/course/curriculum";
import {
  COURSE_ID,
  ENROLMENT_COLUMNS,
  enrolmentFromRows,
  PAYMENT_COLUMNS,
  paymentFromRow,
  type CoursePayment,
} from "@/lib/course/enrolment";
import { grantEnrolment, revokeForPayment } from "@/lib/course/purchase";
import type { AdminCourseProgress, AdminPayment, AdminUser, AdminUserChanges } from "@/lib/admin/users";
import { getRequestUser, getSupabaseAdmin } from "@/lib/supabase/server";

/** Far-future ban used to disable an account (Supabase has no separate "disabled" flag). */
const DISABLED_BAN = "876000h";

export class AdminError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof AdminError) return Response.json({ error: error.message }, { status: error.status });
  console.error("Admin users request failed", error);
  return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

const isAdmin = (user: User) => user.app_metadata?.role === "admin";
const isSuperAdmin = (user: User) => isAdmin(user) && user.app_metadata?.super_admin === true;
const isDisabled = (user: User) =>
  Boolean(user.banned_until && new Date(user.banned_until).getTime() > Date.now());

/** The signed-in admin and a secret-key client, or an error for anyone else. */
export async function requireAdmin(): Promise<{ me: User; supabase: SupabaseClient }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new AdminError("User management isn't set up (SUPABASE_SECRET_KEY is missing).", 503);
  const me = await getRequestUser();
  if (!me) throw new AdminError("Please sign in.", 401);
  if (!isAdmin(me)) throw new AdminError("Only admins can manage users.", 403);
  return { me, supabase };
}

async function allAuthUsers(supabase: SupabaseClient) {
  const users: User[] = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 1000) return users;
  }
}

type Row = Record<string, unknown>;

/** Course rows for some or all users, grouped by user id. */
type CourseRows = {
  enrolments: Map<string, Row>;
  payments: Map<string, CoursePayment[]>;
  progress: Map<string, Row[]>;
};

const PROGRESS_COLUMNS = "user_id, lesson_slug, read_at, watched_at, attempts, best_score, passed_at, updated_at";

function groupBy<T>(rows: T[], key: (row: T) => string | null) {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const id = key(row);
    if (!id) continue;
    map.set(id, [...(map.get(id) ?? []), row]);
  }
  return map;
}

/** Loads enrolments, payments and progress for one user, or for everyone when `userId` is omitted. */
async function loadCourseRows(supabase: SupabaseClient, userId?: string): Promise<CourseRows> {
  const table = (name: string, columns: string) => {
    const query = supabase.from(name).select(columns).eq("course_id", COURSE_ID);
    return userId ? query.eq("user_id", userId) : query;
  };
  const [enrolments, payments, progress] = await Promise.all([
    table("course_enrolments", `user_id, updated_at, ${ENROLMENT_COLUMNS}`),
    table("course_payments", PAYMENT_COLUMNS),
    table("course_progress", PROGRESS_COLUMNS),
  ]);
  if (enrolments.error) throw enrolments.error;
  if (payments.error) throw payments.error;
  if (progress.error) throw progress.error;
  const paymentRows = (payments.data as unknown as Row[]).map(paymentFromRow);
  paymentRows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return {
    enrolments: new Map((enrolments.data as unknown as Row[]).map((row) => [String(row.user_id), row])),
    payments: groupBy(paymentRows, (payment) => payment.userId),
    progress: groupBy(progress.data as unknown as Row[], (row) => String(row.user_id)),
  };
}

function progressFromRows(rows: Row[], completed: boolean): AdminCourseProgress {
  const lessons = learnerCourse.lessons.map((lesson) => {
    const row = rows.find((item) => item.lesson_slug === lesson.slug);
    return {
      slug: lesson.slug,
      title: lesson.title,
      read: Boolean(row?.read_at),
      watched: Boolean(row?.watched_at),
      attempts: typeof row?.attempts === "number" ? row.attempts : 0,
      bestScore: typeof row?.best_score === "number" ? row.best_score : null,
      passedAt: typeof row?.passed_at === "string" ? row.passed_at : null,
    };
  });
  const passed = lessons.filter((lesson) => lesson.passedAt).length;
  // A course recorded as finished counts as fully passed (e.g. finished before progress was saved).
  return { passed: completed ? lessons.length : passed, total: lessons.length, lessons };
}

/** The latest of some ISO dates (ignoring missing ones). */
function latestDate(...dates: unknown[]) {
  return dates
    .filter((date): date is string => typeof date === "string")
    .sort()
    .at(-1);
}

function toAdminUser(user: User, rows: CourseRows): AdminUser {
  const meta = user.user_metadata ?? {};
  const enrolmentRow = rows.enrolments.get(user.id) ?? null;
  const payments = rows.payments.get(user.id) ?? [];
  const progressRows = rows.progress.get(user.id) ?? [];
  const enrolment = enrolmentFromRows(enrolmentRow, payments);
  return {
    id: user.id,
    role: isAdmin(user) ? "admin" : "student",
    superAdmin: isSuperAdmin(user),
    name: typeof meta.full_name === "string" ? meta.full_name : "",
    email: user.email ?? "",
    phone: typeof meta.phone === "string" && meta.phone ? meta.phone : null,
    accountStatus: isDisabled(user) ? "disabled" : "active",
    enrolment,
    payments,
    progress: progressFromRows(progressRows, Boolean(enrolment.completedAt)),
    lastSignInAt: user.last_sign_in_at ?? null,
    createdAt: user.created_at,
    updatedAt:
      latestDate(
        user.updated_at ?? user.created_at,
        enrolmentRow?.updated_at,
        payments[0]?.createdAt,
        ...progressRows.map((row) => row.updated_at),
      ) ?? user.created_at,
  };
}

export async function listAdminUsers(supabase: SupabaseClient): Promise<AdminUser[]> {
  const [users, rows] = await Promise.all([allAuthUsers(supabase), loadCourseRows(supabase)]);
  return users.map((user) => toAdminUser(user, rows));
}

export async function getAdminUser(supabase: SupabaseClient, id: string): Promise<AdminUser> {
  const { data, error } = await supabase.auth.admin.getUserById(id);
  if (error || !data.user) throw new AdminError("That user doesn't exist.", 404);
  return toAdminUser(data.user, await loadCourseRows(supabase, id));
}

/** Active admins other than `exceptId`. */
async function otherActiveAdmins(supabase: SupabaseClient, exceptId: string) {
  const users = await allAuthUsers(supabase);
  return users.filter((user) => user.id !== exceptId && isAdmin(user) && !isDisabled(user)).length;
}

/**
 * Checks an admin may change (or delete) `target`. Super admin accounts can only be
 * changed by a super admin; nobody can remove the last active admin or lock themselves out.
 */
export async function assertCanChange(
  supabase: SupabaseClient,
  me: User,
  target: User,
  change: { removesAdminAccess: boolean },
) {
  if (isSuperAdmin(target) && !isSuperAdmin(me)) {
    throw new AdminError("Only a super admin can change this account.", 403);
  }
  if (!change.removesAdminAccess || !isAdmin(target)) return;
  if (target.id === me.id) {
    throw new AdminError("You can't remove your own admin access. Ask another admin.", 400);
  }
  if ((await otherActiveAdmins(supabase, target.id)) === 0) {
    throw new AdminError("Keep at least one active admin.", 400);
  }
}

export async function getAuthUser(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.auth.admin.getUserById(id);
  if (error || !data.user) throw new AdminError("That user doesn't exist.", 404);
  return data.user;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function applyChanges(
  supabase: SupabaseClient,
  me: User,
  target: User,
  changes: AdminUserChanges,
) {
  const removesAdminAccess =
    (changes.role === "student" && isAdmin(target)) ||
    (changes.accountStatus === "disabled" && isAdmin(target));
  await assertCanChange(supabase, me, target, { removesAdminAccess });

  const attributes: {
    email?: string;
    email_confirm?: boolean;
    user_metadata?: Record<string, unknown>;
    app_metadata?: Record<string, unknown>;
    ban_duration?: string;
  } = {};

  const meta: Record<string, unknown> = {};
  if (changes.name !== undefined) {
    if (!changes.name.trim()) throw new AdminError("Name is required.", 400);
    meta.full_name = changes.name.trim();
  }
  if (changes.phone !== undefined) meta.phone = changes.phone?.trim() || null;
  if (Object.keys(meta).length) attributes.user_metadata = meta;

  if (changes.email !== undefined && changes.email.trim().toLowerCase() !== (target.email ?? "").toLowerCase()) {
    if (!EMAIL_PATTERN.test(changes.email.trim())) throw new AdminError("Enter a valid email.", 400);
    attributes.email = changes.email.trim();
    // An admin's change takes effect straight away, without a confirmation email.
    attributes.email_confirm = true;
  }
  if (changes.role !== undefined) {
    // Merged into the existing app_metadata, so the super admin flag stays as it is.
    attributes.app_metadata = { role: changes.role === "admin" ? "admin" : null };
  }
  if (changes.accountStatus !== undefined) {
    attributes.ban_duration = changes.accountStatus === "disabled" ? DISABLED_BAN : "none";
  }

  if (Object.keys(attributes).length) {
    const { error } = await supabase.auth.admin.updateUserById(target.id, attributes);
    if (error) {
      if (error.code === "email_exists") throw new AdminError("Another account already uses this email.", 400);
      throw error;
    }
  }

  if (changes.recordPayment) await recordPayment(supabase, me, target, changes.recordPayment, changes.name);
  if (changes.access) await setAccess(supabase, target, changes.access);
}

/**
 * Records a payment taken in the shop (or free access) and opens the course. The record
 * name is fixed from now on.
 */
async function recordPayment(
  supabase: SupabaseClient,
  me: User,
  target: User,
  payment: NonNullable<AdminUserChanges["recordPayment"]>,
  newName?: string,
) {
  const { data: existing, error } = await supabase
    .from("course_enrolments")
    .select("status")
    .eq("user_id", target.id)
    .eq("course_id", COURSE_ID)
    .maybeSingle();
  if (error) throw error;
  if (existing?.status === "active") throw new AdminError("They already have the course.", 400);

  const name = (newName ?? target.user_metadata?.full_name ?? "").toString().trim();
  if (!name) throw new AdminError("Add the student's name first. It goes on their record.", 400);
  if (payment.method !== "in_shop" && payment.method !== "free") {
    throw new AdminError("Unknown payment method.", 400);
  }
  const amountCents = payment.method === "free" ? 0 : Math.round(Number(payment.amountCents));
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    throw new AdminError("Enter the amount paid, or choose Free.", 400);
  }

  const now = new Date().toISOString();
  const { data: saved, error: insertError } = await supabase
    .from("course_payments")
    .insert({
      user_id: target.id,
      course_id: COURSE_ID,
      method: payment.method,
      status: "paid",
      amount_cents: amountCents,
      currency: "eur",
      name,
      email: target.email ?? "",
      recorded_by: me.id,
      note: payment.note?.trim() || null,
      paid_at: now,
      updated_at: now,
    })
    .select("id")
    .single();
  if (insertError) throw insertError;
  await grantEnrolment(supabase, { userId: target.id, paymentId: saved.id, certificateName: name });
}

/** Removes course access (keeping the record and progress) or gives it back. */
async function setAccess(
  supabase: SupabaseClient,
  target: User,
  access: NonNullable<AdminUserChanges["access"]>,
) {
  const now = new Date().toISOString();
  const revoke = access.status === "revoked";
  const reason = access.reason?.trim() ?? "";
  if (revoke && !reason) throw new AdminError("Say why access is being removed.", 400);
  const { data, error } = await supabase
    .from("course_enrolments")
    .update(
      revoke
        ? { status: "revoked", revoked_at: now, revoke_reason: reason, updated_at: now }
        : { status: "active", revoked_at: null, revoke_reason: null, updated_at: now },
    )
    .eq("user_id", target.id)
    .eq("course_id", COURSE_ID)
    .select("user_id");
  if (error) throw error;
  if (!data.length) throw new AdminError("They haven't bought the course.", 400);
}

/** Every course payment, newest first. */
export async function listPayments(supabase: SupabaseClient): Promise<AdminPayment[]> {
  const [users, payments] = await Promise.all([
    allAuthUsers(supabase),
    supabase.from("course_payments").select(PAYMENT_COLUMNS).eq("course_id", COURSE_ID),
  ]);
  if (payments.error) throw payments.error;
  const names = new Map(
    users.map((user) => [
      user.id,
      (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) || user.email || "",
    ]),
  );
  return (payments.data as unknown as Row[])
    .map(paymentFromRow)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((payment) => ({
      ...payment,
      recordedByName: payment.recordedBy ? (names.get(payment.recordedBy) ?? "Deleted admin") : null,
      accountExists: Boolean(payment.userId && names.has(payment.userId)),
    }));
}

/**
 * Marks an in-shop payment as refunded and removes the access it gave. Stripe payments
 * are refunded in the Stripe dashboard instead; the webhook records them here.
 */
export async function refundShopPayment(supabase: SupabaseClient, id: string, reason?: string) {
  const { data: payment, error } = await supabase
    .from("course_payments")
    .select("id, user_id, method, status, amount_cents, note")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!payment) throw new AdminError("That payment doesn't exist.", 404);
  if (payment.method === "stripe") {
    throw new AdminError("Refund online payments in the Stripe dashboard. They update here automatically.", 400);
  }
  if (payment.method === "free") throw new AdminError("Free access has nothing to refund. Remove access instead.", 400);
  if (payment.status !== "paid") throw new AdminError("Only a paid payment can be refunded.", 400);

  const now = new Date().toISOString();
  const extra = reason?.trim();
  const { error: updateError } = await supabase
    .from("course_payments")
    .update({
      status: "refunded",
      refunded_cents: payment.amount_cents,
      refunded_at: now,
      note: extra ? [payment.note, `Refund: ${extra}`].filter(Boolean).join("\n") : payment.note,
      updated_at: now,
    })
    .eq("id", id);
  if (updateError) throw updateError;
  await revokeForPayment(supabase, id, "Refunded");
  return typeof payment.user_id === "string" ? payment.user_id : null;
}
