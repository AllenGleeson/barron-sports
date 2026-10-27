"use client";

import { useEffect } from "react";
import { adminButton } from "@/components/admin/fields";

export function AdminConfirmModal({
  eyebrow,
  title,
  children,
  confirmLabel,
  danger = false,
  onCancel,
  onConfirm,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/80 px-4 py-10"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        className="my-auto w-full max-w-lg border border-line bg-moss p-5 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[11px] uppercase tracking-[0.2em] text-brass">
          {eyebrow}
        </p>
        <h2
          id="admin-confirm-title"
          className="mt-2 font-display text-3xl text-cream"
        >
          {title}
        </h2>
        {children ? (
          <div className="mt-3 space-y-2 text-sm text-parchment">{children}</div>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className={danger ? adminButton.danger : adminButton.primary}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            className={adminButton.secondary}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
