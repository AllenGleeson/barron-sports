import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { ENROLMENT_COLUMNS, enrolmentFromRow, NO_ENROLMENT } from "@/lib/course/enrolment";
import type { AdminUser, AdminUserChanges } from "@/lib/admin/users";
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

type EnrolmentRow = (NonNullable<Parameters<typeof enrolmentFromRow>[0]> & { updated_at?: unknown }) | null;

function toAdminUser(user: User, enrolmentRow: EnrolmentRow): AdminUser {
  const meta = user.user_metadata ?? {};
  const enrolmentUpdated = typeof enrolmentRow?.updated_at === "string" ? enrolmentRow.updated_at : null;
  const accountUpdated = user.updated_at ?? user.created_at;
  return {
    id: user.id,
    role: isAdmin(user) ? "admin" : "student",
    superAdmin: isSuperAdmin(user),
    name: typeof meta.full_name === "string" ? meta.full_name : "",
    email: user.email ?? "",
    phone: typeof meta.phone === "string" && meta.phone ? meta.phone : null,
    accountStatus: isDisabled(user) ? "disabled" : "active",
    enrolment: enrolmentRow ? enrolmentFromRow(enrolmentRow) : NO_ENROLMENT,
    lastSignInAt: user.last_sign_in_at ?? null,
    createdAt: user.created_at,
    updatedAt:
      enrolmentUpdated && new Date(enrolmentUpdated) > new Date(accountUpdated)
        ? enrolmentUpdated
        : accountUpdated,
  };
}

export async function listAdminUsers(supabase: SupabaseClient): Promise<AdminUser[]> {
  const [users, enrolments] = await Promise.all([
    allAuthUsers(supabase),
    supabase.from("course_enrolments").select(`user_id, updated_at, ${ENROLMENT_COLUMNS}`),
  ]);
  if (enrolments.error) throw enrolments.error;
  const byUser = new Map(enrolments.data.map((row) => [row.user_id as string, row]));
  return users.map((user) => toAdminUser(user, byUser.get(user.id) ?? null));
}

export async function getAdminUser(supabase: SupabaseClient, id: string): Promise<AdminUser> {
  const { data, error } = await supabase.auth.admin.getUserById(id);
  if (error || !data.user) throw new AdminError("That user doesn't exist.", 404);
  const enrolment = await supabase
    .from("course_enrolments")
    .select(`updated_at, ${ENROLMENT_COLUMNS}`)
    .eq("user_id", id)
    .maybeSingle();
  if (enrolment.error) throw enrolment.error;
  return toAdminUser(data.user, enrolment.data);
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

  if (changes.markPaid) await markPaidInShop(supabase, target, changes.name);
}

/** Records a payment taken in the shop; the record name is fixed from now on. */
async function markPaidInShop(supabase: SupabaseClient, target: User, newName?: string) {
  const { data: existing, error } = await supabase
    .from("course_enrolments")
    .select("status")
    .eq("user_id", target.id)
    .maybeSingle();
  if (error) throw error;
  if (existing?.status === "paid") return;
  const name = (newName ?? target.user_metadata?.full_name ?? "").toString().trim();
  if (!name) throw new AdminError("Add the student's name first. It goes on their record.", 400);
  const now = new Date().toISOString();
  const { error: upsertError } = await supabase.from("course_enrolments").upsert({
    user_id: target.id,
    status: "paid",
    amount_cents: null,
    currency: null,
    certificate_name: name,
    paid_at: now,
    updated_at: now,
  });
  if (upsertError) throw upsertError;
}
