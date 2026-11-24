"use client";

import { useMemo, useState } from "react";
import { buttonClass } from "@/components/ui/styles";
import { AdminCheckbox } from "@/components/admin/fields";
import {
  SelectAllRow,
  SelectRowCell,
  selectableRowProps,
  useBulkFlag,
  useRowSelection,
} from "@/components/admin/bulk";
import { DiscountDialog } from "@/components/admin/DiscountDialog";
import {
  DATE_OPTIONS,
  formatAdminDate,
  matchesDateFilter,
  matchesPublishedFilter,
  PUBLISHED_OPTIONS,
  type DateFilter,
  type PublishedFilter,
} from "@/components/admin/filters";
import {
  AdminTable,
  compareSortValues,
  useTableSort,
  type AdminTableHeader,
  type SortDirection,
} from "@/components/admin/list";
import { AdminPagination, usePagination } from "@/components/admin/pagination";
import { emptyProduct, ProductForm } from "@/components/admin/ProductForm";
import {
  DISCOUNT_OPTIONS,
  matchesDiscountFilter,
  matchesOfferFilter,
  matchesPriceFilter,
  matchesTypeFilter,
  OFFER_STATUS_LABELS,
  offerOptions,
  PRICE_OPTIONS,
  TYPE_OPTIONS,
  type DiscountFilter,
  type OfferFilter,
  type PriceFilter,
  type TypeFilter,
} from "@/components/admin/productFilters";
import {
  AdminTabs,
  AdminToolbar,
  MenuButton,
  type ActionDef,
  type FilterDef,
} from "@/components/admin/toolbar";
import { isPackage, type AdminProduct } from "@/lib/admin/models";
import {
  discountPercentOf,
  formatEuro,
  isDiscounted,
  productSaleCents,
  sumProductSaleCents,
} from "@/lib/admin/money";
import { offerStatus } from "@/lib/admin/productOffer";
import { useAdminStore } from "@/lib/admin/store";

type View = "offers" | "packages" | "all";

