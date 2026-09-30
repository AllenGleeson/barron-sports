import { Container } from "@/components/ui/Container";
import { CoverImage } from "@/components/media/CoverImage";
import { services } from "@/lib/site";

export function ServicesPreview() {
  return (
    <section className="bg-ink pb-8 pt-4 lg:pb-10 lg:pt-6" aria-labelledby="services-heading">
      <Container>
        <h2
          id="services-heading"
          className="mb-6 text-center font-display text-3xl uppercase tracking-[0.22em] text-cream sm:text-4xl lg:mb-8"
        >
          Our Services
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {services.map((service, index) => (
            <article
              key={service.title}
              className={`flex flex-col bg-moss ${index < 3 ? "lg:col-span-4" : "lg:col-span-6"}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <CoverImage
                  src={service.image.src}
                  alt={service.image.alt}
                  sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
                />
                <div
                  className="pointer-events-none absolute inset-3 border border-brass/35"
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-1 flex-col px-5 py-6">
                <h3 className="font-display text-2xl leading-snug text-cream">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-parchment">
                  {service.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
