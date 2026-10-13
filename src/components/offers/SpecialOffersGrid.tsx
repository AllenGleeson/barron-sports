"use client";

import { useEffect, useState } from "react";
import { OfferCard } from "@/components/cards/OfferCard";
import { specialOfferProductsFromStore } from "@/lib/admin/productOffer";
import { readAdminStoreData } from "@/lib/admin/store";
import type { SpecialOffer } from "@/lib/site";

export function SpecialOffersGrid({ offers }: { offers: SpecialOffer[] }) {
  const [fromProducts, setFromProducts] = useState<SpecialOffer[]>([]);

  useEffect(() => {
    const store = readAdminStoreData();
    if (!store) return;
    setFromProducts(specialOfferProductsFromStore(store));
  }, []);

  const existing = new Set(offers.map((offer) => offer.title.toLowerCase()));
  const extra = fromProducts.filter(
    (offer) => !existing.has(offer.title.toLowerCase()),
  );
  const rows = [...offers, ...extra];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((offer) => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
}
