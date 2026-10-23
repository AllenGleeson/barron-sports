"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ADMIN_STORE_VERSION,
  normalizeAdminOffer,
  type AdminBrand,
  type AdminOffer,
  type AdminProduct,
  type AdminService,
  type AdminStoreData,
} from "@/lib/admin/models";
import { isCatalogOnlyOffer } from "@/lib/admin/productOffer";
import { createSeedStore, mergeSpecialOfferProducts } from "@/lib/admin/seed";
import { SPECIAL_OFFERS } from "@/lib/site";

const STORAGE_KEY = "barron-admin-v1";

type Collection = "brands" | "services" | "products" | "offers";

type AdminStoreContextValue = {
  data: AdminStoreData;
  ready: boolean;
  reset: () => void;
  upsertBrand: (row: AdminBrand) => void;
  upsertService: (row: AdminService) => void;
  upsertProduct: (row: AdminProduct) => void;
  patchProducts: (
    ids: string[],
    mutate: (row: AdminProduct) => AdminProduct,
  ) => void;
  patchBrands: (
    ids: string[],
    mutate: (row: AdminBrand) => AdminBrand,
  ) => void;
  patchServices: (
    ids: string[],
    mutate: (row: AdminService) => AdminService,
  ) => void;
  upsertOffer: (row: AdminOffer) => void;
  patchOffers: (
    ids: string[],
    mutate: (row: AdminOffer) => AdminOffer,
  ) => void;
  remove: (collection: Collection, id: string) => void;
};

const AdminStoreContext = createContext<AdminStoreContextValue | null>(null);

function readStore(): AdminStoreData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedStore();
    const parsed = JSON.parse(raw) as AdminStoreData;
    if (parsed?.version !== ADMIN_STORE_VERSION) return createSeedStore();
    if (
      !Array.isArray(parsed.brands) ||
      !Array.isArray(parsed.services) ||
      !Array.isArray(parsed.products) ||
      !Array.isArray(parsed.offers) ||
      !Array.isArray(parsed.categories)
    ) {
      return createSeedStore();
    }
    return mergeSpecialOfferProducts({
      ...parsed,
      products: parsed.products.map((product) => ({
        ...product,
        specialOffer: Boolean(product.specialOffer),
      })),
      offers: parsed.offers
        .filter((offer) => !isCatalogOnlyOffer(offer))
        .map((offer) => {
          const seeded = SPECIAL_OFFERS.find(
            (row) => row.id === offer.id || row.title === offer.title,
          );
          return normalizeAdminOffer({
            ...offer,
            categoryLabel:
              offer.categoryLabel ||
              seeded?.category ||
              parsed.categories.find((category) => category.id === offer.categoryId)
                ?.name ||
              "",
          });
        }),
    });
  } catch {
    return createSeedStore();
  }
}

export function readAdminStoreData(): AdminStoreData | null {
  if (typeof window === "undefined") return null;
  try {
    return readStore();
  } catch {
    return null;
  }
}

function writeStore(data: AdminStoreData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function newAdminId(prefix: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AdminStoreData | null>(null);

  useEffect(() => {
    const store = readStore();
    setData(store);
    writeStore(store);
  }, []);

  const persist = useCallback((next: AdminStoreData) => {
    setData(next);
    writeStore(next);
  }, []);

  const value = useMemo<AdminStoreContextValue | null>(() => {
    if (!data) return null;

    const replace = <T extends { id: string }>(rows: T[], row: T) => {
      const index = rows.findIndex((item) => item.id === row.id);
      if (index === -1) return [...rows, row];
      const copy = rows.slice();
      copy[index] = row;
      return copy;
    };

    return {
      data,
      ready: true,
      reset: () => persist(createSeedStore()),
      upsertBrand: (row) => persist({ ...data, brands: replace(data.brands, row) }),
      upsertService: (row) =>
        persist({ ...data, services: replace(data.services, row) }),
      upsertProduct: (row) =>
        persist({ ...data, products: replace(data.products, row) }),
      patchProducts: (ids, mutate) => {
        const idSet = new Set(ids);
        const now = new Date().toISOString();
        persist({
          ...data,
          products: data.products.map((row) =>
            idSet.has(row.id) ? { ...mutate(row), updatedAt: now } : row,
          ),
        });
      },
      patchBrands: (ids, mutate) => {
        const idSet = new Set(ids);
        const now = new Date().toISOString();
        persist({
          ...data,
          brands: data.brands.map((row) =>
            idSet.has(row.id) ? { ...mutate(row), updatedAt: now } : row,
          ),
        });
      },
      patchServices: (ids, mutate) => {
        const idSet = new Set(ids);
        const now = new Date().toISOString();
        persist({
          ...data,
          services: data.services.map((row) =>
            idSet.has(row.id) ? { ...mutate(row), updatedAt: now } : row,
          ),
        });
      },
      upsertOffer: (row) =>
        persist({ ...data, offers: replace(data.offers, normalizeAdminOffer(row)) }),
      patchOffers: (ids, mutate) => {
        const idSet = new Set(ids);
        const now = new Date().toISOString();
        persist({
          ...data,
          offers: data.offers.map((row) =>
            idSet.has(row.id) ? { ...mutate(row), updatedAt: now } : row,
          ),
        });
      },
      remove: (collection, id) =>
        persist({
          ...data,
          [collection]: data[collection].filter((row) => row.id !== id),
        }),
    };
  }, [data, persist]);

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