const VIEWS: { id: View; label: string; matches: (row: AdminProduct) => boolean }[] = [
  { id: "all", label: "All products", matches: () => true },
  { id: "offers", label: "Special offers", matches: (row) => row.specialOffer },
  { id: "packages", label: "Packages", matches: isPackage },
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

/**
 * Optional columns and the screen width from which each appears. On phones
 * the table shows just one of them next to the name (price unless the user
 * picks another under "Columns"); from tablet width, any number can be ticked.
 */
const COLUMNS: Record<
  "price" | "published" | "offer" | "category" | "type" | "discount" | "dateAdded" | "lastUpdated",
  { label: string; from: "sm" | "md" | "lg" | "xl"; sortFirst: SortDirection }
> = {
  price: { label: "Price", from: "sm", sortFirst: "asc" },
  published: { label: "Published", from: "sm", sortFirst: "desc" },
  offer: { label: "Special offer", from: "md", sortFirst: "desc" },
  category: { label: "Category", from: "lg", sortFirst: "asc" },
  type: { label: "Type", from: "lg", sortFirst: "asc" },
  discount: { label: "Discount", from: "xl", sortFirst: "desc" },
  dateAdded: { label: "Date added", from: "xl", sortFirst: "desc" },
  lastUpdated: { label: "Last updated", from: "xl", sortFirst: "desc" },
};

type ColumnKey = keyof typeof COLUMNS;

/** Visibility from tablet width up (`sm:` and wider); phones are handled separately. */
const FROM_SM_UP = {
  sm: "sm:table-cell",
  md: "sm:hidden md:table-cell",
  lg: "sm:hidden lg:table-cell",
  xl: "sm:hidden xl:table-cell",
} as const;

const cell = "px-2.5 py-2.5 sm:px-3 lg:px-4 lg:py-3";

/** Live offers first when sorting the Special offer column. */
const OFFER_RANK = { live: 4, scheduled: 3, ended: 2, hidden: 1, none: 0 } as const;

/** What each column sorts by; anything else falls back to the product's sort order. */
function sortValue(row: AdminProduct, key: string, categoryNames: Map<string, string>) {
  switch (key) {
    case "name":
      return row.name;
    case "price":
      return productSaleCents(row);
    case "published":
      return row.published ? 1 : 0;
    case "offer":
      return OFFER_RANK[offerStatus(row)];
    case "category":
      return categoryNames.get(row.categoryId) ?? null;
    case "type":
      return isPackage(row) ? "Package" : "Product";
    case "discount":
      return discountPercentOf(row);
    case "dateAdded":
      return row.createdAt;
    case "lastUpdated":
      return row.updatedAt;
    default:
      return row.sortOrder;
  }
}

/** The single admin page for products, special offers and packages. */
export function ProductsAdmin() {
  const { data, patch } = useAdminStore();
  // Admin only renders in the browser, so the URL can be read on first render.
  const [view, setView] = useState<View>(viewFromUrl);
  const [editing, setEditing] = useState<{ product: AdminProduct; isNew: boolean } | null>(null);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [offerFilter, setOfferFilter] = useState<OfferFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [discountFilter, setDiscountFilter] = useState<DiscountFilter>("all");
  const [publishedFilter, setPublishedFilter] = useState<PublishedFilter>("all");
  const [dateAddedFilter, setDateAddedFilter] = useState<DateFilter>("all");
  const [lastUpdatedFilter, setLastUpdatedFilter] = useState<DateFilter>("all");
  const [mobileColumn, setMobileColumn] = useState<ColumnKey>("price");
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({
    price: true,
    published: true,
    offer: true,
    category: true,
    type: true,
    discount: true,
    dateAdded: true,
    lastUpdated: true,
  });

  const currentView = VIEWS.find((item) => item.id === view) ?? VIEWS[0];
  // The Type column is redundant on the Packages view.
  const shown = { ...columns, type: columns.type && view !== "packages" };
  const columnKeys = (Object.keys(COLUMNS) as ColumnKey[]).filter(
    (key) => !(key === "type" && view === "packages"),
  );
  const phoneColumn = columnKeys.includes(mobileColumn) ? mobileColumn : "price";
  // Ticked columns, plus the phone column (which may be unticked for wider screens).
  const shownKeys = columnKeys.filter((key) => shown[key] || key === phoneColumn);

  /** Responsive classes for a column's header and cells. */
  function columnClass(key: ColumnKey) {
    const onPhone = key === phoneColumn ? "table-cell" : "hidden";
    const fromTablet = shown[key] ? FROM_SM_UP[COLUMNS[key].from] : "sm:hidden";
    return `${onPhone} ${fromTablet}`;
  }

  const categoryName = (id: string) =>
    data.categories.find((category) => category.id === id)?.name ?? "—";

  const { sort, toggle: toggleSort } = useTableSort({ key: "sortOrder", direction: "asc" });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const byId = new Map(data.products.map((row) => [row.id, row]));
    const categoryNames = new Map(data.categories.map((category) => [category.id, category.name]));
    return data.products
      .filter(currentView.matches)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      // Stable sort, so equal values keep the sort order above.
      .sort((a, b) =>
        compareSortValues(
          sortValue(a, sort.key, categoryNames),
          sortValue(b, sort.key, categoryNames),
          sort.direction,
        ),
      )
      .filter((row) => matchesTypeFilter(row, typeFilter))
      .filter((row) => matchesOfferFilter(row, offerFilter))
      .filter((row) => categoryFilter === "all" || row.categoryId === categoryFilter)
      .filter((row) => matchesPriceFilter(row, priceFilter))
      .filter((row) => matchesDiscountFilter(row, discountFilter))
      .filter((row) => matchesPublishedFilter(row.published, publishedFilter))
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
    data.categories,
    data.products,
    dateAddedFilter,
    discountFilter,
    lastUpdatedFilter,
    offerFilter,
    priceFilter,
    publishedFilter,
    search,
    sort,
    typeFilter,
  ]);

  // Any change to what's listed or its order goes back to page 1.
  const pagination = usePagination(
    rows,
    JSON.stringify([
      view,
      search,
      sort,
      typeFilter,
      offerFilter,
      categoryFilter,
      priceFilter,
      discountFilter,
      publishedFilter,
      dateAddedFilter,
      lastUpdatedFilter,
    ]),
  );

  const selection = useRowSelection(rows);
  const selectedRows = data.products.filter((row) => selection.isSelected(row.id));
  const bulk = useBulkFlag({
    noun: "product",
    onApply: (field, ids, value) => patch("products", ids, (row) => ({ ...row, [field]: value })),
  });

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

  function changeView(next: View) {
    setView(next);
    resetFilters();
    const url = new URL(window.location.href);
    if (next === "all") url.searchParams.delete("view");
    else url.searchParams.set("view", next);
    window.history.replaceState(null, "", url);
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

  // Packages hold plain products only, and offer items can't be bundled again.
  const packageBlocker =
    selectedRows.length < 2
      ? "Tick two or more products."
      : selectedRows.some(isPackage)
        ? "Packages can't go inside another package."
        : selectedRows.some((row) => row.specialOffer)
          ? "Untick products that are already special offers."
          : null;

  function startPackageFromSelection() {
    if (packageBlocker) return;
    const totals = sumProductSaleCents(selectedRows);
    setEditing({
      isNew: true,
      product: emptyProduct({
        kind: "package",
        categoryId: "",
        sortOrder: data.products.length,
        productIds: selectedRows.map((row) => row.id),
        // Full price defaults to the products' combined price when they all have one.
        priceCents: totals.missing === 0 ? totals.total : null,
      }),
    });
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

  const filters: FilterDef[] = [
    ...(view === "packages"
      ? []
      : [
          {
            key: "type",
            label: "Type",
            value: typeFilter,
            options: TYPE_OPTIONS,
            onChange: (value: string) => setTypeFilter(value as TypeFilter),
          },
        ]),
    {
      key: "offer",
      label: "Special offer",
      value: offerFilter,
      options: offerOptions(view === "offers"),
      onChange: (value) => setOfferFilter(value as OfferFilter),
    },
    {
      key: "category",
      label: "Category",
      value: categoryFilter,
      options: [
        { value: "all", label: "All" },
        ...data.categories.map((category) => ({ value: category.id, label: category.name })),
      ],
      onChange: setCategoryFilter,
    },
    {
      key: "price",
      label: "Price",
      value: priceFilter,
      options: PRICE_OPTIONS,
      onChange: (value) => setPriceFilter(value as PriceFilter),
    },
    {
      key: "discount",
      label: "Discount",
      value: discountFilter,
      options: DISCOUNT_OPTIONS,
      onChange: (value) => setDiscountFilter(value as DiscountFilter),
    },
    {
      key: "published",
      label: "Published",
      value: publishedFilter,
      options: PUBLISHED_OPTIONS,
      onChange: (value) => setPublishedFilter(value as PublishedFilter),
    },
    {
      key: "dateAdded",
      label: "Date added",
      value: dateAddedFilter,
      options: DATE_OPTIONS,
      onChange: (value) => setDateAddedFilter(value as DateFilter),
    },
    {
      key: "lastUpdated",
      label: "Last updated",
      value: lastUpdatedFilter,
      options: DATE_OPTIONS,
      onChange: (value) => setLastUpdatedFilter(value as DateFilter),
    },
  ];

  const actions: ActionDef[] = [
    {
      key: "publish",
      label: "Publish",
      needsSelection: true,
      onSelect: () => bulk.start("published", true, selectedRows),
    },
    {
      key: "unpublish",
      label: "Unpublish",
      needsSelection: true,
      onSelect: () => bulk.start("published", false, selectedRows),
    },
    {
      key: "offer-on",
      label: "Mark as special offer",
      needsSelection: true,
      onSelect: () => bulk.start("specialOffer", true, selectedRows),
    },
    {
      key: "offer-off",
      label: "Remove from special offers",
      needsSelection: true,
      onSelect: () => bulk.start("specialOffer", false, selectedRows),
    },
    {
      key: "package",
      label: "Create package…",
      needsSelection: true,
      disabled: packageBlocker != null,
      hint: packageBlocker ?? undefined,
      onSelect: startPackageFromSelection,
    },
    { key: "discount", label: "Apply discount…", onSelect: () => setDiscountOpen(true) },
    {
      key: "discount-off",
      label: "Remove discount",
      needsSelection: true,
      onSelect: () => clearDiscount(selection.selected),
    },
  ];

  const tableHeaders: AdminTableHeader[] = [
    "Select",
    { label: "Product", sortKey: "name" },
    ...shownKeys.map((key) => ({
      label: COLUMNS[key].label,
      className: columnClass(key),
      sortKey: key,
      sortFirst: COLUMNS[key].sortFirst,
    })),
    "",
  ];

  return (
    <div>
      <AdminToolbar
        title={currentView.label}
        count={rows.length}
        total={data.products.filter(currentView.matches).length}
        addLabel={ADD_LABELS[view]}
        onAdd={startNew}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search products"
        filters={filters}
        onResetFilters={resetFilters}
        actions={actions}
        selectedCount={selection.selected.length}
        onClearSelection={selection.clear}
        tabs={
          <AdminTabs
            value={view}
            onChange={changeView}
            tabs={VIEWS.map((item) => ({
              id: item.id,
              label: item.label,
              count: data.products.filter(item.matches).length,
            }))}
          />
        }
        extra={
          <MenuButton label="Columns" align="right">
            {(close) => (
              <>
                {/* Phones: one column next to the name. */}
                <fieldset className="grid gap-2 sm:hidden">
                  <legend className="mb-2 text-xs text-stone">Show next to the name</legend>
                  {columnKeys.map((key) => (
                    <label key={key} className="inline-flex items-center gap-2 text-sm text-parchment">
                      <input
                        type="radio"
                        name="phone-column"
                        checked={phoneColumn === key}
                        onChange={() => {
                          setMobileColumn(key);
                          close();
                        }}
                        className="size-4 accent-brass"
                      />
                      {COLUMNS[key].label}
                    </label>
                  ))}
                </fieldset>
                {/* Tablet and desktop: any number of columns. */}
                <div className="hidden gap-2 sm:grid">
                  <p className="text-xs text-stone">
                    Narrower screens hide some columns automatically.
                  </p>
                  {columnKeys.map((key) => (
                    <AdminCheckbox
                      key={key}
                      label={COLUMNS[key].label}
                      checked={columns[key]}
                      onChange={(event) => setColumns({ ...columns, [key]: event.target.checked })}
                    />
                  ))}
                </div>
              </>
            )}
          </MenuButton>
        }
      />

      <AdminTable headers={tableHeaders} sort={sort} onSort={toggleSort}>
        <SelectAllRow
          selection={selection}
          colSpan={2 + shownKeys.length}
          pageIds={pagination.pageRows.map((row) => row.id)}
        />
        {pagination.pageRows.map((row) => {
          const discounted = isDiscounted(row);
          const percent = discountPercentOf(row);
          const status = offerStatus(row);
          const packaged = isPackage(row);
          const values: Record<ColumnKey, React.ReactNode> = {
            price: discounted ? (
              <span className="whitespace-nowrap">
                <span className="mr-2 text-stone line-through">{formatEuro(row.priceCents)}</span>
                {formatEuro(row.discountPriceCents)}
              </span>
            ) : (
              formatEuro(row.priceCents, row.priceDisplay)
            ),
            published: row.published ? "Yes" : "No",
            offer: (
              <span className={status === "live" ? "text-brass" : undefined}>
                {OFFER_STATUS_LABELS[status]}
              </span>
            ),
            category: row.categoryId ? categoryName(row.categoryId) : "—",
            type: packaged ? "Package" : "Product",
            discount: discounted ? (
              <span className="text-brass">{`Yes${percent != null ? ` · ${percent}%` : ""}`}</span>
            ) : (
              "No"
            ),
            dateAdded: <span className="whitespace-nowrap tabular-nums">{formatAdminDate(row.createdAt)}</span>,
            lastUpdated: <span className="whitespace-nowrap tabular-nums">{formatAdminDate(row.updatedAt)}</span>,
          };
          // Status the hidden columns would show, so narrow screens don't lose it.
          const tags = [
            !row.published ? "Unpublished" : null,
            status !== "none" ? `Offer: ${OFFER_STATUS_LABELS[status]}` : null,
            packaged ? `Package · ${row.productIds.length} products` : null,
          ].filter(Boolean);
          return (
            <tr key={row.id} {...selectableRowProps(selection, row.id)}>
              <SelectRowCell selection={selection} id={row.id} label={row.name} />
              <td className={`${cell} text-cream`}>
                {row.name}
                {packaged ? (
                  <span className="mt-0.5 hidden text-xs text-stone md:block">
                    {row.productIds.length} product{row.productIds.length === 1 ? "" : "s"}
                  </span>
                ) : null}
                {tags.length > 0 ? (
                  <span className="mt-0.5 block text-xs text-stone md:hidden">{tags.join(" · ")}</span>
                ) : null}
              </td>
              {shownKeys.map((key) => (
                <td key={key} className={`${cell} text-parchment ${columnClass(key)}`}>
                  {values[key]}
                </td>
              ))}
              <td className={`${cell} text-right`}>
                <button
                  type="button"
                  className={buttonClass({ variant: "ghost", size: "xs" })}
                  onClick={() => setEditing({ product: row, isNew: false })}
                >
                  Edit
                </button>
              </td>
            </tr>
          );
        })}
      </AdminTable>
      <AdminPagination pagination={pagination} label="Product pages" />

      {bulk.modal}
      {discountOpen ? (
        <DiscountDialog selectedIds={selection.selected} onClose={() => setDiscountOpen(false)} />
      ) : null}
    </div>
  );
}
