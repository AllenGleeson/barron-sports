import {
  brandAliases,
  brands,
  categories,
  getAllProducts,
  services,
  SPECIAL_OFFERS,
} from "@/lib/site";
import { parsePriceLabel } from "@/lib/admin/money";
import {
  ADMIN_STORE_VERSION,
  isFirearmCategory,
  type AdminBrand,
  type AdminCategory,
  type AdminOffer,
  type AdminProduct,
  type AdminService,
  type AdminStoreData,
  type ProductCondition,
} from "@/lib/admin/models";
import { uniqueSlug } from "@/lib/admin/slug";

const OFFER_CATEGORY_SLUGS: Record<string, string> = {
  Rifles: "rifles",
  Scopes: "accessories",
  "Clay Traps": "accessories",
  "Ear Protection": "accessories",
  "Thermal Optics": "night-vision-optics",
};

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

function isSpecialOfferTitle(name: string) {
  const lower = name.toLowerCase();
  return SPECIAL_OFFERS.some((offer) => offer.title.toLowerCase() === lower);
}

function canonicalOfferTitle(name: string) {
  const lower = name.toLowerCase();
  for (const offer of SPECIAL_OFFERS) {
    if (offer.title.toLowerCase() === lower) return offer.title;
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
    showImages: category.slug !== "rifles" && category.slug !== "shotguns",
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
      specialOffer: isSpecialOfferTitle(product.name),
      quantity,
      stockNote,
      brandIds: matchBrandIds(product.brands, brandRows),
      published: true,
      sortOrder: index,
      createdAt: now,
      updatedAt: now,
    };
  });

  const offerRows: AdminOffer[] = SPECIAL_OFFERS.filter(
    (offer) => offer.id !== "dogtrace-gps",
  ).map((offer, index) => {
    const categorySlug = OFFER_CATEGORY_SLUGS[offer.category];
    const category = categorySlug
      ? categoryRows.find((row) => row.slug === categorySlug)
      : undefined;
    const sale = parsePriceLabel(offer.price);
    const rrp = parsePriceLabel(offer.rrp);
    const matchedProduct =
      productRows.find(
        (product) => product.name.toLowerCase() === offer.title.toLowerCase(),
      ) ?? null;

    return {
      id: offer.id,
      kind: "offer",
      title: offer.title,
      description: "",
      productId: matchedProduct?.id ?? null,
      productIds: matchedProduct ? [matchedProduct.id] : [],
      categoryId: category?.id ?? null,
      categoryLabel: offer.category,
      imageUrl: offer.image,
      highlights: offer.description,
      priceCents: sale.cents,
      originalPriceCents: rrp.cents,
      priceDisplay: sale.display,
      badge: offer.badge ?? null,
      published: true,
      sortOrder: index,
      startsAt: null,
      endsAt: null,
      createdAt: now,
      updatedAt: now,
    };
  });

  return mergeSpecialOfferProducts({
    version: ADMIN_STORE_VERSION,
    categories: categoryRows,
    brands: brandRows,
    services: serviceRows,
    products: productRows,
    offers: offerRows,
  });
}

export function mergeSpecialOfferProducts(data: AdminStoreData): AdminStoreData {
  const now = stamp();
  const taken = new Set(data.products.map((product) => product.slug));

  const products = data.products.map((product) => {
    const title = canonicalOfferTitle(product.name);
    if (!title || product.name === title) {
      return { ...product, specialOffer: Boolean(product.specialOffer) };
    }

    const offer = SPECIAL_OFFERS.find((row) => row.title === title);
    if (!offer) return { ...product, name: title };

    const sale = parsePriceLabel(offer.price);
    const rrp = parsePriceLabel(offer.rrp);

    return {
      ...product,
      name: title,
      summary: `${offer.description.join(". ")}.`,
      imageUrl: offer.image,
      priceCents: rrp.cents ?? sale.cents,
      discountPriceCents: rrp.cents ? sale.cents : null,
      priceDisplay: sale.display,
      badge: offer.badge ?? product.badge,
      brandIds:
        product.brandIds.length > 0
          ? product.brandIds
          : matchBrandIds(OFFER_BRAND_HINTS[title], data.brands),
      specialOffer: true,
      updatedAt: now,
    };
  });

  const existingNames = new Set(products.map((product) => product.name.toLowerCase()));

  for (const offer of SPECIAL_OFFERS) {
    if (existingNames.has(offer.title.toLowerCase())) continue;

    const slug = uniqueSlug(offer.title, taken, offer.id);
    const categorySlug = OFFER_CATEGORY_SLUGS[offer.category];
    const category =
      data.categories.find((row) => row.slug === categorySlug) ?? data.categories[0];
    const sale = parsePriceLabel(offer.price);
    const rrp = parsePriceLabel(offer.rrp);

    products.push({
      id: recordId("product", slug),
      slug,
      categoryId: category.id,
      name: offer.title,
      summary: `${offer.description.join(". ")}.`,
      imageUrl: offer.image,
      priceCents: rrp.cents ?? sale.cents,
      discountPriceCents: rrp.cents ? sale.cents : null,
      priceDisplay: sale.display,
      caliber: parseCaliber(category.slug, offer.title, offer.description.join(" ")),
      condition: null,
      conditionDetail: null,
      badge: offer.badge ?? null,
      featured: offer.category === "Rifles",
      specialOffer: true,
      quantity: null,
      stockNote: null,
      brandIds: matchBrandIds(OFFER_BRAND_HINTS[offer.title], data.brands),
      published: true,
      sortOrder: products.length,
      createdAt: now,
      updatedAt: now,
    });
  }

  const offers = data.offers.map((offer) => {
    if (offer.productId) return offer;
    const match = products.find(
      (product) => product.name.toLowerCase() === offer.title.toLowerCase(),
    );
    return match ? { ...offer, productId: match.id } : offer;
  });

  return { ...data, products, offers };
}
