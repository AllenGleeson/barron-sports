import {
  brandAliases,
  brands,
  categories,
  getAllProducts,
  isFirearmCategory,
  OFFER_CATEGORY_SLUGS,
  PRODUCT_PLACEHOLDER_IMAGE,
  sameTitle,
  services,
  SPECIAL_OFFERS,
} from "@/lib/site";
import { parsePriceLabel } from "@/lib/admin/money";
import {
  ADMIN_STORE_VERSION,
  type AdminBrand,
  type AdminCategory,
  type AdminProduct,
  type AdminService,
  type AdminStoreData,
  type ProductCondition,
} from "@/lib/admin/models";
import { uniqueSlug } from "@/lib/admin/slug";

function recordId(prefix: string, slug: string) {
  return `${prefix}-${slug}`;
}

function stamp() {
  return new Date().toISOString();
}

function aliasesFor(name: string) {
  return Object.entries(brandAliases)
    .filter(([, official]) => official === name)
    .map(([alias]) => alias)
    .filter((alias) => alias !== name.toLowerCase());
}

function parseStock(summary: string) {
  const quantityMatch = summary.match(/(\d+)\s+in stock/i);
  const quantity = quantityMatch ? Number(quantityMatch[1]) : null;
  const noteMatch = summary.match(/·\s*(.+)$/);
  const tail = noteMatch?.[1]?.trim() ?? "";
  const stockNote =
    tail && !/\d+\s+in stock/i.test(tail) ? tail : null;
  return { quantity, stockNote };
}

