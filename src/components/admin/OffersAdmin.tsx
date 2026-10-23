"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminCheckbox,
  AdminField,
  AdminFormIntro,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  adminButton,
} from "@/components/admin/fields";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminImagePreview } from "@/components/admin/AdminImagePreview";
import { PackageProductPicker } from "@/components/admin/PackageProductPicker";
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
import {
  isPackageOffer,
  normalizeAdminOffer,
  type AdminOffer,
} from "@/lib/admin/models";
import { centsToInput, formatEuro, inputToCents } from "@/lib/admin/money";
import { isCatalogOnlyOffer, productsInPackage } from "@/lib/admin/productOffer";
import { newAdminId, useAdminStore } from "@/lib/admin/store";
import {
  scrollToFirstInvalid,
  validateOfferDraft,
} from "@/lib/admin/validation";

function emptyOffer(sortOrder: number): AdminOffer {
  const now = new Date().toISOString();
  return {
    id: newAdminId("offer"),
    kind: "offer",
    title: "",
    description: "",
    productId: null,
    productIds: [],
    categoryId: null,
    categoryLabel: "",
    imageUrl: "",
    highlights: [],
    priceCents: null,
    originalPriceCents: null,
    priceDisplay: null,
    badge: null,
    published: true,
    sortOrder,
    startsAt: null,
    endsAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

function highlightsToText(highlights: string[]) {
  return highlights.join("\n");
}

function textToHighlights(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function isoToDateInput(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function dateInputToIso(value: string) {
  if (!value.trim()) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function OffersAdmin() {
  const { data, upsertOffer, patchOffers, remove } = useAdminStore();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<AdminOffer | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [highlightsText, setHighlightsText] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [publishPlan, setPublishPlan] = useState<PublishPlan | null>(null);
  const [publishedFilter, setPublishedFilter] = useState<PublishedFilter>("all");
  const [dateAddedFilter, setDateAddedFilter] = useState<DateFilter>("all");
  const [lastUpdatedFilter, setLastUpdatedFilter] = useState<DateFilter>("all");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.offers
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .filter((row) => !isCatalogOnlyOffer(row))
      .filter((row) => matchesPublishedFilter(row.published, publishedFilter))
      .filter((row) => matchesDateFilter(row.createdAt, dateAddedFilter))
      .filter((row) => matchesDateFilter(row.updatedAt, lastUpdatedFilter))
      .filter((row) => {
        if (!q) return true;
        if (row.title.toLowerCase().includes(q)) return true;
        if (row.categoryLabel.toLowerCase().includes(q)) return true;
        if (row.description.toLowerCase().includes(q)) return true;
        if (row.highlights.some((line) => line.toLowerCase().includes(q))) return true;
        if (row.kind === "package") {
          return productsInPackage(row, data.products).some((product) =>
            product.name.toLowerCase().includes(q),
          );
        }
        return false;
      });
  }, [
    data.offers,
    data.products,
    dateAddedFilter,
    lastUpdatedFilter,
    publishedFilter,
    search,
  ]);

  const products = useMemo(
    () =>
      data.products
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, "en")),
    [data.products],
  );

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

  function openDraft(row: AdminOffer, nextIsNew: boolean) {
    setIsNew(nextIsNew);
    setAttempted(false);
    setDraft(normalizeAdminOffer(row));
    setHighlightsText(highlightsToText(row.highlights));
    setPrice(centsToInput(row.priceCents));
    setOriginalPrice(centsToInput(row.originalPriceCents));
    setConfirmDelete(false);
  }

  function setSelectedPublished(published: boolean) {
    if (selected.length === 0) return;
    const items = data.offers
      .filter((row) => selected.includes(row.id))
      .map((row) => ({
        id: row.id,
        name: row.title,
        published: row.published,
      }));
    setPublishPlan({
      published,
      noun: "offer",
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
    patchOffers(ids, (row) => ({
      ...row,
      published: publishPlan.published,
    }));
    setPublishPlan(null);
  }

  const tableHeaders: AdminTableHeader[] = [
    "Select",
    "Offer",
    "Price",
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
    const packaged = productsInPackage(draft, products);
    const linkedProduct =
      products.find((product) => product.id === draft.productId) ?? packaged[0];
    const isPackage = isPackageOffer(draft);
    const draftErrors = () =>
      validateOfferDraft({
        kind: draft.kind,
        title: draft.title,
        description: draft.description,
        categoryLabel: draft.categoryLabel,
        imageUrl: draft.imageUrl,
        highlightsText,
        productIds: draft.productIds,
        price,
        originalPrice,
        priceDisplay: draft.priceDisplay,
        startsAt: draft.startsAt,
        endsAt: draft.endsAt,
      });
    const errors = attempted ? draftErrors() : {};

    return (
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setAttempted(true);
          const nextErrors = draftErrors();
          if (Object.keys(nextErrors).length) {
            window.setTimeout(scrollToFirstInvalid, 0);
            return;
          }
          upsertOffer({
            ...draft,
            title: draft.title.trim(),
            description: draft.description.trim(),
            categoryLabel: draft.categoryLabel.trim(),
            imageUrl: draft.imageUrl.trim(),
            highlights: isPackage
              ? packaged.map((product) => product.name)
              : textToHighlights(highlightsText),
            priceCents: inputToCents(price),
            originalPriceCents: inputToCents(originalPrice),
            priceDisplay: draft.priceDisplay?.trim() || null,
            badge: draft.badge?.trim() || null,
            productId: isPackage
              ? (draft.productIds[0] ?? null)
              : draft.productId || null,
            productIds: draft.productIds,
            categoryId: draft.categoryId || null,
            updatedAt: new Date().toISOString(),
          });
          setAttempted(false);
          setDraft(null);
          setIsNew(false);
        }}
      >
        <AdminFormIntro
          title={
            isNew
              ? isPackage
                ? "New package"
                : "New special offer"
              : isPackage
                ? "Edit package"
                : "Edit special offer"
          }
          errors={errors}
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone">Type</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className={isPackage ? adminButton.secondary : adminButton.primary}
                onClick={() => setDraft({ ...draft, kind: "offer" })}
              >
                Single offer
              </button>
              <button
                type="button"
                className={isPackage ? adminButton.primary : adminButton.secondary}
                onClick={() =>
                  setDraft({
                    ...draft,
                    kind: "package",
                    productIds:
                      draft.productIds.length === 0 && draft.productId
                        ? [draft.productId]
                        : draft.productIds,
                    categoryLabel: draft.categoryLabel.trim() || "Package",
                  })
                }
              >
                Package
              </button>
            </div>
          </div>
          <AdminField
            label={isPackage ? "Name" : "Title"}
            required
            error={errors.title}
          >
            <AdminInput
              required
              invalid={Boolean(errors.title)}
              value={draft.title}
              onChange={(event) =>
                setDraft({ ...draft, title: event.target.value })
              }
            />
          </AdminField>
          <AdminField
            label="Category label"
            required
            hint={
              isPackage
                ? "Shown on the offer card, for example Package."
                : "Shown on the offer card, for example Clay Traps."
            }
            error={errors.categoryLabel}
          >
            <AdminInput
              required
              invalid={Boolean(errors.categoryLabel)}
              value={draft.categoryLabel}
              onChange={(event) =>
                setDraft({ ...draft, categoryLabel: event.target.value })
              }
            />
          </AdminField>
          {isPackage ? (
            <div className="lg:col-span-2">
              <AdminField
                label="Description"
                required
                hint="Short copy for the package on the special offers page."
                error={errors.description}
              >
                <AdminTextarea
                  required
                  invalid={Boolean(errors.description)}
                  rows={4}
                  value={draft.description}
                  onChange={(event) =>
                    setDraft({ ...draft, description: event.target.value })
                  }
                />
              </AdminField>
            </div>
          ) : null}
          <AdminField label="Shop category" hint="Used for the View Offer link.">
            <AdminSelect
              value={draft.categoryId ?? ""}
              onChange={(event) =>
                setDraft({ ...draft, categoryId: event.target.value || null })
              }
            >
              <option value="">None</option>
              {data.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          {isPackage ? null : (
            <AdminField
              label="Linked product"
              hint="Prefer this product’s category for the View Offer link."
            >
              <AdminSelect
                value={draft.productId ?? ""}
                onChange={(event) =>
                  setDraft({ ...draft, productId: event.target.value || null })
                }
              >
                <option value="">None</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
          )}
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
            <AdminImagePreview
              src={draft.imageUrl}
              alt={draft.title}
              emptyLabel="No image"
            />
          </div>
          {isPackage ? (
            <PackageProductPicker
              products={products}
              categories={data.categories}
              selectedIds={draft.productIds}
              error={errors.productIds}
              onChange={(productIds) => setDraft({ ...draft, productIds })}
              onUseTotalAsOriginal={(cents) =>
                setOriginalPrice(centsToInput(cents))
              }
            />
          ) : (
            <div className="lg:col-span-2">
              <AdminField
                label="Highlights"
                required
                hint="One point per line. These appear as the offer details."
                error={errors.highlights}
              >
                <AdminTextarea
                  required
                  invalid={Boolean(errors.highlights)}
                  rows={5}
                  value={highlightsText}
                  onChange={(event) => setHighlightsText(event.target.value)}
                />
              </AdminField>
            </div>
          )}
          <AdminField
            label={isPackage ? "Package price (€)" : "Price (€)"}
            required={!draft.priceDisplay?.trim()}
            hint="Required unless you enter a Price display such as Inquire for Pricing."
            error={errors.price}
          >
            <AdminInput
              inputMode="decimal"
              invalid={Boolean(errors.price)}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </AdminField>
          <AdminField
            label="Original price (€)"
            hint="Shown struck through when the offer is reduced."
            error={errors.originalPrice}
          >
            <AdminInput
              inputMode="decimal"
              invalid={Boolean(errors.originalPrice)}
              value={originalPrice}
              onChange={(event) => setOriginalPrice(event.target.value)}
            />
          </AdminField>
          <AdminField
            label="Price display"
            required={!price.trim()}
            hint="Overrides numbers. From €599 or Inquire for Pricing."
          >
            <AdminInput
              value={draft.priceDisplay ?? ""}
              onChange={(event) =>
                setDraft({ ...draft, priceDisplay: event.target.value })
              }
            />
          </AdminField>
          <AdminField label="Badge">
            <AdminInput
              value={draft.badge ?? ""}
              onChange={(event) =>
                setDraft({ ...draft, badge: event.target.value })
              }
            />
          </AdminField>
          <AdminField label="Starts" hint="Leave empty to show immediately.">
            <AdminInput
              type="date"
              value={isoToDateInput(draft.startsAt)}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  startsAt: dateInputToIso(event.target.value),
                })
              }
            />
          </AdminField>
          <AdminField label="Ends" hint="Leave empty for no end date." error={errors.endsAt}>
            <AdminInput
              type="date"
              invalid={Boolean(errors.endsAt)}
              value={isoToDateInput(draft.endsAt)}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  endsAt: dateInputToIso(event.target.value),
                })
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
            confirmLabel={isPackage ? "Delete package" : "Delete offer"}
            danger
            onCancel={() => setConfirmDelete(false)}
            onConfirm={() => {
              remove("offers", draft.id);
              setConfirmDelete(false);
              setDraft(null);
              setIsNew(false);
            }}
          >
            <p>This cannot be undone.</p>
            {isPackage && packaged.length > 0 ? (
              <p>
                This package includes{" "}
                {packaged.map((product) => product.name).join(", ")}. Those
                products will not be deleted.
              </p>
            ) : linkedProduct ? (
              <p>
                This offer is linked to {linkedProduct.name}. The product itself
                will not be deleted.
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
        title="Special Offers"
        count={rows.length}
        search={search}
        onSearch={setSearch}
        addLabel="Add offer"
        onAdd={() => openDraft(emptyOffer(data.offers.length), true)}
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
              ? "Select one or more offers first."
              : `${selected.length} selected offer${selected.length === 1 ? "" : "s"}`}
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
            Published offers are shown on the site. Unpublished offers are
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
            colSpan={6}
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
                <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden bg-white">
                  {row.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={assetPath(row.imageUrl)}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="text-cream">{row.title}</p>
                  <p className="mt-0.5 text-xs text-stone">
                    {row.kind === "package"
                      ? `Package${row.productIds.length ? ` · ${row.productIds.length} products` : ""}`
                      : row.categoryLabel}
                  </p>
                </div>
              </div>
            </td>
            <td className="px-2.5 py-2.5 text-parchment sm:px-3 lg:px-4 lg:py-3">
              {row.originalPriceCents != null &&
              row.priceCents != null &&
              row.priceCents < row.originalPriceCents ? (
                <span>
                  <span className="mr-2 text-stone line-through">
                    {formatEuro(row.originalPriceCents)}
                  </span>
                  {formatEuro(row.priceCents, row.priceDisplay)}
                </span>
              ) : (
                formatEuro(row.priceCents, row.priceDisplay)
              )}
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
                onClick={() => openDraft(row, false)}
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
