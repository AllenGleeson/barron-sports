import { writeStorage } from "@/lib/browserStorage";
import { useStorageItem } from "@/lib/useBrowserStorage";

const AUTH_KEY = "barron-admin-auth";

export const ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD?.trim() || "barron";

/** `undefined` until hydrated, then whether this tab has unlocked admin. */
export function useAdminUnlocked() {
  const value = useStorageItem(AUTH_KEY, "session");
  return value === undefined ? undefined : value === "1";
}

export function unlockAdmin() {
  writeStorage(AUTH_KEY, "1", "session");
}

export function lockAdmin() {
  writeStorage(AUTH_KEY, null, "session");
}
