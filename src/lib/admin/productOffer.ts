import {
  isPackageOffer,
  type AdminOffer,
  type AdminProduct,
  type AdminStoreData,
} from "@/lib/admin/models";
import { formatEuro } from "@/lib/admin/money";
import { PRODUCT_PLACEHOLDER_IMAGE, type SpecialOffer } from "@/lib/site";

export function productsInPackage(
  offer: Pick<AdminOffer, "productIds">,
  products: AdminProduct[],
) {
  const byId = new Map(products.map((product) => [product.id, product]));
  return offer.productIds
    .map((id) => byId.get(id))
    .filter((product): product is AdminProduct => Boolean(product));
}

export function isCatalogOnlyOffer(offer: { id: string; title: string }) {
  return (
    offer.id === "dogtrace-gps" ||
    offer.title.toLowerCase() === "gps dog tracking systems"
  );
}

function offerIsLive(offer: AdminOffer, now = Date.now()) {
  if (!offer.published) return false;
  if (offer.startsAt) {
    const start = new Date(offer.startsAt).getTime();
    if (!Number.isNaN(start) && start > now) return false;
  }
  if (offer.endsAt) {
    const end = new Date(offer.endsAt).getTime();
    if (!Number.isNaN(end) && end < now) return false;
  }
  return true;
}

export function adminOfferToSpecialOffer(
  offer: AdminOffer,
  store: AdminStoreData,
): SpecialOffer {
  const category = store.categories.find((item) => item.id === offer.categoryId);
  const packaged = productsInPackage(offer, store.products);
  const isPackage = isPackageOffer(offer);
  const product = isPackage
    ? packaged[0]
    : offer.productId
      ? store.products.find((item) => item.id === offer.productId)
      : undefined;
  const productCategory = product
    ? store.categories.find((item) => item.id === product.categoryId)
    : undefined;
  const hrefCategory = productCategory ?? category;
  const packageLines = packaged.map((item) => item.name);

  return {
    id: offer.id,
    kind: isPackage ? "package" : "offer",
    category:
      offer.categoryLabel.trim() ||
      category?.name ||
      (isPackage ? "Package" : "Special Offer"),
    title: offer.title,
    image: offer.imageUrl || PRODUCT_PLACEHOLDER_IMAGE,
    summary: offer.description.trim() || undefined,
    description: isPackage && packageLines.length ? packageLines : offer.highlights,
    rrp:
      offer.originalPriceCents != null
        ? formatEuro(offer.originalPriceCents)
        : undefined,
    price: formatEuro(offer.priceCents, offer.priceDisplay),
    badge: offer.badge ?? (isPackage ? "Package" : undefined),
    href: hrefCategory
      ? `/products/${hrefCategory.slug}/`
      : "/special-offers/",
  };
}

export function specialOffersFromStore(store: AdminStoreData): SpecialOffer[] {
  return store.offers
    .filter((offer) => offerIsLive(offer) && !isCatalogOnlyOffer(offer))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((offer) => adminOfferToSpecialOffer(offer, store));
}
