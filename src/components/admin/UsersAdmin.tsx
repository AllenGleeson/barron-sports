"use client";

import { useMemo, useState } from "react";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import {
  SelectAllRow,
  SelectRowCell,
  selectableRowProps,
  useRowSelection,
} from "@/components/admin/bulk";
import {
  DATE_OPTIONS,
  formatAdminDate,
  matchesDateFilter,
  type DateFilter,
  type FilterOption,
} from "@/components/admin/filters";
import {
  AdminTable,
  compareSortValues,
  useTableSort,
  type AdminTableHeader,
} from "@/components/admin/list";
import {
  AdminTabs,
  AdminToolbar,
  type ActionDef,
  type FilterDef,
} from "@/components/admin/toolbar";
import { UserDetail } from "@/components/admin/UserDetail";
import { useAdminAuth } from "@/lib/admin/auth";
import {
  courseState,
  courseStateLabel,
  SUPER_ADMIN_NOTE,
  type AdminUser,
  type UserAccountStatus,
  type UserRole,
} from "@/lib/admin/users";
import {
  deleteUser,
  sendPasswordReset,
  updateUser,
  useAdminUsers,
} from "@/lib/admin/usersApi";
import { buttonClass } from "@/components/ui/styles";

type View = "students" | "admins";
type CourseFilter = "all" | "not-purchased" | "checkout" | "purchased" | "completed";
type AccountFilter = "all" | UserAccountStatus;

const VIEW_ROLES: Record<View, UserRole> = { students: "student", admins: "admin" };

/** The view comes from `?view=` so it survives a reload. */
function viewFromUrl(): View {
  return new URLSearchParams(window.location.search).get("view") === "admins"
    ? "admins"
    : "students";
}

const COURSE_OPTIONS: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "not-purchased", label: "Not purchased" },
  { value: "checkout", label: "Checkout started, not paid" },
  { value: "purchased", label: "In progress" },
  { value: "completed", label: "Completed" },
];

const ACCOUNT_OPTIONS: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
];

function matchesCourseFilter(row: AdminUser, filter: CourseFilter) {
  if (filter === "all") return true;
  if (filter === "checkout") return row.enrolment.status === "checkout_created";
  return courseState(row).kind === filter;
}

const COURSE_RANK = { "not-purchased": 0, purchased: 1, completed: 2 } as const;

function sortValue(row: AdminUser, key: string): string | number | null {
  switch (key) {
    case "user":
      return row.name || row.email;
    case "course":
      return COURSE_RANK[courseState(row).kind];
    case "paid":
      return row.enrolment.paidAt;
    case "account":
      return row.accountStatus === "active" ? 1 : 0;
    case "updated":
      return row.updatedAt;
    default:
      return row.createdAt;
  }
}

