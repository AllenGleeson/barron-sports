"use client";

import { useState } from "react";
import { adminButton } from "@/components/admin/fields";

export type SortDirection = "asc" | "desc";
export type TableSort = { key: string; direction: SortDirection };

/**
 * A column heading; `className` can hide it on small screens (e.g. "hidden md:table-cell").
 * Give it a `sortKey` (and pass `sort` / `onSort` to the table) to make it a sort button.
 * `sortFirst` is the direction on first click, e.g. "desc" for dates so newest comes first.
 */
export type AdminTableHeader =
  | string
  | { label: string; className?: string; sortKey?: string; sortFirst?: SortDirection };

/**
 * Sort state for an admin table. Clicking a column sorts by it, a second click flips it,
 * and a third goes back to `initial` (the table's normal order).
 */
export function useTableSort(initial: TableSort) {
  const [sort, setSort] = useState(initial);
  function toggle(key: string, first: SortDirection = "asc") {
    setSort((current) => {
      if (current.key !== key) return { key, direction: first };
      if (current.direction === first) return { key, direction: first === "asc" ? "desc" : "asc" };
      return key === initial.key ? { key, direction: first } : initial;
    });
  }
  return { sort, toggle };
}

/** Compares two cell values for sorting. Empty values always go last. */
export function compareSortValues(
  a: string | number | null,
  b: string | number | null,
  direction: SortDirection,
) {
  if (a === null || a === "") return b === null || b === "" ? 0 : 1;
  if (b === null || b === "") return -1;
  const result =
    typeof a === "number" && typeof b === "number"
      ? a - b
      : String(a).localeCompare(String(b), "en-IE", { sensitivity: "base", numeric: true });
  return direction === "asc" ? result : -result;
}

export function AdminTable({
  headers,
  children,
  tableClassName,
  className = "mt-6",
  sort,
  onSort,
}: {
  headers: AdminTableHeader[];
  children: React.ReactNode;
  tableClassName?: string;
  /** Classes for the outer box; defaults to the usual top margin. */
  className?: string;
  sort?: TableSort;
  onSort?: (key: string, first: SortDirection) => void;
}) {
  return (
    <div className={`${className} overflow-x-auto border border-line`}>
      <table className={`w-full text-left text-sm ${tableClassName ?? ""}`}>
        <thead className="bg-forest text-[11px] uppercase tracking-[0.14em] text-stone">
          <tr>
            {headers.map((header, index) => {
              const item = typeof header === "string" ? { label: header } : header;
              const sortKey = "sortKey" in item ? item.sortKey : undefined;
              const active = sortKey && sort?.key === sortKey ? sort.direction : null;
              return (
                <th
                  key={`${index}-${item.label}`}
                  aria-sort={active ? (active === "asc" ? "ascending" : "descending") : undefined}
                  className={`px-2 py-2.5 align-bottom font-medium sm:px-2.5 lg:px-3 lg:py-3 ${
                    "className" in item ? (item.className ?? "") : ""
                  }`}
                >
                  {sortKey && onSort ? (
                    <button
                      type="button"
                      onClick={() =>
                        onSort(sortKey, ("sortFirst" in item ? item.sortFirst : undefined) ?? "asc")
                      }
                      className={`inline-flex cursor-pointer items-center gap-1 text-left uppercase leading-tight tracking-[0.14em] hover:text-cream ${
                        active ? "text-brass" : ""
                      }`}
                    >
                      {item.label}
                      <span aria-hidden="true" className={active ? "" : "opacity-40"}>
                        {active === "desc" ? "▼" : active === "asc" ? "▲" : "↕"}
                      </span>
                    </button>
                  ) : (
                    <span className="block leading-tight">{item.label}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft bg-moss">{children}</tbody>
      </table>
    </div>
  );
}

export function AdminFormActions({
  onCancel,
  onDelete,
  savingLabel = "Save",
}: {
  onCancel: () => void;
  onDelete?: () => void;
  savingLabel?: string;
}) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <button type="submit" className={adminButton.primary}>
        {savingLabel}
      </button>
      <button type="button" className={adminButton.secondary} onClick={onCancel}>
        Cancel
      </button>
      {onDelete ? (
        <button type="button" className={adminButton.danger} onClick={onDelete}>
          Delete
        </button>
      ) : null}
    </div>
  );
}
