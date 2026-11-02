import type Stripe from "stripe";
import { recordCheckoutSession, recordFailedSession, recordRefund } from "@/lib/course/purchase";
import { getStripe } from "@/lib/stripe/server";

/**
 * Stripe webhook (endpoint: /api/stripe/webhook/, note the trailing slash).
 * Backs up the return page: if the learner closes the tab after paying, this still
 * records the payment. It also records refunds made in the Stripe dashboard (a full
 * refund removes course access) and checkouts that expired or failed.
 * Locally, forward events with `stripe listen --forward-to localhost:3000/api/stripe/webhook/`.
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

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await recordCheckoutSession(event.data.object);
        break;
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed":
        await recordFailedSession(event.data.object);
        break;
      case "charge.refunded":
        await recordRefund(event.data.object);
        break;
    }
  } catch (error) {
    console.error(`Handling Stripe ${event.type} failed`, error);
    // A 500 makes Stripe retry later.
    return new Response("Couldn't record the event", { status: 500 });
  }

  return Response.json({ received: true });
}
