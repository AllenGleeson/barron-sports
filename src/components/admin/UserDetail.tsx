"use client";

import { useState } from "react";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import {
  AdminCheckbox,
  AdminField,
  AdminFormIntro,
  AdminInput,
  AdminSelect,
  adminButton,
} from "@/components/admin/fields";
import { formatAdminDate } from "@/components/admin/filters";
import { UserCourse } from "@/components/admin/UserCourse";
import {
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  SUPER_ADMIN_NOTE,
  type AdminUser,
  type AdminUserChanges,
  type UserRole,
} from "@/lib/admin/users";
import { deleteUser, inviteUser, sendPasswordReset, updateUser } from "@/lib/admin/usersApi";
import {
  compactErrors,
  requiredText,
  scrollToFirstInvalid,
  validateEmail,
  type FieldErrors,
} from "@/lib/admin/validation";
import {
  certificateSvg,
  downloadCertificate,
  formatRecordDate,
  recordCode,
} from "@/lib/course/certificate";

type UserDetailProps = {
  /** The account to show, or null when adding a new one. */
  user: AdminUser | null;
  /** Role for a new account. */
  newRole: UserRole;
  /** The signed-in admin's own account. */
  isMe: boolean;
  /** Shows the account without any way to change it (the super admin). */
  readOnly: boolean;
  /** Active admins other than this account, so the last one can't be removed. */
  otherActiveAdmins: number;
  onClose: () => void;
  onSaved: (user: AdminUser) => void;
  onDeleted: (user: AdminUser) => void;
};

type Draft = {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  active: boolean;
};

const sectionClass = "mt-10 border-t border-line pt-8";
const LAST_ADMIN = "Keep at least one active admin.";

function draftFrom(user: AdminUser | null, role: UserRole): Draft {
  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    role: user?.role ?? role,
    active: (user?.accountStatus ?? "active") === "active",
  };
}

function validate(draft: Draft, user: AdminUser | null, otherActiveAdmins: number): FieldErrors {
  const lastAdmin = user?.role === "admin" && otherActiveAdmins === 0;
  return compactErrors({
    name: requiredText(draft.name, "Name"),
    email: validateEmail(draft.email),
    role: lastAdmin && draft.role !== "admin" ? LAST_ADMIN : undefined,
    active: lastAdmin && !draft.active ? LAST_ADMIN : undefined,
  });
}

