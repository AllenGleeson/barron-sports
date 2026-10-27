import { buttonClass, fieldLabelClass } from "@/components/ui/styles";
import type { FieldErrors } from "@/lib/admin/validation";

function fieldClassName(invalid?: boolean) {
  return `mt-2 w-full border bg-ink px-3 py-2.5 text-sm text-cream outline-none ${
    invalid
      ? "border-red-400/70 focus:border-red-300"
      : "border-line focus:border-brass"
  }`;
}

type FieldProps = {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  /** Use "group" when the field holds more than one control (e.g. buttons). */
  as?: "label" | "group";
  children: React.ReactNode;
};

export function AdminField({
  label,
  hint,
  required = false,
  error,
  as = "label",
  children,
}: FieldProps) {
  const Wrapper = as === "label" ? "label" : "div";
  return (
    <Wrapper
      className="block"
      data-invalid={error ? "true" : undefined}
      {...(as === "group" ? { role: "group", "aria-label": label } : {})}
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className={fieldLabelClass}>
          {label}
        </span>
        <span
          className={`shrink-0 text-[10px] uppercase tracking-[0.16em] ${
            required ? "text-brass" : "text-stone"
          }`}
        >
          {required ? "Required" : "Optional"}
        </span>
      </span>
      {children}
      {error ? (
        <span role="alert" className="mt-1 block text-xs text-red-300">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-stone">{hint}</span>
      ) : null}
    </Wrapper>
  );
}

export function AdminFormIntro({
  title,
  errors,
}: {
  title: string;
  errors: FieldErrors;
}) {
  const messages = Object.values(errors);
  return (
    <>
      <h1 className="font-display text-4xl text-cream">{title}</h1>
      <p className="mt-2 text-sm text-parchment">
        Fields marked required must be filled in. Optional fields can be left
        blank.
      </p>
      {messages.length ? (
        <div
          role="alert"
          className="mt-5 border border-red-400/40 bg-red-950/25 px-4 py-3 text-sm text-red-200"
        >
          <p className="font-medium text-red-100">
            Please complete the required information before saving.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

type InvalidProp = { invalid?: boolean };

export function AdminInput({
  invalid,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & InvalidProp) {
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      className={`${fieldClassName(invalid)} ${className}`}
    />
  );
}

export function AdminTextarea({
  invalid,
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & InvalidProp) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || undefined}
      className={`${fieldClassName(invalid)} resize-y ${className}`}
    />
  );
}

export function AdminSelect({
  invalid,
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & InvalidProp) {
  return (
    <select
      {...props}
      aria-invalid={invalid || undefined}
      className={`${fieldClassName(invalid)} ${className}`}
    />
  );
}

export function AdminCheckbox({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-parchment">
      <input
        type="checkbox"
        {...props}
        className="size-4 accent-brass"
      />
      {label}
    </label>
  );
}

/** Admin buttons: the shared button styles at the compact size. */
export const adminButton = {
  primary: buttonClass({ variant: "primary", size: "sm" }),
  secondary: buttonClass({ variant: "secondary", size: "sm" }),
  danger: buttonClass({ variant: "danger", size: "sm" }),
  /** Text-only link style (no border), e.g. "View site". */
  ghost:
    "inline-flex items-center justify-center text-[12px] font-medium uppercase tracking-[0.18em] text-brass hover:text-cream",
};
