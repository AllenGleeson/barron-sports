"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AdminCheckbox, AdminSelect, adminButton } from "@/components/admin/fields";
import {
  DiscountConfirmModal,
  type DiscountPlan,
} from "@/components/admin/DiscountConfirmModal";
import {
  BulkPublishPanel,
  SelectAllRow,
  SelectRowCell,
  useRowSelection,
} from "@/components/admin/bulk";
import {
  ColumnFilter,
  DateColumnFilter,
  formatAdminDate,
  matchesDateFilter,
  PublishedColumnFilter,
  type DateFilter,
  type PublishedFilter,
} from "@/components/admin/columnFilters";
import { AdminListHeader, AdminTable, type AdminTableHeader } from "@/components/admin/list";
import { emptyProduct, ProductForm } from "@/components/admin/ProductForm";
import {
  matchesDiscountFilter,
  matchesOfferFilter,
  matchesPriceFilter,
  matchesTypeFilter,
  OFFER_STATUS_LABELS,
  type DiscountFilter,
  type OfferFilter,
  type PriceFilter,
  type TypeFilter,
} from "@/components/admin/productFilters";
import { isPackage, type AdminProduct } from "@/lib/admin/models";
import {
  applyPercentOff,
  DISCOUNT_PERCENTS,
  discountPercentOf,
  formatEuro,
  isDiscounted,
} from "@/lib/admin/money";
import { offerStatus } from "@/lib/admin/productOffer";
import { useAdminStore } from "@/lib/admin/store";

type View = "offers" | "packages" | "all";

const VIEWS: { id: View; label: string; matches: (row: AdminProduct) => boolean }[] = [
  { id: "offers", label: "Special offers", matches: (row) => row.specialOffer },
  { id: "packages", label: "Packages", matches: isPackage },
  { id: "all", label: "All products", matches: () => true },
];

const ADD_LABELS: Record<View, string> = {
  offers: "Add special offer",
  packages: "Add package",
  all: "Add product",
};

/** The view comes from `?view=` so the admin overview can link straight to it. */
function viewFromUrl(): View {
  const value = new URLSearchParams(window.location.search).get("view");
  return value === "offers" || value === "packages" ? value : "all";
}

const COLUMN_LABELS = {
  type: "Type",
  offer: "Special offer",
  category: "Category",
  price: "Price",
  discount: "Discount",
  published: "Published",
  dateAdded: "Date Added",
  lastUpdated: "Last Updated",
} as const;

type ColumnKey = keyof typeof COLUMN_LABELS;

const cell = "px-2.5 py-2.5 sm:px-3 lg:px-4 lg:py-3";

