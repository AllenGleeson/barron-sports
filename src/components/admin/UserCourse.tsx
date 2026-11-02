"use client";

import { useState } from "react";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminField, AdminInput, AdminSelect, AdminTextarea, adminButton } from "@/components/admin/fields";
import { formatAdminDate } from "@/components/admin/filters";
import { AdminTable } from "@/components/admin/list";
import { centsToInput, formatEuro, inputToCents } from "@/lib/admin/money";
import { courseState, courseStateLabel, type AdminUser } from "@/lib/admin/users";
import { refundPayment, updateUser } from "@/lib/admin/usersApi";
import { formatRecordDate } from "@/lib/course/certificate";
import {
  courseEnrolmentOffer,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  paymentAmount,
  stripePaymentUrl,
  type CoursePayment,
} from "@/lib/course/enrolment";

const sectionClass = "mt-10 border-t border-line pt-8";
const cell = "px-2.5 py-2.5 sm:px-3 lg:px-4 lg:py-3";
const labelClass = "text-[11px] uppercase tracking-[0.2em] text-stone";

type Message = { text: string; error?: boolean } | null;

type UserCourseProps = {
  user: AdminUser;
  onSaved: (user: AdminUser) => void;
};

/** A student's course: access, progress per lesson, payments, and what an admin can change. */
export function UserCourse({ user, onSaved }: UserCourseProps) {
  const [message, setMessage] = useState<Message>(null);
  const state = courseState(user);
  const { enrolment } = user;

  const details = [
    {
      label: "Access",
      value:
        enrolment.status === "paid"
          ? "Open"
          : enrolment.status === "revoked"
            ? `Removed${enrolment.revokedAt ? ` ${formatAdminDate(enrolment.revokedAt)}` : ""}`
            : "Not bought",
    },
    ...(enrolment.revokeReason ? [{ label: "Reason", value: enrolment.revokeReason }] : []),
    { label: "Enrolled", value: enrolment.paidAt ? formatRecordDate(enrolment.paidAt) : "—" },
    {
      label: "Paid",
      value:
        enrolment.method === "free"
          ? "Free"
          : enrolment.amountCents != null && enrolment.method
            ? `${formatEuro(enrolment.amountCents)} ${PAYMENT_METHOD_LABELS[enrolment.method].toLowerCase()}`
            : "—",
    },
    { label: "Name on record", value: enrolment.certificateName ?? "—" },
    { label: "Completed", value: enrolment.completedAt ? formatRecordDate(enrolment.completedAt) : "Not yet" },
  ];

  return (
    <section className={sectionClass} aria-labelledby="user-course-heading">
      <h2 id="user-course-heading" className="font-display text-2xl text-cream">
        Course: {courseStateLabel(state)}
      </h2>
      <dl className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {details.map((row) => (
          <div key={row.label}>
            <dt className={labelClass}>{row.label}</dt>
            <dd className="mt-1 text-base text-cream">{row.value}</dd>
          </div>
        ))}
      </dl>

      {message ? (
        <p
          className={`mt-4 text-sm ${message.error ? "text-red-300" : "text-brass"}`}
          role={message.error ? "alert" : "status"}
        >
          {message.text}
        </p>
      ) : null}

      {enrolment.status === "paid" || enrolment.status === "revoked" ? <Progress user={user} /> : null}
      <Payments user={user} onSaved={onSaved} onMessage={setMessage} />

      {enrolment.status === "registered" || enrolment.status === "checkout_created" ? (
        <RecordPayment user={user} onSaved={onSaved} onMessage={setMessage} />
      ) : (
        <AccessControl user={user} onSaved={onSaved} onMessage={setMessage} />
      )}
    </section>
  );
}

