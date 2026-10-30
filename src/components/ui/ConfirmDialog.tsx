"use client";

import { useEffect } from "react";
import { ActionButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

type ConfirmDialogProps = {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** A modal question for public pages. Escape or a click outside cancels. */
export function ConfirmDialog({
  eyebrow,
  title,
  children,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
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
        aria-labelledby="confirm-dialog-title"
        className="my-auto w-full max-w-lg border border-brass bg-moss p-5 sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 id="confirm-dialog-title" className="mt-2 font-display text-3xl text-cream">
          {title}
        </h2>
        {children ? (
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-parchment">{children}</div>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ActionButton autoFocus onClick={onConfirm}>
            {confirmLabel}
          </ActionButton>
          <ActionButton variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
