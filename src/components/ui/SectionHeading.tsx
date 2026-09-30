type SectionHeadingProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "text-center mx-auto items-center" : "";

  return (
    <div className={`flex max-w-2xl flex-col ${alignment}`}>
      {eyebrow ? (
        <p className="mb-3 text-[11px] uppercase tracking-[0.32em] text-brass">
          {eyebrow}
        </p>
      ) : null}
      <h2 id={id} className="font-display text-4xl leading-tight text-cream sm:text-5xl">
        {title}
      </h2>
      <span
        className={`mt-5 h-px w-14 bg-brass/80 ${align === "center" ? "mx-auto" : ""}`}
        aria-hidden="true"
      />
      {description ? (
        <p className="mt-6 text-base leading-relaxed text-parchment/90">
          {description}
        </p>
      ) : null}
    </div>
  );
}
