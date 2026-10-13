"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminField,
  AdminInput,
  AdminTextarea,
  AdminCheckbox,
  adminButton,
} from "@/components/admin/fields";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminImagePreview } from "@/components/admin/AdminImagePreview";
import {
  DateColumnFilter,
  formatAdminDate,
  matchesDateFilter,
  matchesPublishedFilter,
  PublishedColumnFilter,
  type DateFilter,
  type PublishedFilter,
} from "@/components/admin/columnFilters";
import {
  PublishConfirmModal,
  type PublishPlan,
} from "@/components/admin/PublishConfirmModal";
import {
  AdminFormActions,
  AdminListHeader,
  AdminTable,
  type AdminTableHeader,
} from "@/components/admin/list";
import { assetPath } from "@/lib/assetPath";
import type { AdminService } from "@/lib/admin/models";
import { slugify } from "@/lib/admin/slug";
import { newAdminId, useAdminStore } from "@/lib/admin/store";

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

export function ServicesAdmin() {
  const { data, upsertService, patchServices, remove } = useAdminStore();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<AdminService | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [publishPlan, setPublishPlan] = useState<PublishPlan | null>(null);
  const [publishedFilter, setPublishedFilter] = useState<PublishedFilter>("all");
  const [dateAddedFilter, setDateAddedFilter] = useState<DateFilter>("all");
  const [lastUpdatedFilter, setLastUpdatedFilter] = useState<DateFilter>("all");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.services
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
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
  ]);

  useEffect(() => {
    const visible = new Set(rows.map((row) => row.id));
    setSelected((current) => {
      const next = current.filter((id) => visible.has(id));
      return next.length === current.length ? current : next;
    });
  }, [rows]);

  const filtersAtDefault =
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

  function setSelectedPublished(published: boolean) {
    if (selected.length === 0) return;
    const items = data.services
      .filter((row) => selected.includes(row.id))
      .map((row) => ({
        id: row.id,
        name: row.title,
        published: row.published,
      }));
    setPublishPlan({
      published,
      noun: "service",
      items,
      include: items
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
    patchServices(ids, (row) => ({
      ...row,
      published: publishPlan.published,
    }));
    setPublishPlan(null);
  }

  const tableHeaders: AdminTableHeader[] = [
    "Select",
    "Service",
    {
      label: "Published",
      filter: (
        <PublishedColumnFilter
          value={publishedFilter}
          onChange={setPublishedFilter}
        />
      ),
    },
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
    "Actions",
  ];

  if (draft) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          upsertService({
            ...draft,
            slug: slugify(draft.slug || draft.title),
            updatedAt: new Date().toISOString(),
          });
          setDraft(null);
          setIsNew(false);
        }}
      >
        <h1 className="font-display text-4xl text-cream">
          {isNew ? "New service" : "Edit service"}
        </h1>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <AdminField label="Title">
            <AdminInput
              required
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
          <AdminField label="Slug">
            <AdminInput
              required
              value={draft.slug}
              onChange={(event) =>
                setDraft({ ...draft, slug: slugify(event.target.value) })
              }
            />
          </AdminField>
          <div className="lg:col-span-2">
            <AdminField label="Description">
              <AdminTextarea
                required
                rows={5}
                value={draft.description}
                onChange={(event) =>
                  setDraft({ ...draft, description: event.target.value })
                }
              />
            </AdminField>
          </div>
          <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_14rem] lg:col-span-2">
            <AdminField label="Image URL">
              <AdminInput
                required
                value={draft.imageUrl}
                onChange={(event) =>
                  setDraft({ ...draft, imageUrl: event.target.value })
                }
              />
            </AdminField>
            <AdminImagePreview src={draft.imageUrl} alt={draft.imageAlt || draft.title} />
          </div>
          <AdminField label="Image alt text">
            <AdminInput
              required
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
      <AdminListHeader
        title="Services"
        count={rows.length}
        search={search}
        onSearch={setSearch}
        addLabel="Add service"
        onAdd={() => {
          setIsNew(true);
          setDraft(emptyService(data.services.length));
        }}
      />
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className={adminButton.secondary}
          disabled={filtersAtDefault}
          onClick={() => {
            setPublishedFilter("all");
            setDateAddedFilter("all");
            setLastUpdatedFilter("all");
          }}
        >
          Reset filters
        </button>
      </div>
      <div className="mt-4 max-w-md">
        <div className="border border-line bg-forest p-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-brass">
            Set published
          </p>
          <p className="mt-3 text-sm text-parchment">
            {selected.length === 0
              ? "Select one or more services first."
              : `${selected.length} selected service${selected.length === 1 ? "" : "s"}`}
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
            Published services are shown on the site. Unpublished services are
            hidden.
          </p>
        </div>
      </div>
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
            colSpan={5}
            className="px-2.5 py-2.5 text-xs text-stone sm:px-3 lg:px-4 lg:py-3"
          >
            {selected.length} selected
          </td>
        </tr>
        {rows.map((row) => (
          <tr key={row.id}>
            <td className="px-2.5 py-2.5 sm:px-3 lg:px-4 lg:py-3">
              <input
                type="checkbox"
                aria-label={`Select ${row.title}`}
                checked={selected.includes(row.id)}
                onChange={(event) =>
                  toggleSelected(row.id, event.target.checked)
                }
                className="size-4 accent-[var(--brass)]"
              />
            </td>
            <td className="px-2.5 py-2.5 sm:px-3 lg:px-4 lg:py-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={assetPath(row.imageUrl)}
                  alt=""
                  className="h-12 w-16 object-cover"
                />
                <div>
                  <p className="text-cream">{row.title}</p>
                  <p className="line-clamp-1 text-xs text-stone">
                    {row.description}
                  </p>
                </div>
              </div>
            </td>
            <td className="px-2.5 py-2.5 text-parchment sm:px-3 lg:px-4 lg:py-3">
              {row.published ? "Yes" : "No"}
            </td>
            <td className="whitespace-nowrap px-2.5 py-2.5 text-parchment tabular-nums sm:px-3 lg:px-4 lg:py-3">
              {formatAdminDate(row.createdAt)}
            </td>
            <td className="whitespace-nowrap px-2.5 py-2.5 text-parchment tabular-nums sm:px-3 lg:px-4 lg:py-3">
              {formatAdminDate(row.updatedAt)}
            </td>
            <td className="px-2.5 py-2.5 text-right sm:px-3 lg:px-4 lg:py-3">
              <button
                type="button"
                className="text-[11px] uppercase tracking-[0.18em] text-brass hover:text-cream"
                onClick={() => {
                  setIsNew(false);
                  setDraft(row);
                }}
              >
                Edit
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
