"use client";

import { useMemo, useState } from "react";
import {
  AdminCheckbox,
  AdminField,
  AdminFormIntro,
  AdminInput,
} from "@/components/admin/fields";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminImagePreview } from "@/components/admin/AdminImagePreview";
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
  SelectAllRow,
  SelectRowCell,
  useBulkFlag,
  useRowSelection,
} from "@/components/admin/bulk";
import {
  AdminFormActions,
  AdminTable,
  compareSortValues,
  useTableSort,
  type AdminTableHeader,
} from "@/components/admin/list";
import { AdminToolbar, type ActionDef, type FilterDef } from "@/components/admin/toolbar";
import type { AdminBrand } from "@/lib/admin/models";
import { slugify } from "@/lib/admin/slug";
import { newAdminId, useAdminStore } from "@/lib/admin/store";
import {
  scrollToFirstInvalid,
  validateBrandDraft,
} from "@/lib/admin/validation";

function emptyBrand(sortOrder: number): AdminBrand {
  const now = new Date().toISOString();
  return {
    id: newAdminId("brand"),
    slug: "",
    name: "",
    logoUrl: "",
    aliases: [],
    websiteUrl: null,
    sortOrder,
    published: true,
    createdAt: now,
    updatedAt: now,
  };
}

/** What each column sorts by; anything else falls back to the record's sort order. */
function sortValue(
  row: { name: string; published: boolean; createdAt: string; updatedAt: string; sortOrder: number },
  key: string,
) {
  if (key === "name") return row.name;
  if (key === "published") return row.published ? 1 : 0;
  if (key === "createdAt") return row.createdAt;
  if (key === "updatedAt") return row.updatedAt;
  return row.sortOrder;
}

