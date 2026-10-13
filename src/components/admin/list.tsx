import { adminButton, AdminInput } from "@/components/admin/fields";

export function AdminListHeader({
  title,
  count,
  search,
  onSearch,
  onAdd,
  addLabel,
}: {
  title: string;
  count: number;
  search: string;
  onSearch: (value: string) => void;
  onAdd: () => void;
  addLabel: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-4xl text-cream">{title}</h1>
        <p className="mt-2 text-sm text-parchment">{count} records</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <AdminInput
          type="search"
          placeholder="Search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          className="sm:w-56"
        />
        <button type="button" className={adminButton.primary} onClick={onAdd}>
          {addLabel}
        </button>
      </div>
    </div>
  );
}

export type AdminTableHeader =
  | string
  | { label: string; filter?: React.ReactNode; className?: string };

export function AdminTable({
  headers,
  children,
  tableClassName,
}: {
  headers: AdminTableHeader[];
  children: React.ReactNode;
  tableClassName?: string;
}) {
  return (
    <div className="mt-6 overflow-x-auto border border-line">
      <table className={`w-full text-left text-sm ${tableClassName ?? ""}`}>
        <thead className="bg-forest text-[11px] uppercase tracking-[0.14em] text-stone">
          <tr>
            {headers.map((header) => {
              const label = typeof header === "string" ? header : header.label;
              const filter = typeof header === "string" ? null : header.filter;
              const className =
                typeof header === "string" ? undefined : header.className;
              return (
                <th
                  key={label || "actions"}
                  className={`px-2 py-2.5 align-bottom font-medium sm:px-2.5 lg:px-3 lg:py-3 ${className ?? ""}`}
                >
                  <span className="block leading-tight">{label}</span>
                  {filter}
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
