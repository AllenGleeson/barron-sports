"use client";

import { OfferCard } from "@/components/cards/OfferCard";
import { OffersComingSoon } from "@/components/offers/OffersComingSoon";
import { usePublicOffers } from "@/lib/admin/usePublicOffers";
import type { SpecialOffer } from "@/lib/site";

export function SpecialOffersGrid({ offers }: { offers: SpecialOffer[] }) {
  const fromStore = usePublicOffers(offers);
  const rows = fromStore ?? offers;

  if (fromStore !== null && rows.length === 0) {
    return <OffersComingSoon />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((offer) => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
}
