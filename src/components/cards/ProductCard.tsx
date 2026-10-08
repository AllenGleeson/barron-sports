import Image from "next/image";
import Link from "next/link";
import { CoverImage } from "@/components/media/CoverImage";
import {
  PRODUCT_PLACEHOLDER_IMAGE,
  brandLogoFor,
  type CatalogProduct,
  type Product,
} from "@/lib/site";

export function ProductCard({
  product,
  categoryLabel,
  categoryHref,
  showImage = true,
  layout = "grid",
}: {
  product: Product;
  categoryLabel?: string;
  categoryHref?: string;
  showImage?: boolean;
  layout?: "grid" | "list";
}) {
  if (layout === "list") {
    const brand = brandLogoFor(product.brands?.[0]);
    return (
      <li
        className={`py-4 first:border-t ${
          product.featured
            ? "border border-brass/40 bg-moss px-5 my-3 first:border-t"
            : "border-b border-line-soft"
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="flex min-w-0 items-start gap-4">
            {brand ? (
              <span className="relative mt-0.5 h-10 w-16 shrink-0 bg-white p-1 sm:h-12 sm:w-20">
                <Image
                  src={brand.logo}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </span>
            ) : null}
            <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {categoryLabel && categoryHref ? (
                <Link
                  href={categoryHref}
                  className="text-[10px] uppercase tracking-[0.22em] text-brass hover:text-cream"
                >
                  {categoryLabel}
                </Link>
              ) : null}
              {product.badge ? (
                <p className="text-[10px] uppercase tracking-[0.22em] text-brass">
                  {product.badge}
                  {product.condition ? ` · ${product.condition}` : ""}
                </p>
              ) : null}
            </div>
            <h2 className="mt-1 font-display text-xl text-cream">{product.name}</h2>
            <p className="mt-1 text-sm leading-relaxed text-parchment">{product.summary}</p>
            {product.href ? (
              <Link
                href={product.href}
                className="mt-2 inline-block text-[11px] uppercase tracking-[0.18em] text-brass hover:text-cream"
              >
                View offer →
              </Link>
            ) : null}
            </div>
          </div>
          {product.price ? (
            <p className="shrink-0 text-brass sm:text-right">{product.price}</p>
          ) : null}
        </div>
      </li>
    );
  }

  return (
    <li className="flex h-full flex-col border border-line bg-moss">
      {showImage ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-white p-4">
          <CoverImage
            src={product.image ?? PRODUCT_PLACEHOLDER_IMAGE}
            alt=""
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            fit="contain"
          />
          {product.badge ? (
            <span className="absolute left-4 top-4 bg-brass px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-ink">
              {product.badge}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        {categoryLabel && categoryHref ? (
          <Link
            href={categoryHref}
            className="text-[10px] uppercase tracking-[0.22em] text-brass hover:text-cream"
          >
            {categoryLabel}
          </Link>
        ) : null}
        {product.badge ? (
          <p
            className={`text-[10px] uppercase tracking-[0.22em] text-brass ${
              categoryLabel ? "mt-2" : ""
            }`}
          >
            {product.badge}
            {product.condition ? ` · ${product.condition}` : ""}
          </p>
        ) : null}
        <h2
          className={`font-display text-xl text-cream ${
            categoryLabel || product.badge ? "mt-2" : ""
          }`}
        >
          {product.name}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-parchment">{product.summary}</p>
        {product.price ? <p className="mt-5 text-brass">{product.price}</p> : null}
        {product.href ? (
          <Link
            href={product.href}
            className="mt-5 inline-block text-[11px] uppercase tracking-[0.18em] text-brass hover:text-cream"
          >
            View offer →
          </Link>
        ) : null}
      </div>
    </li>
  );
}

export function ProductCardList({
  products,
  showCategory = false,
  showImage = true,
  layout = "grid",
}: {
  products: Array<Product | CatalogProduct>;
  showCategory?: boolean;
  showImage?: boolean;
  layout?: "grid" | "list";
}) {
  const useList =
    layout === "list" ||
    (products.length > 0 &&
      products.every(
        (product) =>
          "categorySlug" in product &&
          (product.categorySlug === "rifles" || product.categorySlug === "shotguns"),
      ));

  return (
    <ul
      className={
        useList
          ? "border-line"
          : "grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      }
    >
      {products.map((product) => {
        const catalog = "categoryName" in product ? product : null;
        const firearm =
          catalog?.categorySlug === "rifles" || catalog?.categorySlug === "shotguns";
        return (
          <ProductCard
            key={`${catalog?.categorySlug ?? ""}-${product.badge ?? ""}-${product.name}-${product.price ?? ""}-${product.summary}`}
            product={product}
            categoryLabel={showCategory ? catalog?.categoryName : undefined}
            categoryHref={showCategory ? catalog?.categoryHref : undefined}
            showImage={showImage && !firearm}
            layout={useList ? "list" : "grid"}
          />
        );
      })}
    </ul>
  );
}
