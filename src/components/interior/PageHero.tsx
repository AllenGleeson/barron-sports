import { CoverImage } from "@/components/media/CoverImage";
import { Container } from "@/components/ui/Container";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  image: { src: string; alt: string };
  compact?: boolean;
};

export function PageHero({ eyebrow, title, description, image, compact = false }: PageHeroProps) {
  return (
    <section className={`relative isolate overflow-hidden ${compact ? "min-h-[32vh]" : "min-h-[42vh]"}`}>
      <CoverImage src={image.src} alt={image.alt} priority sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/35" aria-hidden="true" />
      <Container
        className={`relative flex items-end ${
          compact ? "min-h-[32vh] pb-4 pt-6 sm:pt-8" : "min-h-[42vh] pb-14 pt-24"
        }`}
      >
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-[11px] uppercase tracking-[0.32em] text-brass">{eyebrow}</p>
          ) : null}
          <h1 className={`font-display text-5xl leading-tight text-cream sm:text-6xl ${compact ? "mt-2" : "mt-4"}`}>
            {title}
          </h1>
          {description ? (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-parchment">
              {description}
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
