export const ADMIN_STORE_VERSION = 1;
export const FIREARM_CATEGORY_SLUGS = ["rifles", "shotguns"] as const;

export type ProductCondition = "new" | "used";

export type AdminCategory = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  showImages: boolean;
  sortOrder: number;
  published: boolean;
};

export type AdminBrand = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  aliases: string[];
  websiteUrl: string | null;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminService = {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminProduct = {
  id: string;
  slug: string;
  categoryId: string;
  name: string;
  summary: string;
  imageUrl: string | null;
  priceCents: number | null;
  discountPriceCents: number | null;
  priceDisplay: string | null;
  caliber: string | null;
  condition: ProductCondition | null;
  conditionDetail: string | null;
  badge: string | null;
  featured: boolean;
  specialOffer: boolean;
  quantity: number | null;
  stockNote: string | null;
  brandIds: string[];
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminOfferKind = "offer" | "package";

export type AdminOffer = {
  id: string;
  kind: AdminOfferKind;
  title: string;
  description: string;
  productId: string | null;
  productIds: string[];
  categoryId: string | null;
  categoryLabel: string;
  imageUrl: string;
  highlights: string[];
  priceCents: number | null;
  originalPriceCents: number | null;
  priceDisplay: string | null;
  badge: string | null;
  published: boolean;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function isPackageOffer(offer: Pick<AdminOffer, "kind">) {
  return offer.kind === "package";
}

export function normalizeAdminOffer(offer: AdminOffer): AdminOffer {
  const productIds = Array.isArray(offer.productIds)
    ? offer.productIds.filter(Boolean)
    : [];
  const fromSingle =
    productIds.length === 0 && offer.productId ? [offer.productId] : productIds;
  return {
    ...offer,
    kind: offer.kind === "package" ? "package" : "offer",
    description: offer.description ?? "",
    productIds: fromSingle,
  };
}

export type AdminStoreData = {
  version: typeof ADMIN_STORE_VERSION;
  categories: AdminCategory[];
  brands: AdminBrand[];
  services: AdminService[];
  products: AdminProduct[];
  offers: AdminOffer[];
};

export function isFirearmCategory(slug: string) {
  return (FIREARM_CATEGORY_SLUGS as readonly string[]).includes(slug);
}
