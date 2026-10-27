"use client";

import { useState } from "react";
import { AdminCheckbox, adminButton } from "@/components/admin/fields";
import {
  PublishConfirmModal,
  type PublishableRow,
  type PublishPlan,
} from "@/components/admin/PublishConfirmModal";

/**
 * Row selection for an admin table. Only rows that are currently visible
 * (after search and filters) count as selected.
 */
export function useRowSelection(rows: { id: string }[]) {
  const [picked, setPicked] = useState<string[]>([]);
  const visible = new Set(rows.map((row) => row.id));
  const selected = picked.filter((id) => visible.has(id));
  const pickedSet = new Set(selected);

  return {
    selected,
    isSelected: (id: string) => pickedSet.has(id),
    allSelected: rows.length > 0 && rows.every((row) => pickedSet.has(row.id)),
    toggle: (id: string, checked: boolean) =>
      setPicked(checked ? [...selected, id] : selected.filter((item) => item !== id)),
    setAll: (checked: boolean) => setPicked(checked ? rows.map((row) => row.id) : []),
  };
}

type Selection = ReturnType<typeof useRowSelection>;

/** The "All / n selected" row at the top of an admin table. */
export function SelectAllRow({
  selection,
  colSpan,
}: {
  selection: Selection;
  colSpan: number;
}) {
  return (
    <tr className="bg-forest/60">
      <td className="px-2.5 py-2.5 sm:px-3 lg:px-4 lg:py-3">
        <AdminCheckbox
          label="All"
          checked={selection.allSelected}
          onChange={(event) => selection.setAll(event.target.checked)}
        />
      </td>
      <td
        colSpan={colSpan}
        className="px-2.5 py-2.5 text-xs text-stone sm:px-3 lg:px-4 lg:py-3"
      >
        {selection.selected.length} selected
      </td>
    </tr>
  );
}

/** The checkbox cell at the start of each admin table row. */
export function SelectRowCell({
  selection,
  id,
  label,
}: {
  selection: Selection;
  id: string;
  label: string;
}) {
  return (
    <td className="px-2.5 py-2.5 sm:px-3 lg:px-4 lg:py-3">
      <input
        type="checkbox"
        aria-label={`Select ${label}`}
        checked={selection.isSelected(id)}
        onChange={(event) => selection.toggle(id, event.target.checked)}
        className="size-4 accent-brass"
      />
    </td>
  );
}

/**
 * "Set published" (or "Set special offer") box for the selected rows, with the
 * confirm dialog. `onApply` receives the confirmed ids and the new value.
 */
export function BulkPublishPanel({
  noun,
  rows,
  field = "published",
  onApply,
}: {
  noun: string;
  rows: PublishableRow[];
  field?: "published" | "specialOffer";
  onApply: (ids: string[], value: boolean) => void;
}) {
  const [plan, setPlan] = useState<PublishPlan | null>(null);
  const count = rows.length;
  const current = (row: PublishableRow) =>
    field === "specialOffer" ? Boolean(row.specialOffer) : row.published;

  function start(value: boolean) {
    if (count === 0) return;
    setPlan({
      published: value,
      field,
      noun,
      items: rows,
      include: rows.filter((row) => current(row) !== value).map((row) => row.id),
    });
  }

  function confirm() {
    if (plan && plan.include.length > 0) onApply(plan.include, plan.published);
    setPlan(null);
  }

  return (
    <div className="border border-line bg-forest p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-brass">
        {field === "specialOffer" ? "Set special offer" : "Set published"}
      </p>
      <p className="mt-3 text-sm text-parchment">
        {count === 0
          ? `Select one or more ${noun}s first.`
          : `${count} selected ${noun}${count === 1 ? "" : "s"}`}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={adminButton.primary}
          disabled={count === 0}
          onClick={() => start(true)}
        >
          Yes
        </button>
        <button
          type="button"
          className={adminButton.secondary}
          disabled={count === 0}
          onClick={() => start(false)}
        >
          No
        </button>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-stone">
        {field === "specialOffer"
          ? `Special offers appear on the Special Offers pages while published.`
          : `Published ${noun}s are shown on the site. Unpublished ${noun}s are hidden.`}
      </p>
      {plan ? (
        <PublishConfirmModal
          plan={plan}
          onChangeInclude={(include) => setPlan({ ...plan, include })}
          onCancel={() => setPlan(null)}
          onConfirm={confirm}
        />
      ) : null}
    </div>
  );
}
