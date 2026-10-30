"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminSelect, adminButton } from "@/components/admin/fields";
import { DiscountConfirmModal, type DiscountPlan } from "@/components/admin/DiscountConfirmModal";
import { applyPercentOff, DISCOUNT_PERCENTS, isDiscounted } from "@/lib/admin/money";
import { useAdminStore } from "@/lib/admin/store";

type Target = "selected" | "category" | "brand";

/**
 * "Apply discount" from the products Actions menu: pick which products
 * (selected rows, a category or a brand) and a percentage, then confirm.
 */
export function DiscountDialog({
  selectedIds,
  onClose,
}: {
  selectedIds: string[];
  onClose: () => void;
}) {
  const { data, patch } = useAdminStore();
  const [target, setTarget] = useState<Target>(selectedIds.length > 0 ? "selected" : "category");
  const [categoryId, setCategoryId] = useState(data.categories[0]?.id ?? "");
  const brands = useMemo(() => {
    const used = new Set(data.products.flatMap((row) => row.brandIds));
    return data.brands
      .filter((brand) => used.has(brand.id))
      .sort((a, b) => a.name.localeCompare(b.name, "en"));
  }, [data.brands, data.products]);
  const [brandId, setBrandId] = useState(brands[0]?.id ?? "");
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<DiscountPlan | null>(null);

  useEffect(() => {
    if (plan) return; // the confirm dialog handles Escape itself
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, plan]);

  function targetProducts() {
    if (target === "category") return data.products.filter((row) => row.categoryId === categoryId);
    if (target === "brand") return data.products.filter((row) => row.brandIds.includes(brandId));
    return data.products.filter((row) => selectedIds.includes(row.id));
  }

  function targetLabel(count: number) {
    if (target === "category") {
      return `${data.categories.find((row) => row.id === categoryId)?.name ?? ""} category`;
    }
    if (target === "brand") return `${data.brands.find((row) => row.id === brandId)?.name ?? ""} products`;
    return `${count} selected product${count === 1 ? "" : "s"}`;
  }

  function choose(percent: number) {
    const priced = targetProducts().filter((row) => row.priceCents != null && row.priceCents > 0);
    if (priced.length === 0) {
      setError("None of those products have a price to discount.");
      return;
    }
    const existing = priced.filter(isDiscounted);
    setError("");
    setPlan({
      percent,
      label: targetLabel(priced.length),
      fresh: priced.filter((row) => !isDiscounted(row)),
      existing,
      includeExisting: existing.map((row) => row.id),
    });
  }

  if (plan) {
    return (
      <DiscountConfirmModal
        plan={plan}
        onChangeInclude={(includeExisting) => setPlan({ ...plan, includeExisting })}
        onCancel={() => setPlan(null)}
        onConfirm={() => {
          const ids = [...plan.fresh.map((row) => row.id), ...plan.includeExisting];
          if (ids.length > 0) {
            patch("products", ids, (row) => ({
              ...row,
              discountPriceCents: applyPercentOff(row.priceCents as number, plan.percent),
            }));
          }
          onClose();
        }}
      />
    );
  }

  const radio = (value: Target, label: string, disabled = false) => (
    <label
      className={`inline-flex items-center gap-2 text-sm ${disabled ? "text-stone" : "text-parchment"}`}
    >
      <input
        type="radio"
        name="discount-target"
        checked={target === value}
        disabled={disabled}
        onChange={() => setTarget(value)}
        className="accent-brass"
      />
      {label}
    </label>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/80 px-4 py-10"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="discount-dialog-title"
        className="my-auto w-full max-w-lg border border-line bg-moss p-5 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[11px] uppercase tracking-[0.2em] text-brass">Bulk action</p>
        <h2 id="discount-dialog-title" className="mt-2 font-display text-3xl text-cream">
          Apply a discount
        </h2>

        <p className="mt-5 text-sm text-parchment">Discount</p>
        <div className="mt-2 flex flex-wrap gap-4">
          {radio("selected", `Selected (${selectedIds.length})`, selectedIds.length === 0)}
          {radio("category", "A category")}
          {radio("brand", "A brand")}
        </div>
        {target === "category" ? (
          <AdminSelect
            aria-label="Category to discount"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            {data.categories.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </AdminSelect>
        ) : null}
        {target === "brand" ? (
          <AdminSelect
            aria-label="Brand to discount"
            value={brandId}
            onChange={(event) => setBrandId(event.target.value)}
          >
            {brands.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </AdminSelect>
        ) : null}

        <p className="mt-5 text-sm text-parchment">By</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {DISCOUNT_PERCENTS.map((percent) => (
            <button
              key={percent}
              type="button"
              className={adminButton.primary}
              onClick={() => choose(percent)}
            >
              {percent}%
            </button>
          ))}
        </div>
        {error ? (
          <p className="mt-3 text-sm text-red-200" role="alert">
            {error}
          </p>
        ) : null}
        <p className="mt-3 text-xs text-stone">You&apos;ll see which products change before anything is saved.</p>

        <div className="mt-6">
          <button type="button" className={adminButton.secondary} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
