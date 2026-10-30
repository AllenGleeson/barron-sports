"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLearnerAuth, type Learner } from "@/lib/course/account";

/** The sign-in page, returning to `path` afterwards. */
export function signInHref(path: string) {
  return `/course/sign-in?next=${encodeURIComponent(path)}`;
}

/**
 * Shows `children` for a signed-in learner; otherwise sends them to sign in and back.
 * This only decides what the page shows: the database and the server routes check
 * the sign-in themselves.
 */
export function RequireLearner({
  path,
  children,
  status = (message) => (
    <p className="text-sm text-stone" role="status">
      {message}
    </p>
  ),
}: {
  /** This page's path, to return to after signing in. */
  path: string;
  children: (learner: Learner) => React.ReactNode;
  /** How to show a waiting or error message; a plain line by default. */
  status?: (message: React.ReactNode) => React.ReactNode;
}) {
  const auth = useLearnerAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.status === "signed-out") router.replace(signInHref(path));
  }, [auth.status, path, router]);

  if (auth.status === "unconfigured") {
    return status("Accounts aren't set up yet. Please try again later.");
  }
  if (auth.status !== "signed-in") return status("Checking your account…");
  return children(auth.learner);
}