/** Only the fields that differ from the saved account. */
function changesFrom(draft: Draft, user: AdminUser): AdminUserChanges {
  const changes: AdminUserChanges = {};
  if (draft.name.trim() !== user.name) changes.name = draft.name.trim();
  if (draft.email.trim().toLowerCase() !== user.email.toLowerCase()) changes.email = draft.email.trim();
  if ((draft.phone.trim() || null) !== user.phone) changes.phone = draft.phone.trim() || null;
  if (draft.role !== user.role) changes.role = draft.role;
  if (draft.active !== (user.accountStatus === "active")) {
    changes.accountStatus = draft.active ? "active" : "disabled";
  }
  return changes;
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function UserDetail({
  user,
  newRole,
  isMe,
  readOnly,
  otherActiveAdmins,
  onClose,
  onSaved,
  onDeleted,
}: UserDetailProps) {
  const [draft, setDraft] = useState(() => draftFrom(user, newRole));
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [confirm, setConfirm] = useState<"delete" | null>(null);
  const errors = attempted ? validate(draft, user, otherActiveAdmins) : {};
  const isNew = !user;

  if (user && readOnly) return <ReadOnlyAccount user={user} onClose={onClose} />;

  function edit(next: Partial<Draft>) {
    setDraft({ ...draft, ...next });
    setMessage(null);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setAttempted(true);
    if (Object.keys(validate(draft, user, otherActiveAdmins)).length) {
      window.setTimeout(scrollToFirstInvalid, 0);
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      if (!user) {
        onSaved(await inviteUser({ name: draft.name, email: draft.email, role: draft.role }));
        return;
      }
      const changes = changesFrom(draft, user);
      if (!Object.keys(changes).length) {
        setMessage({ text: "Nothing to save." });
        return;
      }
      onSaved(await updateUser(user.id, changes));
      setAttempted(false);
      setMessage({ text: "Account saved." });
    } catch (error) {
      setMessage({ text: (error as Error).message, error: true });
    } finally {
      setBusy(false);
    }
  }

  const canDelete = user && !isMe && !(user.role === "admin" && otherActiveAdmins === 0);

  return (
    <div>
      <button type="button" className={adminButton.ghost} onClick={onClose}>
        ← All users
      </button>

      <form className="mt-4" noValidate onSubmit={save}>
        <AdminFormIntro
          title={user ? user.name || user.email : `New ${ROLE_LABELS[draft.role].toLowerCase()}`}
          errors={errors}
        />
        {isNew ? (
          <p className="mt-3 text-sm text-parchment">
            They&apos;ll get an email invite with a link to choose their own password.
          </p>
        ) : null}

        <h2 className="mt-8 font-display text-2xl text-cream">Account</h2>
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          <AdminField
            label="Name"
            required
            error={errors.name}
            hint={
              user?.enrolment.certificateName
                ? `Their record keeps the name "${user.enrolment.certificateName}" from when they paid.`
                : undefined
            }
          >
            <AdminInput
              required
              autoComplete="off"
              invalid={Boolean(errors.name)}
              value={draft.name}
              onChange={(event) => edit({ name: event.target.value })}
            />
          </AdminField>
          <AdminField
            label="Email"
            required
            error={errors.email}
            hint={isNew ? "The invite goes here." : "Used to sign in. A change applies straight away."}
          >
            <AdminInput
              required
              type="email"
              autoComplete="off"
              invalid={Boolean(errors.email)}
              value={draft.email}
              onChange={(event) => edit({ email: event.target.value })}
            />
          </AdminField>
          <AdminField
            label="Role"
            required
            error={errors.role}
            hint={isMe ? "You can't change your own role." : ROLE_PERMISSIONS[draft.role]}
          >
            <AdminSelect
              invalid={Boolean(errors.role)}
              value={draft.role}
              disabled={isMe}
              onChange={(event) => edit({ role: event.target.value as UserRole })}
            >
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          {isNew ? null : (
            <AdminField label="Phone">
              <AdminInput
                type="tel"
                autoComplete="off"
                value={draft.phone}
                onChange={(event) => edit({ phone: event.target.value })}
              />
            </AdminField>
          )}
          {isNew ? null : (
            <div data-invalid={errors.active ? "true" : undefined}>
              <AdminCheckbox
                label="Account active"
                checked={draft.active}
                disabled={isMe}
                onChange={(event) => edit({ active: event.target.checked })}
              />
              {errors.active ? (
                <p role="alert" className="mt-1 text-xs text-red-300">
                  {errors.active}
                </p>
              ) : (
                <p className="mt-1 text-xs text-stone">
                  {isMe
                    ? "You can't disable your own account."
                    : draft.role === "admin"
                      ? "A disabled account can't sign in to admin."
                      : "A disabled account can't sign in or open the course."}
                </p>
              )}
            </div>
          )}
          {user ? (
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-stone">Joined</dt>
                <dd className="mt-1 text-parchment">{formatAdminDate(user.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-stone">Last sign-in</dt>
                <dd className="mt-1 text-parchment">
                  {user.lastSignInAt ? formatAdminDate(user.lastSignInAt) : "—"}
                </dd>
              </div>
            </dl>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button type="submit" className={adminButton.primary} disabled={busy}>
            {busy ? "Saving…" : isNew ? "Send invite" : "Save account"}
          </button>
          <button type="button" className={adminButton.secondary} onClick={onClose}>
            Cancel
          </button>
          {canDelete ? (
            <button type="button" className={adminButton.danger} onClick={() => setConfirm("delete")}>
              Delete
            </button>
          ) : null}
        </div>
        {message ? (
          <p
            className={`mt-3 text-sm ${message.error ? "text-red-300" : "text-brass"}`}
            role={message.error ? "alert" : "status"}
          >
            {message.text}
          </p>
        ) : null}
      </form>

      {user ? (
        <>
          <PasswordReset user={user} />
          {/* Admins can buy the course too; show it whenever there's an enrolment. */}
          {user.role === "student" || user.enrolment.status !== "registered" ? (
            <UserCourse user={user} onSaved={onSaved} />
          ) : null}
          {user.enrolment.completedAt ? (
            <CompletionRecordAdmin user={user} completedAt={user.enrolment.completedAt} />
          ) : null}
        </>
      ) : null}

      {user && confirm === "delete" ? (
        <AdminConfirmModal
          eyebrow="Confirm delete"
          title={`Delete ${user.name || user.email}?`}
          confirmLabel="Delete user"
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            setConfirm(null);
            try {
              await deleteUser(user.id);
              onDeleted(user);
            } catch (error) {
              setMessage({ text: (error as Error).message, error: true });
            }
          }}
        >
          <p>
            Their account, course access and progress will be removed. This can&apos;t be undone.
            Their payments stay on the Payments page.
          </p>
        </AdminConfirmModal>
      ) : null}
    </div>
  );
}

function ReadOnlyAccount({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const details = [
    { label: "Email", value: user.email },
    { label: "Phone", value: user.phone ?? "—" },
    { label: "Role", value: "Super admin" },
    { label: "Account", value: user.accountStatus === "active" ? "Active" : "Disabled" },
    { label: "Joined", value: formatAdminDate(user.createdAt) },
    { label: "Last sign-in", value: user.lastSignInAt ? formatAdminDate(user.lastSignInAt) : "—" },
  ];
  return (
    <div>
      <button type="button" className={adminButton.ghost} onClick={onClose}>
        ← All users
      </button>
      <h1 className="mt-4 font-display text-4xl text-cream">{user.name || user.email}</h1>
      <p className="mt-4 flex gap-2 border border-line bg-moss px-4 py-3 text-sm text-parchment">
        <span aria-hidden="true">🔒</span>
        <span>{SUPER_ADMIN_NOTE}</span>
      </p>
      <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {details.map((item) => (
          <div key={item.label}>
            <dt className="text-[11px] uppercase tracking-[0.2em] text-stone">{item.label}</dt>
            <dd className="mt-1 break-all text-base text-cream">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function PasswordReset({ user }: { user: AdminUser }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ text: string; error?: boolean } | null>(null);
  return (
    <section className={sectionClass} aria-labelledby="user-password-heading">
      <h2 id="user-password-heading" className="font-display text-2xl text-cream">
        Password
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-parchment">
        Sends a link to <span className="break-all text-cream">{user.email}</span> to choose a new
        password. Their current password keeps working until they do.
      </p>
      {user.accountStatus === "disabled" ? (
        <p className="mt-2 text-sm text-stone">
          This account is disabled, so they still can&apos;t sign in after resetting.
        </p>
      ) : null}
      <button
        type="button"
        className={`${adminButton.secondary} mt-4`}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setResult(null);
          try {
            const sent = await sendPasswordReset(user.id);
            setResult({
              text: `Password reset email sent to ${sent.sentTo} at ${formatDateTime(sent.sentAt)}.`,
            });
          } catch (error) {
            setResult({ text: (error as Error).message, error: true });
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Sending…" : "Send password reset email"}
      </button>
      {result ? (
        <p
          className={`mt-3 text-sm ${result.error ? "text-red-300" : "text-brass"}`}
          role={result.error ? "alert" : "status"}
        >
          {result.text}
        </p>
      ) : null}
    </section>
  );
}

function CompletionRecordAdmin({ user, completedAt }: { user: AdminUser; completedAt: string }) {
  const [otherEmail, setOtherEmail] = useState("");
  const [otherError, setOtherError] = useState("");
  const [sentTo, setSentTo] = useState("");
  const name = user.enrolment.certificateName ?? user.name;
  const svg = certificateSvg(name, completedAt);
  const code = recordCode(name, completedAt);

  return (
    <section className={sectionClass} aria-labelledby="user-record-heading">
      <h2 id="user-record-heading" className="font-display text-2xl text-cream">
        Completion record
      </h2>
      <p className="mt-2 text-sm text-parchment">
        Record {code}, issued to {name} on {formatRecordDate(completedAt)}.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div
          className="overflow-hidden border border-line [&_svg]:h-auto [&_svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <button type="button" className={adminButton.primary} onClick={() => setSentTo(user.email)}>
              Resend to account email
            </button>
            <button
              type="button"
              className={adminButton.secondary}
              onClick={() => downloadCertificate(svg, code)}
            >
              Download
            </button>
          </div>
          <p className="-mt-2 break-all text-xs text-stone">{user.email}</p>

          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              const error = validateEmail(otherEmail);
              if (error) {
                setOtherError(error);
                return;
              }
              setSentTo(otherEmail.trim());
              setOtherEmail("");
            }}
          >
            <AdminField label="Send to another email" error={otherError || undefined}>
              <AdminInput
                type="email"
                autoComplete="off"
                invalid={Boolean(otherError)}
                value={otherEmail}
                onChange={(event) => {
                  setOtherEmail(event.target.value);
                  setOtherError("");
                }}
              />
            </AdminField>
            <button type="submit" className={`${adminButton.secondary} mt-3`}>
              Send record
            </button>
          </form>

          {sentTo ? (
            <p className="text-sm text-brass" role="status">
              Record sent to {sentTo}. (Preview: record emails aren&apos;t sent yet.)
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