function Progress({ user }: { user: AdminUser }) {
  const { progress } = user;
  const yes = (done: boolean) => (done ? "✓" : <span className="text-stone">—</span>);
  return (
    <div className="mt-8">
      <h3 className="font-display text-xl text-cream">
        Progress: {progress.passed} of {progress.total} lessons passed
      </h3>
      <AdminTable
        className="mt-3"
        headers={[
          "Lesson",
          { label: "Read", className: "hidden sm:table-cell" },
          { label: "Film", className: "hidden sm:table-cell" },
          "Attempts",
          "Best",
          "Passed",
        ]}
      >
        {progress.lessons.map((lesson, index) => (
          <tr key={lesson.slug}>
            <td className={`${cell} text-cream`}>
              {index + 1}. {lesson.title}
            </td>
            <td className={`${cell} hidden text-brass sm:table-cell`}>{yes(lesson.read)}</td>
            <td className={`${cell} hidden text-brass sm:table-cell`}>{yes(lesson.watched)}</td>
            <td className={`${cell} tabular-nums text-parchment`}>{lesson.attempts}</td>
            <td className={`${cell} tabular-nums text-parchment`}>
              {lesson.bestScore != null ? `${lesson.bestScore}%` : "—"}
            </td>
            <td className={`${cell} whitespace-nowrap tabular-nums text-parchment`}>
              {lesson.passedAt ? formatAdminDate(lesson.passedAt) : "—"}
            </td>
          </tr>
        ))}
      </AdminTable>
      {user.enrolment.completedAt && progress.lessons.every((lesson) => !lesson.passedAt) ? (
        <p className="mt-2 text-xs text-stone">
          Completed before lesson progress was saved to the account, so only the completion date is known.
        </p>
      ) : null}
    </div>
  );
}

