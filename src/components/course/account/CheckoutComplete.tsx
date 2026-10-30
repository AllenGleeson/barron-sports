"use client";

import { useEffect, useState } from "react";
import { RequireLearner } from "@/components/course/account/RequireLearner";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

type Result =
  | { status: "checking" }
  | { status: "paid" }
  | { status: "open" }
  | { status: "error"; message: string };

export function CheckoutComplete() {
  return (
    <section className="bg-ink py-10 lg:py-14">
      <Container>
        <RequireLearner path="/course/dashboard">{() => <PaymentResult />}</RequireLearner>
      </Container>
    </section>
  );
}

/** Asks the server to confirm the Stripe session in `?session_id=` and record it. */
function PaymentResult() {
  const [result, setResult] = useState<Result>({ status: "checking" });

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    let cancelled = false;
    const url = `/api/course/checkout/status/?session_id=${encodeURIComponent(sessionId ?? "")}`;
    void fetch(url)
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as {
          status?: string;
          paid?: boolean;
          error?: string;
        };
        if (cancelled) return;
        if (!response.ok) setResult({ status: "error", message: body.error ?? "We couldn't check the payment." });
        else if (body.paid) setResult({ status: "paid" });
        else if (body.status === "open") setResult({ status: "open" });
        else setResult({ status: "error", message: "The payment hasn't gone through yet." });
      })
      .catch(() => {
        if (!cancelled) setResult({ status: "error", message: "We couldn't check the payment." });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const box = "max-w-xl border bg-moss px-5 py-6 sm:px-8";

  if (result.status === "checking") {
    return (
      <p className="text-sm text-stone" role="status">
        Confirming your payment…
      </p>
    );
  }

  if (result.status === "paid") {
    return (
      <div className={`${box} border-brass`} role="status">
        <Eyebrow>Payment received</Eyebrow>
        <h2 className="mt-3 font-display text-3xl text-cream">You&apos;re enrolled</h2>
        <p className="mt-3 text-sm leading-relaxed text-parchment">
          Thanks. Stripe will email your receipt. The course is ready whenever you are.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button href="/course/learn">Start the course</Button>
          <Button href="/course/dashboard" variant="secondary">
            Your dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${box} border-line`}>
      <h2 className="font-display text-3xl text-cream">
        {result.status === "open" ? "Payment not finished" : "Something went wrong"}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-parchment" role="alert">
        {result.status === "open"
          ? "The payment wasn't completed, and you haven't been charged."
          : `${result.message} If you were charged, contact the shop and we'll sort it out.`}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button href="/course/checkout">Try again</Button>
        <Button href="/course/dashboard" variant="secondary">
          Your dashboard
        </Button>
      </div>
    </div>
  );
}
