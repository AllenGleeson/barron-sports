"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { RequireLearner } from "@/components/course/account/RequireLearner";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { useCourseEnrolment, type Learner } from "@/lib/course/account";
import { isPaid } from "@/lib/course/enrolment";

// Referenced in full so Next.js inlines it into the browser bundle.
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

export function CourseCheckout() {
  return (
    <section className="bg-ink py-10 lg:py-14">
      <Container>
        <RequireLearner path="/course/checkout">
          {(learner) => <CheckoutForLearner learner={learner} />}
        </RequireLearner>
      </Container>
    </section>
  );
}

function Message({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-xl border border-line bg-moss px-5 py-6 text-sm leading-relaxed text-parchment sm:px-8">
      {children}
    </div>
  );
}

function CheckoutForLearner({ learner }: { learner: Learner }) {
  const state = useCourseEnrolment(learner.id);

  if (state.loading) {
    return (
      <p className="text-sm text-stone" role="status">
        Checking your enrolment…
      </p>
    );
  }
  if (isPaid(state.enrolment)) {
    return (
      <Message>
        <p>You already have the course.</p>
        <Button href="/course/learn" className="mt-5">
          Go to the course
        </Button>
      </Message>
    );
  }
  if (!stripePromise) {
    return (
      <Message>
        <p>Payments aren&apos;t set up yet. Please try again later.</p>
        <Button href="/course/dashboard" variant="secondary" className="mt-5">
          Back to your dashboard
        </Button>
      </Message>
    );
  }
  return <EmbeddedPayment stripe={stripePromise} certificateName={learner.name.trim()} />;
}

type SecretState = { status: "loading" } | { status: "ready"; clientSecret: string } | { status: "error"; message: string };

function EmbeddedPayment({
  stripe,
  certificateName,
}: {
  stripe: NonNullable<typeof stripePromise>;
  certificateName: string;
}) {
  const [secret, setSecret] = useState<SecretState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/course/checkout/", { method: "POST" })
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as {
          clientSecret?: string;
          error?: string;
        };
        if (cancelled) return;
        if (response.ok && body.clientSecret) {
          setSecret({ status: "ready", clientSecret: body.clientSecret });
        } else {
          setSecret({ status: "error", message: body.error ?? "Checkout couldn't be started." });
        }
      })
      .catch(() => {
        if (!cancelled) setSecret({ status: "error", message: "Checkout couldn't be started." });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (secret.status === "loading") {
    return (
      <p className="text-sm text-stone" role="status">
        Opening secure checkout…
      </p>
    );
  }
  if (secret.status === "error") {
    return (
      <Message>
        <p role="alert">{secret.message}</p>
        <Button href="/course/dashboard" variant="secondary" className="mt-5">
          Back to your dashboard
        </Button>
      </Message>
    );
  }

  return (
    <div>
      <p className="mx-auto mb-4 max-w-3xl text-sm text-parchment">
        Your completion record will be issued to{" "}
        <span className="text-cream">{certificateName}</span>. This can&apos;t be changed after
        payment.
      </p>
      {/* Stripe draws its own light form; the light panel keeps it readable on the dark page. */}
      <div className="mx-auto max-w-3xl overflow-hidden bg-cream">
        <EmbeddedCheckoutProvider stripe={stripe} options={{ clientSecret: secret.clientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
      <p className="mx-auto mt-4 max-w-3xl text-xs text-stone">
        Payments are handled by Stripe. Barron Sports never sees your card details.
      </p>
    </div>
  );
}
