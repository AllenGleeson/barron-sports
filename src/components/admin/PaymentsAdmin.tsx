"use client";

import { useMemo, useState } from "react";
import { adminButton } from "@/components/admin/fields";
import { formatAdminDate, type FilterOption } from "@/components/admin/filters";
import { AdminTable, compareSortValues, useTableSort, type AdminTableHeader } from "@/components/admin/list";
import { AdminToolbar, type FilterDef } from "@/components/admin/toolbar";
import { formatEuro } from "@/lib/admin/money";
import type { AdminPayment } from "@/lib/admin/users";
import { useAdminPayments } from "@/lib/admin/usersApi";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  paymentAmount,
  stripePaymentUrl,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/course/enrolment";

const cell = "px-2.5 py-2.5 sm:px-3 lg:px-4 lg:py-3";

const METHOD_OPTIONS: FilterOption[] = [
  { value: "all", label: "All" },
  ...(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((value) => ({
    value,
    label: PAYMENT_METHOD_LABELS[value],
  })),
];

const STATUS_OPTIONS: FilterOption[] = [
  { value: "all", label: "All" },
  ...(Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((value) => ({
    value,
    label: PAYMENT_STATUS_LABELS[value],
  })),
];

/** The date a payment counts on: when it was paid, or when checkout started. */
const paymentDate = (payment: AdminPayment) => payment.paidAt ?? payment.createdAt;

/** "2026-10" for a date, in local time. */
function monthKey(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IE", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
}

function sortValue(payment: AdminPayment, key: string): string | number | null {
  switch (key) {
    case "student":
      return payment.name || payment.email;
    case "amount":
      return payment.amountCents;
    case "status":
      return PAYMENT_STATUS_LABELS[payment.status];
    default:
      return paymentDate(payment);
  }
}

/** Money actually kept: paid amounts less refunds. */
function netCents(payments: AdminPayment[]) {
  return payments
    .filter((payment) => payment.status === "paid" || payment.status === "refunded")
    .reduce((sum, payment) => sum + payment.amountCents - payment.refundedCents, 0);
}

const csvEuro = (cents: number) => (cents / 100).toFixed(2);

function csvField(value: string) {
  return /[",\n\r]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

/** Downloads the payments as a CSV file (for the accountant). */
function downloadCsv(payments: AdminPayment[]) {
  const header = [
    "Date",
    "Name",
    "Email",
    "Method",
    "Status",
    "Amount (EUR)",
    "Refunded (EUR)",
    "Recorded by",
    "Note",
    "Stripe payment",
  ];
  const lines = payments.map((payment) =>
    [
      paymentDate(payment).slice(0, 10),
      payment.name,
      payment.email,
      PAYMENT_METHOD_LABELS[payment.method],
      PAYMENT_STATUS_LABELS[payment.status],
      csvEuro(payment.amountCents),
      csvEuro(payment.refundedCents),
      payment.recordedByName ?? "",
      payment.note ?? "",
      payment.stripePaymentIntentId ?? "",
    ]
      .map(csvField)
      .join(","),
  );
  // The byte-order mark lets Excel read accented names (Áine, Siobhán) correctly.
  const blob = new Blob(["﻿" + [header.join(","), ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `course-payments-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Every course payment: online, in the shop and free, with totals and a CSV export. */
export function PaymentsAdmin() {
  const { state, reload } = useAdminPayments();
  const payments = useMemo(() => (state.status === "ready" ? state.payments : []), [state]);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const { sort, toggle: toggleSort } = useTableSort({ key: "date", direction: "desc" });

  const monthOptions: FilterOption[] = useMemo(() => {
    const months = [...new Set(payments.map((payment) => monthKey(paymentDate(payment))))].sort().reverse();
    return [{ value: "all", label: "Any month" }, ...months.map((value) => ({ value, label: monthLabel(value) }))];
  }, [payments]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments
      .filter((payment) => methodFilter === "all" || payment.method === methodFilter)
      .filter((payment) => statusFilter === "all" || payment.status === statusFilter)
      .filter((payment) => monthFilter === "all" || monthKey(paymentDate(payment)) === monthFilter)
      .filter(
        (payment) =>
          !q ||
          payment.name.toLowerCase().includes(q) ||
          payment.email.toLowerCase().includes(q) ||
          (payment.note ?? "").toLowerCase().includes(q),
      )
      .sort((a, b) => compareSortValues(sortValue(a, sort.key), sortValue(b, sort.key), sort.direction));
  }, [methodFilter, monthFilter, payments, search, sort, statusFilter]);

  const paidRows = rows.filter((payment) => payment.status === "paid" || payment.status === "refunded");
  const refundedCents = paidRows.reduce((sum, payment) => sum + payment.refundedCents, 0);
  const totals = [
    { label: "Taken", value: formatEuro(netCents(rows)) },
    { label: "Paid courses", value: String(rows.filter((payment) => payment.status === "paid").length) },
    { label: "Refunded", value: formatEuro(refundedCents) },
    { label: "Free", value: String(rows.filter((payment) => payment.method === "free").length) },
  ];

  const filters: FilterDef[] = [
    { key: "method", label: "Method", value: methodFilter, options: METHOD_OPTIONS, onChange: setMethodFilter },
    { key: "status", label: "Status", value: statusFilter, options: STATUS_OPTIONS, onChange: setStatusFilter },
    { key: "month", label: "Month", value: monthFilter, options: monthOptions, onChange: setMonthFilter },
  ];

  const headers: AdminTableHeader[] = [
    { label: "Date", sortKey: "date", sortFirst: "desc" },
    { label: "Student", sortKey: "student" },
    { label: "Method", className: "hidden md:table-cell" },
    { label: "Amount", sortKey: "amount", sortFirst: "desc" },
    { label: "Status", sortKey: "status" },
    { label: "Recorded by", className: "hidden lg:table-cell" },
    { label: "Note", className: "hidden lg:table-cell" },
    "",
  ];

  return (
    <div>
      <AdminToolbar
        title="Payments"
        count={rows.length}
        total={payments.length}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search name, email or note"
        filters={filters}
        onResetFilters={() => {
          setMethodFilter("all");
          setStatusFilter("all");
          setMonthFilter("all");
        }}
        actions={[]}
        selectedCount={0}
        onClearSelection={() => {}}
        beforeControls={
          <p className="mt-3 max-w-3xl text-sm text-stone">
            Course payments: online through Stripe, taken in the shop, or free access. Shop and free payments are
            recorded on the student&apos;s page under Users. Refund online payments in the Stripe dashboard; they
            update here automatically.
          </p>
        }
        extra={
          <button
            type="button"
            className={adminButton.secondary}
            disabled={rows.length === 0}
            onClick={() => downloadCsv(rows)}
          >
            Export CSV
          </button>
        }
      />

      {state.status === "ready" ? (
        <dl className="mt-6 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
          {totals.map((item) => (
            <div key={item.label} className="bg-moss px-4 py-3">
              <dt className="text-[11px] uppercase tracking-[0.2em] text-stone">{item.label}</dt>
              <dd className="mt-1 font-display text-2xl tabular-nums text-cream">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {state.status === "loading" ? (
        <p className="mt-6 text-sm text-stone" role="status">
          Loading payments…
        </p>
      ) : state.status === "error" ? (
        <div className="mt-6 border border-red-400/40 bg-red-950/25 px-4 py-3 text-sm text-red-200" role="alert">
          <p>{state.message}</p>
          <button type="button" className="mt-2 cursor-pointer text-brass hover:text-cream" onClick={reload}>
            Try again
          </button>
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-sm text-stone">{payments.length ? "No payments match." : "No payments yet."}</p>
      ) : (
        <AdminTable headers={headers} sort={sort} onSort={toggleSort}>
          {rows.map((payment) => {
            const stripeUrl = stripePaymentUrl(payment);
            return (
              <tr key={payment.id}>
                <td className={`${cell} whitespace-nowrap tabular-nums text-parchment`}>
                  {formatAdminDate(paymentDate(payment))}
                </td>
                <td className={cell}>
                  <p className="text-cream">{payment.name || <span className="text-stone">No name</span>}</p>
                  <p className="break-all text-xs text-stone">{payment.email}</p>
                  {payment.accountExists ? null : <p className="text-xs text-stone">Account deleted</p>}
                  <p className="text-xs text-stone md:hidden">{PAYMENT_METHOD_LABELS[payment.method]}</p>
                </td>
                <td className={`${cell} hidden text-parchment md:table-cell`}>
                  {PAYMENT_METHOD_LABELS[payment.method]}
                </td>
                <td className={`${cell} whitespace-nowrap tabular-nums text-cream`}>{paymentAmount(payment)}</td>
                <td className={`${cell} ${payment.status === "paid" ? "text-brass" : "text-parchment"}`}>
                  {PAYMENT_STATUS_LABELS[payment.status]}
                </td>
                <td className={`${cell} hidden text-parchment lg:table-cell`}>{payment.recordedByName ?? "—"}</td>
                <td className={`${cell} hidden max-w-xs whitespace-pre-line text-xs text-stone lg:table-cell`}>
                  {payment.note ?? ""}
                </td>
                <td className={`${cell} text-right`}>
                  {stripeUrl ? (
                    <a href={stripeUrl} target="_blank" rel="noreferrer" className={adminButton.ghost}>
                      Stripe ↗
                    </a>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </AdminTable>
      )}
    </div>
  );
}
