"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdminCheckbox,
  AdminField,
  AdminFormIntro,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  adminButton,
} from "@/components/admin/fields";
import {
  DiscountConfirmModal,
  type DiscountPlan,
} from "@/components/admin/DiscountConfirmModal";
import {
  PublishConfirmModal,
  type PublishPlan,
} from "@/components/admin/PublishConfirmModal";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminImagePreview } from "@/components/admin/AdminImagePreview";
import {
  ColumnFilter,
  DateColumnFilter,
  formatAdminDate,
  matchesDateFilter,
  PublishedColumnFilter,
  type DateFilter,
  type PublishedFilter,
} from "@/components/admin/columnFilters";
import {
  AdminFormActions,
  AdminListHeader,
  AdminTable,
  type AdminTableHeader,
} from "@/components/admin/list";
import {
  isFirearmCategory,
  type AdminBrand,
  type AdminProduct,
  type ProductCondition,
} from "@/lib/admin/models";
import {
  applyPercentOff,
  centsToInput,
  DISCOUNT_PERCENTS,
  discountPercentOf,
  formatEuro,
  inputToCents,
  isDiscounted,
} from "@/lib/admin/money";
import { slugify } from "@/lib/admin/slug";
import { newAdminId, useAdminStore } from "@/lib/admin/store";
import {
  scrollToFirstInvalid,
  validateProductDraft,
} from "@/lib/admin/validation";

type PriceFilter =
  | "all"
  | "priced"
  | "none"
  | "under-250"
  | "250-500"
  | "500-1000"
  | "1000-2500"
  | "over-2500";
type DiscountFilter = "all" | "yes" | "no" | "5" | "10" | "15" | "20";

function emptyProduct(categoryId: string, sortOrder: number): AdminProduct {
  const now = new Date().toISOString();
  return {
    id: newAdminId("product"),
    slug: "",
    categoryId,
    name: "",
    summary: "",
    imageUrl: null,
    priceCents: null,
    discountPriceCents: null,
    priceDisplay: null,
    caliber: null,
    condition: null,
    conditionDetail: null,
    badge: null,
    featured: false,
    specialOffer: false,
    quantity: null,
    stockNote: null,
    brandIds: [],
    published: true,
    sortOrder,
    createdAt: now,
    updatedAt: now,
  };
}

function salePriceCents(row: AdminProduct) {
  if (isDiscounted(row) && row.discountPriceCents != null) {
    return row.discountPriceCents;
  }
  return row.priceCents;
}

