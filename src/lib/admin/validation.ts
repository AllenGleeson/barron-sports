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
  name,
  slug,
  categoryId,
  summary,
  imageUrl,
  price,
  discount,
  quantity,
  takenSlugs,
}: {
  name: string;
  slug: string;
  categoryId: string;
  summary: string;
  imageUrl: string | null;
  price: string;
  discount: string;
  quantity: number | null;
  takenSlugs: string[];
}): FieldErrors {
  const priceError = validateMoneyField(price, "Price");
  const discountError = validateMoneyField(discount, "Discount price");
  let discountRule: string | undefined;
  if (!priceError && !discountError && discount.trim()) {
    if (!price.trim()) {
      discountRule = "Set a regular price before adding a discount price.";
    } else {
      const regular = Number(price.trim().replace(",", "."));
      const sale = Number(discount.trim().replace(",", "."));
      if (sale >= regular) {
        discountRule = "Discount price must be lower than the regular price.";
      }
    }
  }

  return compactErrors({
    name: requiredText(name, "Name"),
    slug: validateSlugValue(slug || name, takenSlugs),
    categoryId: categoryId ? undefined : "Category is required.",
    summary: requiredText(summary, "Summary"),
    imageUrl: validateAssetPath(imageUrl, "Image URL", false),
    price: priceError,
    discount: discountError || discountRule,
    quantity: validateOptionalWholeNumber(quantity, "Quantity"),
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

export function validateOfferDraft({
  kind,
  title,
  description,
  categoryLabel,
  imageUrl,
  highlightsText,
  productIds,
  price,
  originalPrice,
  priceDisplay,
  startsAt,
  endsAt,
}: {
  kind: "offer" | "package";
  title: string;
  description: string;
  categoryLabel: string;
  imageUrl: string;
  highlightsText: string;
  productIds: string[];
  price: string;
  originalPrice: string;
  priceDisplay: string | null;
  startsAt: string | null;
  endsAt: string | null;
}): FieldErrors {
  const isPackage = kind === "package";
  const priceError = validateMoneyField(price, isPackage ? "Package price" : "Price");
  const originalError = validateMoneyField(originalPrice, "Original price");
  let originalRule: string | undefined;
  if (!priceError && !originalError && originalPrice.trim()) {
    if (!price.trim()) {
      originalRule = isPackage
        ? "Set the package price before adding an original price."
        : "Set the offer price before adding an original price.";
    } else {
      const sale = Number(price.trim().replace(",", "."));
      const original = Number(originalPrice.trim().replace(",", "."));
      if (original <= sale) {
        originalRule = "Original price must be higher than the offer price.";
      }
    }
  }

  const hasPrice = Boolean(price.trim() || priceDisplay?.trim());
  const dateRule =
    startsAt && endsAt && new Date(endsAt) < new Date(startsAt)
      ? "End date must be on or after the start date."
      : undefined;

  return compactErrors({
    title: requiredText(title, isPackage ? "Name" : "Title"),
    description: isPackage ? requiredText(description, "Description") : undefined,
    categoryLabel: requiredText(categoryLabel, "Category label"),
    imageUrl: validateAssetPath(imageUrl, "Image URL", true),
    highlights:
      isPackage ||
      highlightsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean).length
        ? undefined
        : "Add at least one highlight.",
    productIds:
      isPackage && productIds.length < 2
        ? "Select at least two products for the package."
        : undefined,
    price:
      priceError ||
      (hasPrice
        ? undefined
        : isPackage
          ? "Enter a package price or a price display such as Inquire for Pricing."
          : "Enter a price or a price display such as Inquire for Pricing."),
    originalPrice: originalError || originalRule,
    endsAt: dateRule,
  });
}
