import { slugify } from "@/lib/admin/slug";

export type FieldErrors = Record<string, string>;

export function compactErrors(
  errors: Record<string, string | undefined>,
): FieldErrors {
  return Object.fromEntries(
    Object.entries(errors).filter(
      (entry): entry is [string, string] => Boolean(entry[1]),
    ),
  );
}

export function requiredText(
  value: string | null | undefined,
  label: string,
) {
  return value?.trim() ? undefined : `${label} is required.`;
}

export function validateSlugValue(
  value: string,
  taken: string[],
  label = "Slug",
) {
  const slug = slugify(value);
  if (!slug) return `${label} is required.`;
  if (taken.includes(slug)) return `This ${label.toLowerCase()} is already in use.`;
  return undefined;
}

export function validateAssetPath(
  value: string | null | undefined,
  label: string,
  required: boolean,
) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return required ? `${label} is required.` : undefined;
  if (
    trimmed.startsWith("/") ||
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith("data:image/")
  ) {
    return undefined;
  }
  return `${label} must be a path like /brands/logo.png or a full https:// URL.`;
}

export function validateMoneyField(raw: string, label: string) {
  const value = raw.trim().replace(",", ".");
  if (!value) return undefined;
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return `Enter a valid ${label.toLowerCase()}, for example 175 or 175.50.`;
  }
  return undefined;
}

export function validateOptionalWholeNumber(
  raw: string | number | null | undefined,
  label: string,
) {
  if (raw === "" || raw == null) return undefined;
  const value = String(raw).trim();
  if (!/^\d+$/.test(value)) return `${label} must be a whole number.`;
  return undefined;
}

export function validateHttpUrl(value: string | null | undefined, label: string) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return undefined;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return `${label} must start with http:// or https://.`;
    }
    return undefined;
  } catch {
    return `${label} must be a full address, for example https://example.com.`;
  }
}

export function scrollToFirstInvalid() {
  document
    .querySelector<HTMLElement>("[data-invalid='true']")
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function validateProductDraft({
  kind,
  name,
  slug,
  categoryId,
  summary,
  imageUrl,
  price,
  discount,
  priceDisplay,
  quantity,
  productIds,
  specialOffer,
  offerStartsAt,
  offerEndsAt,
  takenSlugs,
}: {
  kind: "product" | "package";
  name: string;
  slug: string;
  categoryId: string;
  summary: string;
  imageUrl: string | null;
  price: string;
  discount: string;
  priceDisplay: string | null;
  quantity: number | null;
  productIds: string[];
  specialOffer: boolean;
  offerStartsAt: string | null;
  offerEndsAt: string | null;
  takenSlugs: string[];
}): FieldErrors {
  const isPackage = kind === "package";
  const priceLabel = isPackage ? "Full price" : "Price";
  const saleLabel = isPackage ? "Package price" : "Discount price";
  const priceError = validateMoneyField(price, priceLabel);
  const discountError = validateMoneyField(discount, saleLabel);
  let discountRule: string | undefined;
  if (!priceError && !discountError && discount.trim()) {
    if (!price.trim()) {
      discountRule = `Set the ${priceLabel.toLowerCase()} before adding a ${saleLabel.toLowerCase()}.`;
    } else {
      const regular = Number(price.trim().replace(",", "."));
      const sale = Number(discount.trim().replace(",", "."));
      if (sale >= regular) {
        discountRule = `${saleLabel} must be lower than the ${priceLabel.toLowerCase()}.`;
      }
    }
  }

  // Special offers need something to show in the price slot on the offer card.
  const offerPriceRule =
    specialOffer && !price.trim() && !discount.trim() && !priceDisplay?.trim()
      ? "Special offers need a price, or a price display such as Inquire for Pricing."
      : undefined;
  const dateRule =
    offerStartsAt && offerEndsAt && new Date(offerEndsAt) < new Date(offerStartsAt)
      ? "End date must be on or after the start date."
      : undefined;

  return compactErrors({
    name: requiredText(name, "Name"),
    slug: validateSlugValue(slug || name, takenSlugs),
    categoryId: isPackage || categoryId ? undefined : "Category is required.",
    summary: requiredText(summary, isPackage ? "Description" : "Summary"),
    imageUrl: validateAssetPath(imageUrl, "Image", specialOffer),
    productIds:
      isPackage && productIds.length < 2
        ? "Select at least two products for the package."
        : undefined,
    price: priceError || offerPriceRule,
    discount: discountError || discountRule,
    quantity: validateOptionalWholeNumber(quantity, "Quantity"),
    offerEndsAt: dateRule,
  });
}

export function validateServiceDraft({
  title,
  slug,
  description,
  imageUrl,
  imageAlt,
  takenSlugs,
}: {
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  takenSlugs: string[];
}): FieldErrors {
  return compactErrors({
    title: requiredText(title, "Title"),
    slug: validateSlugValue(slug || title, takenSlugs),
    description: requiredText(description, "Description"),
    imageUrl: validateAssetPath(imageUrl, "Image URL", true),
    imageAlt: requiredText(imageAlt, "Image alt text"),
  });
}

export function validateBrandDraft({
  name,
  slug,
  logoUrl,
  websiteUrl,
  takenSlugs,
}: {
  name: string;
  slug: string;
  logoUrl: string;
  websiteUrl: string | null;
  takenSlugs: string[];
}): FieldErrors {
  return compactErrors({
    name: requiredText(name, "Name"),
    slug: validateSlugValue(slug || name, takenSlugs),
    logoUrl: validateAssetPath(logoUrl, "Logo URL", true),
    websiteUrl: validateHttpUrl(websiteUrl, "Website URL"),
  });
}
