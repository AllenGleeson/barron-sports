"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/styles";

const navButton = buttonClass({ variant: "secondary", size: "xs" });
const currentPageButton = buttonClass({ variant: "primary", size: "xs" });

export const ADMIN_PAGE_SIZES = [25, 50, 100] as const;

/**
 * Page state for an admin table. `resetKey` should change whenever the search,
 * filters, sort or view change, so the table goes back to page 1; plain edits
 * keep the current page (clamped if rows were removed).
 */
export function usePagination<T>(rows: T[], resetKey: string) {
  const [pageSize, setPageSize] = useState<number>(ADMIN_PAGE_SIZES[0]);
  const [state, setState] = useState({ page: 1, key: resetKey });
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = state.key === resetKey ? Math.min(state.page, pageCount) : 1;
  const start = (page - 1) * pageSize;

  return {
    page,
    pageCount,
    pageSize,
    total: rows.length,
    start,
    pageRows: rows.slice(start, start + pageSize),
    setPage: (next: number) =>
      setState({ page: Math.min(Math.max(1, next), pageCount), key: resetKey }),
    setPageSize: (size: number) => {
      setPageSize(size);
      setState({ page: 1, key: resetKey });
    },
  };
}

type Pagination = ReturnType<typeof usePagination>;

/** Page numbers with gaps (0) around the current page, e.g. 1 … 4 5 6 … 12. */
function visiblePages(page: number, total: number) {
  const start = Math.max(1, page - 1);
  const end = Math.min(total, page + 1);
  const pages: number[] = [];
  if (start > 1) pages.push(1);
  if (start > 2) pages.push(0);
  for (let item = start; item <= end; item += 1) pages.push(item);
  if (end < total - 1) pages.push(0);
  if (end < total) pages.push(total);
  return pages;
}

/** "Showing 1–25 of 120", page buttons and a per-page picker, below an admin table. */
export function AdminPagination({
  pagination,
  label = "Table pages",
}: {
  pagination: Pagination;
  label?: string;
}) {
  const { page, pageCount, pageSize, total, start, setPage, setPageSize } = pagination;
  if (total === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-stone">
      <p className="tabular-nums">
        Showing {start + 1}–{Math.min(start + pageSize, total)} of {total}
      </p>
      {pageCount > 1 ? (
        <nav aria-label={label} className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            className={navButton}
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <ul className="flex flex-wrap items-center gap-1">
            {visiblePages(page, pageCount).map((item, index) =>
              item === 0 ? (
                <li key={`gap-${index}`} className="px-1.5" aria-hidden="true">
                  …
                </li>
              ) : (
                <li key={item}>
                  <button
                    type="button"
                    aria-current={item === page ? "page" : undefined}
                    className={`min-w-9 ${item === page ? currentPageButton : navButton}`}
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </button>
                </li>
              ),
            )}
          </ul>
          <button
            type="button"
            className={navButton}
            disabled={page >= pageCount}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </nav>
      ) : null}
      <label className="inline-flex items-center gap-2">
        Per page
        <select
          value={pageSize}
          onChange={(event) => setPageSize(Number(event.target.value))}
          className="border border-line bg-ink px-2 py-1.5 text-sm text-cream outline-none focus:border-brass"
        >
          {ADMIN_PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
