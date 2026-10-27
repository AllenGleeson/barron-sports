"use client";

import { useMemo, useState } from "react";
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
import { AdminImageField } from "@/components/admin/AdminImageField";
import { AdminFormActions } from "@/components/admin/list";
import { PackageProductPicker } from "@/components/admin/PackageProductPicker";
import { ProductBrandPicker } from "@/components/admin/ProductBrandPicker";
import { fieldLabelClass } from "@/components/ui/styles";
import { dateInputToIso, isoToDateInput } from "@/lib/admin/dateInput";
import {
  isPackage,
  type AdminProduct,
  type AdminProductKind,
  type ProductCondition,
} from "@/lib/admin/models";
import { centsToInput, inputToCents } from "@/lib/admin/money";
import { packagesContaining } from "@/lib/admin/productOffer";
import { slugify } from "@/lib/admin/slug";
import { newAdminId, useAdminStore } from "@/lib/admin/store";
import { scrollToFirstInvalid, validateProductDraft } from "@/lib/admin/validation";
import { isFirearmCategory } from "@/lib/site";

export function emptyProduct({
  kind,
  categoryId,
  sortOrder,
  specialOffer = false,
}: {
  kind: AdminProductKind;
  categoryId: string;
  sortOrder: number;
  specialOffer?: boolean;
}): AdminProduct {
  const now = new Date().toISOString();
  return {
    id: newAdminId(kind),
    kind,
    slug: "",
    categoryId: kind === "package" ? "" : categoryId,
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
    quantity: null,
    stockNote: null,
    brandIds: [],
    productIds: [],
    specialOffer,
    offerLabel: null,
    highlights: [],
    offerStartsAt: null,
    offerEndsAt: null,
    published: true,
    sortOrder,
    createdAt: now,
    updatedAt: now,
  };
}

function textToLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Add/edit form for a product or a package, including its special offer details. */
export function ProductForm({
  initial,
  isNew,
  onClose,
}: {
  initial: AdminProduct;
  isNew: boolean;
  onClose: () => void;
}) {
  const { data, upsert, remove } = useAdminStore();
  const [draft, setDraft] = useState(initial);
  const [price, setPrice] = useState(centsToInput(initial.priceCents));
  const [discount, setDiscount] = useState(centsToInput(initial.discountPriceCents));
  const [highlightsText, setHighlightsText] = useState(initial.highlights.join("\n"));
  const [attempted, setAttempted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const packaged = isPackage(draft);
  const noun = packaged ? "package" : "product";
  const category = data.categories.find((row) => row.id === draft.categoryId);
  const firearm = !packaged && isFirearmCategory(category?.slug ?? "");
  const inPackages = packagesContaining(draft.id, data.products);

  // Packages are built from normal products only.
  const pickable = useMemo(
    () =>
      data.products
        .filter((row) => !isPackage(row) && row.id !== draft.id)
        .sort((a, b) => a.name.localeCompare(b.name, "en")),
    [data.products, draft.id],
  );

  const takenSlugs = data.products.filter((row) => row.id !== draft.id).map((row) => row.slug);
  const validate = () =>
    validateProductDraft({
      kind: draft.kind,
      name: draft.name,
      slug: draft.slug,
      categoryId: draft.categoryId,
      summary: draft.summary,
      imageUrl: draft.imageUrl,
      price,
      discount,
      priceDisplay: draft.priceDisplay,
      quantity: draft.quantity,
      productIds: draft.productIds,
      specialOffer: draft.specialOffer,
      offerStartsAt: draft.offerStartsAt,
      offerEndsAt: draft.offerEndsAt,
      takenSlugs,
    });
  const errors = attempted ? validate() : {};

  function save() {
    setAttempted(true);
    if (Object.keys(validate()).length) {
      window.setTimeout(scrollToFirstInvalid, 0);
      return;
    }
    upsert("products", {
      ...draft,
      name: draft.name.trim(),
      slug: slugify(draft.slug || draft.name),
      summary: draft.summary.trim(),
      imageUrl: draft.imageUrl?.trim() || null,
      priceCents: inputToCents(price),
      discountPriceCents: inputToCents(discount),
      priceDisplay: draft.priceDisplay?.trim() || null,
      caliber: firearm ? draft.caliber?.trim() || null : null,
      conditionDetail:
        draft.condition === "used" ? draft.conditionDetail?.trim() || null : null,
      badge: draft.badge?.trim() || null,
      stockNote: draft.stockNote?.trim() || null,
      productIds: packaged ? draft.productIds : [],
      offerLabel: draft.offerLabel?.trim() || null,
      highlights: packaged ? [] : textToLines(highlightsText),
      updatedAt: new Date().toISOString(),
    });
    onClose();
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <AdminFormIntro title={`${isNew ? "New" : "Edit"} ${noun}`} errors={errors} />
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {isNew ? (
          <div className="lg:col-span-2">
            <p className={fieldLabelClass}>Type</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["product", "package"] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  aria-pressed={draft.kind === kind}
                  className={draft.kind === kind ? adminButton.primary : adminButton.secondary}
                  onClick={() => setDraft({ ...draft, kind })}
                >
                  {kind === "product" ? "Product" : "Package of products"}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <AdminField label="Name" required error={errors.name}>
          <AdminInput
            required
            invalid={Boolean(errors.name)}
            value={draft.name}
            onChange={(event) => {
              const name = event.target.value;
              setDraft({ ...draft, name, slug: isNew ? slugify(name) : draft.slug });
            }}
          />
        </AdminField>
        <AdminField label="Slug" required error={errors.slug}>
          <AdminInput
            required
            invalid={Boolean(errors.slug)}
            value={draft.slug}
            onChange={(event) => setDraft({ ...draft, slug: slugify(event.target.value) })}
          />
        </AdminField>
        <AdminField
          label="Category"
          required={!packaged}
          hint={packaged ? "Used for the View Offer link. Defaults to the first product's." : undefined}
          error={errors.categoryId}
        >
          <AdminSelect
            required={!packaged}
            invalid={Boolean(errors.categoryId)}
            value={draft.categoryId}
            onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}
          >
            <option value="">{packaged ? "None" : "Select a category"}</option>
            {data.categories.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </AdminSelect>
        </AdminField>
        <div className="lg:col-span-2">
          <AdminField
            label={packaged ? "Description" : "Summary"}
            required
            error={errors.summary}
          >
            <AdminTextarea
              required
              invalid={Boolean(errors.summary)}
              rows={4}
              value={draft.summary}
              onChange={(event) => setDraft({ ...draft, summary: event.target.value })}
            />
          </AdminField>
        </div>
        <AdminImageField
          value={draft.imageUrl ?? ""}
          alt={draft.name}
          required={draft.specialOffer}
          hint={draft.specialOffer ? "Shown on the offer card." : "Leave empty for firearms lists"}
          error={errors.imageUrl}
          onChange={(imageUrl) => setDraft({ ...draft, imageUrl })}
        />

        {packaged ? (
          <PackageProductPicker
            products={pickable}
            categories={data.categories}
            brands={data.brands}
            selectedIds={draft.productIds}
            error={errors.productIds}
            onChange={(productIds) => setDraft({ ...draft, productIds })}
            onUseTotalAsOriginal={(cents) => setPrice(centsToInput(cents))}
          />
        ) : null}

        {firearm ? (
          <AdminField label="Caliber" hint=".22 LR, .223, 12g">
            <AdminInput
              value={draft.caliber ?? ""}
              onChange={(event) => setDraft({ ...draft, caliber: event.target.value })}
            />
          </AdminField>
        ) : null}
        <AdminField
          label={packaged ? "Full price (€)" : "Price (€)"}
          hint={packaged ? "Usually the items total." : undefined}
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
          label={packaged ? "Package price (€)" : "Discount price (€)"}
          hint={
            packaged
              ? "The price for the whole package. The full price shows struck through."
              : "Leave empty when the item is not on sale"
          }
          error={errors.discount}
        >
          <AdminInput
            inputMode="decimal"
            invalid={Boolean(errors.discount)}
            value={discount}
            onChange={(event) => setDiscount(event.target.value)}
          />
        </AdminField>
        <AdminField label="Price display" hint="Overrides numbers. From €450 or Inquire for Pricing.">
          <AdminInput
            value={draft.priceDisplay ?? ""}
            onChange={(event) => setDraft({ ...draft, priceDisplay: event.target.value })}
          />
        </AdminField>

        {packaged ? null : (
          <>
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
                  onChange={(event) => setDraft({ ...draft, conditionDetail: event.target.value })}
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
                    quantity: event.target.value === "" ? null : Number(event.target.value),
                  })
                }
              />
            </AdminField>
            <AdminField label="Stock note">
              <AdminInput
                value={draft.stockNote ?? ""}
                onChange={(event) => setDraft({ ...draft, stockNote: event.target.value })}
              />
            </AdminField>
            <ProductBrandPicker
              key={draft.id}
              brands={data.brands}
              selectedIds={draft.brandIds}
              onChange={(brandIds) => setDraft({ ...draft, brandIds })}
            />
          </>
        )}

        <div className="flex flex-wrap items-end gap-6 pb-2 lg:col-span-2">
          <AdminCheckbox
            label="Special offer"
            checked={draft.specialOffer}
            onChange={(event) => setDraft({ ...draft, specialOffer: event.target.checked })}
          />
          {packaged ? null : (
            <AdminCheckbox
              label="Featured"
              checked={draft.featured}
              onChange={(event) => setDraft({ ...draft, featured: event.target.checked })}
            />
          )}
          <AdminCheckbox
            label="Published"
            checked={draft.published}
            onChange={(event) => setDraft({ ...draft, published: event.target.checked })}
          />
        </div>

        {draft.specialOffer ? (
          <fieldset className="grid gap-5 border border-line bg-forest p-4 lg:col-span-2 lg:grid-cols-2">
            <legend className="px-2 text-[11px] uppercase tracking-[0.2em] text-brass">
              Special offer
            </legend>
            <AdminField
              label="Offer label"
              hint={`Shown on the offer card. Defaults to ${packaged ? "Package" : category?.name ?? "the category"}.`}
            >
              <AdminInput
                value={draft.offerLabel ?? ""}
                placeholder={packaged ? "Package" : category?.name}
                onChange={(event) => setDraft({ ...draft, offerLabel: event.target.value })}
              />
            </AdminField>
            <AdminField label="Badge" hint="Small tag on the card, e.g. Full Lineup.">
              <AdminInput
                value={draft.badge ?? ""}
                onChange={(event) => setDraft({ ...draft, badge: event.target.value })}
              />
            </AdminField>
            {packaged ? (
              <p className="text-sm text-parchment lg:col-span-2">
                The offer card lists the products in this package.
              </p>
            ) : (
              <div className="lg:col-span-2">
                <AdminField
                  label="Highlights"
                  hint="One point per line. Shown on the offer card; the summary is used if empty."
                >
                  <AdminTextarea
                    rows={4}
                    value={highlightsText}
                    onChange={(event) => setHighlightsText(event.target.value)}
                  />
                </AdminField>
              </div>
            )}
            <AdminField label="Starts" hint="Leave empty to show immediately.">
              <AdminInput
                type="date"
                value={isoToDateInput(draft.offerStartsAt)}
                onChange={(event) =>
                  setDraft({ ...draft, offerStartsAt: dateInputToIso(event.target.value) })
                }
              />
            </AdminField>
            <AdminField label="Ends" hint="Leave empty for no end date." error={errors.offerEndsAt}>
              <AdminInput
                type="date"
                invalid={Boolean(errors.offerEndsAt)}
                value={isoToDateInput(draft.offerEndsAt)}
                onChange={(event) =>
                  setDraft({ ...draft, offerEndsAt: dateInputToIso(event.target.value) })
                }
              />
            </AdminField>
          </fieldset>
        ) : null}
      </div>

      <AdminFormActions
        onCancel={onClose}
        onDelete={isNew ? undefined : () => setConfirmDelete(true)}
      />
      {confirmDelete ? (
        <AdminConfirmModal
          eyebrow="Confirm delete"
          title={`Delete ${draft.name}?`}
          confirmLabel={`Delete ${noun}`}
          danger
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            remove("products", draft.id);
            onClose();
          }}
        >
          <p>This cannot be undone.</p>
          {packaged ? (
            <p>The products in this package will not be deleted.</p>
          ) : inPackages.length > 0 ? (
            <p>
              It will be removed from {inPackages.length === 1 ? "the package" : "these packages"}:{" "}
              {inPackages.map((row) => row.name).join(", ")}.
            </p>
          ) : null}
        </AdminConfirmModal>
      ) : null}
    </form>
  );
}
