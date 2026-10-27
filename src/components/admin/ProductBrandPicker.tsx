"use client";

import { useMemo, useState } from "react";
import { AdminCheckbox } from "@/components/admin/fields";
import { fieldLabelClass } from "@/components/ui/styles";
import type { AdminBrand } from "@/lib/admin/models";

function brandMatchesQuery(brand: AdminBrand, needle: string) {
  if (brand.name.toLowerCase().includes(needle)) return true;
  return brand.aliases.some((alias) => alias.toLowerCase().includes(needle));
}

export function ProductBrandPicker({
  brands,
  selectedIds,
  onChange,
}: {
  brands: AdminBrand[];
  selectedIds: string[];
  onChange: (brandIds: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const selected = new Set(selectedIds);

  const visible = useMemo(() => {
    const chosen = new Set(selectedIds);
    const sorted = brands.slice().sort((a, b) => {
      const aSelected = chosen.has(a.id) ? 0 : 1;
      const bSelected = chosen.has(b.id) ? 0 : 1;
      if (aSelected !== bSelected) return aSelected - bSelected;
      return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);
    });
    if (!needle) return sorted;
    return sorted.filter(
      (brand) => chosen.has(brand.id) || brandMatchesQuery(brand, needle),
    );
  }, [brands, needle, selectedIds]);

  return (
    <div className="lg:col-span-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className={fieldLabelClass}>Brands</p>
        <p className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-stone">
          Optional
        </p>
      </div>
      <div className="relative mt-2">
        <input
          type="search"
          value={query}
          autoComplete="off"
          placeholder="Search brands"
          aria-label="Search brands"
          className="subject-search w-full border border-line bg-ink px-3 py-2.5 pr-10 text-sm text-cream outline-none focus:border-brass"
          onChange={(event) => setQuery(event.target.value)}
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear brand search"
            className="absolute inset-y-0 right-1 z-10 flex cursor-pointer items-center px-2 text-brass hover:text-cream"
            onClick={() => setQuery("")}
          >
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden="true">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        ) : null}
      </div>
      {selectedIds.length > 0 ? (
        <p className="mt-2 text-xs text-stone">
          {selectedIds.length} selected
        </p>
      ) : null}
      <div className="mt-2 grid max-h-48 grid-cols-1 gap-2 overflow-y-auto border border-line bg-ink p-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((brand) => (
          <AdminCheckbox
            key={brand.id}
            label={brand.name}
            checked={selected.has(brand.id)}
            onChange={(event) => {
              const brandIds = event.target.checked
                ? [...selectedIds, brand.id]
                : selectedIds.filter((id) => id !== brand.id);
              onChange(brandIds);
            }}
          />
        ))}
        {visible.length === 0 ? (
          <p className="text-sm text-parchment sm:col-span-2 lg:col-span-3">
            No brands match that search.
          </p>
        ) : null}
      </div>
    </div>
  );
}
