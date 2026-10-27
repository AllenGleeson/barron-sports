"use client";

import { useState } from "react";
import { adminButton, AdminField, AdminInput } from "@/components/admin/fields";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { signInAdmin, signOutAdmin, useAdminAuth } from "@/lib/admin/auth";

/** Shows the admin area only to signed-in Supabase accounts with the admin role. */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const auth = useAdminAuth();

  if (auth.status === "loading") {
    return (
      <p className="p-8 text-sm text-parchment" role="status">
        Checking access…
      </p>
    );
  }

  if (auth.status === "signed-in" && auth.isAdmin) return children;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-forest px-5">
      <div className="w-full max-w-md border border-line bg-moss p-6 sm:p-8">
        <Eyebrow>Barron Sports</Eyebrow>
        <h1 className="mt-3 font-display text-4xl text-cream">Admin</h1>
        {auth.status === "unconfigured" ? (
          <p className="mt-3 text-sm text-parchment">
            Sign-in isn&apos;t set up. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to the environment variables.
          </p>
        ) : auth.status === "signed-in" ? (
          <>
            <p className="mt-3 text-sm text-parchment">
              {auth.email} doesn&apos;t have admin access. Ask the site owner to grant it, or sign
              in with a different account.
            </p>
            <button
              type="button"
              className={`${adminButton.secondary} mt-6`}
              onClick={() => void signOutAdmin()}
            >
              Sign out
            </button>
          </>
        ) : (
          <SignInForm />
        )}
      </div>
    </div>
  );
}

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        const message = await signInAdmin(email, password);
        setBusy(false);
        // On success the gate re-renders from the new session.
        if (message) setError(message);
      }}
    >
      <p className="mt-3 text-sm text-parchment">
        Sign in to manage products, offers, services and brands.
      </p>
      <div className="mt-6 grid gap-4">
        <AdminField label="Email" required>
          <AdminInput
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
            required
          />
        </AdminField>
        <AdminField label="Password" required>
          <AdminInput
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            required
          />
        </AdminField>
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className={`${adminButton.primary} mt-6`} disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
