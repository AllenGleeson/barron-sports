"use client";

import { useMemo, useState } from "react";
import {
  AdminField,
  AdminFormIntro,
  AdminInput,
  AdminTextarea,
  AdminCheckbox,
} from "@/components/admin/fields";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminImagePreview } from "@/components/admin/AdminImagePreview";
import {
  SelectAllRow,
  SelectRowCell,
  useBulkFlag,
  useRowSelection,
} from "@/components/admin/bulk";
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
  AdminFormActions,
  AdminTable,
  compareSortValues,
  useTableSort,
  type AdminTableHeader,
} from "@/components/admin/list";
import { AdminToolbar, type ActionDef, type FilterDef } from "@/components/admin/toolbar";
import type { AdminService } from "@/lib/admin/models";
import { slugify } from "@/lib/admin/slug";
import { newAdminId, useAdminStore } from "@/lib/admin/store";
import {
  scrollToFirstInvalid,
  validateServiceDraft,
} from "@/lib/admin/validation";

function emptyService(sortOrder: number): AdminService {
  const now = new Date().toISOString();
  return {
    id: newAdminId("service"),
    slug: "",
    title: "",
    description: "",
    imageUrl: "",
    imageAlt: "",
    sortOrder,
    published: true,
    createdAt: now,
    updatedAt: now,
  };
}

/** What each column sorts by; anything else falls back to the record's sort order. */
function sortValue(
  row: { title: string; published: boolean; createdAt: string; updatedAt: string; sortOrder: number },
  key: string,
) {
  if (key === "name") return row.title;
  if (key === "published") return row.published ? 1 : 0;
  if (key === "createdAt") return row.createdAt;
  if (key === "updatedAt") return row.updatedAt;
  return row.sortOrder;
}

export function ServicesAdmin() {
  const { data, upsert, patch, remove } = useAdminStore();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<AdminService | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [publishedFilter, setPublishedFilter] = useState<PublishedFilter>("all");
  const [dateAddedFilter, setDateAddedFilter] = useState<DateFilter>("all");
  const [lastUpdatedFilter, setLastUpdatedFilter] = useState<DateFilter>("all");

  const { sort, toggle: toggleSort } = useTableSort({ key: "sortOrder", direction: "asc" });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.services
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      // Stable sort, so equal values keep the sort order above.
      .sort((a, b) =>
        compareSortValues(sortValue(a, sort.key), sortValue(b, sort.key), sort.direction),
      )
      .filter((row) => matchesPublishedFilter(row.published, publishedFilter))
      .filter((row) => matchesDateFilter(row.createdAt, dateAddedFilter))
      .filter((row) => matchesDateFilter(row.updatedAt, lastUpdatedFilter))
      .filter(
        (row) =>
          !q ||
          row.title.toLowerCase().includes(q) ||
          row.description.toLowerCase().includes(q),
      );
  }, [
    data.services,
    dateAddedFilter,
    lastUpdatedFilter,
    publishedFilter,
    search,
    sort,
  ]);

  const selection = useRowSelection(rows);

  const bulk = useBulkFlag({
    noun: "service",
    onApply: (field, ids, value) => patch("services", ids, (row) => ({ ...row, [field]: value })),
  });
  const selectedRows = data.services
    .filter((row) => selection.isSelected(row.id))
    .map((row) => ({ id: row.id, name: row.title, published: row.published }));

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
    { label: "Service", sortKey: "name" },
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
    const takenSlugs = data.services
      .filter((row) => row.id !== draft.id)
      .map((row) => row.slug);
    const errors = attempted
      ? validateServiceDraft({
          title: draft.title,
          slug: draft.slug,
          description: draft.description,
          imageUrl: draft.imageUrl,
          imageAlt: draft.imageAlt,
          takenSlugs,
        })
      : {};
    return (
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setAttempted(true);
          const nextErrors = validateServiceDraft({
            title: draft.title,
            slug: draft.slug,
            description: draft.description,
            imageUrl: draft.imageUrl,
            imageAlt: draft.imageAlt,
            takenSlugs,
          });
          if (Object.keys(nextErrors).length) {
            window.setTimeout(scrollToFirstInvalid, 0);
            return;
          }
          upsert("services", {
            ...draft,
            slug: slugify(draft.slug || draft.title),
            updatedAt: new Date().toISOString(),
          });
          setAttempted(false);
          setDraft(null);
          setIsNew(false);
        }}
      >
        <AdminFormIntro
          title={isNew ? "New service" : "Edit service"}
          errors={errors}
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <AdminField label="Title" required error={errors.title}>
            <AdminInput
              required
              invalid={Boolean(errors.title)}
              value={draft.title}
              onChange={(event) => {
                const title = event.target.value;
                setDraft({
                  ...draft,
                  title,
                  slug: isNew ? slugify(title) : draft.slug,
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
          <div className="lg:col-span-2">
            <AdminField label="Description" required error={errors.description}>
              <AdminTextarea
                required
                invalid={Boolean(errors.description)}
                rows={5}
                value={draft.description}
                onChange={(event) =>
                  setDraft({ ...draft, description: event.target.value })
                }
              />
            </AdminField>
          </div>
          <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_14rem] lg:col-span-2">
            <AdminField label="Image URL" required error={errors.imageUrl}>
              <AdminInput
                required
                invalid={Boolean(errors.imageUrl)}
                value={draft.imageUrl}
                onChange={(event) =>
                  setDraft({ ...draft, imageUrl: event.target.value })
                }
              />
            </AdminField>
            <AdminImagePreview src={draft.imageUrl} alt={draft.imageAlt || draft.title} />
          </div>
          <AdminField label="Image alt text" required error={errors.imageAlt}>
            <AdminInput
              required
              invalid={Boolean(errors.imageAlt)}
              value={draft.imageAlt}
              onChange={(event) =>
                setDraft({ ...draft, imageAlt: event.target.value })
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
            title={`Delete ${draft.title}?`}
            confirmLabel="Delete service"
            danger
            onCancel={() => setConfirmDelete(false)}
            onConfirm={() => {
              remove("services", draft.id);
              setConfirmDelete(false);
              setDraft(null);
              setIsNew(false);
            }}
          >
            <p>This cannot be undone.</p>
          </AdminConfirmModal>
        ) : null}
      </form>
    );
  }

  return (
    <div>
      <AdminToolbar
        title="Services"
        count={rows.length}
        total={data.services.length}
        addLabel="Add service"
        onAdd={() => {
          setIsNew(true);
          setAttempted(false);
          setDraft(emptyService(data.services.length));
        }}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search services"
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
            <SelectRowCell selection={selection} id={row.id} label={row.title} />
            <td className="px-2.5 py-2.5 sm:px-3 lg:px-4 lg:py-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={row.imageUrl}
                  alt=""
                  className="h-12 w-16 object-cover"
                />
                <div>
                  <p className="text-cream">{row.title}</p>
                  {row.published ? null : (
                    <p className="text-xs text-stone sm:hidden">Unpublished</p>
                  )}
                  <p className="line-clamp-1 text-xs text-stone">
                    {row.description}
                  </p>
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
