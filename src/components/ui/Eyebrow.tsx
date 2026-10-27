/**
 * Small brass uppercase label above a heading.
 * `wide` is the looser letter-spacing used above page and section titles.
 */
export function Eyebrow({
  children,
  wide = false,
  className = "",
}: {
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <p
      className={`text-[11px] uppercase text-brass ${wide ? "tracking-[0.32em]" : "tracking-[0.28em]"} ${className}`}
    >
      {children}
    </p>
  );
}
