import Link from "next/link";
import { CoverImage } from "@/components/media/CoverImage";
import { offerHref, type SpecialOffer } from "@/lib/site";

export function OfferCard({ offer }: { offer: SpecialOffer }) {
  return (
    <article className="group flex h-full flex-col border border-line bg-moss">
      <div className="relative aspect-[4/3] overflow-hidden bg-panel p-4">
        <CoverImage
          src={offer.image}
          alt={offer.title}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          fit="contain"
          className="transition duration-700 group-hover:scale-[1.03]"
        />
        {offer.badge ? (
          <span className="absolute left-4 top-4 bg-brass px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-ink">
            {offer.badge}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-[10px] uppercase tracking-[0.22em] text-brass">
          {offer.category}
        </p>
        <h3 className="mt-2 font-display text-2xl leading-snug text-cream">
          {offer.title}
        </h3>
        <ul className="mt-3 flex-1 space-y-1.5 text-sm leading-relaxed text-stone">
          {offer.description.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-5 flex items-baseline gap-3">
          {offer.rrp ? (
            <span className="text-sm text-stone line-through">{offer.rrp}</span>
          ) : null}
          <span className="text-lg text-brass">{offer.price}</span>
        </p>
        <Link
          href={offerHref(offer)}
          className="mt-6 inline-flex w-fit border border-line px-4 py-2.5 text-[11px] uppercase tracking-[0.18em] text-cream transition-colors hover:border-brass hover:text-brass"
        >
          View Offer
        </Link>
      </div>
    </article>
  );
}
