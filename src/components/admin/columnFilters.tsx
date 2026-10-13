export type PublishedFilter = "all" | "yes" | "no";
export type DateFilter = "all" | "today" | "7" | "30" | "older";

export function formatAdminDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function startOfLocalDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function matchesDateFilter(iso: string, filter: DateFilter) {
  if (filter === "all") return true;
  const stamp = new Date(iso).getTime();
  if (Number.isNaN(stamp)) return false;
  const today = startOfLocalDay();
  const day = 24 * 60 * 60 * 1000;
  if (filter === "today") return stamp >= today;
  if (filter === "7") return stamp >= today - 6 * day;
  if (filter === "30") return stamp >= today - 29 * day;
  return stamp < today - 29 * day;
}

export function matchesPublishedFilter(
  published: boolean,
  filter: PublishedFilter,
) {
  if (filter === "all") return true;
  return filter === "yes" ? published : !published;
}

export function ColumnFilter({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-2 w-full min-w-0">
      <select
        aria-label={`Filter ${label}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full min-w-0 border px-1 py-1.5 text-[11px] font-medium normal-case tracking-normal text-cream outline-none ${
          value === "all"
            ? "border-line bg-ink"
            : "border-brass bg-ink text-brass"
        }`}
      >
        {children}
      </select>
    </div>
  );
}

export function DateColumnFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: DateFilter;
  onChange: (value: DateFilter) => void;
}) {
  return (
    <ColumnFilter
      label={label}
      value={value}
      onChange={(next) => onChange(next as DateFilter)}
    >
      <option value="all">All</option>
      <option value="today">Today</option>
      <option value="7">Last 7 days</option>
      <option value="30">Last 30 days</option>
      <option value="older">Older</option>
    </ColumnFilter>
  );
}

export function PublishedColumnFilter({
  value,
  onChange,
}: {
  value: PublishedFilter;
  onChange: (value: PublishedFilter) => void;
}) {
  return (
    <ColumnFilter
      label="Published"
      value={value}
      onChange={(next) => onChange(next as PublishedFilter)}
    >
      <option value="all">All</option>
      <option value="yes">Published</option>
      <option value="no">Unpublished</option>
    </ColumnFilter>
  );
}
