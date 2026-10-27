"use client";

import { useEffect } from "react";
import { adminButton } from "@/components/admin/fields";

export type PublishableRow = {
  id: string;
  name: string;
  published: boolean;
  specialOffer?: boolean;
};

export type PublishPlan = {
  published: boolean;
  items: PublishableRow[];
  include: string[];
  field?: "published" | "specialOffer";
  noun?: string;
};

export function PublishConfirmModal({
  plan,
  onChangeInclude,
  onCancel,
  onConfirm,
}: {
  plan: PublishPlan;
  onChangeInclude: (ids: string[]) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const field = plan.field ?? "published";
  const noun = plan.noun ?? "product";
  const flagLabel = field === "specialOffer" ? "special offer" : "published";
  const currentFlag = (row: PublishableRow) =>
    field === "specialOffer" ? Boolean(row.specialOffer) : row.published;
  const nextLabel = plan.published ? "Yes" : "No";
  const changing = plan.items.filter(
    (row) => currentFlag(row) !== plan.published,
  );
  const already = plan.items.filter(
    (row) => currentFlag(row) === plan.published,
  );
  const applyCount = plan.include.length;
  const allChangingIncluded =
    changing.length > 0 &&
    changing.every((row) => plan.include.includes(row.id));
  const nounFor = (count: number) => `${noun}${count === 1 ? "" : "s"}`;

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
        aria-labelledby="publish-confirm-title"
        className="my-auto w-full max-w-2xl border border-line bg-moss p-5 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[11px] uppercase tracking-[0.2em] text-brass">
          Confirm {flagLabel}
        </p>
        <h2
          id="publish-confirm-title"
          className="mt-2 font-display text-3xl text-cream"
        >
          Set {flagLabel} to {nextLabel}
        </h2>
        <p className="mt-3 text-sm text-parchment">
          {`${changing.length} selected ${nounFor(changing.length)} will change${
            already.length > 0
              ? `, and ${already.length} ${already.length === 1 ? "is" : "are"} already ${nextLabel.toLowerCase()}.`
              : "."
          }`}
        </p>

        {changing.length > 0 ? (
          <div className="mt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-stone">
                Will be updated
              </p>
              <button
                type="button"
                className={adminButton.ghost}
                onClick={() =>
                  onChangeInclude(
                    allChangingIncluded ? [] : changing.map((row) => row.id),
                  )
                }
              >
                {allChangingIncluded ? "Skip all" : "Include all"}
              </button>
            </div>
            <p className="mt-2 text-xs text-stone">
              Uncheck any {noun} that should keep its current status.
            </p>
            <ul className="mt-3 max-h-72 overflow-y-auto border border-line bg-ink">
              {changing.map((row) => {
                const included = plan.include.includes(row.id);
                const current = currentFlag(row);
                return (
                  <li
                    key={row.id}
                    className="flex items-start gap-3 border-b border-line-soft px-3 py-3 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 size-4 shrink-0 accent-brass"
                      checked={included}
                      aria-label={`Change ${flagLabel} on ${row.name}`}
                      onChange={(event) => {
                        onChangeInclude(
                          event.target.checked
                            ? [...plan.include, row.id]
                            : plan.include.filter((id) => id !== row.id),
                        );
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-cream">{row.name}</p>
                      {included ? (
                        <p className="mt-1 text-xs text-brass">
                          {current ? "Yes" : "No"} → {nextLabel}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-stone">
                          Will stay {current ? "Yes" : "No"}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="mt-5 text-sm text-stone">
            Nothing to change. Every selected {noun} is already {nextLabel}.
          </p>
        )}

        {already.length > 0 && changing.length > 0 ? (
          <div className="mt-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone">
              Already {nextLabel}
            </p>
            <ul className="mt-3 max-h-40 overflow-y-auto border border-line bg-ink">
              {already.map((row) => (
                <li
                  key={row.id}
                  className="border-b border-line-soft px-3 py-3 last:border-b-0"
                >
                  <p className="text-sm text-cream">{row.name}</p>
                  <p className="mt-1 text-xs text-stone">No change</p>
                </li>
              ))}
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
            Apply to {applyCount} {nounFor(applyCount)}
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
