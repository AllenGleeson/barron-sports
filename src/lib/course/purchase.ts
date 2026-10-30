import "server-only";
import type Stripe from "stripe";
import { courseEnrolmentOffer } from "@/lib/course/enrolment";
import { getSupabaseAdmin } from "@/lib/supabase/server";

function idOf(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/** The learner a Checkout Session was created for (set by the checkout route). */
export function sessionUserId(session: Stripe.Checkout.Session) {
  return session.client_reference_id ?? session.metadata?.user_id ?? null;
}

/**
 * Records a Checkout Session in `course_enrolments`. Marks the learner as paid only
 * when Stripe says the session is paid for the full course price. Safe to call more
 * than once (the return page and the webhook both call it); an existing paid row is
 * left as it is.
 *
 * Returns true when the learner is paid after the call.
 */
export async function recordCheckoutSession(session: Stripe.Checkout.Session) {
  const userId = sessionUserId(session);
  const supabase = getSupabaseAdmin();
  if (!userId || !supabase) {
    throw new Error(
      userId ? "SUPABASE_SECRET_KEY isn't set, so the payment can't be recorded." : "Checkout Session has no user id.",
    );
  }

  const { data: existing, error: readError } = await supabase
    .from("course_enrolments")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();
  if (readError) throw readError;
  if (existing?.status === "paid") return true;

  const paid =
    session.payment_status === "paid" &&
    session.amount_total === courseEnrolmentOffer.priceCents &&
    session.currency === courseEnrolmentOffer.currency;
  const now = new Date().toISOString();

  const { error } = await supabase.from("course_enrolments").upsert({
    user_id: userId,
    status: paid ? "paid" : "checkout_created",
    amount_cents: session.amount_total,
    currency: session.currency,
    stripe_customer_id: idOf(session.customer),
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: idOf(session.payment_intent),
    certificate_name: session.metadata?.certificate_name ?? null,
    paid_at: paid ? now : null,
    updated_at: now,
  });
  if (error) throw error;
  return paid;
}
