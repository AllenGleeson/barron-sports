import { COURSE_ID, courseEnrolmentOffer } from "@/lib/course/enrolment";
import { recordCheckoutSession } from "@/lib/course/purchase";
import { getStripe } from "@/lib/stripe/server";
import { getRequestUser, getSupabaseAdmin, getSupabaseForRequest } from "@/lib/supabase/server";

function fail(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

/**
 * Starts a Stripe Checkout Session (embedded on /course/checkout) for the signed-in
 * learner and returns its client secret. The price comes from `courseEnrolmentOffer`,
 * never from the request.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe || !getSupabaseAdmin()) {
    return fail("Payments aren't set up yet. Please try again later.", 503);
  }

  const user = await getRequestUser();
  if (!user?.email) return fail("Please sign in to buy the course.", 401);

  // The completion record is issued in this name, and it's fixed from here on.
  const fullName = user.user_metadata?.full_name;
  const certificateName = typeof fullName === "string" ? fullName.trim() : "";
  if (!certificateName) return fail("Add your name on your dashboard before paying.", 400);

  const supabase = await getSupabaseForRequest();
  const { data: enrolment } = (await supabase
    ?.from("course_enrolments")
    .select("status")
    .eq("user_id", user.id)
    .eq("course_id", COURSE_ID)
    .maybeSingle()) ?? { data: null };
  if (enrolment?.status === "active") return fail("You already have the course.", 409);
  if (enrolment?.status === "revoked") {
    return fail("Your access to the course was removed. Please contact the shop.", 409);
  }

  const origin = new URL(request.url).origin;
  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: courseEnrolmentOffer.currency,
            unit_amount: courseEnrolmentOffer.priceCents,
            product_data: {
              name: courseEnrolmentOffer.title,
              description: courseEnrolmentOffer.description,
            },
          },
        },
      ],
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { user_id: user.id, certificate_name: certificateName },
      payment_intent_data: { metadata: { user_id: user.id } },
      billing_address_collection: "required",
      return_url: `${origin}/course/checkout/complete/?session_id={CHECKOUT_SESSION_ID}`,
    });
    await recordCheckoutSession(session);
    return Response.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error("Course checkout failed", error);
    return fail("Checkout couldn't be started. Please try again.", 500);
  }
}