export function BrandsAdmin() {
  const { data, upsert, patch, remove } = useAdminStore();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<AdminBrand | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [publishedFilter, setPublishedFilter] = useState<PublishedFilter>("all");
  const [dateAddedFilter, setDateAddedFilter] = useState<DateFilter>("all");
  const [lastUpdatedFilter, setLastUpdatedFilter] = useState<DateFilter>("all");

  const { sort, toggle: toggleSort } = useTableSort({ key: "sortOrder", direction: "asc" });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.brands
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      // Stable sort, so equal values keep the sort order above.
      .sort((a, b) =>
        compareSortValues(sortValue(a, sort.key), sortValue(b, sort.key), sort.direction),
      )
      .filter((row) => matchesPublishedFilter(row.published, publishedFilter))
      .filter((row) => matchesDateFilter(row.createdAt, dateAddedFilter))
      .filter((row) => matchesDateFilter(row.updatedAt, lastUpdatedFilter))
      .filter((row) => !q || row.name.toLowerCase().includes(q));
  }, [
    data.brands,
    dateAddedFilter,
    lastUpdatedFilter,
    publishedFilter,
    search,
    sort,
  ]);

  const selection = useRowSelection(rows);

  const bulk = useBulkFlag({
    noun: "brand",
    onApply: (field, ids, value) => patch("brands", ids, (row) => ({ ...row, [field]: value })),
  });
  const selectedRows = data.brands
    .filter((row) => selection.isSelected(row.id))
    .map((row) => ({ id: row.id, name: row.name, published: row.published }));

  function resetFilters() {
    setPublishedFilter("all");
    setDateAddedFilter("all");
    setLastUpdatedFilter("all");
  }

  const filters: FilterDef[] = [
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
  ];




  const tableHeaders: AdminTableHeader[] = [
    "Select",
    { label: "Brand", sortKey: "name" },
    {
      label: "Published",
      sortKey: "published",
      sortFirst: "desc",
      className: "hidden sm:table-cell",
    },
    {
      label: "Date added",
      sortKey: "createdAt",
      sortFirst: "desc",
      className: "hidden lg:table-cell",
    },
    {
      label: "Last updated",
      sortKey: "updatedAt",
      sortFirst: "desc",
      className: "hidden lg:table-cell",
    },
    "",
  ];

  if (draft) {
    const linkedProducts = data.products.filter((product) =>
      product.brandIds.includes(draft.id),
    ).length;

    const takenSlugs = data.brands
      .filter((row) => row.id !== draft.id)
      .map((row) => row.slug);
    const errors = attempted
      ? validateBrandDraft({
          name: draft.name,
          slug: draft.slug,
          logoUrl: draft.logoUrl,
          websiteUrl: draft.websiteUrl,
          takenSlugs,
        })
      : {};

    return (
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setAttempted(true);
          const nextErrors = validateBrandDraft({
            name: draft.name,
            slug: draft.slug,
            logoUrl: draft.logoUrl,
            websiteUrl: draft.websiteUrl,
            takenSlugs,
          });
          if (Object.keys(nextErrors).length) {
            window.setTimeout(scrollToFirstInvalid, 0);
            return;
          }
          upsert("brands", {
            ...draft,
            slug: slugify(draft.slug || draft.name),
            websiteUrl: draft.websiteUrl?.trim() || null,
            updatedAt: new Date().toISOString(),
          });
          setAttempted(false);
          setDraft(null);
          setIsNew(false);
        }}
      >
        <AdminFormIntro
          title={isNew ? "New brand" : "Edit brand"}
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
          <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_14rem] lg:col-span-2">
            <AdminField label="Logo URL" required error={errors.logoUrl}>
              <AdminInput
                required
                invalid={Boolean(errors.logoUrl)}
                value={draft.logoUrl}
                onChange={(event) =>
                  setDraft({ ...draft, logoUrl: event.target.value })
                }
              />
            </AdminField>
            <AdminImagePreview
              src={draft.logoUrl}
              alt={draft.name}
              variant="logo"
              emptyLabel="No logo"
            />
          </div>
          <AdminField
            label="Website URL"
            hint="Full address, for example https://example.com"
            error={errors.websiteUrl}
          >
            <AdminInput
              type="url"
              invalid={Boolean(errors.websiteUrl)}
              value={draft.websiteUrl ?? ""}
              onChange={(event) =>
                setDraft({ ...draft, websiteUrl: event.target.value })
              }
            />
          </AdminField>
          <AdminField label="Sort order">
            <AdminInput
              type="number"
              value={draft.sortOrder}
              onChange={(event) =>
                setDraft({ ...draft, sortOrder: Number(event.target.value) || 0 })
              }
            />
          </AdminField>
          <div className="flex items-end pb-2">
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
            confirmLabel="Delete brand"
            danger
            onCancel={() => setConfirmDelete(false)}
            onConfirm={() => {
              remove("brands", draft.id);
              setConfirmDelete(false);
              setDraft(null);
              setIsNew(false);
            }}
          >
            <p>This cannot be undone.</p>
            {linkedProducts > 0 ? (
              <p>
                {linkedProducts} product{linkedProducts === 1 ? "" : "s"}{" "}
                currently {linkedProducts === 1 ? "uses" : "use"} this brand.
              </p>
            ) : null}
          </AdminConfirmModal>
        ) : null}
      </form>
    );
  }

  return (
    <div>
      <AdminToolbar
        title="Brands"
        count={rows.length}
        total={data.brands.length}
        addLabel="Add brand"
        onAdd={() => {
          setIsNew(true);
          setAttempted(false);
          setDraft(emptyBrand(data.brands.length));
        }}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search brands"
        filters={filters}
        onResetFilters={resetFilters}
        actions={actions}
        selectedCount={selection.selected.length}
        onClearSelection={selection.clear}
      />
      <AdminTable headers={tableHeaders} sort={sort} onSort={toggleSort}>
        <SelectAllRow selection={selection} colSpan={5} />
        {rows.map((row) => (
          <tr key={row.id}>
            <SelectRowCell selection={selection} id={row.id} label={row.name} />
            <td className="px-2.5 py-2.5 sm:px-3 lg:px-4 lg:py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-20 items-center justify-center bg-cream p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={row.logoUrl}
                    alt=""
                    className="max-h-10 max-w-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-cream">{row.name}</p>
                  {row.published ? null : (
                    <p className="text-xs text-stone sm:hidden">Unpublished</p>
                  )}
                </div>
              </div>
            </td>
            <td className="px-2.5 py-2.5 text-parchment sm:px-3 lg:px-4 lg:py-3 hidden sm:table-cell">
              {row.published ? "Yes" : "No"}
            </td>
            <td className="whitespace-nowrap px-2.5 py-2.5 text-parchment tabular-nums sm:px-3 lg:px-4 lg:py-3 hidden lg:table-cell">
              {formatAdminDate(row.createdAt)}
            </td>
            <td className="whitespace-nowrap px-2.5 py-2.5 text-parchment tabular-nums sm:px-3 lg:px-4 lg:py-3 hidden lg:table-cell">
              {formatAdminDate(row.updatedAt)}
            </td>
            <td className="px-2.5 py-2.5 text-right sm:px-3 lg:px-4 lg:py-3">
              <button
                type="button"
                className="text-[11px] uppercase tracking-[0.18em] text-brass hover:text-cream"
                onClick={() => {
                  setIsNew(false);
                  setAttempted(false);
                  setDraft(row);
                }}
              >
                Edit
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>
      {bulk.modal}
    </div>
  );
}
