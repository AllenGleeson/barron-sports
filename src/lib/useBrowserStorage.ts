"use client";

import { useSyncExternalStore } from "react";
import { readStorage, subscribeStorage, type StorageArea } from "@/lib/browserStorage";

/**
 * The raw stored string for `key`.
 * `undefined` during prerender and hydration, `null` when nothing is stored.
 */
export function useStorageItem(
  key: string,
  area: StorageArea = "local",
): string | null | undefined {
  return useSyncExternalStore(
    subscribeStorage,
    () => readStorage(key, area),
    () => undefined,
  );
}

const noopSubscribe = () => () => {};

/** `false` during prerender and hydration, `true` once running in the browser. */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
