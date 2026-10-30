import { formatEuro } from "@/lib/admin/money";

/**
 * The online course as a product. Stripe Checkout charges `priceCents` (no Stripe
 * Price object is needed), and the server checks the amount on the paid session.
 *
 * Enrolment flow: register (Supabase Auth) → course dashboard → Purchase → Stripe
 * embedded Checkout → server confirms the payment and writes `course_enrolments`
 * → /course/learn opens.
 */
const COURSE_PRICE_CENTS = 4900;

export const courseEnrolmentOffer = {
  title: "Firearms safety course",
  description: "Online firearms safety course from Barron Sports, Ennis.",
  priceCents: COURSE_PRICE_CENTS,
  priceDisplay: formatEuro(COURSE_PRICE_CENTS),
  currency: "eur",
} as const;

/**
 * Where a learner is with paying: "registered" (account only, no enrolment row),
 * "checkout_created" (opened Stripe Checkout) or "paid".
 */
export type CourseEnrolmentStatus = "registered" | "checkout_created" | "paid";

/** A learner's enrolment, as read from the `course_enrolments` table. */
export type CourseEnrolment = {
  status: CourseEnrolmentStatus;
  paidAt: string | null;
  amountCents: number | null;
  /** The name fixed at checkout; the completion record always uses it. */
  certificateName: string | null;
  /** Set once by the server when the course is first finished. */
  completedAt: string | null;
};

export const NO_ENROLMENT: CourseEnrolment = {
  status: "registered",
  paidAt: null,
  amountCents: null,
  certificateName: null,
  completedAt: null,
};

/** The columns `enrolmentFromRow` reads. */
export const ENROLMENT_COLUMNS = "status, paid_at, amount_cents, certificate_name, completed_at";

/** Turns a `course_enrolments` row (or no row) into a `CourseEnrolment`. */
export function enrolmentFromRow(
  row: {
    status?: unknown;
    paid_at?: unknown;
    amount_cents?: unknown;
    certificate_name?: unknown;
    completed_at?: unknown;
  } | null,
): CourseEnrolment {
  if (!row) return NO_ENROLMENT;
  const status = row.status === "paid" || row.status === "checkout_created" ? row.status : "registered";
  return {
    status,
    paidAt: typeof row.paid_at === "string" ? row.paid_at : null,
    amountCents: typeof row.amount_cents === "number" ? row.amount_cents : null,
    certificateName:
      typeof row.certificate_name === "string" && row.certificate_name.trim()
        ? row.certificate_name
        : null,
    completedAt: typeof row.completed_at === "string" ? row.completed_at : null,
  };
}

export function isPaid(enrolment: CourseEnrolment) {
  return enrolment.status === "paid";
}
