const fieldClassName =
  "mt-2 w-full border border-line bg-ink px-3 py-2.5 text-sm text-cream outline-none focus:border-brass";

type FieldProps = {
  label: string;
  hint?: string;
  children: React.ReactNode;
};

export function AdminField({ label, hint, children }: FieldProps) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.2em] text-stone">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-stone">{hint}</span> : null}
    </label>
  );
}

export function AdminInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return <input {...props} className={`${fieldClassName} ${props.className ?? ""}`} />;
}

export function AdminTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={`${fieldClassName} resize-y ${props.className ?? ""}`}
    />
  );
}

export function AdminSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  return (
    <select {...props} className={`${fieldClassName} ${props.className ?? ""}`} />
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
        className="size-4 accent-[var(--brass)]"
      />
      {label}
    </label>
  );
}

export const adminButton = {
  primary:
    "inline-flex items-center justify-center bg-brass px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.18em] text-ink hover:bg-[#dcc392] disabled:opacity-50",
  secondary:
    "inline-flex items-center justify-center border border-cream/35 px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.18em] text-cream hover:border-brass hover:text-brass",
  danger:
    "inline-flex items-center justify-center border border-red-400/40 px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.18em] text-red-200 hover:border-red-300 hover:text-red-100",
  ghost:
    "inline-flex items-center justify-center text-[12px] font-medium uppercase tracking-[0.18em] text-brass hover:text-cream",
};
