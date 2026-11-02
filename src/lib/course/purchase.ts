import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { COURSE_ID, courseEnrolmentOffer } from "@/lib/course/enrolment";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Writes `course_payments` and `course_enrolments`. Server only, with the secret key:
 * learners can read their own rows but never write them.
 */

function idOf(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function requireAdminClient() {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("SUPABASE_SECRET_KEY isn't set, so payments can't be recorded.");
  return supabase;
}

/** The learner a Checkout Session was created for (set by the checkout route). */
export function sessionUserId(session: Stripe.Checkout.Session) {
  return session.client_reference_id ?? session.metadata?.user_id ?? null;
}

/**
 * Gives a learner access to the course, linked to the payment that paid for it. The
 * record name is fixed here. An existing active enrolment is left as it is (so the name
 * and completion never change); a revoked one is restored with the new payment.
 */
export async function grantEnrolment(
  supabase: SupabaseClient,
  input: { userId: string; paymentId: string; certificateName: string },
) {
  const { data: existing, error } = await supabase
    .from("course_enrolments")
    .select("status")
    .eq("user_id", input.userId)
    .eq("course_id", COURSE_ID)
    .maybeSingle();
  if (error) throw error;
  if (existing?.status === "active") return;

  const now = new Date().toISOString();
  if (existing) {
    const { error: updateError } = await supabase
      .from("course_enrolments")
      .update({ status: "active", payment_id: input.paymentId, revoked_at: null, revoke_reason: null, updated_at: now })
      .eq("user_id", input.userId)
      .eq("course_id", COURSE_ID);
    if (updateError) throw updateError;
    return;
  }
  const { error: insertError } = await supabase.from("course_enrolments").insert({
    user_id: input.userId,
    course_id: COURSE_ID,
    status: "active",
    payment_id: input.paymentId,
    certificate_name: input.certificateName,
    enrolled_at: now,
    updated_at: now,
  });
  if (insertError) throw insertError;
}

/** Removes access when the payment it came from is refunded. */
export async function revokeForPayment(supabase: SupabaseClient, paymentId: string, reason: string) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("course_enrolments")
    .update({ status: "revoked", revoked_at: now, revoke_reason: reason, updated_at: now })
    .eq("payment_id", paymentId)
    .eq("status", "active");
  if (error) throw error;
}

/**
 * Records a Checkout Session in `course_payments` (one row per session) and, once
 * Stripe says it's paid for the full course price, gives the learner access. Safe to call
 * more than once: the checkout route, the return page and the webhook all call it.
 * A paid or refunded payment is never moved back to pending.
 *
 * Returns true when the learner has access after the call.
 */
export async function recordCheckoutSession(session: Stripe.Checkout.Session) {
  const userId = sessionUserId(session);
  if (!userId) throw new Error("Checkout Session has no user id.");
  const supabase = requireAdminClient();

  const { data: existing, error: readError } = await supabase
    .from("course_payments")
    .select("id, status")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();
  if (readError) throw readError;

  const paid = session.payment_status === "paid";
  const settled = existing?.status === "paid" || existing?.status === "refunded";
  const status = settled ? existing.status : paid ? "paid" : session.status === "expired" ? "failed" : "pending";
  const now = new Date().toISOString();
  const certificateName = session.metadata?.certificate_name?.trim() ?? "";

  const { data: saved, error } = await supabase
    .from("course_payments")
    .upsert(
      {
        ...(existing ? { id: existing.id } : {}),
        user_id: userId,
        course_id: COURSE_ID,
        method: "stripe",
        status,
        amount_cents: session.amount_total ?? 0,
        currency: session.currency ?? courseEnrolmentOffer.currency,
        name: certificateName,
        email: session.customer_details?.email ?? session.customer_email ?? "",
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: idOf(session.payment_intent),
        stripe_customer_id: idOf(session.customer),
        ...(paid && !settled ? { paid_at: now } : {}),
        updated_at: now,
      },
      { onConflict: "stripe_checkout_session_id" },
    )
    .select("id, status")
    .single();
  if (error) throw error;

  // The price is set by the server when the session is created; this is a second check.
  const fullPrice =
    session.amount_total === courseEnrolmentOffer.priceCents &&
    session.currency === courseEnrolmentOffer.currency;
  if (saved.status !== "paid" || !fullPrice) return false;

  await grantEnrolment(supabase, { userId, paymentId: saved.id, certificateName });
  return true;
}

/**
 * Records a refund made in the Stripe dashboard (webhook `charge.refunded`). A full
 * refund marks the payment refunded and removes the course access it gave.
 */
export async function recordRefund(charge: Stripe.Charge) {
  const paymentIntentId = idOf(charge.payment_intent);
  if (!paymentIntentId) return;
  const supabase = requireAdminClient();

  const { data: payment, error } = await supabase
    .from("course_payments")
    .select("id")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();
  if (error) throw error;
  // Not a course payment (or recorded before the payment intent was known).
  if (!payment) return;

  const now = new Date().toISOString();
  const fullRefund = charge.refunded;
  const { error: updateError } = await supabase
    .from("course_payments")
    .update({
      refunded_cents: charge.amount_refunded,
      ...(fullRefund ? { status: "refunded", refunded_at: now } : {}),
      updated_at: now,
    })
    .eq("id", payment.id);
  if (updateError) throw updateError;

  if (fullRefund) await revokeForPayment(supabase, payment.id, "Refunded");
}

/** Marks a Checkout Session that expired or whose payment failed. */
export async function recordFailedSession(session: Stripe.Checkout.Session) {
  const supabase = requireAdminClient();
  const { error } = await supabase
    .from("course_payments")
    .update({ status: "failed", updated_at: new Date().toISOString() })
    .eq("stripe_checkout_session_id", session.id)
    .eq("status", "pending");
  if (error) throw error;
}
