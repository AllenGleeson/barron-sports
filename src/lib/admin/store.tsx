"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  normalizeAdminProduct,
  type AdminBrand,
  type AdminProduct,
  type AdminService,
  type AdminStoreData,
} from "@/lib/admin/models";
import {
  brandFromRow,
  categoryFromRow,
  productFromRow,
  serviceFromRow,
  toRow,
} from "@/lib/admin/rows";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type AdminRows = {
  brands: AdminBrand;
  services: AdminService;
  products: AdminProduct;
};

export type AdminCollection = keyof AdminRows;

type AdminStoreContextValue = {
  data: AdminStoreData;
  /** Adds the row, or replaces the row with the same id. */
  upsert: <C extends AdminCollection>(collection: C, row: AdminRows[C]) => void;
  /** Applies `mutate` to each listed row and stamps `updatedAt`. */
  patch: <C extends AdminCollection>(
    collection: C,
    ids: string[],
    mutate: (row: AdminRows[C]) => AdminRows[C],
  ) => void;
  remove: (collection: AdminCollection, id: string) => void;
};

const AdminStoreContext = createContext<AdminStoreContextValue | null>(null);

/** Loads every content table. Admins see unpublished rows too (database access rules). */
async function loadAdminData(supabase: SupabaseClient): Promise<AdminStoreData> {
  const [categories, brands, services, products] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("brands").select("*").order("sort_order"),
    supabase.from("services").select("*").order("sort_order"),
    supabase.from("products").select("*").order("sort_order"),
  ]);
  const error = categories.error ?? brands.error ?? services.error ?? products.error;
  if (error) throw new Error(error.message);
  return {
    categories: (categories.data ?? []).map(categoryFromRow),
    brands: (brands.data ?? []).map(brandFromRow),
    services: (services.data ?? []).map(serviceFromRow),
    products: (products.data ?? []).map(productFromRow),
  };
}

export function newAdminId(prefix: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}

const normalizers: { [C in AdminCollection]?: (row: AdminRows[C]) => AdminRows[C] } = {
  products: normalizeAdminProduct,
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: AdminStoreData };

/**
 * Admin data from Supabase. Changes show immediately and are saved in the
 * background; if a save fails the admin is told and the data is reloaded.
 */
export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LoadState>(() =>
    getSupabaseBrowser()
      ? { status: "loading" }
      : { status: "error", message: "Supabase isn't configured." },
  );

  const reload = useCallback(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    loadAdminData(supabase)
      .then((data) => setState({ status: "ready", data }))
      .catch((error: Error) => setState({ status: "error", message: error.message }));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const data = state.status === "ready" ? state.data : null;

  const value = useMemo<AdminStoreContextValue | null>(() => {
    const supabase = getSupabaseBrowser();
    if (!data || !supabase) return null;

    /** Shows `next` straight away, then runs the database writes. */
    function commit(next: AdminStoreData, write: () => Promise<{ error: { message: string } | null }[]>) {
      setState({ status: "ready", data: next });
      write()
        .then((results) => {
          const failed = results.find((result) => result.error);
          if (failed?.error) throw new Error(failed.error.message);
        })
        .catch((error: Error) => {
          window.alert(`That change couldn't be saved: ${error.message}\n\nThe latest data will be reloaded.`);
          reload();
        });
    }

    const save = (collection: AdminCollection, rows: object[]) =>
      supabase.from(collection).upsert(rows.map((row) => toRow(collection, row)));

    return {
      data,
      upsert: (collection, row) => {
        const normalize = normalizers[collection] as
          | ((row: AdminRows[typeof collection]) => AdminRows[typeof collection])
          | undefined;
        const next = normalize ? normalize(row) : row;
        const rows = data[collection] as (typeof next)[];
        const index = rows.findIndex((item) => item.id === next.id);
        const updated =
          index === -1 ? [...rows, next] : rows.map((item, i) => (i === index ? next : item));
        commit({ ...data, [collection]: updated }, async () => [await save(collection, [next])]);
      },
      patch: (collection, ids, mutate) => {
        const idSet = new Set(ids);
        const now = new Date().toISOString();
        const rows = data[collection] as Parameters<typeof mutate>[0][];
        const changed: typeof rows = [];
        const updated = rows.map((row) => {
          if (!idSet.has(row.id)) return row;
          const next = { ...mutate(row), updatedAt: now };
          changed.push(next);
          return next;
        });
        commit({ ...data, [collection]: updated }, async () => [await save(collection, changed)]);
      },
      remove: (collection, id) => {
        const next = { ...data, [collection]: data[collection].filter((row) => row.id !== id) };
        // Drop a deleted product from any package that contained it.
        const packages: AdminProduct[] = [];
        if (collection === "products") {
          next.products = next.products.map((row) => {
            if (!row.productIds.includes(id)) return row;
            const updated = { ...row, productIds: row.productIds.filter((item) => item !== id) };
            packages.push(updated);
            return updated;
          });
        }
        commit(next, async () => [
          await supabase.from(collection).delete().eq("id", id),
          ...(packages.length > 0 ? [await save("products", packages)] : []),
        ]);
      },
    };
  }, [data, reload]);

  if (state.status === "error") {
    return (
      <div className="p-8 text-sm text-parchment" role="alert">
        <p>The admin data couldn&apos;t be loaded: {state.message}</p>
        <button type="button" className="mt-3 text-brass underline" onClick={reload}>
          Try again
        </button>
      </div>
    );
  }

  if (!value) {
    return (
      <p className="p-8 text-sm text-parchment" role="status">
        Loading admin data…
      </p>
    );
  }

  return <AdminStoreContext.Provider value={value}>{children}</AdminStoreContext.Provider>;
}

export function useAdminStore() {
  const ctx = useContext(AdminStoreContext);
  if (!ctx) throw new Error("useAdminStore must be used inside AdminStoreProvider");
  return ctx;
}
