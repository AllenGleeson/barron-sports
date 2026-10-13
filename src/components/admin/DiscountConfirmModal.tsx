"use client";

import { useEffect } from "react";
import { adminButton } from "@/components/admin/fields";
import type { AdminProduct } from "@/lib/admin/models";
import {
  applyPercentOff,
  discountPercentOf,
  formatEuro,
} from "@/lib/admin/money";

export type DiscountPlan = {
  percent: number;
  label: string;
  fresh: AdminProduct[];
  existing: AdminProduct[];
  includeExisting: string[];
};

export function DiscountConfirmModal({
  plan,
  onChangeInclude,
  onCancel,
  onConfirm,
}: {
  plan: DiscountPlan;
  onChangeInclude: (ids: string[]) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const applyCount = plan.fresh.length + plan.includeExisting.length;
  const allExistingIncluded =
    plan.existing.length > 0 &&
    plan.existing.every((row) => plan.includeExisting.includes(row.id));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/80 px-4 py-10"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="discount-confirm-title"
        className="w-full max-w-2xl border border-line bg-moss p-5 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[11px] uppercase tracking-[0.2em] text-brass">
          Confirm discount
        </p>
        <h2
          id="discount-confirm-title"
          className="mt-2 font-display text-3xl text-cream"
        >
          Apply {plan.percent}% off
        </h2>
        <p className="mt-3 text-sm text-parchment">
          {plan.label}. {plan.fresh.length} product
          {plan.fresh.length === 1 ? "" : "s"} have no discount yet
          {plan.existing.length > 0
            ? `, and ${plan.existing.length} already have a discount.`
            : "."}
        </p>

        {plan.existing.length > 0 ? (
          <div className="mt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-stone">
                Already discounted
              </p>
              <button
                type="button"
                className={adminButton.ghost}
                onClick={() =>
                  onChangeInclude(
                    allExistingIncluded
                      ? []
                      : plan.existing.map((row) => row.id),
                  )
                }
              >
                {allExistingIncluded ? "Skip all" : "Include all"}
              </button>
            </div>
            <p className="mt-2 text-xs text-stone">
              Uncheck any product that should keep its current discount.
            </p>
            <ul className="mt-3 max-h-72 overflow-y-auto border border-line bg-ink">
              {plan.existing.map((row) => {
                const included = plan.includeExisting.includes(row.id);
                const current = discountPercentOf(row);
                const nextPrice = applyPercentOff(
                  row.priceCents as number,
                  plan.percent,
                );
                return (
                  <li
                    key={row.id}
                    className="flex items-start gap-3 border-b border-line-soft px-3 py-3 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 size-4 shrink-0 accent-[var(--brass)]"
                      checked={included}
                      aria-label={`Change discount on ${row.name}`}
                      onChange={(event) => {
                        onChangeInclude(
                          event.target.checked
                            ? [...plan.includeExisting, row.id]
                            : plan.includeExisting.filter((id) => id !== row.id),
                        );
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-cream">{row.name}</p>
                      <p className="mt-1 text-xs text-stone">
                        Current: {current != null ? `${current}%` : "sale"} ·{" "}
                        {formatEuro(row.priceCents)} →{" "}
                        {formatEuro(row.discountPriceCents)}
                      </p>
                      {included ? (
                        <p className="mt-1 text-xs text-brass">
                          New: {plan.percent}% · {formatEuro(row.priceCents)} →{" "}
                          {formatEuro(nextPrice)}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-stone">
                          Will keep the current discount
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className={adminButton.primary}
            disabled={applyCount === 0}
            onClick={onConfirm}
          >
            Apply to {applyCount} product{applyCount === 1 ? "" : "s"}
          </button>
          <button
            type="button"
            className={adminButton.secondary}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
