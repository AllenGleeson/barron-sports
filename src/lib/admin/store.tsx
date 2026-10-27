"use client";

import { createContext, useContext, useMemo } from "react";
import {
  ADMIN_STORE_VERSION,
  normalizeAdminProduct,
  type AdminBrand,
  type AdminProduct,
  type AdminService,
  type AdminStoreData,
} from "@/lib/admin/models";
import { createSeedStore } from "@/lib/admin/seed";
import { writeJson } from "@/lib/browserStorage";
import { useStorageItem } from "@/lib/useBrowserStorage";

const STORAGE_KEY = "barron-admin-v1";

type AdminRows = {
  brands: AdminBrand;
  services: AdminService;
  products: AdminProduct;
};

export type AdminCollection = keyof AdminRows;

type AdminStoreContextValue = {
  data: AdminStoreData;
  reset: () => void;
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

function parseStore(raw: string | null): AdminStoreData {
  if (!raw) return createSeedStore();
  try {
    const parsed = JSON.parse(raw) as AdminStoreData;
    if (parsed?.version !== ADMIN_STORE_VERSION) return createSeedStore();
    if (
      !Array.isArray(parsed.brands) ||
      !Array.isArray(parsed.services) ||
      !Array.isArray(parsed.products) ||
      !Array.isArray(parsed.categories)
    ) {
      return createSeedStore();
    }
    return { ...parsed, products: parsed.products.map(normalizeAdminProduct) };
  } catch {
    return createSeedStore();
  }
}

/**
 * The admin data saved in this browser (or the seed when nothing is saved).
 * `null` during prerender and hydration.
 */
export function useAdminStoreData(): AdminStoreData | null {
  const raw = useStorageItem(STORAGE_KEY);
  return useMemo(() => (raw === undefined ? null : parseStore(raw)), [raw]);
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

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const data = useAdminStoreData();

  const value = useMemo<AdminStoreContextValue | null>(() => {
    if (!data) return null;

    const persist = (next: AdminStoreData) => {
      if (!writeJson(STORAGE_KEY, next)) {
        // Most likely too many uploaded photos (they are stored inline for now).
        window.alert(
          "This change couldn't be saved because the browser's storage is full. " +
            "Remove some uploaded photos or use image URLs instead, then try again.",
        );
      }
    };

    return {
      data,
      reset: () => persist(createSeedStore()),
      upsert: (collection, row) => {
        const normalize = normalizers[collection] as
          | ((row: AdminRows[typeof collection]) => AdminRows[typeof collection])
          | undefined;
        const next = normalize ? normalize(row) : row;
        const rows = data[collection] as (typeof next)[];
        const index = rows.findIndex((item) => item.id === next.id);
        const updated =
          index === -1 ? [...rows, next] : rows.map((item, i) => (i === index ? next : item));
        persist({ ...data, [collection]: updated });
      },
      patch: (collection, ids, mutate) => {
        const idSet = new Set(ids);
        const now = new Date().toISOString();
        const rows = data[collection] as Parameters<typeof mutate>[0][];
        persist({
          ...data,
          [collection]: rows.map((row) =>
            idSet.has(row.id) ? { ...mutate(row), updatedAt: now } : row,
          ),
        });
      },
      remove: (collection, id) => {
        const next = { ...data, [collection]: data[collection].filter((row) => row.id !== id) };
        if (collection === "products") {
          // Drop the deleted product from any package that contained it.
          next.products = next.products.map((row) =>
            row.productIds.includes(id)
              ? { ...row, productIds: row.productIds.filter((item) => item !== id) }
              : row,
          );
        }
        persist(next);
      },
    };
  }, [data]);

  if (!value) {
    return (
      <p className="p-8 text-sm text-parchment" role="status">
        Loading admin data…
      </p>
    );
  }

  return (
    <AdminStoreContext.Provider value={value}>
      {children}
    </AdminStoreContext.Provider>
  );
}

export function useAdminStore() {
  const ctx = useContext(AdminStoreContext);
  if (!ctx) throw new Error("useAdminStore must be used inside AdminStoreProvider");
  return ctx;
}
