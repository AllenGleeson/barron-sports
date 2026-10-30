import { recordCheckoutSession, sessionUserId } from "@/lib/course/purchase";
import { getStripe } from "@/lib/stripe/server";
import { getRequestUser } from "@/lib/supabase/server";

/**
 * Called by /course/checkout/complete after Stripe sends the learner back. Asks Stripe
 * for the session and records the payment straight away, so the course opens without
 * waiting for the webhook.
 */
export async function GET(request: Request) {
  const stripe = getStripe();
  if (!stripe) return Response.json({ error: "Payments aren't set up yet." }, { status: 503 });

  const user = await getRequestUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401 });

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) return Response.json({ error: "Missing session." }, { status: 400 });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (sessionUserId(session) !== user.id) {
      return Response.json({ error: "This payment belongs to another account." }, { status: 403 });
    }
    const paid = session.status === "complete" ? await recordCheckoutSession(session) : false;
    return Response.json({ status: session.status, paid });
  } catch (error) {
    console.error("Course checkout status failed", error);
    return Response.json({ error: "We couldn't check the payment." }, { status: 500 });
  }
}
