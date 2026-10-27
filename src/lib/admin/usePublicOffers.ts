"use client";

import { useMemo } from "react";
import { specialOffersFromStore } from "@/lib/admin/productOffer";
import { useAdminStoreData } from "@/lib/admin/store";

/**
 * Published offers from this browser's admin data.
 * `null` until hydrated: callers render their static fallback until then.
 */
export function usePublicOffers() {
  const store = useAdminStoreData();
  return useMemo(() => (store ? specialOffersFromStore(store) : null), [store]);
}
