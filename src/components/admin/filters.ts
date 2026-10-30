/** Filter types, option lists and matchers shared by the admin list pages. */

export type FilterOption = { value: string; label: string };

export type PublishedFilter = "all" | "yes" | "no";
export type DateFilter = "all" | "today" | "7" | "30" | "older";

export const PUBLISHED_OPTIONS: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "yes", label: "Published" },
  { value: "no", label: "Unpublished" },
];

export const DATE_OPTIONS: FilterOption[] = [
  { value: "all", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "older", label: "Older than 30 days" },
];

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

export function matchesPublishedFilter(published: boolean, filter: PublishedFilter) {
  if (filter === "all") return true;
  return filter === "yes" ? published : !published;
}
