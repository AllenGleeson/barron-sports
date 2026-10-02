import Link from "next/link";
import { CoverImage } from "@/components/media/CoverImage";
import { PRODUCT_PLACEHOLDER_IMAGE, type CatalogProduct, type Product } from "@/lib/site";

export function ProductCard({
  product,
  categoryLabel,
  categoryHref,
}: {
  product: Product;
  categoryLabel?: string;
  categoryHref?: string;
}) {
  return (
    <li className="flex h-full flex-col border border-line bg-moss">
      <div className="relative aspect-[4/3] overflow-hidden bg-white p-4">
        <CoverImage
          src={product.image ?? PRODUCT_PLACEHOLDER_IMAGE}
          alt=""
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          fit="contain"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        {categoryLabel && categoryHref ? (
          <Link
            href={categoryHref}
            className="text-[10px] uppercase tracking-[0.22em] text-brass hover:text-cream"
          >
            {categoryLabel}
          </Link>
        ) : null}
        <h2 className={`font-display text-xl text-cream ${categoryLabel ? "mt-2" : ""}`}>
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
}: {
  products: Array<Product | CatalogProduct>;
  showCategory?: boolean;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => {
        const catalog = "categoryName" in product ? product : null;
        return (
          <ProductCard
            key={`${catalog?.categorySlug ?? ""}-${product.name}`}
            product={product}
            categoryLabel={showCategory ? catalog?.categoryName : undefined}
            categoryHref={showCategory ? catalog?.categoryHref : undefined}
          />
        );
      })}
    </ul>
  );
}
