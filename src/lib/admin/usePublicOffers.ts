"use client";

import { useEffect, useState } from "react";
import { specialOffersFromStore } from "@/lib/admin/productOffer";
import { readAdminStoreData } from "@/lib/admin/store";
import type { SpecialOffer } from "@/lib/site";

export function usePublicOffers(fallback: SpecialOffer[]) {
  const [offers, setOffers] = useState<SpecialOffer[] | null>(null);

  useEffect(() => {
    const store = readAdminStoreData();
    setOffers(store ? specialOffersFromStore(store) : fallback);
  }, [fallback]);

  return offers;
}

export function usePublishedOfferTitles() {
  const [titles, setTitles] = useState<string[] | null>(null);

  useEffect(() => {
    const store = readAdminStoreData();
    if (!store) return;
    setTitles(
      specialOffersFromStore(store).map((offer) => offer.title.toLowerCase()),
    );
  }, []);

  return titles;
}