function matchesPriceFilter(row: AdminProduct, filter: PriceFilter) {
  const cents = salePriceCents(row);
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

function matchesDiscountFilter(row: AdminProduct, filter: DiscountFilter) {
  if (filter === "all") return true;
  const discounted = isDiscounted(row);
  if (filter === "yes") return discounted;
  if (filter === "no") return !discounted;
  return discounted && discountPercentOf(row) === Number(filter);
}

function brandMatchesQuery(brand: AdminBrand, needle: string) {
  if (brand.name.toLowerCase().includes(needle)) return true;
  return brand.aliases.some((alias) => alias.toLowerCase().includes(needle));
}

function ProductBrandPicker({
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
        <p className="text-[11px] uppercase tracking-[0.2em] text-stone">Brands</p>
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

export function ProductsAdmin() {
  const { data, upsertProduct, patchProducts, remove } = useAdminStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [draft, setDraft] = useState<AdminProduct | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [discountTarget, setDiscountTarget] = useState<"category" | "selected">(
    "selected",
  );
  const [discountCategory, setDiscountCategory] = useState(
    data.categories[0]?.id ?? "",
  );
  const [discountPlan, setDiscountPlan] = useState<DiscountPlan | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [publishPlan, setPublishPlan] = useState<PublishPlan | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [columns, setColumns] = useState({
    category: true,
    price: true,
    discount: true,
    published: true,
    dateAdded: true,
    lastUpdated: true,
  });
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [discountFilter, setDiscountFilter] = useState<DiscountFilter>("all");
  const [publishedFilter, setPublishedFilter] = useState<PublishedFilter>("all");
  const [dateAddedFilter, setDateAddedFilter] = useState<DateFilter>("all");
  const [lastUpdatedFilter, setLastUpdatedFilter] = useState<DateFilter>("all");
  const columnsRef = useRef<HTMLDivElement>(null);

  const visibleColumnCount =
    Number(columns.category) +
    Number(columns.price) +
    Number(columns.discount) +
    Number(columns.published) +
    Number(columns.dateAdded) +
    Number(columns.lastUpdated);

  const categoryName = (id: string) =>
    data.categories.find((category) => category.id === id)?.name ?? "—";
  const categorySlug = (id: string) =>
    data.categories.find((category) => category.id === id)?.slug ?? "";

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.products
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .filter((row) => categoryFilter === "all" || row.categoryId === categoryFilter)
      .filter((row) => matchesPriceFilter(row, priceFilter))
      .filter((row) => matchesDiscountFilter(row, discountFilter))
      .filter((row) => {
        if (publishedFilter === "all") return true;
        return publishedFilter === "yes" ? row.published : !row.published;
      })
      .filter((row) => matchesDateFilter(row.createdAt, dateAddedFilter))
      .filter((row) => matchesDateFilter(row.updatedAt, lastUpdatedFilter))
      .filter(
        (row) =>
          !q ||
          row.name.toLowerCase().includes(q) ||
          row.summary.toLowerCase().includes(q) ||
          (row.caliber ?? "").toLowerCase().includes(q),
      );
  }, [
    categoryFilter,
    data.products,
    dateAddedFilter,
    discountFilter,
    lastUpdatedFilter,
    priceFilter,
    publishedFilter,
    search,
  ]);

  function updateColumn(
    key: keyof typeof columns,
    visible: boolean,
  ) {
    setColumns((current) => ({ ...current, [key]: visible }));
    if (visible) return;
    if (key === "category") setCategoryFilter("all");
    if (key === "price") setPriceFilter("all");
    if (key === "discount") setDiscountFilter("all");
    if (key === "published") setPublishedFilter("all");
    if (key === "dateAdded") setDateAddedFilter("all");
    if (key === "lastUpdated") setLastUpdatedFilter("all");
  }

  const tableHeaders: AdminTableHeader[] = [
    "Select",
    "Product",
    ...(columns.category
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
    ...(columns.price
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
    ...(columns.discount
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
    ...(columns.published
      ? [
          {
            label: "Published",
            filter: (
              <PublishedColumnFilter
                value={publishedFilter}
                onChange={setPublishedFilter}
              />
            ),
          },
        ]
      : []),
    ...(columns.dateAdded
      ? [
          {
            label: "Date Added",
            filter: (
              <DateColumnFilter
                label="Date added"
                value={dateAddedFilter}
                onChange={setDateAddedFilter}
              />
            ),
          },
        ]
      : []),
    ...(columns.lastUpdated
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

  useEffect(() => {
    const visible = new Set(rows.map((row) => row.id));
    setSelected((current) => {
      const next = current.filter((id) => visible.has(id));
      return next.length === current.length ? current : next;
    });
  }, [rows]);

  useEffect(() => {
    if (!columnsOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!columnsRef.current?.contains(event.target as Node)) {
        setColumnsOpen(false);
      }
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, [columnsOpen]);

  const filtersAtDefault =
    categoryFilter === "all" &&
    priceFilter === "all" &&
    discountFilter === "all" &&
    publishedFilter === "all" &&
    dateAddedFilter === "all" &&
    lastUpdatedFilter === "all";

  const allVisibleSelected =
    rows.length > 0 && rows.every((row) => selected.includes(row.id));

  function toggleSelected(id: string, checked: boolean) {
    setSelected((current) =>
      checked ? [...current, id] : current.filter((item) => item !== id),
    );
  }

  function targetIds() {
    if (discountTarget === "category") {
      return data.products
        .filter((row) => row.categoryId === discountCategory)
        .map((row) => row.id);
    }
    return selected;
  }

  function applyDiscount(percent: number) {
    const ids = targetIds();
    if (ids.length === 0) {
      setDiscountError(
        discountTarget === "category"
          ? "Choose a category first."
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
    const fresh = priced.filter((row) => !isDiscounted(row));
    const label =
      discountTarget === "category"
        ? `${categoryName(discountCategory)} category`
        : `${priced.length} selected product${priced.length === 1 ? "" : "s"}`;
    setDiscountError("");
    setDiscountPlan({
      percent,
      label,
      fresh,
      existing,
      includeExisting: existing.map((row) => row.id),
    });
  }

  function confirmDiscount() {
    if (!discountPlan) return;
    const ids = [
      ...discountPlan.fresh.map((row) => row.id),
      ...discountPlan.includeExisting,
    ];
    if (ids.length === 0) {
      setDiscountPlan(null);
      return;
    }
    const percent = discountPlan.percent;
    patchProducts(ids, (row) => ({
      ...row,
      discountPriceCents: applyPercentOff(row.priceCents as number, percent),
    }));
    setDiscountPlan(null);
  }

  function clearDiscount(ids: string[]) {
    const discounted = data.products.filter(
      (row) => ids.includes(row.id) && isDiscounted(row),
    );
    if (discounted.length === 0) return;
    patchProducts(
      discounted.map((row) => row.id),
      (row) => ({ ...row, discountPriceCents: null }),
    );
  }

  function setSelectedPublished(published: boolean) {
    if (selected.length === 0) return;
    const products = data.products.filter((row) => selected.includes(row.id));
    setPublishPlan({
      published,
      noun: "product",
      items: products,
      include: products
        .filter((row) => row.published !== published)
        .map((row) => row.id),
    });
  }

  function confirmPublish() {
    if (!publishPlan) return;
    const ids = publishPlan.include;
    if (ids.length === 0) {
      setPublishPlan(null);
      return;
    }
    patchProducts(ids, (row) => ({
      ...row,
      published: publishPlan.published,
    }));
    setPublishPlan(null);
  }

  if (draft) {
    const firearm = isFirearmCategory(categorySlug(draft.categoryId));
    const linkedOffers = data.offers.filter(
      (offer) => offer.productId === draft.id,
    ).length;
    const takenSlugs = data.products
      .filter((row) => row.id !== draft.id)
      .map((row) => row.slug);
    const errors = attempted
      ? validateProductDraft({
          name: draft.name,
          slug: draft.slug,
          categoryId: draft.categoryId,
          summary: draft.summary,
          imageUrl: draft.imageUrl,
          price,
          discount,
          quantity: draft.quantity,
          takenSlugs,
        })
      : {};
    return (
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setAttempted(true);
          const nextErrors = validateProductDraft({
            name: draft.name,
            slug: draft.slug,
            categoryId: draft.categoryId,
            summary: draft.summary,
            imageUrl: draft.imageUrl,
            price,
            discount,
            quantity: draft.quantity,
            takenSlugs,
          });
          if (Object.keys(nextErrors).length) {
            window.setTimeout(scrollToFirstInvalid, 0);
            return;
          }
          upsertProduct({
            ...draft,
            slug: slugify(draft.slug || draft.name),
            imageUrl: draft.imageUrl?.trim() || null,
            priceCents: inputToCents(price),
            discountPriceCents: inputToCents(discount),
            priceDisplay: draft.priceDisplay?.trim() || null,
            caliber: firearm ? draft.caliber?.trim() || null : null,
            conditionDetail:
              draft.condition === "used"
                ? draft.conditionDetail?.trim() || null
                : null,
            badge: draft.badge?.trim() || null,
            stockNote: draft.stockNote?.trim() || null,
            updatedAt: new Date().toISOString(),
          });
          setAttempted(false);
          setDraft(null);
          setIsNew(false);
        }}
      >
        <AdminFormIntro
          title={isNew ? "New product" : "Edit product"}
          errors={errors}
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <AdminField label="Name" required error={errors.name}>
            <AdminInput
              required
              invalid={Boolean(errors.name)}
              value={draft.name}
              onChange={(event) => {
                const name = event.target.value;
                setDraft({
                  ...draft,
                  name,
                  slug: isNew ? slugify(name) : draft.slug,
                });
              }}
            />
          </AdminField>
          <AdminField label="Slug" required error={errors.slug}>
            <AdminInput
              required
              invalid={Boolean(errors.slug)}
              value={draft.slug}
              onChange={(event) =>
                setDraft({ ...draft, slug: slugify(event.target.value) })
              }
            />
          </AdminField>
          <AdminField label="Category" required error={errors.categoryId}>
            <AdminSelect
              required
              invalid={Boolean(errors.categoryId)}
              value={draft.categoryId}
              onChange={(event) =>
                setDraft({ ...draft, categoryId: event.target.value })
              }
            >
              <option value="">Select a category</option>
              {data.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <div className="lg:col-span-2">
            <AdminField label="Summary" required error={errors.summary}>
              <AdminTextarea
                required
                invalid={Boolean(errors.summary)}
                rows={4}
                value={draft.summary}
                onChange={(event) =>
                  setDraft({ ...draft, summary: event.target.value })
                }
              />
            </AdminField>
          </div>
          <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_14rem] lg:col-span-2">
            <AdminField
              label="Image URL"
              hint="Leave empty for firearms lists"
              error={errors.imageUrl}
            >
              <AdminInput
                invalid={Boolean(errors.imageUrl)}
                value={draft.imageUrl ?? ""}
                onChange={(event) =>
                  setDraft({ ...draft, imageUrl: event.target.value })
                }
              />
            </AdminField>
            <AdminImagePreview src={draft.imageUrl} alt={draft.name} />
          </div>
          {firearm ? (
            <AdminField label="Caliber" hint=".22 LR, .223, 12g">
              <AdminInput
                value={draft.caliber ?? ""}
                onChange={(event) =>
                  setDraft({ ...draft, caliber: event.target.value })
                }
              />
            </AdminField>
          ) : null}
          <AdminField label="Price (€)" error={errors.price}>
            <AdminInput
              inputMode="decimal"
              invalid={Boolean(errors.price)}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </AdminField>
          <AdminField
            label="Discount price (€)"
            hint="Leave empty when the item is not on sale"
            error={errors.discount}
          >
            <AdminInput
              inputMode="decimal"
              invalid={Boolean(errors.discount)}
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
            />
          </AdminField>
          <AdminField
            label="Price display"
            hint="Overrides numbers. From €450 or Inquire for Pricing."
          >
            <AdminInput
              value={draft.priceDisplay ?? ""}
              onChange={(event) =>
                setDraft({ ...draft, priceDisplay: event.target.value })
              }
            />
          </AdminField>
          <AdminField label="Condition">
            <AdminSelect
              value={draft.condition ?? ""}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  condition: (event.target.value || null) as ProductCondition | null,
                })
              }
            >
              <option value="">None</option>
              <option value="new">New</option>
              <option value="used">Used</option>
            </AdminSelect>
          </AdminField>
          {draft.condition === "used" ? (
            <AdminField label="Used condition detail">
              <AdminInput
                value={draft.conditionDetail ?? ""}
                onChange={(event) =>
                  setDraft({ ...draft, conditionDetail: event.target.value })
                }
              />
            </AdminField>
          ) : null}
          <AdminField label="Quantity" error={errors.quantity}>
            <AdminInput
              type="number"
              min={0}
              invalid={Boolean(errors.quantity)}
              value={draft.quantity ?? ""}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  quantity:
                    event.target.value === "" ? null : Number(event.target.value),
                })
              }
            />
          </AdminField>
          <AdminField label="Stock note">
            <AdminInput
              value={draft.stockNote ?? ""}
              onChange={(event) =>
                setDraft({ ...draft, stockNote: event.target.value })
              }
            />
          </AdminField>
          <ProductBrandPicker
            key={draft.id}
            brands={data.brands}
            selectedIds={draft.brandIds}
            onChange={(brandIds) => setDraft({ ...draft, brandIds })}
          />
          <div className="flex flex-wrap items-end gap-6 pb-2">
            <AdminCheckbox
              label="Featured"
              checked={draft.featured}
              onChange={(event) =>
                setDraft({ ...draft, featured: event.target.checked })
              }
            />
            <AdminCheckbox
              label="Published"
              checked={draft.published}
              onChange={(event) =>
                setDraft({ ...draft, published: event.target.checked })
              }
            />
          </div>
        </div>
        <AdminFormActions
          onCancel={() => {
            setConfirmDelete(false);
            setAttempted(false);
            setDraft(null);
            setIsNew(false);
          }}
          onDelete={isNew ? undefined : () => setConfirmDelete(true)}
        />
        {confirmDelete ? (
          <AdminConfirmModal
            eyebrow="Confirm delete"
            title={`Delete ${draft.name}?`}
            confirmLabel="Delete product"
            danger
            onCancel={() => setConfirmDelete(false)}
            onConfirm={() => {
              remove("products", draft.id);
              setConfirmDelete(false);
              setDraft(null);
              setIsNew(false);
            }}
          >
            <p>This cannot be undone.</p>
            {linkedOffers > 0 ? (
              <p>
                {linkedOffers} special offer{linkedOffers === 1 ? "" : "s"}{" "}
                currently {linkedOffers === 1 ? "links" : "link"} to this
                product.
              </p>
            ) : null}
          </AdminConfirmModal>
        ) : null}
      </form>
    );
  }

  return (
    <div>
      <AdminListHeader
        title="Products"
        count={rows.length}
        search={search}
        onSearch={setSearch}
        addLabel="Add product"
        onAdd={() => {
          setIsNew(true);
          setAttempted(false);
          setPrice("");
          setDiscount("");
          setDraft(
            emptyProduct(data.categories[0]?.id ?? "", data.products.length),
          );
        }}
      />
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className={adminButton.secondary}
          disabled={filtersAtDefault}
          onClick={() => {
            setCategoryFilter("all");
            setPriceFilter("all");
            setDiscountFilter("all");
            setPublishedFilter("all");
            setDateAddedFilter("all");
            setLastUpdatedFilter("all");
          }}
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
            <div className="absolute right-0 z-10 mt-2 w-56 border border-line bg-forest p-3 shadow-none">
              <p className="text-[11px] uppercase tracking-[0.2em] text-stone">
                Show columns
              </p>
              <div className="mt-3 grid gap-2">
                {(
                  [
                    ["category", "Category"],
                    ["price", "Price"],
                    ["discount", "Discount"],
                    ["published", "Published"],
                    ["dateAdded", "Date Added"],
                    ["lastUpdated", "Last Updated"],
                  ] as const
                ).map(([key, label]) => (
                  <AdminCheckbox
                    key={key}
                    label={label}
                    checked={columns[key]}
                    onChange={(event) =>
                      updateColumn(key, event.target.checked)
                    }
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="border border-line bg-forest p-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-brass">
            Apply discount
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-parchment">
              <input
                type="radio"
                name="discount-target"
                checked={discountTarget === "category"}
                onChange={() => setDiscountTarget("category")}
                className="accent-[var(--brass)]"
              />
              Category
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-parchment">
              <input
                type="radio"
                name="discount-target"
                checked={discountTarget === "selected"}
                onChange={() => setDiscountTarget("selected")}
                className="accent-[var(--brass)]"
              />
              Selected products
              {selected.length > 0 ? ` (${selected.length})` : ""}
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
              disabled={selected.length === 0}
              onClick={() => clearDiscount(selected)}
            >
              Remove discount from selected
            </button>
          </div>
          {discountError ? (
            <p className="mt-3 text-sm text-red-200" role="alert">
              {discountError}
            </p>
          ) : null}
        </div>
        <div className="border border-line bg-forest p-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-brass">
            Set published
          </p>
          <p className="mt-3 text-sm text-parchment">
            {selected.length === 0
              ? "Select one or more products first."
              : `${selected.length} selected product${selected.length === 1 ? "" : "s"}`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className={adminButton.primary}
              disabled={selected.length === 0}
              onClick={() => setSelectedPublished(true)}
            >
              Yes
            </button>
            <button
              type="button"
              className={adminButton.secondary}
              disabled={selected.length === 0}
              onClick={() => setSelectedPublished(false)}
            >
              No
            </button>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-stone">
            Published products are shown on the site. Unpublished products are
            hidden.
          </p>
        </div>
      </div>
      {discountPlan ? (
        <DiscountConfirmModal
          plan={discountPlan}
          onChangeInclude={(includeExisting) =>
            setDiscountPlan({ ...discountPlan, includeExisting })
          }
          onCancel={() => setDiscountPlan(null)}
          onConfirm={confirmDiscount}
        />
      ) : null}
      {publishPlan ? (
        <PublishConfirmModal
          plan={publishPlan}
          onChangeInclude={(include) =>
            setPublishPlan({ ...publishPlan, include })
          }
          onCancel={() => setPublishPlan(null)}
          onConfirm={confirmPublish}
        />
      ) : null}
      <AdminTable headers={tableHeaders}>
        <tr className="bg-forest/60">
          <td className="px-2.5 py-2.5 sm:px-3 lg:px-4 lg:py-3">
            <AdminCheckbox
              label="All"
              checked={allVisibleSelected}
              onChange={(event) => {
                setSelected(
                  event.target.checked ? rows.map((row) => row.id) : [],
                );
              }}
            />
          </td>
          <td
            colSpan={2 + visibleColumnCount}
            className="px-2.5 py-2.5 text-xs text-stone sm:px-3 lg:px-4 lg:py-3"
          >
            {selected.length} selected
          </td>
        </tr>
        {rows.map((row) => {
          const discounted = isDiscounted(row);
          const percent = discountPercentOf(row);
          return (
            <tr key={row.id}>
              <td className="px-2.5 py-2.5 sm:px-3 lg:px-4 lg:py-3">
                <input
                  type="checkbox"
                  aria-label={`Select ${row.name}`}
                  checked={selected.includes(row.id)}
                  onChange={(event) =>
                    toggleSelected(row.id, event.target.checked)
                  }
                  className="size-4 accent-[var(--brass)]"
                />
              </td>
              <td className="px-2.5 py-2.5 text-cream sm:px-3 lg:px-4 lg:py-3">
                {row.name}
              </td>
              {columns.category ? (
                <td className="px-2.5 py-2.5 text-parchment sm:px-3 lg:px-4 lg:py-3">
                  {categoryName(row.categoryId)}
                </td>
              ) : null}
              {columns.price ? (
                <td className="px-2.5 py-2.5 text-parchment sm:px-3 lg:px-4 lg:py-3">
                  {discounted ? (
                    <span>
                      <span className="mr-2 text-stone line-through">
                        {formatEuro(row.priceCents)}
                      </span>
                      {formatEuro(row.discountPriceCents)}
                    </span>
                  ) : (
                    formatEuro(row.priceCents, row.priceDisplay)
                  )}
                </td>
              ) : null}
              {columns.discount ? (
                <td className="px-2.5 py-2.5 sm:px-3 lg:px-4 lg:py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={discounted ? "text-brass" : "text-parchment"}
                    >
                      {discounted
                        ? `Yes${percent != null ? ` · ${percent}%` : ""}`
                        : "No"}
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
              {columns.published ? (
                <td className="px-2.5 py-2.5 text-parchment sm:px-3 lg:px-4 lg:py-3">
                  {row.published ? "Yes" : "No"}
                </td>
              ) : null}
              {columns.dateAdded ? (
                <td className="whitespace-nowrap px-2.5 py-2.5 text-parchment tabular-nums sm:px-3 lg:px-4 lg:py-3">
                  {formatAdminDate(row.createdAt)}
                </td>
              ) : null}
              {columns.lastUpdated ? (
                <td className="whitespace-nowrap px-2.5 py-2.5 text-parchment tabular-nums sm:px-3 lg:px-4 lg:py-3">
                  {formatAdminDate(row.updatedAt)}
                </td>
              ) : null}
              <td className="px-2.5 py-2.5 text-right sm:px-3 lg:px-4 lg:py-3">
                <button
                  type="button"
                  className="text-[11px] uppercase tracking-[0.18em] text-brass hover:text-cream"
                  onClick={() => {
                    setIsNew(false);
                    setAttempted(false);
                    setPrice(centsToInput(row.priceCents));
                    setDiscount(centsToInput(row.discountPriceCents));
                    setDraft(row);
                  }}
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
