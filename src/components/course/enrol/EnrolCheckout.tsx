"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearEnrolment,
  courseEnrolmentOffer,
  createPreviewUserId,
  createStripeCheckoutSessionId,
  createStripeCustomerId,
  createStripePaymentIntentId,
  hasCourseAccess,
  loadEnrolment,
  saveEnrolment,
  type CourseEnrolment,
} from "@/lib/course/enrolment";
import { fieldClass, fieldLabelClass } from "@/components/ui/styles";
import { CourseLoading } from "@/components/course/CourseLoading";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { Container } from "@/components/ui/Container";
import { ActionButton, Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = "details" | "payment";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function EnrolCheckout() {
  return (
    <ClientOnly fallback={<CourseLoading>Opening enrolment…</CourseLoading>}>
      <EnrolCheckoutSteps />
    </ClientOnly>
  );
}

function EnrolCheckoutSteps() {
  const router = useRouter();
  // Rendered inside ClientOnly, so saved enrolment can be read on first render.
  const [saved] = useState(loadEnrolment);
  const paid = Boolean(saved && hasCourseAccess(saved));
  const [existing, setExisting] = useState<CourseEnrolment | null>(paid ? saved : null);
  const [step, setStep] = useState<Step>(saved && !paid ? "payment" : "details");
  const [name, setName] = useState(saved?.name ?? "");
  const [email, setEmail] = useState(saved?.email ?? "");
  const [draft, setDraft] = useState<CourseEnrolment | null>(paid ? null : saved);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [resetArmed, setResetArmed] = useState(false);

  if (existing && hasCourseAccess(existing)) {
    return (
      <section className="bg-ink py-10 lg:py-14">
        <Container>
          <div className="mx-auto max-w-xl border border-line bg-moss px-5 py-8 sm:px-8">
            <Eyebrow>Access open</Eyebrow>
            <h2 className="mt-3 font-display text-3xl text-cream">You can start the course</h2>
            <p className="mt-4 text-sm leading-relaxed text-parchment">
              Registered as {existing.name} ({existing.email}). Preview Stripe payment recorded on{" "}
              {existing.paidAt ? formatDate(existing.paidAt) : "—"}. Nothing was charged and nothing
              was written to Supabase.
            </p>
            <dl className="mt-5 space-y-2 text-xs leading-relaxed text-stone">
              <div className="flex justify-between gap-4">
                <dt>User</dt>
                <dd className="font-mono text-parchment">{existing.userId}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Customer</dt>
                <dd className="font-mono text-parchment">{existing.stripeCustomerId}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Checkout</dt>
                <dd className="max-w-[14rem] truncate font-mono text-parchment">
                  {existing.stripeCheckoutSessionId}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Payment</dt>
                <dd className="max-w-[14rem] truncate font-mono text-parchment">
                  {existing.stripePaymentIntentId}
                </dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/course/learn">Open the course</Button>
              <ActionButton variant="ghost"
                onClick={() => {
                  if (!resetArmed) {
                    setResetArmed(true);
                    return;
                  }
                  clearEnrolment();
                  setExisting(null);
                  setDraft(null);
                  setStep("details");
                  setResetArmed(false);
                  setError("");
                }}
              >
                {resetArmed ? "Clear enrolment" : "Reset this preview"}
              </ActionButton>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  function continueDetails(event: React.FormEvent) {
    event.preventDefault();
    const cleanName = name.trim().replace(/\s+/g, " ");
    const cleanEmail = email.trim().toLowerCase();
    if (cleanName.length < 2) {
      setError("Enter the name for the enrolment.");
      return;
    }
    if (!emailPattern.test(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    const now = new Date().toISOString();
    const next: CourseEnrolment = {
      userId: draft?.userId ?? createPreviewUserId(),
      name: cleanName,
      email: cleanEmail,
      status: "registered",
      registeredAt: draft?.registeredAt ?? now,
      paidAt: null,
      stripeCustomerId: draft?.stripeCustomerId ?? createStripeCustomerId(),
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
    };

    setName(cleanName);
    setEmail(cleanEmail);
    setDraft(saveEnrolment(next));
    setError("");
    setStep("payment");
  }

  function payWithStripePreview(event: React.FormEvent) {
    event.preventDefault();
    const base = draft ?? loadEnrolment();
    if (!base) {
      setError("Register with your email first.");
      setStep("details");
      return;
    }

    setPaying(true);
    setError("");

    // Live path: POST /api/course/checkout → Stripe Checkout Session → redirect.
    // Webhook checkout.session.completed → update Supabase course_enrolments → unlock /course/learn.
    window.setTimeout(() => {
      const now = new Date().toISOString();
      const enrolment = saveEnrolment({
        ...base,
        status: "paid",
        paidAt: now,
        stripeCustomerId: base.stripeCustomerId ?? createStripeCustomerId(),
        stripeCheckoutSessionId: createStripeCheckoutSessionId(),
        stripePaymentIntentId: createStripePaymentIntentId(),
      });
      setExisting(enrolment);
      setDraft(enrolment);
      setPaying(false);
      router.push("/course/learn");
    }, 900);
  }

  return (
    <section className="bg-ink py-10 lg:py-14">
      <Container>
        <div className="mx-auto max-w-xl">
          <ol className="grid grid-cols-2 border border-line" aria-label="Enrolment steps">
            {(
              [
                { id: "details", label: "Register" },
                { id: "payment", label: "Stripe" },
              ] as const
            ).map((item, index) => {
              const active = step === item.id;
              const done = item.id === "details" && step === "payment";
              return (
                <li
                  key={item.id}
                  className={`px-4 py-3 ${index > 0 ? "border-l border-line" : ""} ${
                    active ? "bg-moss" : "bg-transparent"
                  }`}
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-brass">
                    Step {index + 1}
                    {done ? " · Done" : ""}
                  </p>
                  <p className="mt-1 text-sm text-cream">{item.label}</p>
                </li>
              );
            })}
          </ol>

          {step === "details" ? (
            <form className="mt-6 border border-line bg-moss px-5 py-6 sm:px-8" onSubmit={continueDetails}>
              <h2 className="font-display text-3xl text-cream">Register by email</h2>
              <p className="mt-3 text-sm leading-relaxed text-parchment">
                Live enrolment will create a Supabase user and profile from this email. This preview
                only stores the details on this device.
              </p>
              <label className="mt-6 block">
                <span className={fieldLabelClass}>Full name</span>
                <input
                  value={name}
                  autoComplete="name"
                  onChange={(event) => {
                    setName(event.target.value);
                    setError("");
                  }}
                  className={fieldClass}
                />
              </label>
              <label className="mt-4 block">
                <span className={fieldLabelClass}>Email</span>
                <input
                  type="email"
                  value={email}
                  autoComplete="email"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  className={fieldClass}
                />
              </label>
              {error ? (
                <p className="mt-4 text-sm text-parchment" role="alert">
                  {error}
                </p>
              ) : null}
              <ActionButton type="submit" className="mt-6">
                Continue to Stripe
              </ActionButton>
            </form>
          ) : (
            <form
              className="mt-6 border border-line bg-moss px-5 py-6 sm:px-8"
              onSubmit={payWithStripePreview}
            >
              <h2 className="font-display text-3xl text-cream">Stripe Checkout</h2>
              <p className="mt-3 text-sm leading-relaxed text-parchment">
                {courseEnrolmentOffer.priceNote} Card details stay on Stripe in production. Here the
                button only simulates a successful Checkout Session and webhook.
              </p>

              <div className="mt-6 border border-line bg-ink px-4 py-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-brass">
                      {courseEnrolmentOffer.title}
                    </p>
                    <p className="mt-2 text-sm text-parchment">{name}</p>
                    <p className="text-sm text-stone">{email}</p>
                  </div>
                  <p className="font-display text-3xl text-cream">
                    {courseEnrolmentOffer.priceDisplay}
                  </p>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-stone">
                  Provider {courseEnrolmentOffer.provider} · Store {courseEnrolmentOffer.store} ·
                  Price {courseEnrolmentOffer.stripePriceId}
                </p>
              </div>

              <div className="mt-5 border border-dashed border-line px-4 py-5 text-sm leading-relaxed text-parchment">
                <p className="text-[11px] uppercase tracking-[0.18em] text-brass">
                  Simulated Checkout
                </p>
                <p className="mt-2">
                  In production this page redirects to Stripe-hosted Checkout. After payment, a
                  Vercel webhook marks the Supabase enrolment as paid and the course unlocks.
                </p>
              </div>

              {error ? (
                <p className="mt-4 text-sm text-parchment" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <ActionButton type="submit" disabled={paying}>
                  {paying
                    ? "Confirming Stripe payment…"
                    : `Pay ${courseEnrolmentOffer.priceDisplay} with Stripe`}
                </ActionButton>
                <ActionButton variant="ghost"
                  type="button"
                  onClick={() => {
                    setStep("details");
                    setError("");
                  }}
                >
                  Back
                </ActionButton>
              </div>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
