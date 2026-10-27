/**
 * Mobile accordion lists built on `<details>`. Items sharing a `name` close
 * each other when opened.
 */

/** Down-arrow that flips when its `<details>` (with class `group`) is open. */
export function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`h-3.5 w-3.5 shrink-0 text-brass transition duration-200 group-open:rotate-180 group-hover/item:text-brass-light ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** Classes for `<summary>` that hide the browser's default marker. */
export const summaryClass =
  "flex cursor-pointer list-none items-center gap-3 py-3 outline-none [&::-webkit-details-marker]:hidden";

/** Bordered list wrapper for `AccordionItem`s. */
export function AccordionList({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ul className={`divide-y divide-line-soft border-y border-line-soft ${className}`}>
      {children}
    </ul>
  );
}

/** One row with a display-font title that expands to show `children`. */
export function AccordionItem({
  name,
  title,
  children,
}: {
  name: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="group/item -mx-2 px-2 transition-colors hover:bg-moss active:bg-moss">
      <details className="group" name={name}>
        <summary className={summaryClass}>
          <h3 className="min-w-0 flex-1 font-display text-xl leading-snug text-cream transition-colors group-hover/item:text-brass">
            {title}
          </h3>
          <Chevron />
        </summary>
        {children}
      </details>
    </li>
  );
}