const cell = "px-2.5 py-2.5 sm:px-3 lg:px-4 lg:py-3";
const dateCell = `${cell} hidden whitespace-nowrap tabular-nums text-parchment md:table-cell`;

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function UsersAdmin() {
  const auth = useAdminAuth();
  const me = auth.status === "signed-in" ? auth : null;
  const { state, replace, drop, reload } = useAdminUsers();
  const users = useMemo(() => (state.status === "ready" ? state.users : []), [state]);

  // Admin only renders in the browser, so the URL can be read on first render.
  const [view, setView] = useState<View>(viewFromUrl);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creatingRole, setCreatingRole] = useState<UserRole | null>(null);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<CourseFilter>("all");
  const [accountFilter, setAccountFilter] = useState<AccountFilter>("all");
  const [joinedFilter, setJoinedFilter] = useState<DateFilter>("all");
  const [confirm, setConfirm] = useState<"resend" | "password" | "delete" | null>(null);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const { sort, toggle: toggleSort } = useTableSort({ key: "joined", direction: "desc" });
  const students = view === "students";
  const role = VIEW_ROLES[view];

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      // The super admin is shown on its own above the table.
      .filter((row) => row.role === role && !row.superAdmin)
      .filter((row) => matchesCourseFilter(row, courseFilter))
      .filter((row) => accountFilter === "all" || row.accountStatus === accountFilter)
      .filter((row) => matchesDateFilter(row.createdAt, joinedFilter))
      .filter(
        (row) =>
          !q ||
          row.name.toLowerCase().includes(q) ||
          row.email.toLowerCase().includes(q) ||
          (row.phone ?? "").replace(/\s/g, "").includes(q.replace(/\s/g, "")),
      )
      .sort(
        (a, b) =>
          compareSortValues(sortValue(a, sort.key), sortValue(b, sort.key), sort.direction) ||
          a.email.localeCompare(b.email, "en-IE"),
      );
  }, [accountFilter, courseFilter, joinedFilter, role, search, sort, users]);

  const selection = useRowSelection(rows);
  const superAdmins = students ? [] : users.filter((row) => row.superAdmin);
  const selectedRows = users.filter((row) => selection.isSelected(row.id));
  const notCompleted = selectedRows.filter((row) => !row.enrolment.completedAt);
  const activeAdmins = users.filter((row) => row.role === "admin" && row.accountStatus === "active");

  /** Why removing admin access from these accounts isn't allowed, if it isn't. */
  function lockoutReason(ids: string[]) {
    if (role !== "admin") return null;
    if (me && ids.includes(me.id)) return "Untick your own account.";
    const remaining = activeAdmins.filter((row) => !ids.includes(row.id));
    return remaining.length === 0 ? "Keep at least one active admin." : null;
  }
  const selectionLockout = lockoutReason(selection.selected);

  /** Runs a change for each selected account, one at a time, and reports the result. */
  async function runBulk(
    label: string,
    fn: (user: AdminUser) => Promise<void>,
    done: (count: number) => string,
  ) {
    setBusy(true);
    setNotice(null);
    const failures: string[] = [];
    let count = 0;
    for (const user of selectedRows) {
      try {
        await fn(user);
        count += 1;
      } catch (error) {
        failures.push(`${user.name || user.email}: ${(error as Error).message}`);
      }
    }
    setBusy(false);
    setNotice(
      failures.length
        ? { text: `${label}: ${done(count)} ${failures.join(" ")}`, error: true }
        : { text: done(count) },
    );
  }

  function setAccountStatus(status: UserAccountStatus) {
    void runBulk(
      status === "active" ? "Enable" : "Disable",
      async (user) => replace(await updateUser(user.id, { accountStatus: status })),
      (count) => `${plural(count, "account")} ${status === "active" ? "enabled" : "disabled"}.`,
    );
  }

  function resetFilters() {
    setCourseFilter("all");
    setAccountFilter("all");
    setJoinedFilter("all");
  }

  function changeView(next: View) {
    setView(next);
    resetFilters();
    selection.clear();
    setNotice(null);
    const url = new URL(window.location.href);
    if (next === "students") url.searchParams.delete("view");
    else url.searchParams.set("view", next);
    window.history.replaceState(null, "", url);
  }

  const open = users.find((row) => row.id === openId) ?? null;
  if (creatingRole || open) {
    return (
      <UserDetail
        key={open?.id ?? `new-${creatingRole}`}
        user={open}
        newRole={creatingRole ?? "student"}
        isMe={Boolean(open && me && open.id === me.id)}
        readOnly={Boolean(open?.superAdmin && !me?.isSuperAdmin)}
        otherActiveAdmins={activeAdmins.filter((row) => row.id !== open?.id).length}
        onClose={() => {
          setCreatingRole(null);
          setOpenId(null);
        }}
        onSaved={(saved) => {
          replace(saved);
          setCreatingRole(null);
          setOpenId(saved.id);
          // Follow the user to the tab that now lists them.
          const savedView: View = saved.role === "admin" ? "admins" : "students";
          if (savedView !== view) changeView(savedView);
        }}
        onDeleted={(user) => {
          drop([user.id]);
          setOpenId(null);
          setNotice({ text: `${user.name || user.email} deleted.` });
        }}
      />
    );
  }

  const filters: FilterDef[] = [
    ...(students
      ? [
          {
            key: "course",
            label: "Course",
            value: courseFilter,
            options: COURSE_OPTIONS,
            onChange: (value: string) => setCourseFilter(value as CourseFilter),
          },
        ]
      : []),
    {
      key: "account",
      label: "Account",
      value: accountFilter,
      options: ACCOUNT_OPTIONS,
      onChange: (value) => setAccountFilter(value as AccountFilter),
    },
    {
      key: "joined",
      label: "Joined",
      value: joinedFilter,
      options: DATE_OPTIONS,
      onChange: (value) => setJoinedFilter(value as DateFilter),
    },
  ];

  const actions: ActionDef[] = [
    ...(students
      ? [
          {
            key: "resend",
            label: "Resend completion record",
            needsSelection: true,
            disabled: busy || notCompleted.length > 0,
            hint:
              notCompleted.length > 0
                ? "Untick students who haven't completed the course."
                : "Tick students who have completed the course.",
            onSelect: () => setConfirm("resend"),
          },
        ]
      : []),
    {
      key: "password",
      label: "Send password reset email",
      needsSelection: true,
      disabled: busy,
      onSelect: () => setConfirm("password"),
    },
    {
      key: "enable",
      label: "Enable accounts",
      needsSelection: true,
      disabled: busy,
      onSelect: () => setAccountStatus("active"),
    },
    {
      key: "disable",
      label: "Disable accounts",
      needsSelection: true,
      disabled: busy || selectionLockout != null,
      hint: selectionLockout ?? undefined,
      onSelect: () => setAccountStatus("disabled"),
    },
    {
      key: "delete",
      label: "Delete users…",
      needsSelection: true,
      disabled: busy || selectionLockout != null,
      hint: selectionLockout ?? undefined,
      danger: true,
      onSelect: () => setConfirm("delete"),
    },
  ];

  const tableHeaders: AdminTableHeader[] = [
    "Select",
    { label: students ? "Student" : "Admin", sortKey: "user" },
    ...(students
      ? [
          { label: "Course", sortKey: "course", sortFirst: "desc" as const },
          {
            label: "Date paid",
            sortKey: "paid",
            sortFirst: "desc" as const,
            className: "hidden md:table-cell",
          },
        ]
      : []),
    {
      label: "Account",
      sortKey: "account",
      sortFirst: "desc",
      className: students ? "hidden md:table-cell" : undefined,
    },
    { label: "Joined", sortKey: "joined", sortFirst: "desc", className: "hidden md:table-cell" },
    {
      label: "Last updated",
      sortKey: "updated",
      sortFirst: "desc",
      className: "hidden md:table-cell",
    },
    "",
  ];

  // Same columns as the main table, without the checkbox or sorting.
  const superAdminHeaders: AdminTableHeader[] = tableHeaders.map((header) => {
    if (typeof header === "string") return header === "Select" ? "" : header;
    return {
      ...header,
      label: header.sortKey === "user" ? "Super admin" : header.label,
      sortKey: undefined,
    };
  });

  function userRow(row: AdminUser) {
    const course = courseState(row);
    const isMe = me?.id === row.id;
    const tags = [
      students && row.accountStatus === "disabled" ? "Disabled" : null,
      students && row.enrolment.paidAt ? `Paid ${formatAdminDate(row.enrolment.paidAt)}` : null,
    ].filter(Boolean);
    return (
      <tr key={row.id} {...(row.superAdmin ? {} : selectableRowProps(selection, row.id))}>
        {row.superAdmin ? (
          <td className={`${cell} text-xs text-stone`} title={SUPER_ADMIN_NOTE}>
            <span aria-label="Locked">🔒</span>
          </td>
        ) : (
          <SelectRowCell selection={selection} id={row.id} label={row.name || row.email} />
        )}
        <td className={cell}>
          <p className="text-cream">
            {row.name || <span className="text-stone">No name</span>}
            {isMe ? <span className="ml-2 text-xs text-brass">You</span> : null}
          </p>
          <p className="break-all text-xs text-stone">{row.email}</p>
          {tags.length > 0 ? (
            <p className="mt-0.5 text-xs text-stone md:hidden">{tags.join(" · ")}</p>
          ) : null}
        </td>
        {students ? (
          <>
            <td className={`${cell} text-parchment`}>
              <span className={course.kind === "completed" ? "text-brass" : ""}>
                {courseStateLabel(course)}
              </span>
              {course.kind === "completed" ? (
                <span className="block text-xs text-stone">{formatAdminDate(course.completedAt)}</span>
              ) : row.enrolment.status === "checkout_created" ? (
                <span className="block text-xs text-stone">Checkout started</span>
              ) : null}
            </td>
            <td className={`${cell} hidden whitespace-nowrap tabular-nums text-parchment md:table-cell`}>
              {row.enrolment.paidAt ? formatAdminDate(row.enrolment.paidAt) : "—"}
            </td>
          </>
        ) : null}
        <td className={`${cell} text-parchment ${students ? "hidden md:table-cell" : ""}`}>
          {row.accountStatus === "active" ? "Active" : "Disabled"}
        </td>
        <td className={dateCell}>{formatAdminDate(row.createdAt)}</td>
        <td className={dateCell}>{formatAdminDate(row.updatedAt)}</td>
        <td className={`${cell} text-right`}>
          <button
            type="button"
            className={buttonClass({ variant: "ghost", size: "xs" })}
            onClick={() => setOpenId(row.id)}
          >
            View
          </button>
        </td>
      </tr>
    );
  }

  return (
    <div>
      <AdminToolbar
        title="Users"
        count={rows.length}
        total={users.filter((row) => row.role === role && !row.superAdmin).length}
        addLabel={students ? "Add student" : "Add admin"}
        onAdd={() => setCreatingRole(role)}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search name, email or phone"
        filters={filters}
        onResetFilters={resetFilters}
        actions={actions}
        selectedCount={selection.selected.length}
        onClearSelection={selection.clear}
        beforeControls={
          <>
            <p className="mt-3 text-sm text-stone">
              {students
                ? "Students have no admin access. They can only use their own account and the course."
                : "Admins have full access to the admin area, including every user account except the super admin, which only the super admin can change."}
            </p>
            {superAdmins.length > 0 ? (
              <section aria-labelledby="super-admin-heading">
                <h2
                  id="super-admin-heading"
                  className="mt-6 text-[11px] uppercase tracking-[0.2em] text-stone"
                >
                  Super admin
                </h2>
                <AdminTable className="mt-2" headers={superAdminHeaders}>
                  {superAdmins.map(userRow)}
                </AdminTable>
              </section>
            ) : null}
          </>
        }
        tabs={
          <AdminTabs
            value={view}
            onChange={changeView}
            tabs={[
              {
                id: "students" as const,
                label: "Students",
                count: users.filter((row) => row.role === "student").length,
              },
              {
                id: "admins" as const,
                label: "Admins",
                count: users.filter((row) => row.role === "admin").length,
              },
            ]}
          />
        }
      />
      {busy ? (
        <p className="mt-4 text-sm text-stone" role="status">
          Working…
        </p>
      ) : notice ? (
        <p
          className={`mt-4 text-sm ${notice.error ? "text-red-300" : "text-brass"}`}
          role={notice.error ? "alert" : "status"}
        >
          {notice.text}
        </p>
      ) : null}

      {students ? null : (
        <h2 className="mt-6 text-[11px] uppercase tracking-[0.2em] text-stone">Admins</h2>
      )}
      {state.status === "loading" ? (
        <p className="mt-6 text-sm text-stone" role="status">
          Loading users…
        </p>
      ) : state.status === "error" ? (
        <div className="mt-6 border border-red-400/40 bg-red-950/25 px-4 py-3 text-sm text-red-200" role="alert">
          <p>{state.message}</p>
          <button type="button" className="mt-2 cursor-pointer text-brass hover:text-cream" onClick={reload}>
            Try again
          </button>
        </div>
      ) : (
        <AdminTable
          className={students ? "mt-6" : "mt-2"}
          headers={tableHeaders}
          sort={sort}
          onSort={toggleSort}
        >
          <SelectAllRow selection={selection} colSpan={tableHeaders.length - 1} />
          {rows.map(userRow)}
        </AdminTable>
      )}

      {confirm === "resend" ? (
        <AdminConfirmModal
          eyebrow="Resend record"
          title={`Resend the completion record to ${plural(selectedRows.length, "student")}?`}
          confirmLabel="Resend"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            setConfirm(null);
            setNotice({
              text: `Record resent to ${plural(selectedRows.length, "student")} (preview: record emails aren't sent yet).`,
            });
          }}
        >
          <p>Each record goes to the student&apos;s account email.</p>
        </AdminConfirmModal>
      ) : null}
      {confirm === "password" ? (
        <AdminConfirmModal
          eyebrow="Password reset"
          title={`Send a password reset email to ${plural(selectedRows.length, "user")}?`}
          confirmLabel="Send"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            setConfirm(null);
            void runBulk(
              "Password reset",
              async (user) => {
                await sendPasswordReset(user.id);
              },
              (count) => `Password reset email sent to ${plural(count, "user")}.`,
            );
          }}
        >
          <p>
            Each user gets a link at their account email to choose a new password. Their current
            password keeps working until they do.
          </p>
          <p className="text-stone">
            Supabase&apos;s built-in email only sends a few emails an hour, so large batches may fail.
          </p>
        </AdminConfirmModal>
      ) : null}
      {confirm === "delete" ? (
        <AdminConfirmModal
          eyebrow="Confirm delete"
          title={`Delete ${plural(selectedRows.length, "user")}?`}
          confirmLabel="Delete users"
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            setConfirm(null);
            const ids: string[] = [];
            void runBulk(
              "Delete",
              async (user) => {
                await deleteUser(user.id);
                ids.push(user.id);
              },
              (count) => `${plural(count, "user")} deleted.`,
            ).then(() => {
              drop(ids);
              selection.clear();
            });
          }}
        >
          <p>
            {students
              ? "Their account and course enrolment will be removed. This can't be undone."
              : "They will lose access to the admin area straight away. This can't be undone."}
          </p>
        </AdminConfirmModal>
      ) : null}
    </div>
  );
}
