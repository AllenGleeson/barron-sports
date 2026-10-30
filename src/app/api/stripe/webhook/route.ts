import type Stripe from "stripe";
import { recordCheckoutSession } from "@/lib/course/purchase";
import { getStripe } from "@/lib/stripe/server";

/**
 * Stripe webhook (endpoint: /api/stripe/webhook/, note the trailing slash).
 * Backs up the return page: if the learner closes the tab after paying, this still
 * records the enrolment. Locally, forward events with
 * `stripe listen --forward-to localhost:3000/api/stripe/webhook/`.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return new Response("Webhook not configured", { status: 503 });

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, request.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    try {
      await recordCheckoutSession(event.data.object);
    } catch (error) {
      console.error("Recording course payment failed", error);
      // A 500 makes Stripe retry later.
      return new Response("Couldn't record payment", { status: 500 });
    }
  }

  return Response.json({ received: true });
}
