"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { fieldClass, fieldLabelClass } from "@/components/ui/styles";
import {
  MIN_PASSWORD_LENGTH,
  sessionFromLinkHash,
  setNewPassword,
  useLearnerAuth,
} from "@/lib/course/account";

/**
 * Where password reset and invite emails land. The link signs the person in; they then
 * choose a password and go on to the course dashboard (or admin, for admins).
 */
export function ResetPasswordForm() {
  const auth = useLearnerAuth();
  const router = useRouter();
  const [linkChecked, setLinkChecked] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void sessionFromLinkHash().then((problem) => {
      setLinkError(problem);
      setLinkChecked(true);
    });
  }, []);

  const box = "max-w-lg border border-line bg-moss px-5 py-6 sm:px-8 sm:py-8";

  let content: React.ReactNode;
  if (!linkChecked || auth.status === "loading") {
    content = (
      <p className="text-sm text-stone" role="status">
        Checking your link…
      </p>
    );
  } else if (auth.status !== "signed-in") {
    content = (
      <div className={box}>
        <h2 className="font-display text-3xl text-cream">Link not valid</h2>
        <p className="mt-3 text-sm leading-relaxed text-parchment" role="alert">
          {linkError ?? "This link has expired or has already been used."} You can ask for a new
          one from the sign-in page.
        </p>
        <Link href="/course/sign-in" className="mt-5 inline-block text-sm text-brass hover:text-cream">
          Go to sign in
        </Link>
      </div>
    );
  } else {
    content = (
      <div className={box}>
        <h2 className="font-display text-3xl text-cream">Choose a password</h2>
        <p className="mt-2 text-sm text-parchment">
          For <span className="break-all text-cream">{auth.learner.email}</span>.
        </p>
        <form
          className="mt-6 space-y-5"
          noValidate
          onSubmit={async (event) => {
            event.preventDefault();
            if (password.length < MIN_PASSWORD_LENGTH) {
              setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
              return;
            }
            if (password !== repeat) {
              setError("The passwords don't match.");
              return;
            }
            setBusy(true);
            const result = await setNewPassword(password);
            setBusy(false);
            if (result.error) {
              setError(result.error);
              return;
            }
            router.replace(result.isAdmin ? "/admin" : "/course/dashboard");
          }}
        >
          {[
            { label: "New password", value: password, set: setPassword },
            { label: "Repeat new password", value: repeat, set: setRepeat },
          ].map((field) => (
            <label key={field.label} className="block">
              <span className={fieldLabelClass}>{field.label}</span>
              <input
                type="password"
                autoComplete="new-password"
                className={fieldClass}
                value={field.value}
                onChange={(event) => {
                  field.set(event.target.value);
                  setError("");
                }}
              />
            </label>
          ))}
          {error ? (
            <p className="text-sm text-parchment" role="alert">
              {error}
            </p>
          ) : null}
          <ActionButton type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save password"}
          </ActionButton>
        </form>
      </div>
    );
  }

  return (
    <section className="bg-ink py-10 lg:py-14">
      <Container>{content}</Container>
    </section>
  );
}
