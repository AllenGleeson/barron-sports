import { formatEuro } from "@/lib/admin/money";

/**
 * The online course as a product. Stripe Checkout charges `priceCents` (no Stripe
 * Price object is needed), and the server checks the amount on the paid session.
 *
 * Enrolment flow: register (Supabase Auth) → course dashboard → Purchase → Stripe
 * embedded Checkout → server confirms the payment, writes `course_payments` and
 * `course_enrolments` → /course/learn opens.
 */
const COURSE_PRICE_CENTS = 4900;

/** The course's id in `course_payments`, `course_enrolments` and `course_progress`. */
export const COURSE_ID = "firearms-safety";

export const courseEnrolmentOffer = {
  title: "Firearms safety course",
  description: "Online firearms safety course from Barron Sports, Ennis.",
  priceCents: COURSE_PRICE_CENTS,
  priceDisplay: formatEuro(COURSE_PRICE_CENTS),
  currency: "eur",
} as const;

// ---------------------------------------------------------------------------
// Payments (`course_payments`)
// ---------------------------------------------------------------------------

/** "stripe" (online), "in_shop" (taken at the counter) or "free" (access given away). */
export type PaymentMethod = "stripe" | "in_shop" | "free";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  stripe: "Online (Stripe)",
  in_shop: "In the shop",
  free: "Free",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Checkout started",
  paid: "Paid",
  failed: "Not completed",
  refunded: "Refunded",
};

export type CoursePayment = {
  id: string;
  userId: string | null;
  method: PaymentMethod;
  status: PaymentStatus;
  amountCents: number;
  refundedCents: number;
  currency: string;
  /** Name and email copied from the account when the payment was made. */
  name: string;
  email: string;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  /** The admin who recorded an in-shop or free payment. */
  recordedBy: string | null;
  note: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
};

export const PAYMENT_COLUMNS =
  "id, user_id, method, status, amount_cents, refunded_cents, currency, name, email, stripe_checkout_session_id, stripe_payment_intent_id, recorded_by, note, paid_at, refunded_at, created_at";

const text = (value: unknown) => (typeof value === "string" ? value : null);
const count = (value: unknown) => (typeof value === "number" ? value : 0);

export function paymentFromRow(row: Record<string, unknown>): CoursePayment {
  const method = row.method === "in_shop" || row.method === "free" ? row.method : "stripe";
  const status =
    row.status === "paid" || row.status === "failed" || row.status === "refunded"
      ? row.status
      : "pending";
  return {
    id: String(row.id),
    userId: text(row.user_id),
    method,
    status,
    amountCents: count(row.amount_cents),
    refundedCents: count(row.refunded_cents),
    currency: text(row.currency) ?? "eur",
    name: text(row.name) ?? "",
    email: text(row.email) ?? "",
    stripeCheckoutSessionId: text(row.stripe_checkout_session_id),
    stripePaymentIntentId: text(row.stripe_payment_intent_id),
    recordedBy: text(row.recorded_by),
    note: text(row.note),
    paidAt: text(row.paid_at),
    refundedAt: text(row.refunded_at),
    createdAt: text(row.created_at) ?? new Date(0).toISOString(),
  };
}

/** The amount for a payment list: "Free", "€49", or "€49 (€20 refunded)". */
export function paymentAmount(payment: CoursePayment) {
  if (payment.method === "free") return "Free";
  const amount = formatEuro(payment.amountCents);
  return payment.refundedCents > 0 && payment.status !== "refunded"
    ? `${amount} (${formatEuro(payment.refundedCents)} refunded)`
    : amount;
}

/** Stripe dashboard link for an online payment (test or live, from the publishable key). */
export function stripePaymentUrl(payment: CoursePayment) {
  if (payment.method !== "stripe" || !payment.stripePaymentIntentId) return null;
  const test = (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "").startsWith("pk_test");
  return `https://dashboard.stripe.com/${test ? "test/" : ""}payments/${payment.stripePaymentIntentId}`;
}

// ---------------------------------------------------------------------------
// Enrolment (`course_enrolments` plus the learner's payments)
// ---------------------------------------------------------------------------

/**
 * Where a learner is with the course: "registered" (account only), "checkout_created"
 * (started paying, not finished), "paid" (has access) or "revoked" (access removed,
 * e.g. after a refund).
 */
export type CourseEnrolmentStatus = "registered" | "checkout_created" | "paid" | "revoked";

export type CourseEnrolment = {
  status: CourseEnrolmentStatus;
  /** When access was given (payment confirmed, or recorded by an admin). */
  paidAt: string | null;
  /** The payment that gave access. */
  method: PaymentMethod | null;
  amountCents: number | null;
  /** The name fixed at payment; the completion record always uses it. */
  certificateName: string | null;
  /** Set once by the server when the last quiz is passed. */
  completedAt: string | null;
  revokedAt: string | null;
  revokeReason: string | null;
};

export const NO_ENROLMENT: CourseEnrolment = {
  status: "registered",
  paidAt: null,
  method: null,
  amountCents: null,
  certificateName: null,
  completedAt: null,
  revokedAt: null,
  revokeReason: null,
};

/** The `course_enrolments` columns `enrolmentFromRows` reads. */
export const ENROLMENT_COLUMNS =
  "status, payment_id, enrolled_at, certificate_name, completed_at, revoked_at, revoke_reason";

/**
 * Builds a learner's enrolment from their `course_enrolments` row (or none) and their
 * payments for the course (any order).
 */
export function enrolmentFromRows(
  row: Record<string, unknown> | null,
  payments: CoursePayment[],
): CourseEnrolment {
  if (!row) {
    const latest = [...payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    return latest?.status === "pending" ? { ...NO_ENROLMENT, status: "checkout_created" } : NO_ENROLMENT;
  }
  const payment = payments.find((item) => item.id === row.payment_id) ?? null;
  const certificateName = text(row.certificate_name)?.trim() || null;
  return {
    status: row.status === "revoked" ? "revoked" : "paid",
    paidAt: text(row.enrolled_at),
    method: payment?.method ?? null,
    amountCents: payment ? payment.amountCents : null,
    certificateName,
    completedAt: text(row.completed_at),
    revokedAt: text(row.revoked_at),
    revokeReason: text(row.revoke_reason),
  };
}

/** Whether the learner can open the lessons. */
export function hasAccess(enrolment: CourseEnrolment) {
  return enrolment.status === "paid";
}
