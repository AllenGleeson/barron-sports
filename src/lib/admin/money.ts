export function parsePriceLabel(raw?: string): {
  cents: number | null;
  display: string | null;
} {
  if (!raw?.trim()) return { cents: null, display: null };
  const value = raw.trim();
  if (/inquire/i.test(value)) return { cents: null, display: value };

  const numeric = value.replace(/[^\d.]/g, "");
  if (!numeric) return { cents: null, display: value };

  const euros = Number(numeric);
  if (!Number.isFinite(euros)) return { cents: null, display: value };

  const cents = Math.round(euros * 100);
  return /^from\s+/i.test(value) ? { cents, display: value } : { cents, display: null };
}

export function centsToInput(cents: number | null): string {
  if (cents == null) return "";
  const euros = cents / 100;
  return Number.isInteger(euros) ? String(euros) : euros.toFixed(2);
}

export function inputToCents(raw: string): number | null {
  const value = raw.trim().replace(",", ".");
  if (!value) return null;
  const euros = Number(value);
  if (!Number.isFinite(euros) || euros < 0) return null;
  return Math.round(euros * 100);
}

export function formatEuro(cents: number | null, display?: string | null) {
  if (display) return display;
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export const DISCOUNT_PERCENTS = [5, 10, 15, 20] as const;

export function applyPercentOff(priceCents: number, percent: number) {
  return Math.max(0, Math.round(priceCents * (1 - percent / 100)));
}

export function isDiscounted(row: {
  priceCents: number | null;
  discountPriceCents: number | null;
}) {
  return (
    row.discountPriceCents != null &&
    row.priceCents != null &&
    row.discountPriceCents < row.priceCents
  );
}

export function discountPercentOf(row: {
  priceCents: number | null;
  discountPriceCents: number | null;
}) {
  if (!isDiscounted(row) || row.priceCents == null || row.discountPriceCents == null) {
    return null;
  }
  return Math.round((1 - row.discountPriceCents / row.priceCents) * 100);
}
