import Link from "next/link";
import { CoverImage } from "@/components/media/CoverImage";
import { offerHref, type SpecialOffer } from "@/lib/site";

export function CompactOfferCard({ offer }: { offer: SpecialOffer }) {
  return (
    <article className="flex h-full flex-col bg-ink px-1 text-center sm:px-2">
      <div className="relative mx-auto h-36 w-full overflow-hidden bg-panel sm:h-40">
        {offer.badge ? (
          <span className="absolute left-2 top-2 z-10 bg-brass px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-ink">
            {offer.badge}
          </span>
        ) : null}
        <CoverImage
          src={offer.image}
          alt={offer.title}
          sizes="220px"
          fit="contain"
        />
      </div>
      <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-brass">
        {offer.category}
      </p>
      <h3 className="mt-1 text-[13px] font-medium uppercase leading-snug tracking-[0.08em] text-cream">
        {offer.title}
      </h3>
      <p className="mt-1 text-[12px] text-stone">
        {offer.rrp ? (
          <>
            <span className="line-through">Orig: {offer.rrp}</span>
            {"  "}
            <span className="text-cream">Offer {offer.price}</span>
          </>
        ) : (
          <span className="text-cream">{offer.price}</span>
        )}
      </p>
      <Link
        href={offerHref(offer)}
        className="mx-auto mt-auto pt-4 inline-flex min-w-[10.5rem] items-center justify-center bg-brass px-8 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-colors hover:bg-[#dcc392]"
      >
        View Offer
      </Link>
    </article>
  );
}
