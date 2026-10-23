"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ProductCardList } from "@/components/cards/ProductCard";
import { OffersComingSoon } from "@/components/offers/OffersComingSoon";
import { usePublishedOfferTitles } from "@/lib/admin/usePublicOffers";
import {
  categories,
  isSpecialOfferProduct,
  type CatalogProduct,
  type Product,
} from "@/lib/site";

const SPECIAL_OFFERS_FILTER = "special-offers";
const PAGE_SIZE = 12;

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
    product.badge,
    product.condition,
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

function visiblePages(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const start = Math.max(1, Math.min(current - 2, total - 4));
  const end = Math.min(total, start + 4);
  const pages: number[] = [];
  if (start > 1) pages.push(1);
  if (start > 2) pages.push(0);
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < total - 1) pages.push(0);
  if (end < total) pages.push(total);
  return pages;
}

function Pagination({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
}) {
  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-between gap-3"
      aria-label="Product pages"
    >
      <button
        type="button"
        className="border border-cream/35 px-4 py-2.5 text-[11px] uppercase tracking-[0.18em] text-cream hover:border-brass hover:text-brass disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Previous
      </button>
      <ul className="flex flex-wrap items-center gap-1">
        {visiblePages(page, pageCount).map((item, index) =>
          item === 0 ? (
            <li key={`ellipsis-${index}`} className="px-2 text-stone" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                aria-current={item === page ? "page" : undefined}
                className={`min-w-10 px-3 py-2.5 text-[11px] uppercase tracking-[0.18em] ${
                  item === page
                    ? "bg-brass text-ink"
                    : "border border-line text-parchment hover:border-brass hover:text-brass"
                }`}
                onClick={() => onPage(item)}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>
      <button
        type="button"
        className="border border-cream/35 px-4 py-2.5 text-[11px] uppercase tracking-[0.18em] text-cream hover:border-brass hover:text-brass disabled:opacity-40"
        disabled={page >= pageCount}
        onClick={() => onPage(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}

export function ProductSearch({
  products,
  showCategory = false,
  showImage = true,
}: {
  products: Array<Product | CatalogProduct>;
  showCategory?: boolean;
  showImage?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [brand, setBrand] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [page, setPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);
  const publishedOfferTitles = usePublishedOfferTitles();
  const needle = query.trim().toLowerCase();
  const viewingSpecialOffers = category === SPECIAL_OFFERS_FILTER;
  const noPublishedOffers =
    publishedOfferTitles !== null && publishedOfferTitles.length === 0;

  function isActiveSpecialOffer(product: Product) {
    if (publishedOfferTitles) {
      return publishedOfferTitles.includes(product.name.toLowerCase());
    }
    return isSpecialOfferProduct(product);
  }

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
  const conditionOptions = useMemo(() => {
    const names = new Set<string>();
    for (const product of products) {
      if (product.badge === "New" || product.badge === "Used") names.add(product.badge);
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [products]);
  const showConditionFilter = conditionOptions.length > 0;

  const results = useMemo(() => {
    const filtered = products.filter((product) => {
      const categoryName = "categoryName" in product ? product.categoryName : undefined;
      if (needle && !matchesQuery(product, needle, categoryName)) return false;
      if (brand && !productBrands(product).includes(brand)) return false;
      if (condition && !product.featured && product.badge !== condition) return false;
      if (category === SPECIAL_OFFERS_FILTER) {
        return isActiveSpecialOffer(product);
      }
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

    const featured = sorted.filter((product) => product.featured);
    const rest = sorted.filter((product) => !product.featured);
    return [...featured, ...rest];
  }, [brand, category, condition, needle, products, publishedOfferTitles, sort]);

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = results.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [brand, category, condition, needle, sort]);

  function goToPage(next: number) {
    const clamped = Math.min(Math.max(1, next), pageCount);
    setPage(clamped);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <div
        className={`grid gap-3 md:grid-cols-2 ${
          showCategoryFilter && showConditionFilter
            ? "xl:grid-cols-[minmax(0,1fr)_11rem_11rem_11rem_14rem]"
            : showCategoryFilter
              ? "xl:grid-cols-[minmax(0,1fr)_12rem_12rem_16rem]"
              : showConditionFilter
                ? "lg:grid-cols-[minmax(0,1fr)_12rem_12rem_14rem]"
                : "lg:grid-cols-[minmax(0,1fr)_14rem_16rem]"
        }`}
      >
        <label
          className={`block min-w-0 md:col-span-2 ${
            showCategoryFilter ? "xl:col-span-1" : "lg:col-span-1"
          }`}
        >
          <span className="text-[11px] uppercase tracking-[0.2em] text-stone">Search products</span>
          <span className="relative mt-2 block">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, brand or type"
              autoComplete="off"
              className="subject-search w-full border border-line bg-ink px-3 py-3 pr-10 text-cream outline-none focus:border-brass"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                className="absolute inset-y-0 right-1 z-10 flex cursor-pointer items-center px-2 text-brass hover:text-cream"
                onClick={() => setQuery("")}
              >
                <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden="true">
                  <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </button>
            ) : null}
          </span>
        </label>
        {showCategoryFilter ? (
          <FilterSelect
            id="product-category"
            label="Category"
            value={category}
            onChange={setCategory}
          >
            <option value="">All categories</option>
            <option value={SPECIAL_OFFERS_FILTER}>Special Offers</option>
            {categoryOptions.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </FilterSelect>
        ) : null}
        {showConditionFilter ? (
          <FilterSelect
            id="product-condition"
            label="Condition"
            value={condition}
            onChange={setCondition}
          >
            <option value="">All</option>
            {conditionOptions.map((name) => (
              <option key={name} value={name}>
                {name}
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
      <div className="mt-8" ref={resultsRef}>
        {viewingSpecialOffers && noPublishedOffers ? (
          <OffersComingSoon />
        ) : results.length > 0 ? (
          <>
            <p className="mb-5 text-sm text-stone">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, results.length)} of {results.length}
            </p>
            <ProductCardList
              products={pageItems}
              showCategory={showCategory}
              showImage={showImage}
              layout={showImage ? "grid" : "list"}
            />
            {pageCount > 1 ? (
              <Pagination
                page={currentPage}
                pageCount={pageCount}
                onPage={goToPage}
              />
            ) : null}
          </>
        ) : (
          <p className="text-parchment">No products match that search.</p>
        )}
      </div>
    </div>
  );
}