function Payments({
  user,
  onSaved,
  onMessage,
}: UserCourseProps & { onMessage: (message: Message) => void }) {
  const [refunding, setRefunding] = useState<CoursePayment | null>(null);
  const [reason, setReason] = useState("");

  return (
    <div className="mt-8">
      <h3 className="font-display text-xl text-cream">Payments</h3>
      {user.payments.length === 0 ? (
        <p className="mt-2 text-sm text-stone">No payments yet.</p>
      ) : (
        <AdminTable
          className="mt-3"
          headers={["Date", "Method", "Amount", "Status", { label: "Note", className: "hidden md:table-cell" }, ""]}
        >
          {user.payments.map((payment) => {
            const stripeUrl = stripePaymentUrl(payment);
            return (
              <tr key={payment.id}>
                <td className={`${cell} whitespace-nowrap tabular-nums text-parchment`}>
                  {formatAdminDate(payment.paidAt ?? payment.createdAt)}
                </td>
                <td className={`${cell} text-parchment`}>{PAYMENT_METHOD_LABELS[payment.method]}</td>
                <td className={`${cell} whitespace-nowrap tabular-nums text-cream`}>{paymentAmount(payment)}</td>
                <td className={`${cell} ${payment.status === "paid" ? "text-brass" : "text-parchment"}`}>
                  {PAYMENT_STATUS_LABELS[payment.status]}
                </td>
                <td className={`${cell} hidden whitespace-pre-line text-xs text-stone md:table-cell`}>
                  {payment.note ?? ""}
                </td>
                <td className={`${cell} text-right`}>
                  {stripeUrl ? (
                    <a href={stripeUrl} target="_blank" rel="noreferrer" className={adminButton.ghost}>
                      Stripe ↗
                    </a>
                  ) : payment.method === "in_shop" && payment.status === "paid" ? (
                    <button type="button" className={adminButton.ghost} onClick={() => setRefunding(payment)}>
                      Refund…
                    </button>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </AdminTable>
      )}
      {user.payments.some((payment) => payment.method === "stripe" && payment.status === "paid") ? (
        <p className="mt-2 text-xs text-stone">
          Refund online payments in the Stripe dashboard. The refund shows here and removes access automatically.
        </p>
      ) : null}

      {refunding ? (
        <AdminConfirmModal
          eyebrow="Refund"
          title={`Mark ${formatEuro(refunding.amountCents)} as refunded?`}
          confirmLabel="Mark refunded"
          danger
          onCancel={() => setRefunding(null)}
          onConfirm={async () => {
            const payment = refunding;
            setRefunding(null);
            try {
              const saved = await refundPayment(payment.id, reason);
              if (saved) onSaved(saved);
              setReason("");
              onMessage({ text: "Payment marked refunded. Their course access has been removed." });
            } catch (error) {
              onMessage({ text: (error as Error).message, error: true });
            }
          }}
        >
          <p>Use this after giving the money back in the shop. Their course access is removed.</p>
          <AdminField label="Reason (optional)">
            <AdminInput value={reason} onChange={(event) => setReason(event.target.value)} />
          </AdminField>
        </AdminConfirmModal>
      ) : null}
    </div>
  );
}

function RecordPayment({
  user,
  onSaved,
  onMessage,
}: UserCourseProps & { onMessage: (message: Message) => void }) {
  const [method, setMethod] = useState<"in_shop" | "free">("in_shop");
  const [amount, setAmount] = useState(centsToInput(courseEnrolmentOffer.priceCents));
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const amountCents = method === "free" ? 0 : inputToCents(amount);

  return (
    <form
      className="mt-8 max-w-2xl"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (method === "in_shop" && !amountCents) {
          setError("Enter the amount paid, or choose Free.");
          return;
        }
        setError("");
        setConfirming(true);
      }}
    >
      <h3 className="font-display text-xl text-cream">Give access</h3>
      <p className="mt-1 text-sm text-parchment">
        For a course paid for in the shop, or given for free. The course opens for them straight away.
      </p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <AdminField label="Payment">
          <AdminSelect value={method} onChange={(event) => setMethod(event.target.value as "in_shop" | "free")}>
            <option value="in_shop">{PAYMENT_METHOD_LABELS.in_shop}</option>
            <option value="free">{PAYMENT_METHOD_LABELS.free}</option>
          </AdminSelect>
        </AdminField>
        {method === "in_shop" ? (
          <AdminField label="Amount (€)" required error={error || undefined}>
            <AdminInput
              inputMode="decimal"
              invalid={Boolean(error)}
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setError("");
              }}
            />
          </AdminField>
        ) : null}
        <AdminField label="Note (optional)" hint="E.g. receipt number, or why it's free.">
          <AdminTextarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} />
        </AdminField>
      </div>
      <button type="submit" className={`${adminButton.secondary} mt-5`}>
        {method === "free" ? "Give free access" : "Record payment"}
      </button>

      {confirming ? (
        <AdminConfirmModal
          eyebrow={method === "free" ? "Free access" : "Paid in the shop"}
          title={
            method === "free"
              ? `Give ${user.name || user.email} free access?`
              : `Record ${formatEuro(amountCents)} paid by ${user.name || user.email}?`
          }
          confirmLabel={method === "free" ? "Give access" : "Record payment"}
          onCancel={() => setConfirming(false)}
          onConfirm={async () => {
            setConfirming(false);
            try {
              onSaved(
                await updateUser(user.id, {
                  recordPayment: { method, amountCents: amountCents ?? 0, note },
                }),
              );
              onMessage({ text: "Access given. The course is now open to them." });
            } catch (failure) {
              onMessage({ text: (failure as Error).message, error: true });
            }
          }}
        >
          <p>The course opens for them straight away.</p>
          <p>
            Their completion record will be issued to <strong>{user.name || "(no name)"}</strong>, and that
            can&apos;t be changed afterwards.
          </p>
        </AdminConfirmModal>
      ) : null}
    </form>
  );
}

function AccessControl({
  user,
  onSaved,
  onMessage,
}: UserCourseProps & { onMessage: (message: Message) => void }) {
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const revoked = user.enrolment.status === "revoked";

  async function save(status: "active" | "revoked") {
    try {
      onSaved(await updateUser(user.id, { access: { status, reason } }));
      setReason("");
      onMessage({ text: status === "active" ? "Access restored." : "Access removed." });
    } catch (error) {
      onMessage({ text: (error as Error).message, error: true });
    }
  }

  return (
    <div className="mt-8">
      <h3 className="font-display text-xl text-cream">Access</h3>
      <p className="mt-1 max-w-2xl text-sm text-parchment">
        {revoked
          ? "They can't open the lessons. Their progress and any completion date are kept."
          : "Removing access closes the lessons for them. Their progress, payments and completion date are kept."}
      </p>
      <button
        type="button"
        className={`${revoked ? adminButton.secondary : adminButton.danger} mt-4`}
        onClick={() => setConfirming(true)}
      >
        {revoked ? "Restore access" : "Remove access…"}
      </button>

      {confirming ? (
        <AdminConfirmModal
          eyebrow={revoked ? "Restore access" : "Remove access"}
          title={revoked ? `Give ${user.name || user.email} access again?` : `Remove ${user.name || user.email}'s access?`}
          confirmLabel={revoked ? "Restore access" : "Remove access"}
          danger={!revoked}
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            if (!revoked && !reason.trim()) {
              setReasonError("Say why access is being removed.");
              return;
            }
            setConfirming(false);
            void save(revoked ? "active" : "revoked");
          }}
        >
          {revoked ? (
            <p>The lessons open for them again, carrying on from where they were.</p>
          ) : (
            <AdminField label="Reason" required error={reasonError || undefined} hint="Shown to the student on their dashboard.">
              <AdminInput
                value={reason}
                invalid={Boolean(reasonError)}
                onChange={(event) => {
                  setReason(event.target.value);
                  setReasonError("");
                }}
              />
            </AdminField>
          )}
        </AdminConfirmModal>
      ) : null}
    </div>
  );
}
