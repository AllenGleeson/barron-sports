"use client";

import { useEffect, useState } from "react";
import {
  ADMIN_PASSWORD,
  isAdminUnlocked,
  unlockAdmin,
} from "@/lib/admin/auth";
import { adminButton, AdminField, AdminInput } from "@/components/admin/fields";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"checking" | "locked" | "open">("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setState(isAdminUnlocked() ? "open" : "locked");
  }, []);

  if (state === "checking") {
    return (
      <p className="p-8 text-sm text-parchment" role="status">
        Checking access…
      </p>
    );
  }

  if (state === "open") return children;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-forest px-5">
      <form
        className="w-full max-w-md border border-line bg-moss p-6 sm:p-8"
        onSubmit={(event) => {
          event.preventDefault();
          if (password === ADMIN_PASSWORD) {
            unlockAdmin();
            setState("open");
            setError(false);
            return;
          }
          setError(true);
        }}
      >
        <p className="text-[11px] uppercase tracking-[0.28em] text-brass">
          Barron Sports
        </p>
        <h1 className="mt-3 font-display text-4xl text-cream">Admin</h1>
        <p className="mt-3 text-sm text-parchment">
          Sign in to manage services, products and brands.
        </p>
        <div className="mt-6">
          <AdminField label="Password">
            <AdminInput
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(false);
              }}
              required
            />
          </AdminField>
        </div>
        {error ? (
          <p className="mt-3 text-sm text-red-200" role="alert">
            That password does not match.
          </p>
        ) : null}
        <button type="submit" className={`${adminButton.primary} mt-6`}>
          Sign in
        </button>
      </form>
    </div>
  );
}
