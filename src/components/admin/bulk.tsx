"use client";

import { useState, type MouseEvent } from "react";
import { AdminCheckbox } from "@/components/admin/fields";
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
    /** Ticks or unticks some rows (e.g. one page), leaving the others as they are. */
    setMany: (ids: string[], checked: boolean) => {
      const changing = new Set(ids);
      const kept = selected.filter((id) => !changing.has(id));
      setPicked(checked ? [...kept, ...ids] : kept);
    },
    total: rows.length,
    clear: () => setPicked([]),
  };
}

type Selection = ReturnType<typeof useRowSelection>;

/**
 * The "All / n selected" row at the top of an admin table. On a paged table,
 * pass `pageIds`: the checkbox then ticks the current page, with a link to
 * select every matching row across all pages.
 */
export function SelectAllRow({
  selection,
  colSpan,
  pageIds,
}: {
  selection: Selection;
  colSpan: number;
  pageIds?: string[];
}) {
  const paged = pageIds != null && pageIds.length < selection.total;
  const pageSelected = paged
    ? pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id))
    : selection.allSelected;
  const link = "cursor-pointer text-brass hover:text-cream";

  return (
    <tr className="bg-forest/60">
      <td className="px-2.5 py-2.5 sm:px-3 lg:px-4 lg:py-3">
        <AdminCheckbox
          label={paged ? "Page" : "All"}
          checked={pageSelected}
          onChange={(event) =>
            paged
              ? selection.setMany(pageIds, event.target.checked)
              : selection.setAll(event.target.checked)
          }
        />
      </td>
      <td
        colSpan={colSpan}
        className="px-2.5 py-2.5 text-xs text-stone sm:px-3 lg:px-4 lg:py-3"
      >
        {selection.selected.length} selected
        {paged && pageSelected && !selection.allSelected ? (
          <>
            {" · "}
            <button type="button" className={link} onClick={() => selection.setAll(true)}>
              Select all {selection.total}
            </button>
          </>
        ) : null}
        {paged && selection.selected.length > 0 ? (
          <>
            {" · "}
            <button type="button" className={link} onClick={selection.clear}>
              Clear
            </button>
          </>
        ) : null}
      </td>
    </tr>
  );
}

/**
 * Props for an admin table `<tr>` so clicking anywhere on the row ticks it.
 * Clicks on the row's own controls (checkbox, Edit button, links) are left alone.
 */
export function selectableRowProps(selection: Selection, id: string) {
  const selected = selection.isSelected(id);
  return {
    "aria-selected": selected,
    className: `cursor-pointer transition-colors ${
      selected ? "bg-forest/50" : "hover:bg-forest/25"
    }`,
    onClick: (event: MouseEvent<HTMLTableRowElement>) => {
      const target = event.target as HTMLElement;
      if (target.closest("button, a, input, label, select, textarea")) return;
      // Don't toggle when the user was dragging to select text.
      if (window.getSelection()?.toString()) return;
      selection.toggle(id, !selected);
    },
  };
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
 * Bulk "published" / "special offer" changes with a confirm dialog.
 * `start` opens the dialog for the given rows; render `modal` somewhere on the page.
 */
export function useBulkFlag({
  noun,
  onApply,
}: {
  noun: string;
  onApply: (field: "published" | "specialOffer", ids: string[], value: boolean) => void;
}) {
  const [plan, setPlan] = useState<PublishPlan | null>(null);

  function start(field: "published" | "specialOffer", value: boolean, rows: PublishableRow[]) {
    if (rows.length === 0) return;
    const current = (row: PublishableRow) =>
      field === "specialOffer" ? Boolean(row.specialOffer) : row.published;
    setPlan({
      published: value,
      field,
      noun,
      items: rows,
      include: rows.filter((row) => current(row) !== value).map((row) => row.id),
    });
  }

  const modal = plan ? (
    <PublishConfirmModal
      plan={plan}
      onChangeInclude={(include) => setPlan({ ...plan, include })}
      onCancel={() => setPlan(null)}
      onConfirm={() => {
        if (plan.include.length > 0) {
          onApply(plan.field ?? "published", plan.include, plan.published);
        }
        setPlan(null);
      }}
    />
  ) : null;

  return { start, modal };
}
