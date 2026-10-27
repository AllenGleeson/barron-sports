/** Shared class strings for interactive elements. */

export const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass";

/** Full-size text input / textarea on public pages (contact form, course). */
export const fieldClass = `mt-2 w-full border border-line bg-ink px-3 py-3 text-cream outline-none focus:border-brass ${focusRing}`;

/** Small uppercase label above a form field. */
export const fieldLabelClass = "text-[11px] uppercase tracking-[0.2em] text-stone";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "md" | "sm";

const variants: Record<ButtonVariant, string> = {
  primary: "border border-brass bg-brass text-ink hover:bg-brass-light",
  secondary:
    "border border-cream/35 bg-transparent text-cream hover:border-brass hover:text-brass",
  ghost:
    "border border-brass/40 bg-transparent text-brass hover:border-brass hover:bg-brass/10",
  danger:
    "border border-red-400/40 bg-transparent text-red-200 hover:border-red-300 hover:text-red-100",
};

const sizes: Record<ButtonSize, string> = {
  md: "px-6 py-3",
  sm: "px-5 py-2.5",
};

/** Class string for anything styled as a button (links and `<button>`s). */
export function buttonClass({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return `inline-flex items-center justify-center text-[12px] font-medium uppercase tracking-[0.18em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing} ${sizes[size]} ${variants[variant]} ${className}`;
}
