import Link from "next/link";
import { CoverImage } from "@/components/media/CoverImage";
import type { FeaturedCollection } from "@/lib/site";

export function FeaturedCollectionCard({
  collection,
}: {
  collection: FeaturedCollection;
}) {
  return (
    <Link
      href={collection.href}
      className="group block"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-panel">
        <CoverImage
          src={collection.image.src}
          alt={collection.image.alt}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="transition duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-3 border border-brass/35"
          aria-hidden="true"
        />
        <h3 className="absolute inset-x-0 bottom-0 px-5 pb-6 font-display text-xl uppercase leading-tight tracking-[0.12em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] sm:text-2xl">
          {collection.name}
        </h3>
      </div>
    </Link>
  );
}