function parseCaliber(categorySlug: string, name: string, summary: string) {
  if (!isFirearmCategory(categorySlug)) return null;

  const head = summary.split("·")[0]?.trim() ?? "";
  if (
    head &&
    !/over\s*&\s*under|semi|pump|side|game|clay/i.test(head)
  ) {
    if (/^\./.test(head) || /\d/.test(head)) return head;
  }

  const fromName = name.match(/(\.\d[\w.-]*|\d+\s*g(?:\/\d+")?)/i);
  return fromName?.[1]?.replace(/\s+/g, "") ?? null;
}

function productCondition(
  badge?: string,
  detail?: string,
): { condition: ProductCondition | null; conditionDetail: string | null } {
  const label = badge?.toLowerCase();
  if (label === "used") {
    return { condition: "used", conditionDetail: detail?.trim() || null };
  }
  if (label === "new" || label === "featured") {
    return { condition: label === "new" ? "new" : null, conditionDetail: null };
  }
  if (detail) return { condition: "used", conditionDetail: detail };
  return { condition: null, conditionDetail: null };
}

const OFFER_PRODUCT_ALIASES: Record<string, string[]> = {
  "champion clay trap - workhorse": [
    "champion workhorse clay trap",
    "champion workhorse",
  ],
  "pard thermal image spotters": ["pard thermal spotters"],
};

const OFFER_BRAND_HINTS: Record<string, string[]> = {
  "Howa 1500": ["Howa"],
  "Champion Clay Trap - Workhorse": ["Champion"],
  "Impact Electronic Ear Muffs": ["Howard Leight by Honeywell"],
  "Pard Thermal Image Spotters": ["Pard"],
};

function canonicalOfferTitle(name: string) {
  const lower = name.toLowerCase();
  for (const offer of SPECIAL_OFFERS) {
    if (sameTitle(offer.title, name)) return offer.title;
    const aliases = OFFER_PRODUCT_ALIASES[offer.title.toLowerCase()] ?? [];
    if (aliases.includes(lower)) return offer.title;
  }
  return null;
}

function matchBrandIds(names: string[] | undefined, brandRows: AdminBrand[]) {
  if (!names?.length) return [];
  const ids: string[] = [];
  for (const name of names) {
    const needle = name.trim().toLowerCase();
    const match =
      brandRows.find((brand) => brand.name === name) ??
      brandRows.find((brand) => brand.aliases.includes(needle)) ??
      brandRows.find((brand) => {
        const brandName = brand.name.toLowerCase();
        return brandName.includes(needle) || needle.includes(brandName);
      });
    if (match && !ids.includes(match.id)) ids.push(match.id);
  }
  return ids;
}

export function createSeedStore(): AdminStoreData {
  const now = stamp();
  const takenBrandSlugs = new Set<string>();
  const takenServiceSlugs = new Set<string>();
  const takenProductSlugs = new Set<string>();

  const categoryRows: AdminCategory[] = categories.map((category, index) => ({
    id: recordId("category", category.slug),
    slug: category.slug,
    name: category.name,
    shortDescription: category.shortDescription,
    description: category.description,
    imageUrl: category.image.src,
    imageAlt: category.image.alt,
    showImages: !isFirearmCategory(category.slug),
    sortOrder: index,
    published: true,
  }));

  const brandRows: AdminBrand[] = brands.map((brand, index) => {
    const slug = uniqueSlug(brand.name, takenBrandSlugs, `brand-${index + 1}`);
    return {
      id: recordId("brand", slug),
      slug,
      name: brand.name,
      logoUrl: brand.logo,
      aliases: aliasesFor(brand.name),
      websiteUrl: null,
      sortOrder: index,
      published: true,
      createdAt: now,
      updatedAt: now,
    };
  });

  const serviceRows: AdminService[] = services.map((service, index) => {
    const slug = uniqueSlug(service.title, takenServiceSlugs, `service-${index + 1}`);
    return {
      id: recordId("service", slug),
      slug,
      title: service.title,
      description: service.description,
      imageUrl: service.image.src,
      imageAlt: service.image.alt,
      sortOrder: index,
      published: true,
      createdAt: now,
      updatedAt: now,
    };
  });

  const categoryBySlug = new Map(categoryRows.map((row) => [row.slug, row]));

  const productRows: AdminProduct[] = getAllProducts().map((product, index) => {
    const category = categoryBySlug.get(product.categorySlug);
    const slug = uniqueSlug(
      product.name,
      takenProductSlugs,
      `product-${index + 1}`,
    );
    const parsed = parsePriceLabel(product.price);
    const original = parsePriceLabel(product.originalPrice);
    const { quantity, stockNote } = parseStock(product.summary);
    const { condition, conditionDetail } = productCondition(
      product.badge,
      product.condition,
    );

    return {
      id: recordId("product", slug),
      kind: "product",
      slug,
      categoryId: category?.id ?? categoryRows[0].id,
      name: product.name,
      summary: product.summary,
      imageUrl: product.image ?? null,
      priceCents: original.cents ?? parsed.cents,
      discountPriceCents: original.cents ? parsed.cents : null,
      priceDisplay: parsed.display,
      caliber: parseCaliber(product.categorySlug, product.name, product.summary),
      condition,
      conditionDetail,
      badge: product.badge ?? null,
      featured: Boolean(product.featured),
      quantity,
      stockNote,
      brandIds: matchBrandIds(product.brands, brandRows),
      ...NOT_AN_OFFER,
      published: true,
      sortOrder: index,
      createdAt: now,
      updatedAt: now,
    };
  });

  return {
    version: ADMIN_STORE_VERSION,
    categories: categoryRows,
    brands: brandRows,
    services: serviceRows,
    products: withSpecialOffers(productRows, categoryRows, brandRows),
  };
}

const NOT_AN_OFFER = {
  productIds: [],
  specialOffer: false,
  offerLabel: null,
  highlights: [],
  offerStartsAt: null,
  offerEndsAt: null,
} satisfies Partial<AdminProduct>;

/**
 * Marks the site's special offers (`SPECIAL_OFFERS`) as special-offer products,
 * matching existing catalogue products by title and creating the rest.
 */
function withSpecialOffers(
  products: AdminProduct[],
  categoryRows: AdminCategory[],
  brandRows: AdminBrand[],
): AdminProduct[] {
  const now = stamp();
  const taken = new Set(products.map((product) => product.slug));
  const rows = products.slice();

  SPECIAL_OFFERS.forEach((offer, offerIndex) => {
    const sale = parsePriceLabel(offer.price);
    const rrp = parsePriceLabel(offer.rrp);
    const offerFields = {
      name: offer.title,
      imageUrl: offer.image || PRODUCT_PLACEHOLDER_IMAGE,
      priceCents: rrp.cents ?? sale.cents,
      discountPriceCents: rrp.cents ? sale.cents : null,
      priceDisplay: sale.display,
      badge: offer.badge ?? null,
      specialOffer: true,
      offerLabel: offer.category,
      highlights: offer.description,
      // Offers list first, in the site's order (the offer pages sort by this).
      sortOrder: offerIndex - SPECIAL_OFFERS.length,
    };

    const index = rows.findIndex((product) => canonicalOfferTitle(product.name) === offer.title);
    if (index !== -1) {
      const product = rows[index];
      rows[index] = {
        ...product,
        ...offerFields,
        badge: offerFields.badge ?? product.badge,
        brandIds:
          product.brandIds.length > 0
            ? product.brandIds
            : matchBrandIds(OFFER_BRAND_HINTS[offer.title], brandRows),
      };
      return;
    }

    const slug = uniqueSlug(offer.title, taken, offer.id);
    const category =
      categoryRows.find((row) => row.slug === OFFER_CATEGORY_SLUGS[offer.category]) ??
      categoryRows[0];
    rows.push({
      ...NOT_AN_OFFER,
      ...offerFields,
      id: recordId("product", slug),
      kind: "product",
      slug,
      categoryId: category.id,
      summary: `${offer.description.join(". ")}.`,
      caliber: parseCaliber(category.slug, offer.title, offer.description.join(" ")),
      condition: null,
      conditionDetail: null,
      featured: offer.category === "Rifles",
      quantity: null,
      stockNote: null,
      brandIds: matchBrandIds(OFFER_BRAND_HINTS[offer.title], brandRows),
      published: true,
      createdAt: now,
      updatedAt: now,
    });
  });

  return rows;
}
