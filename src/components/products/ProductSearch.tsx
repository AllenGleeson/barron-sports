"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ProductCardList } from "@/components/cards/ProductCard";
import { categories, type CatalogProduct, type Product } from "@/lib/site";

type SortKey = "featured" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

const fieldClassName =
  "w-full appearance-none border border-line bg-ink px-3 py-3 pr-10 text-cream outline-none focus:border-brass";

function priceValue(price?: string) {
  if (!price) return null;
  const numeric = Number(price.replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

function productBrands(product: Product) {
  return product.brands ?? [];
}

function matchesQuery(product: Product, query: string, categoryName?: string) {
  const haystack = [
    product.name,
    product.summary,
    product.price,
    categoryName,
    ...productBrands(product),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-[11px] uppercase tracking-[0.2em] text-stone">{label}</span>
      <span className="relative mt-2 block">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={fieldClassName}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-stone" aria-hidden="true">
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </span>
      </span>
    </label>
  );
}

export function ProductSearch({
  products,
  showCategory = false,
}: {
  products: Array<Product | CatalogProduct>;
  showCategory?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const needle = query.trim().toLowerCase();

  const brandOptions = useMemo(() => {
    const names = new Set<string>();
    for (const product of products) {
      for (const name of productBrands(product)) names.add(name);
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const categoryOptions = useMemo(() => {
    const present = new Set(
      products.flatMap((product) =>
        "categorySlug" in product ? [product.categorySlug] : [],
      ),
    );
    return categories.filter((item) => present.has(item.slug));
  }, [products]);

  const showCategoryFilter = categoryOptions.length > 1;

  const results = useMemo(() => {
    const filtered = products.filter((product) => {
      const categoryName = "categoryName" in product ? product.categoryName : undefined;
      if (needle && !matchesQuery(product, needle, categoryName)) return false;
      if (brand && !productBrands(product).includes(brand)) return false;
      if (
        category &&
        (!("categorySlug" in product) || product.categorySlug !== category)
      ) {
        return false;
      }
      return true;
    });

    const sorted = [...filtered];
    if (sort === "name-asc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "name-desc") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort === "price-asc" || sort === "price-desc") {
      sorted.sort((a, b) => {
        const aPrice = priceValue(a.price);
        const bPrice = priceValue(b.price);
        if (aPrice == null && bPrice == null) return 0;
        if (aPrice == null) return 1;
        if (bPrice == null) return -1;
        return sort === "price-asc" ? aPrice - bPrice : bPrice - aPrice;
      });
    }

    return sorted;
  }, [brand, category, needle, products, sort]);

  return (
    <div>
      <div
        className={`grid gap-3 md:grid-cols-2 ${
          showCategoryFilter
            ? "xl:grid-cols-[minmax(0,1fr)_12rem_12rem_16rem]"
            : "lg:grid-cols-[minmax(0,1fr)_14rem_16rem]"
        }`}
      >
        <label
          className={`block min-w-0 md:col-span-2 ${
            showCategoryFilter ? "xl:col-span-1" : "lg:col-span-1"
          }`}
        >
          <span className="text-[11px] uppercase tracking-[0.2em] text-stone">Search products</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, brand or type"
            autoComplete="off"
            className="subject-search mt-2 w-full border border-line bg-ink px-3 py-3 text-cream outline-none focus:border-brass"
          />
        </label>
        {showCategoryFilter ? (
          <FilterSelect
            id="product-category"
            label="Category"
            value={category}
            onChange={setCategory}
          >
            <option value="">All categories</option>
            {categoryOptions.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </FilterSelect>
        ) : null}
        <FilterSelect id="product-brand" label="Brand" value={brand} onChange={setBrand}>
          <option value="">All brands</option>
          {brandOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          id="product-sort"
          label="Sort"
          value={sort}
          onChange={(value) => setSort(value as SortKey)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FilterSelect>
      </div>
      <div className="mt-8">
        {results.length > 0 ? (
          <ProductCardList products={results} showCategory={showCategory} />
        ) : (
          <p className="text-parchment">No products match that search.</p>
        )}
      </div>
    </div>
  );
}
