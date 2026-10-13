const AUTH_KEY = "barron-admin-auth";

export const ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD?.trim() || "barron";

export function isAdminUnlocked() {
  return window.sessionStorage.getItem(AUTH_KEY) === "1";
}

export function unlockAdmin() {
  window.sessionStorage.setItem(AUTH_KEY, "1");
}

export function lockAdmin() {
  window.sessionStorage.removeItem(AUTH_KEY);
}
