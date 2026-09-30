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
    <section className="relative isolate min-h-[42vh] overflow-hidden">
      <CoverImage src={image.src} alt={image.alt} priority sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/35" aria-hidden="true" />
      <Container
        className={`relative flex min-h-[42vh] items-end ${
          compact ? "pb-4 pt-4 sm:pt-6" : "pb-14 pt-24"
        }`}
      >
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-[11px] uppercase tracking-[0.32em] text-brass">{eyebrow}</p>
          ) : null}
          <h1 className="mt-4 font-display text-5xl leading-tight text-cream sm:text-6xl">
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
