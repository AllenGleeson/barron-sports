"use client";

import { useMemo, useState } from "react";
import { AdminCheckbox, AdminSelect, adminButton } from "@/components/admin/fields";
import type { AdminCategory, AdminProduct } from "@/lib/admin/models";
import { formatEuro, productSaleCents, sumProductSaleCents } from "@/lib/admin/money";

function productMatchesQuery(product: AdminProduct, needle: string) {
  if (product.name.toLowerCase().includes(needle)) return true;
  if (product.summary.toLowerCase().includes(needle)) return true;
  if ((product.caliber ?? "").toLowerCase().includes(needle)) return true;
  return false;
}

export function PackageProductPicker({
  products,
  categories,
  selectedIds,
  error,
  onChange,
  onUseTotalAsOriginal,
}: {
  products: AdminProduct[];
  categories: AdminCategory[];
  selectedIds: string[];
  error?: string;
  onChange: (productIds: string[]) => void;
  onUseTotalAsOriginal?: (cents: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const needle = query.trim().toLowerCase();
  const selected = new Set(selectedIds);
  const chosenProducts = useMemo(
    () =>
      selectedIds
        .map((id) => products.find((product) => product.id === id))
        .filter((product): product is AdminProduct => Boolean(product)),
    [products, selectedIds],
  );
  const totals = sumProductSaleCents(chosenProducts);

  const visible = useMemo(() => {
    const chosen = new Set(selectedIds);
    return products
      .slice()
      .sort((a, b) => {
        const aSelected = chosen.has(a.id) ? 0 : 1;
        const bSelected = chosen.has(b.id) ? 0 : 1;
        if (aSelected !== bSelected) return aSelected - bSelected;
        return a.name.localeCompare(b.name, "en");
      })
      .filter((product) => categoryId === "all" || product.categoryId === categoryId)
      .filter(
        (product) =>
          chosen.has(product.id) || !needle || productMatchesQuery(product, needle),
      );
  }, [categoryId, needle, products, selectedIds]);

  const categoryName = (id: string) =>
    categories.find((category) => category.id === id)?.name ?? "Product";

  return (
    <div className="lg:col-span-2" data-invalid={error ? "true" : undefined}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-stone">
          Products in this package
        </p>
        <p className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-brass">
          Required
        </p>
      </div>
      <div className="mt-2 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <div className="relative">
          <input
            type="search"
            value={query}
            autoComplete="off"
            placeholder="Search products"
            aria-label="Search products"
            className="subject-search w-full border border-line bg-ink px-3 py-2.5 pr-10 text-sm text-cream outline-none focus:border-brass"
            onChange={(event) => setQuery(event.target.value)}
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear product search"
              className="absolute inset-y-0 right-1 z-10 flex cursor-pointer items-center px-2 text-brass hover:text-cream"
              onClick={() => setQuery("")}
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden="true">
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </button>
          ) : null}
        </div>
        <AdminSelect
          value={categoryId}
          aria-label="Filter products by category"
          className="!mt-0"
          onChange={(event) => setCategoryId(event.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </AdminSelect>
      </div>
      <p className="mt-2 text-xs text-stone">
        {selectedIds.length} selected. Choose at least two products.
      </p>
      {totals.counted > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-parchment">
          <span>
            Items total {formatEuro(totals.total)}
            {totals.missing > 0
              ? ` · ${totals.missing} without a price`
              : ""}
          </span>
          {onUseTotalAsOriginal && totals.counted > 0 ? (
            <button
              type="button"
              className={adminButton.ghost}
              onClick={() => onUseTotalAsOriginal(totals.total)}
            >
              Use as original price
            </button>
          ) : null}
        </div>
      ) : null}
      <div
        className={`mt-2 max-h-72 space-y-1 overflow-y-auto border bg-ink p-3 ${
          error ? "border-red-400/70" : "border-line"
        }`}
      >
        {visible.map((product) => {
          const sale = productSaleCents(product);
          return (
            <div
              key={product.id}
              className="flex items-start justify-between gap-3 py-1.5"
            >
              <AdminCheckbox
                label={product.name}
                checked={selected.has(product.id)}
                onChange={(event) => {
                  const productIds = event.target.checked
                    ? [...selectedIds, product.id]
                    : selectedIds.filter((id) => id !== product.id);
                  onChange(productIds);
                }}
              />
              <p className="shrink-0 pt-0.5 text-right text-xs text-stone">
                {categoryName(product.categoryId)}
                {" · "}
                {formatEuro(sale, product.priceDisplay)}
                {product.published ? "" : " · Hidden"}
              </p>
            </div>
          );
        })}
        {visible.length === 0 ? (
          <p className="text-sm text-parchment">No products match that search.</p>
        ) : null}
      </div>
      {error ? (
        <span role="alert" className="mt-1 block text-xs text-red-300">
          {error}
        </span>
      ) : (
        <span className="mt-1 block text-xs text-stone">
          Selected products appear as the package contents on the site.
        </span>
      )}
    </div>
  );
}
