import Link from "next/link";
import { CoverImage } from "@/components/media/CoverImage";
import type { Category } from "@/lib/site";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={category.href}
      className="group relative block min-h-[22rem] overflow-hidden bg-panel"
    >
      <CoverImage
        src={category.image.src}
        alt={category.image.alt}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="transition duration-700 ease-out group-hover:scale-[1.04]"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <h3 className="font-display text-3xl text-cream transition-colors group-hover:text-brass">
          {category.name}
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-parchment">
          {category.shortDescription}
        </p>
        <span className="mt-4 inline-flex items-center text-[11px] uppercase tracking-[0.22em] text-brass">
          View category
          <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