/** The single admin page for products, special offers and packages. */
export function ProductsAdmin() {
  const { data, patch } = useAdminStore();
  // Admin only renders in the browser, so the URL can be read on first render.
  const [view, setView] = useState<View>(viewFromUrl);
  const [editing, setEditing] = useState<{ product: AdminProduct; isNew: boolean } | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [offerFilter, setOfferFilter] = useState<OfferFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [discountFilter, setDiscountFilter] = useState<DiscountFilter>("all");
  const [publishedFilter, setPublishedFilter] = useState<PublishedFilter>("all");
  const [dateAddedFilter, setDateAddedFilter] = useState<DateFilter>("all");
  const [lastUpdatedFilter, setLastUpdatedFilter] = useState<DateFilter>("all");
  const [discountTarget, setDiscountTarget] = useState<"category" | "brand" | "selected">(
    "selected",
  );
  const [discountCategory, setDiscountCategory] = useState(data.categories[0]?.id ?? "");
  const [discountBrand, setDiscountBrand] = useState("");
  const [discountPlan, setDiscountPlan] = useState<DiscountPlan | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({
    type: true,
    offer: true,
    category: true,
    price: true,
    discount: true,
    published: true,
    dateAdded: true,
    lastUpdated: true,
  });
  const columnsRef = useRef<HTMLDivElement>(null);

  const currentView = VIEWS.find((item) => item.id === view) ?? VIEWS[2];
  // The Type column is redundant on the Packages view.
  const shown = { ...columns, type: columns.type && view !== "packages" };
  const visibleColumnCount = Object.values(shown).filter(Boolean).length;

  const categoryName = (id: string) =>
    data.categories.find((category) => category.id === id)?.name ?? "—";

  // Brands that at least one product is tagged with, for the discount panel.
  const discountBrands = useMemo(() => {
    const used = new Set(data.products.flatMap((row) => row.brandIds));
    return data.brands
      .filter((brand) => used.has(brand.id))
      .sort((a, b) => a.name.localeCompare(b.name, "en"));
  }, [data.brands, data.products]);
  const brandId = discountBrand || discountBrands[0]?.id || "";
  const brandName = data.brands.find((brand) => brand.id === brandId)?.name ?? "";

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const byId = new Map(data.products.map((row) => [row.id, row]));
    return data.products
      .filter(currentView.matches)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .filter((row) => matchesTypeFilter(row, typeFilter))
      .filter((row) => matchesOfferFilter(row, offerFilter))
      .filter((row) => categoryFilter === "all" || row.categoryId === categoryFilter)
      .filter((row) => matchesPriceFilter(row, priceFilter))
      .filter((row) => matchesDiscountFilter(row, discountFilter))
      .filter((row) => publishedFilter === "all" || row.published === (publishedFilter === "yes"))
      .filter((row) => matchesDateFilter(row.createdAt, dateAddedFilter))
      .filter((row) => matchesDateFilter(row.updatedAt, lastUpdatedFilter))
      .filter((row) => {
        if (!q) return true;
        const text = [
          row.name,
          row.summary,
          row.caliber ?? "",
          row.offerLabel ?? "",
          ...row.highlights,
          // Packages also match the names of the products inside them.
          ...row.productIds.map((id) => byId.get(id)?.name ?? ""),
        ];
        return text.some((value) => value.toLowerCase().includes(q));
      });
  }, [
    categoryFilter,
    currentView,
    data.products,
    dateAddedFilter,
    discountFilter,
    lastUpdatedFilter,
    offerFilter,
    priceFilter,
    publishedFilter,
    search,
    typeFilter,
  ]);

  const selection = useRowSelection(rows);
  const selectedRows = data.products.filter((row) => selection.isSelected(row.id));

  useEffect(() => {
    if (!columnsOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!columnsRef.current?.contains(event.target as Node)) setColumnsOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, [columnsOpen]);

  function resetFilters() {
    setTypeFilter("all");
    setOfferFilter("all");
    setCategoryFilter("all");
    setPriceFilter("all");
    setDiscountFilter("all");
    setPublishedFilter("all");
    setDateAddedFilter("all");
    setLastUpdatedFilter("all");
  }

  const filtersAtDefault =
    typeFilter === "all" &&
    offerFilter === "all" &&
    categoryFilter === "all" &&
    priceFilter === "all" &&
    discountFilter === "all" &&
    publishedFilter === "all" &&
    dateAddedFilter === "all" &&
    lastUpdatedFilter === "all";

  function changeView(next: View) {
    setView(next);
    resetFilters();
    const url = new URL(window.location.href);
    if (next === "all") url.searchParams.delete("view");
    else url.searchParams.set("view", next);
    window.history.replaceState(null, "", url);
  }

  function updateColumn(key: ColumnKey, visible: boolean) {
    setColumns((current) => ({ ...current, [key]: visible }));
    if (visible) return;
    // Hiding a column clears its filter so rows don't vanish for no visible reason.
    const clear: Partial<Record<ColumnKey, () => void>> = {
      type: () => setTypeFilter("all"),
      offer: () => setOfferFilter("all"),
      category: () => setCategoryFilter("all"),
      price: () => setPriceFilter("all"),
      discount: () => setDiscountFilter("all"),
      published: () => setPublishedFilter("all"),
      dateAdded: () => setDateAddedFilter("all"),
      lastUpdated: () => setLastUpdatedFilter("all"),
    };
    clear[key]?.();
  }

  function startNew() {
    setEditing({
      isNew: true,
      product: emptyProduct({
        kind: view === "packages" ? "package" : "product",
        categoryId: data.categories[0]?.id ?? "",
        sortOrder: data.products.length,
        specialOffer: view === "offers",
      }),
    });
  }

  function applyDiscount(percent: number) {
    const ids =
      discountTarget === "category"
        ? data.products.filter((row) => row.categoryId === discountCategory).map((row) => row.id)
        : discountTarget === "brand"
          ? data.products.filter((row) => row.brandIds.includes(brandId)).map((row) => row.id)
          : selection.selected;
    if (ids.length === 0) {
      setDiscountError(
        discountTarget === "category"
          ? "Choose a category first."
          : discountTarget === "brand"
            ? "Choose a brand first."
            : "Select one or more products first.",
      );
      return;
    }
    const priced = data.products.filter(
      (row) => ids.includes(row.id) && row.priceCents != null && row.priceCents > 0,
    );
    if (priced.length === 0) {
      setDiscountError("None of those products have a price to discount.");
      return;
    }
    const existing = priced.filter(isDiscounted);
    setDiscountError("");
    setDiscountPlan({
      percent,
      label:
        discountTarget === "category"
          ? `${categoryName(discountCategory)} category`
          : discountTarget === "brand"
            ? `${brandName} products`
            : `${priced.length} selected product${priced.length === 1 ? "" : "s"}`,
      fresh: priced.filter((row) => !isDiscounted(row)),
      existing,
      includeExisting: existing.map((row) => row.id),
    });
  }

  function confirmDiscount() {
    if (!discountPlan) return;
    const ids = [...discountPlan.fresh.map((row) => row.id), ...discountPlan.includeExisting];
    const percent = discountPlan.percent;
    if (ids.length > 0) {
      patch("products", ids, (row) => ({
        ...row,
        discountPriceCents: applyPercentOff(row.priceCents as number, percent),
      }));
    }
    setDiscountPlan(null);
  }

  function clearDiscount(ids: string[]) {
    const discounted = data.products.filter((row) => ids.includes(row.id) && isDiscounted(row));
    if (discounted.length === 0) return;
    patch(
      "products",
      discounted.map((row) => row.id),
      (row) => ({ ...row, discountPriceCents: null }),
    );
  }

  if (editing) {
    return (
      <ProductForm
        key={editing.product.id}
        initial={editing.product}
        isNew={editing.isNew}
        onClose={() => setEditing(null)}
      />
    );
  }

  const tableHeaders: AdminTableHeader[] = [
    "Select",
    "Product",
    ...(shown.type
      ? [
          {
            label: "Type",
            filter: (
              <ColumnFilter
                label="Type"
                value={typeFilter}
                onChange={(value) => setTypeFilter(value as TypeFilter)}
              >
                <option value="all">All</option>
                <option value="product">Products</option>
                <option value="package">Packages</option>
              </ColumnFilter>
            ),
          },
        ]
      : []),
    ...(shown.offer
      ? [
          {
            label: "Special Offer",
            filter: (
              <ColumnFilter
                label="Special offer"
                value={offerFilter}
                onChange={(value) => setOfferFilter(value as OfferFilter)}
              >
                <option value="all">All</option>
                {view === "offers" ? null : <option value="any">Any special offer</option>}
                <option value="live">Live</option>
                <option value="scheduled">Scheduled</option>
                <option value="ended">Ended</option>
                <option value="hidden">Unpublished</option>
                {view === "offers" ? null : <option value="none">Not an offer</option>}
              </ColumnFilter>
            ),
          },
        ]
      : []),
    ...(shown.category
      ? [
          {
            label: "Category",
            filter: (
              <ColumnFilter
                label="Category"
                value={categoryFilter}
                onChange={(value) => {
                  setCategoryFilter(value);
                  if (value !== "all") setDiscountCategory(value);
                }}
              >
                <option value="all">All</option>
                {data.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </ColumnFilter>
            ),
          },
        ]
      : []),
    ...(shown.price
      ? [
          {
            label: "Price",
            filter: (
              <ColumnFilter
                label="Price"
                value={priceFilter}
                onChange={(value) => setPriceFilter(value as PriceFilter)}
              >
                <option value="all">All</option>
                <option value="priced">Has a price</option>
                <option value="none">No price</option>
                <option value="under-250">Under €250</option>
                <option value="250-500">€250–€500</option>
                <option value="500-1000">€500–€1,000</option>
                <option value="1000-2500">€1,000–€2,500</option>
                <option value="over-2500">Over €2,500</option>
              </ColumnFilter>
            ),
          },
        ]
      : []),
    ...(shown.discount
      ? [
          {
            label: "Discount",
            filter: (
              <ColumnFilter
                label="Discount"
                value={discountFilter}
                onChange={(value) => setDiscountFilter(value as DiscountFilter)}
              >
                <option value="all">All</option>
                <option value="yes">Discounted</option>
                <option value="no">Not discounted</option>
                {DISCOUNT_PERCENTS.map((percent) => (
                  <option key={percent} value={String(percent)}>
                    {percent}%
                  </option>
                ))}
              </ColumnFilter>
            ),
          },
        ]
      : []),
    ...(shown.published
      ? [
          {
            label: "Published",
            filter: <PublishedColumnFilter value={publishedFilter} onChange={setPublishedFilter} />,
          },
        ]
      : []),
    ...(shown.dateAdded
      ? [
          {
            label: "Date Added",
            filter: (
              <DateColumnFilter label="Date added" value={dateAddedFilter} onChange={setDateAddedFilter} />
            ),
          },
        ]
      : []),
    ...(shown.lastUpdated
      ? [
          {
            label: "Last Updated",
            filter: (
              <DateColumnFilter
                label="Last updated"
                value={lastUpdatedFilter}
                onChange={setLastUpdatedFilter}
              />
            ),
          },
        ]
      : []),
    "Actions",
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Show">
        {VIEWS.map((item) => {
          const count = data.products.filter(item.matches).length;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={view === item.id}
              className={view === item.id ? adminButton.primary : adminButton.secondary}
              onClick={() => changeView(item.id)}
            >
              {item.label} ({count})
            </button>
          );
        })}
      </div>

      <AdminListHeader
        title={currentView.label}
        count={rows.length}
        search={search}
        onSearch={setSearch}
        addLabel={ADD_LABELS[view]}
        onAdd={startNew}
      />
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className={adminButton.secondary}
          disabled={filtersAtDefault}
          onClick={resetFilters}
        >
          Reset filters
        </button>
        <div className="relative" ref={columnsRef}>
          <button
            type="button"
            className={adminButton.secondary}
            aria-expanded={columnsOpen}
            aria-haspopup="true"
            onClick={() => setColumnsOpen((open) => !open)}
          >
            Columns
          </button>
          {columnsOpen ? (
            <div className="absolute right-0 z-10 mt-2 w-56 border border-line bg-forest p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-stone">Show columns</p>
              <div className="mt-3 grid gap-2">
                {(Object.keys(COLUMN_LABELS) as ColumnKey[]).map((key) => (
                  <AdminCheckbox
                    key={key}
                    label={COLUMN_LABELS[key]}
                    checked={columns[key]}
                    onChange={(event) => updateColumn(key, event.target.checked)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div className="border border-line bg-forest p-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-brass">Apply discount</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-parchment">
              <input
                type="radio"
                name="discount-target"
                checked={discountTarget === "category"}
                onChange={() => setDiscountTarget("category")}
                className="accent-brass"
              />
              Category
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-parchment">
              <input
                type="radio"
                name="discount-target"
                checked={discountTarget === "brand"}
                onChange={() => setDiscountTarget("brand")}
                className="accent-brass"
              />
              Brand
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-parchment">
              <input
                type="radio"
                name="discount-target"
                checked={discountTarget === "selected"}
                onChange={() => setDiscountTarget("selected")}
                className="accent-brass"
              />
              Selected
              {selection.selected.length > 0 ? ` (${selection.selected.length})` : ""}
            </label>
          </div>
          {discountTarget === "category" ? (
            <div className="mt-3 max-w-xs">
              <AdminSelect
                value={discountCategory}
                onChange={(event) => setDiscountCategory(event.target.value)}
              >
                {data.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </AdminSelect>
            </div>
          ) : null}
          {discountTarget === "brand" ? (
            <div className="mt-3 max-w-xs">
              <AdminSelect
                aria-label="Brand to discount"
                value={brandId}
                onChange={(event) => setDiscountBrand(event.target.value)}
              >
                {discountBrands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </AdminSelect>
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {DISCOUNT_PERCENTS.map((percent) => (
              <button
                key={percent}
                type="button"
                className={adminButton.primary}
                onClick={() => applyDiscount(percent)}
              >
                {percent}%
              </button>
            ))}
            <button
              type="button"
              className={adminButton.secondary}
              disabled={selection.selected.length === 0}
              onClick={() => clearDiscount(selection.selected)}
            >
              Remove from selected
            </button>
          </div>
          {discountError ? (
            <p className="mt-3 text-sm text-red-200" role="alert">
              {discountError}
            </p>
          ) : null}
        </div>
        <BulkPublishPanel
          noun="product"
          field="specialOffer"
          rows={selectedRows}
          onApply={(ids, specialOffer) =>
            patch("products", ids, (row) => ({ ...row, specialOffer }))
          }
        />
        <BulkPublishPanel
          noun="product"
          rows={selectedRows}
          onApply={(ids, published) => patch("products", ids, (row) => ({ ...row, published }))}
        />
      </div>
      {discountPlan ? (
        <DiscountConfirmModal
          plan={discountPlan}
          onChangeInclude={(includeExisting) => setDiscountPlan({ ...discountPlan, includeExisting })}
          onCancel={() => setDiscountPlan(null)}
          onConfirm={confirmDiscount}
        />
      ) : null}

      <AdminTable headers={tableHeaders}>
        <SelectAllRow selection={selection} colSpan={2 + visibleColumnCount} />
        {rows.map((row) => {
          const discounted = isDiscounted(row);
          const percent = discountPercentOf(row);
          const status = offerStatus(row);
          const packaged = isPackage(row);
          return (
            <tr key={row.id}>
              <SelectRowCell selection={selection} id={row.id} label={row.name} />
              <td className={`${cell} text-cream`}>
                {row.name}
                {packaged ? (
                  <span className="mt-0.5 block text-xs text-stone">
                    {row.productIds.length} product{row.productIds.length === 1 ? "" : "s"}
                  </span>
                ) : null}
              </td>
              {shown.type ? (
                <td className={`${cell} text-parchment`}>{packaged ? "Package" : "Product"}</td>
              ) : null}
              {shown.offer ? (
                <td className={`${cell} ${status === "live" ? "text-brass" : "text-parchment"}`}>
                  {OFFER_STATUS_LABELS[status]}
                </td>
              ) : null}
              {shown.category ? (
                <td className={`${cell} text-parchment`}>
                  {row.categoryId ? categoryName(row.categoryId) : "—"}
                </td>
              ) : null}
              {shown.price ? (
                <td className={`${cell} text-parchment`}>
                  {discounted ? (
                    <span>
                      <span className="mr-2 text-stone line-through">{formatEuro(row.priceCents)}</span>
                      {formatEuro(row.discountPriceCents)}
                    </span>
                  ) : (
                    formatEuro(row.priceCents, row.priceDisplay)
                  )}
                </td>
              ) : null}
              {shown.discount ? (
                <td className={cell}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={discounted ? "text-brass" : "text-parchment"}>
                      {discounted ? `Yes${percent != null ? ` · ${percent}%` : ""}` : "No"}
                    </span>
                    {discounted ? (
                      <button
                        type="button"
                        className="text-[11px] uppercase tracking-[0.18em] text-brass hover:text-cream"
                        onClick={() => clearDiscount([row.id])}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </td>
              ) : null}
              {shown.published ? (
                <td className={`${cell} text-parchment`}>{row.published ? "Yes" : "No"}</td>
              ) : null}
              {shown.dateAdded ? (
                <td className={`${cell} whitespace-nowrap text-parchment tabular-nums`}>
                  {formatAdminDate(row.createdAt)}
                </td>
              ) : null}
              {shown.lastUpdated ? (
                <td className={`${cell} whitespace-nowrap text-parchment tabular-nums`}>
                  {formatAdminDate(row.updatedAt)}
                </td>
              ) : null}
              <td className={`${cell} text-right`}>
                <button
                  type="button"
                  className="text-[11px] uppercase tracking-[0.18em] text-brass hover:text-cream"
                  onClick={() => setEditing({ product: row, isNew: false })}
                >
                  Edit
                </button>
              </td>
            </tr>
          );
        })}
      </AdminTable>
    </div>
  );
}
