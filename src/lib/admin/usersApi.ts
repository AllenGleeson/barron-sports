import { useCallback, useEffect, useState } from "react";
import type { AdminUser, AdminUserChanges, UserRole } from "@/lib/admin/users";

/** Calls an admin users route; throws an Error with the server's message on failure. */
async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/admin/users/${path}`, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Something went wrong. Please try again.");
  return body;
}

export async function updateUser(id: string, changes: AdminUserChanges) {
  const { user } = await call<{ user: AdminUser }>(`${id}/`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
  return user;
}

export async function deleteUser(id: string) {
  await call(`${id}/`, { method: "DELETE" });
}

export async function sendPasswordReset(id: string) {
  return call<{ sentTo: string; sentAt: string }>(`${id}/password-reset/`, { method: "POST" });
}

export async function inviteUser(input: { name: string; email: string; role: UserRole }) {
  const { user } = await call<{ user: AdminUser }>("", { method: "POST", body: JSON.stringify(input) });
  return user;
}

export type UsersState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; users: AdminUser[] };

/**
 * All accounts, loaded from the server when the page opens. `replace` / `drop` update
 * the list after a change without loading everything again; `reload` fetches it fresh.
 */
export function useAdminUsers() {
  const [state, setState] = useState<UsersState>({ status: "loading" });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    call<{ users: AdminUser[] }>("")
      .then(({ users }) => {
        if (!cancelled) setState({ status: "ready", users });
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ status: "error", message: error.message });
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  const replace = useCallback((user: AdminUser) => {
    setState((current) => {
      if (current.status !== "ready") return current;
      const exists = current.users.some((row) => row.id === user.id);
      return {
        status: "ready",
        users: exists
          ? current.users.map((row) => (row.id === user.id ? user : row))
          : [...current.users, user],
      };
    });
  }, []);

  const drop = useCallback((ids: string[]) => {
    setState((current) =>
      current.status === "ready"
        ? { status: "ready", users: current.users.filter((row) => !ids.includes(row.id)) }
        : current,
    );
  }, []);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  return { state, replace, drop, reload };
}
