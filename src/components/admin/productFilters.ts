import type { AdminProduct } from "@/lib/admin/models";
import type { FilterOption } from "@/components/admin/filters";
import { DISCOUNT_PERCENTS, discountPercentOf, isDiscounted, productSaleCents } from "@/lib/admin/money";
import { offerStatus, type OfferStatus } from "@/lib/admin/productOffer";

export type PriceFilter =
  | "all"
  | "priced"
  | "none"
  | "under-250"
  | "250-500"
  | "500-1000"
  | "1000-2500"
  | "over-2500";
export type DiscountFilter = "all" | "yes" | "no" | "5" | "10" | "15" | "20";


export function matchesPriceFilter(row: AdminProduct, filter: PriceFilter) {
  const cents = productSaleCents(row);
  if (filter === "all") return true;
  if (filter === "priced") return cents != null;
  if (filter === "none") return cents == null;
  if (cents == null) return false;
  if (filter === "under-250") return cents < 25000;
  if (filter === "250-500") return cents >= 25000 && cents < 50000;
  if (filter === "500-1000") return cents >= 50000 && cents < 100000;
  if (filter === "1000-2500") return cents >= 100000 && cents < 250000;
  return cents >= 250000;
}

export function matchesDiscountFilter(row: AdminProduct, filter: DiscountFilter) {
  if (filter === "all") return true;
  const discounted = isDiscounted(row);
  if (filter === "yes") return discounted;
  if (filter === "no") return !discounted;
  return discounted && discountPercentOf(row) === Number(filter);
}

export type TypeFilter = "all" | "product" | "package";

export function matchesTypeFilter(row: AdminProduct, filter: TypeFilter) {
  return filter === "all" || row.kind === filter;
}

/** "any" = any special offer; the rest match `offerStatus`. */
export type OfferFilter = "all" | "any" | "live" | "scheduled" | "ended" | "hidden" | "none";

export function matchesOfferFilter(row: AdminProduct, filter: OfferFilter) {
  if (filter === "all") return true;
  if (filter === "any") return row.specialOffer;
  return offerStatus(row) === filter;
}

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  live: "Live",
  scheduled: "Scheduled",
  ended: "Ended",
  hidden: "Unpublished",
  none: "No",
};

export const TYPE_OPTIONS: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "product", label: "Products" },
  { value: "package", label: "Packages" },
];

/** On the Special offers view every row is an offer, so "any"/"none" are left out. */
export function offerOptions(offersOnly: boolean): FilterOption[] {
  return [
    { value: "all", label: "All" },
    ...(offersOnly ? [] : [{ value: "any", label: "Any special offer" }]),
    { value: "live", label: "Live" },
    { value: "scheduled", label: "Scheduled" },
    { value: "ended", label: "Ended" },
    { value: "hidden", label: "Unpublished" },
    ...(offersOnly ? [] : [{ value: "none", label: "Not an offer" }]),
  ];
}

export const PRICE_OPTIONS: FilterOption[] = [
  { value: "all", label: "Any price" },
  { value: "priced", label: "Has a price" },
  { value: "none", label: "No price" },
  { value: "under-250", label: "Under €250" },
  { value: "250-500", label: "€250–€500" },
  { value: "500-1000", label: "€500–€1,000" },
  { value: "1000-2500", label: "€1,000–€2,500" },
  { value: "over-2500", label: "Over €2,500" },
];

export const DISCOUNT_OPTIONS: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "yes", label: "Discounted" },
  { value: "no", label: "Not discounted" },
  ...DISCOUNT_PERCENTS.map((percent) => ({ value: String(percent), label: `${percent}% off` })),
];
