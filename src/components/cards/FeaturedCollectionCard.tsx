import Link from "next/link";
import { CoverImage } from "@/components/media/CoverImage";
import type { FeaturedCollection } from "@/lib/site";

export function FeaturedCollectionCard({
  collection,
  compact = false,
}: {
  collection: FeaturedCollection;
  compact?: boolean;
}) {
  return (
    <Link href={collection.href} className="group block">
      <div
        className={`relative overflow-hidden bg-panel ${
          compact ? "aspect-[5/4]" : "aspect-[4/3]"
        }`}
      >
        <CoverImage
          src={collection.image.src}
          alt={collection.image.alt}
          sizes={
            compact
              ? "(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
              : "(min-width: 1024px) 33vw, 33vw"
          }
          className="transition duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
          aria-hidden="true"
        />
        <div
          className={`pointer-events-none absolute border border-brass/35 ${
            compact ? "inset-2" : "inset-1.5 sm:inset-3"
          }`}
          aria-hidden="true"
        />
        <h3
          className={`absolute inset-x-0 bottom-0 font-display uppercase leading-tight tracking-[0.12em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] ${
            compact
              ? "px-3 pb-3 text-sm sm:text-base"
              : "px-1.5 pb-2 text-[11px] tracking-[0.08em] sm:px-4 sm:pb-4 sm:text-lg sm:tracking-[0.12em] lg:px-5 lg:pb-6 lg:text-2xl"
          }`}
        >
          {collection.name}
        </h3>
      </div>
    </Link>
  );
}
