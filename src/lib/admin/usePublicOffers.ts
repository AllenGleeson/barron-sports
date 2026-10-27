"use client";

import { useEffect, useState } from "react";
import { specialOffersFromStore } from "@/lib/admin/productOffer";
import { loadOfferSource } from "@/lib/admin/publicContent";
import type { SpecialOffer } from "@/lib/site";

/**
 * Live special offers from the database.
 * `null` until loaded (or if the database isn't available): callers render
 * their built-in fallback until then.
 */
export function usePublicOffers() {
  const [offers, setOffers] = useState<SpecialOffer[] | null>(null);

  useEffect(() => {
    let active = true;
    void loadOfferSource().then((source) => {
      if (active && source) setOffers(specialOffersFromStore(source));
    });
    return () => {
      active = false;
    };
  }, []);

  return offers;
}
