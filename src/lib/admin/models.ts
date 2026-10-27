export const ADMIN_STORE_VERSION = 2;

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

/** A normal product, or a package made from other products. */
export type AdminProductKind = "product" | "package";

export type AdminProduct = {
  id: string;
  kind: AdminProductKind;
  slug: string;
  /** Empty for packages without a category. */
  categoryId: string;
  name: string;
  /** Product description; for packages, the package description. */
  summary: string;
  imageUrl: string | null;
  /** Regular price (for packages, usually the items total). */
  priceCents: number | null;
  /** Sale price; for packages, the package price. */
  discountPriceCents: number | null;
  priceDisplay: string | null;
  caliber: string | null;
  condition: ProductCondition | null;
  conditionDetail: string | null;
  badge: string | null;
  featured: boolean;
  quantity: number | null;
  stockNote: string | null;
  brandIds: string[];
  /** Products in a package. Empty for normal products. */
  productIds: string[];
  /** Shown on the Special Offers pages when set. */
  specialOffer: boolean;
  /** Label on the offer card, e.g. "Clay Traps". Falls back to the category name. */
  offerLabel: string | null;
  /** Bullet points on the offer card. */
  highlights: string[];
  offerStartsAt: string | null;
  offerEndsAt: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export function isPackage(product: Pick<AdminProduct, "kind">) {
  return product.kind === "package";
}

/** Fills fields that older or hand-edited records may be missing. */
export function normalizeAdminProduct(product: AdminProduct): AdminProduct {
  return {
    ...product,
    kind: product.kind === "package" ? "package" : "product",
    productIds: Array.isArray(product.productIds) ? product.productIds.filter(Boolean) : [],
    highlights: Array.isArray(product.highlights) ? product.highlights : [],
    specialOffer: Boolean(product.specialOffer),
    offerLabel: product.offerLabel ?? null,
    offerStartsAt: product.offerStartsAt ?? null,
    offerEndsAt: product.offerEndsAt ?? null,
  };
}

export type AdminStoreData = {
  version: typeof ADMIN_STORE_VERSION;
  categories: AdminCategory[];
  brands: AdminBrand[];
  services: AdminService[];
  products: AdminProduct[];
};
