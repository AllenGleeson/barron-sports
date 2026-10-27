/**
 * Shared access to localStorage / sessionStorage.
 *
 * Plain functions, safe to import anywhere. Components read storage through
 * the hooks in `useBrowserStorage.ts` (or render inside `ClientOnly`) instead
 * of copying it into state from a `useEffect`.
 */

export type StorageArea = "local" | "session";

const listeners = new Set<() => void>();

function storage(area: StorageArea) {
  return area === "local" ? window.localStorage : window.sessionStorage;
}

export function readStorage(key: string, area: StorageArea = "local") {
  try {
    return storage(area).getItem(key);
  } catch {
    return null;
  }
}

/**
 * Writes (or removes, when `value` is null) a key and re-renders every subscriber.
 * Returns false when the browser refused it (storage full or blocked).
 */
export function writeStorage(
  key: string,
  value: string | null,
  area: StorageArea = "local",
) {
  let saved = true;
  try {
    if (value === null) storage(area).removeItem(key);
    else storage(area).setItem(key, value);
  } catch {
    saved = false;
  }
  listeners.forEach((listener) => listener());
  return saved;
}

export function readJson(key: string, area: StorageArea = "local"): unknown {
  const raw = readStorage(key, area);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown, area: StorageArea = "local") {
  return writeStorage(key, JSON.stringify(value), area);
}

/** Calls `listener` whenever any key changes, in this tab or another one. */
export function subscribeStorage(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}
