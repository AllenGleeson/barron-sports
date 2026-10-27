"use client";

import { useHydrated } from "@/lib/useBrowserStorage";

/**
 * Renders `fallback` during prerender and hydration, then `children`.
 * Children can read browser storage directly while rendering (e.g. in a
 * `useState` initialiser).
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return useHydrated() ? children : fallback;
}
