"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminButton, AdminInput } from "@/components/admin/fields";
import { buttonClass, fieldLabelClass } from "@/components/ui/styles";
import type { FilterOption } from "@/components/admin/filters";

/**
 * The bar above every admin list: title, Add button, search, Filters and
 * Actions menus, and the current selection. Pages describe their filters and
 * actions as data; the toolbar lays them out the same way on every screen size.
 */

export type FilterDef = {
  key: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

export type ActionDef = {
  key: string;
  label: string;
  onSelect: () => void;
  /** Actions that work on ticked rows; disabled until something is selected. */
  needsSelection?: boolean;
  /** Disabled for another reason; `hint` says why. */
  disabled?: boolean;
  hint?: string;
  danger?: boolean;
};

const menuPanel =
  "absolute z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] border border-line bg-forest p-3 shadow-[0_12px_32px_rgba(0,0,0,0.45)]";

/** Closes a menu on outside click or Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

/** A button that opens a small panel below it. */
export function MenuButton({
  label,
  badge,
  align = "left",
  className = "",
  children,
}: {
  label: string;
  badge?: number;
  align?: "left" | "right";
  className?: string;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss(open, close);
  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        className={`${buttonClass({
          variant: badge ? "primary" : "secondary",
          size: "compact",
        })} gap-1.5 sm:gap-2`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        {badge ? (
          <span className="inline-flex min-w-5 items-center justify-center bg-ink px-1 text-[10px] text-brass">
            {badge}
          </span>
        ) : null}
        <span aria-hidden="true" className="text-[9px]">
          ▼
        </span>
      </button>
      {open ? (
        <div className={`${menuPanel} ${align === "right" ? "right-0" : "left-0"}`}>
          {children(close)}
        </div>
      ) : null}
    </div>
  );
}

function FiltersMenu({ filters, onReset }: { filters: FilterDef[]; onReset: () => void }) {
  const active = filters.filter((filter) => filter.value !== "all").length;
  return (
    <MenuButton label="Filters" badge={active}>
      {() => (
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {filters.map((filter) => (
              <label key={filter.key} className="block">
                <span className={fieldLabelClass}>{filter.label}</span>
                <select
                  value={filter.value}
                  onChange={(event) => filter.onChange(event.target.value)}
                  className={`mt-1.5 w-full border bg-ink px-2 py-2 text-sm outline-none ${
                    filter.value === "all"
                      ? "border-line text-cream"
                      : "border-brass text-brass"
                  }`}
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <button
            type="button"
            className={`${adminButton.ghost} mt-4`}
            disabled={active === 0}
            onClick={onReset}
          >
            Reset filters
          </button>
        </div>
      )}
    </MenuButton>
  );
}

function ActionsMenu({ actions, selectedCount }: { actions: ActionDef[]; selectedCount: number }) {
  return (
    <MenuButton label="Actions">
      {(close) => (
        <div>
          <p className="mb-2 text-xs text-stone">
            {selectedCount > 0
              ? `${selectedCount} selected`
              : "Tick rows in the table to use the greyed-out actions."}
          </p>
          <ul className="grid gap-1">
            {actions.map((action) => {
              const disabled =
                Boolean(action.disabled) || (action.needsSelection && selectedCount === 0);
              return (
                <li key={action.key}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      close();
                      action.onSelect();
                    }}
                    className={`w-full cursor-pointer px-2 py-2 text-left text-sm hover:bg-moss disabled:cursor-not-allowed disabled:opacity-40 ${
                      action.danger ? "text-red-200" : "text-cream"
                    }`}
                  >
                    {action.label}
                    {disabled && action.hint ? (
                      <span className="mt-0.5 block text-xs text-stone">{action.hint}</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </MenuButton>
  );
}

export function AdminToolbar({
  title,
  count,
  total,
  addLabel,
  onAdd,
  search,
  onSearch,
  searchPlaceholder = "Search",
  filters,
  onResetFilters,
  actions,
  selectedCount,
  onClearSelection,
  tabs,
  beforeControls,
  extra,
}: {
  title: string;
  /** Rows shown after search and filters. */
  count: number;
  /** All rows on the page, when different from `count`. */
  total?: number;
  /** The Add button; leave both out for a list with nothing to add. */
  addLabel?: string;
  onAdd?: () => void;
  search: string;
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  filters: FilterDef[];
  onResetFilters: () => void;
  actions: ActionDef[];
  selectedCount: number;
  onClearSelection: () => void;
  /** Optional view switcher shown under the title. */
  tabs?: React.ReactNode;
  /** Optional content between the tabs and the search / Filters / Actions row. */
  beforeControls?: React.ReactNode;
  /** Optional controls at the end of the toolbar (e.g. Columns). */
  extra?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-3xl text-cream sm:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-parchment">
            {total !== undefined && total !== count ? `${count} of ${total}` : count} shown
          </p>
        </div>
        {addLabel && onAdd ? (
          <button
            type="button"
            className={`${buttonClass({ size: "compact" })} shrink-0`}
            onClick={onAdd}
          >
            + {addLabel}
          </button>
        ) : null}
      </div>

      {tabs ? <div className="mt-4">{tabs}</div> : null}
      {beforeControls}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <AdminInput
          type="search"
          aria-label={searchPlaceholder}
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          className="!mt-0 w-full sm:w-72"
        />
        <FiltersMenu filters={filters} onReset={onResetFilters} />
        {actions.length > 0 ? <ActionsMenu actions={actions} selectedCount={selectedCount} /> : null}
        {selectedCount > 0 ? (
          <span className="inline-flex items-center gap-2 border border-brass/50 px-3 py-2 text-xs text-brass">
            {selectedCount} selected
            <button
              type="button"
              aria-label="Clear selection"
              className="cursor-pointer text-cream hover:text-brass"
              onClick={onClearSelection}
            >
              ✕
            </button>
          </span>
        ) : null}
        {extra ? <div className="ml-auto">{extra}</div> : null}
      </div>

      <ActiveFilters filters={filters} onReset={onResetFilters} />
    </div>
  );
}

/** Chips for the filters in use, each removable, so it's clear why rows are missing. */
function ActiveFilters({ filters, onReset }: { filters: FilterDef[]; onReset: () => void }) {
  const active = filters.filter((filter) => filter.value !== "all");
  if (active.length === 0) return null;
  return (
    <ul className="mt-3 flex flex-wrap items-center gap-2" aria-label="Active filters">
      {active.map((filter) => {
        const option = filter.options.find((item) => item.value === filter.value);
        return (
          <li
            key={filter.key}
            className="inline-flex items-center gap-2 border border-brass/50 bg-forest px-2.5 py-1 text-xs text-parchment"
          >
            <span>
              <span className="text-stone">{filter.label}:</span> {option?.label ?? filter.value}
            </span>
            <button
              type="button"
              aria-label={`Remove ${filter.label} filter`}
              className="cursor-pointer text-brass hover:text-cream"
              onClick={() => filter.onChange("all")}
            >
              ✕
            </button>
          </li>
        );
      })}
      {active.length > 1 ? (
        <li>
          <button
            type="button"
            className="cursor-pointer text-xs text-stone underline-offset-2 hover:text-cream hover:underline"
            onClick={onReset}
          >
            Clear all
          </button>
        </li>
      ) : null}
    </ul>
  );
}

/**
 * View switcher buttons. On phones they share the width evenly (count on its
 * own line) so they fit without scrolling; from tablet width they sit in a row.
 */
export function AdminTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div
      className="grid auto-cols-fr grid-flow-col gap-1.5 sm:flex sm:flex-wrap sm:gap-2"
      role="group"
      aria-label="Show"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          aria-pressed={value === tab.id}
          className={`${buttonClass({
            variant: value === tab.id ? "primary" : "secondary",
            size: "compact",
          })} min-w-0 flex-col text-center sm:flex-row sm:gap-1`}
          onClick={() => onChange(tab.id)}
        >
          <span>{tab.label}</span>
          {tab.count !== undefined ? (
            <span className="opacity-80">({tab.count})</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
