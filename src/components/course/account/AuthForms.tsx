"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CourseLoading } from "@/components/course/CourseLoading";
import { ActionButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { fieldClass, fieldLabelClass } from "@/components/ui/styles";
import {
  MIN_PASSWORD_LENGTH,
  registerLearner,
  requestPasswordReset,
  signInLearner,
  useLearnerAuth,
} from "@/lib/course/account";
import { validateEmail } from "@/lib/admin/validation";

/** Where to go after signing in: `?next=` if it's a course page, else the dashboard. */
function nextPath() {
  const next = new URLSearchParams(window.location.search).get("next") ?? "";
  return next.startsWith("/course/") && !next.startsWith("//") ? next : "/course/dashboard";
}

/** Sends a signed-in visitor on to the dashboard (or `?next=`). */
function useLeaveWhenSignedIn() {
  const auth = useLearnerAuth();
  const router = useRouter();
  useEffect(() => {
    if (auth.status === "signed-in") router.replace(nextPath());
  }, [auth.status, router]);
  return auth.status;
}

function Field({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className={fieldLabelClass}>{label}</span>
      <input {...props} className={fieldClass} />
      {hint ? <span className="mt-1 block text-xs text-stone">{hint}</span> : null}
    </label>
  );
}

function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-ink py-10 lg:py-14">
      <Container>
        <div className="max-w-lg border border-line bg-moss px-5 py-6 sm:px-8 sm:py-8">{children}</div>
      </Container>
    </section>
  );
}

function FormError({ message }: { message: string }) {
  return message ? (
    <p className="mt-4 border border-danger/60 bg-ink px-4 py-3 text-sm text-parchment" role="alert">
      {message}
    </p>
  ) : null;
}

export function RegisterForm() {
  const status = useLeaveWhenSignedIn();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  if (status === "loading" || status === "signed-in") {
    return <CourseLoading>Checking your account…</CourseLoading>;
  }

  if (needsConfirm) {
    return (
      <FormCard>
        <h2 className="font-display text-3xl text-cream">Check your email</h2>
        <p className="mt-3 text-sm leading-relaxed text-parchment">
          We sent a link to <span className="text-cream">{email.trim()}</span>. Open it to confirm
          your address, then sign in.
        </p>
      </FormCard>
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const problem = !name.trim()
      ? "Enter your name."
      : validateEmail(email)
        ? "Enter a valid email address."
        : password.length < MIN_PASSWORD_LENGTH
          ? `Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`
          : "";
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError("");
    const result = await registerLearner(name, email, password);
    setBusy(false);
    if (result === "confirm") setNeedsConfirm(true);
    else if (result) setError(result);
    // On success the sign-in listener moves on to the dashboard.
  }

  return (
    <FormCard>
      <h2 className="font-display text-3xl text-cream">Create your account</h2>
      <p className="mt-2 text-sm text-parchment">
        You&apos;ll use this to buy the course and come back to your lessons.
      </p>
      <form className="mt-6 space-y-5" noValidate onSubmit={submit}>
        <Field label="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FormError message={error} />
        <ActionButton type="submit" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </ActionButton>
      </form>
      <p className="mt-6 text-sm text-stone">
        Already have an account?{" "}
        <Link href="/course/sign-in" className="text-brass hover:text-cream">
          Sign in
        </Link>
      </p>
    </FormCard>
  );
}

export function SignInForm() {
  const status = useLeaveWhenSignedIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (status === "loading" || status === "signed-in") {
    return <CourseLoading>Checking your account…</CourseLoading>;
  }

  if (forgot) {
    return (
      <FormCard>
        <h2 className="font-display text-3xl text-cream">Reset your password</h2>
        {resetSent ? (
          <p className="mt-3 text-sm leading-relaxed text-parchment" role="status">
            If there&apos;s an account for <span className="text-cream">{email.trim()}</span>,
            we&apos;ve emailed it a link to choose a new password. Open it on this device.
          </p>
        ) : (
          <form
            className="mt-6 space-y-5"
            noValidate
            onSubmit={async (event) => {
              event.preventDefault();
              if (validateEmail(email)) {
                setError("Enter your email address.");
                return;
              }
              setBusy(true);
              setError("");
              const result = await requestPasswordReset(email);
              setBusy(false);
              if (result) setError(result);
              else setResetSent(true);
            }}
          >
            <Field
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormError message={error} />
            <ActionButton type="submit" disabled={busy}>
              {busy ? "Sending…" : "Email me a link"}
            </ActionButton>
          </form>
        )}
        <button
          type="button"
          className="mt-6 cursor-pointer text-sm text-brass hover:text-cream"
          onClick={() => {
            setForgot(false);
            setResetSent(false);
            setError("");
          }}
        >
          Back to sign in
        </button>
      </FormCard>
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (validateEmail(email) || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    setError("");
    const result = await signInLearner(email, password);
    setBusy(false);
    if (result) setError(result);
  }

  return (
    <FormCard>
      <h2 className="font-display text-3xl text-cream">Sign in</h2>
      <form className="mt-6 space-y-5" noValidate onSubmit={submit}>
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FormError message={error} />
        <ActionButton type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </ActionButton>
      </form>
      <button
        type="button"
        className="mt-4 cursor-pointer text-sm text-brass hover:text-cream"
        onClick={() => {
          setForgot(true);
          setError("");
        }}
      >
        Forgot your password?
      </button>
      <p className="mt-6 text-sm text-stone">
        New to the course?{" "}
        <Link href="/course/register" className="text-brass hover:text-cream">
          Create an account
        </Link>
      </p>
    </FormCard>
  );
}
