import type { CourseEnrolment, CourseEnrolmentStatus } from "@/lib/course/enrolment";

/**
 * Accounts on the admin Users page: Supabase Auth users plus their course enrolment.
 * Loaded and changed through the admin-only routes in `src/app/api/admin/users/`.
 */

export type UserAccountStatus = "active" | "disabled";

/**
 * "admin" is a Supabase Auth user with `app_metadata.role = "admin"` (what `is_admin()`
 * checks in the database); every other account is a student.
 */
export type UserRole = "student" | "admin";

export type AdminUser = {
  /** The Supabase Auth user id. */
  id: string;
  role: UserRole;
  /**
   * The shop owner's account: role "admin" plus `app_metadata.super_admin = true`.
   * Only a super admin can change it. Set it in SQL (see README).
   */
  superAdmin: boolean;
  name: string;
  email: string;
  phone: string | null;
  accountStatus: UserAccountStatus;
  enrolment: CourseEnrolment;
  lastSignInAt: string | null;
  createdAt: string;
  /** The latest change to the account or its course enrolment. */
  updatedAt: string;
};

/** What an admin can change on an account (all optional). */
export type AdminUserChanges = {
  name?: string;
  email?: string;
  phone?: string | null;
  role?: UserRole;
  accountStatus?: UserAccountStatus;
  /** Records a payment taken in the shop. */
  markPaid?: boolean;
};

export const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  admin: "Admin",
};

export const ROLE_PERMISSIONS: Record<UserRole, string> = {
  student: "No admin access. Can only use their own account: the course, their progress and their record.",
  admin: "Full access to the admin area, including products, services, brands and every user account.",
};

export const SUPER_ADMIN_NOTE =
  "Super admin. Full access, and other admins can't change, disable or delete this account.";

export const ENROLMENT_STATUS_LABELS: Record<CourseEnrolmentStatus, string> = {
  registered: "Not paid",
  checkout_created: "Checkout started",
  paid: "Paid",
};

export type CourseState =
  | { kind: "not-purchased" }
  | { kind: "purchased"; paidAt: string | null }
  | { kind: "completed"; completedAt: string };

/** Where a student is with the course, as far as the database knows. */
export function courseState(user: AdminUser): CourseState {
  const { enrolment } = user;
  if (enrolment.completedAt) return { kind: "completed", completedAt: enrolment.completedAt };
  if (enrolment.status === "paid") return { kind: "purchased", paidAt: enrolment.paidAt };
  return { kind: "not-purchased" };
}

export function courseStateLabel(state: CourseState) {
  if (state.kind === "completed") return "Completed";
  if (state.kind === "purchased") return "In progress";
  return "Not purchased";
}
