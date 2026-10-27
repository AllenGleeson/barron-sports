import { readJson, writeJson, writeStorage } from "@/lib/browserStorage";
import { formatEuro } from "@/lib/admin/money";

const STORAGE_KEY = "barron-course-enrol-preview-v2";

/**
 * Preview store that mirrors the planned live stack:
 * - Supabase Auth + `profiles` / `course_enrolments` tables
 * - Stripe Checkout Session + PaymentIntent (via Vercel Route Handlers)
 * - Stripe webhooks write paid state into Supabase; the learn gate reads that row
 *
 * This file only uses localStorage so the flow can be tested without Stripe or Supabase.
 */

const COURSE_PRICE_CENTS = 4900;

export const courseEnrolmentOffer = {
  title: "Firearms safety course",
  priceCents: COURSE_PRICE_CENTS,
  priceDisplay: formatEuro(COURSE_PRICE_CENTS),
  currency: "eur",
  /** Placeholder Stripe Price id for the live Checkout Session */
  stripePriceId: "price_preview_firearms_safety",
  provider: "Stripe",
  store: "Supabase",
  priceNote:
    "One-time course fee. This preview does not call Stripe or write to Supabase.",
} as const;

export type CourseEnrolmentStatus = "registered" | "checkout_created" | "paid";

export type CourseEnrolment = {
  /** Mirrors `profiles.id` / Supabase Auth user id */
  userId: string;
  name: string;
  email: string;
  status: CourseEnrolmentStatus;
  registeredAt: string;
  paidAt: string | null;
  stripeCustomerId: string | null;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
};

function randomHex(length: number) {
  let value = "";
  while (value.length < length) {
    value += Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, "0");
  }
  return value.slice(0, length);
}

export function createPreviewUserId() {
  return `usr_${randomHex(24)}`;
}

export function createStripeCustomerId() {
  return `cus_preview_${randomHex(14)}`;
}

export function createStripeCheckoutSessionId() {
  return `cs_test_preview_${randomHex(24)}`;
}

export function createStripePaymentIntentId() {
  return `pi_preview_${randomHex(24)}`;
}

export function loadEnrolment(): CourseEnrolment | null {
  const parsed = readJson(STORAGE_KEY) as Partial<CourseEnrolment> | null;
  if (!parsed || typeof parsed !== "object") return null;
  if (
    typeof parsed.userId !== "string" ||
    typeof parsed.name !== "string" ||
    typeof parsed.email !== "string" ||
    typeof parsed.registeredAt !== "string" ||
    (parsed.status !== "registered" &&
      parsed.status !== "checkout_created" &&
      parsed.status !== "paid")
  ) {
    return null;
  }
  if (!parsed.name.trim() || !parsed.email.trim()) return null;
  return {
    userId: parsed.userId,
    name: parsed.name.trim(),
    email: parsed.email.trim(),
    status: parsed.status,
    registeredAt: parsed.registeredAt,
    paidAt: typeof parsed.paidAt === "string" ? parsed.paidAt : null,
    stripeCustomerId:
      typeof parsed.stripeCustomerId === "string" ? parsed.stripeCustomerId : null,
    stripeCheckoutSessionId:
      typeof parsed.stripeCheckoutSessionId === "string"
        ? parsed.stripeCheckoutSessionId
        : null,
    stripePaymentIntentId:
      typeof parsed.stripePaymentIntentId === "string"
        ? parsed.stripePaymentIntentId
        : null,
  };
}

export function saveEnrolment(enrolment: CourseEnrolment) {
  writeJson(STORAGE_KEY, enrolment);
  return enrolment;
}

export function clearEnrolment() {
  writeStorage(STORAGE_KEY, null);
}

export function hasCourseAccess(enrolment?: CourseEnrolment | null) {
  const row = enrolment === undefined ? loadEnrolment() : enrolment;
  return Boolean(row && row.status === "paid" && row.paidAt);
}
