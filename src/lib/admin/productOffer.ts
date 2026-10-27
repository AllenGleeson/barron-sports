import { isPackage, type AdminProduct, type AdminStoreData } from "@/lib/admin/models";
import { formatEuro, isDiscounted } from "@/lib/admin/money";
import { categoryHref, PRODUCT_PLACEHOLDER_IMAGE, type SpecialOffer } from "@/lib/site";

/** The products inside a package, in the order they were picked. */
export function productsInPackage(
  product: Pick<AdminProduct, "productIds">,
  products: AdminProduct[],
) {
  const byId = new Map(products.map((row) => [row.id, row]));
  return product.productIds
    .map((id) => byId.get(id))
    .filter((row): row is AdminProduct => Boolean(row));
}

/** Packages that include `productId`. */
export function packagesContaining(productId: string, products: AdminProduct[]) {
  return products.filter((row) => isPackage(row) && row.productIds.includes(productId));
}

export type OfferStatus = "live" | "scheduled" | "ended" | "hidden" | "none";

/** Whether a product shows on the Special Offers pages right now. */
export function offerStatus(product: AdminProduct, now = Date.now()): OfferStatus {
  if (!product.specialOffer) return "none";
  if (!product.published) return "hidden";
  const start = product.offerStartsAt ? new Date(product.offerStartsAt).getTime() : NaN;
  if (!Number.isNaN(start) && start > now) return "scheduled";
  const end = product.offerEndsAt ? new Date(product.offerEndsAt).getTime() : NaN;
  if (!Number.isNaN(end) && end < now) return "ended";
  return "live";
}

/** The data needed to build offer cards. */
export type OfferSource = Pick<AdminStoreData, "categories" | "products">;

export function productToSpecialOffer(product: AdminProduct, store: OfferSource): SpecialOffer {
  const packaged = isPackage(product);
  const contents = packaged ? productsInPackage(product, store.products) : [];
  // Packages without their own category link to their first product's category.
  const category =
    store.categories.find((row) => row.id === product.categoryId) ??
    store.categories.find((row) => row.id === contents[0]?.categoryId);
  const discounted = isDiscounted(product);

  const bullets = packaged
    ? contents.map((item) => item.name)
    : product.highlights.length > 0
      ? product.highlights
      : [product.summary];

  return {
    id: product.id,
    kind: packaged ? "package" : "offer",
    category:
      product.offerLabel?.trim() || (packaged ? "Package" : category?.name ?? "Special Offer"),
    title: product.name,
    image: product.imageUrl || PRODUCT_PLACEHOLDER_IMAGE,
    summary: packaged ? product.summary.trim() || undefined : undefined,
    description: bullets,
    rrp: discounted ? formatEuro(product.priceCents) : undefined,
    price: formatEuro(
      discounted ? product.discountPriceCents : product.priceCents,
      product.priceDisplay,
    ),
    badge: product.badge ?? (packaged ? "Package" : undefined),
    href: category ? categoryHref(category.slug) : "/special-offers",
  };
}

/** Live special offers from the admin data, for the public offer pages. */
export function specialOffersFromStore(store: OfferSource): SpecialOffer[] {
  return store.products
    .filter((product) => offerStatus(product) === "live")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((product) => productToSpecialOffer(product, store));
}
