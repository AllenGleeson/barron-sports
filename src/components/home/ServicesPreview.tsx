"use client";

import { Container } from "@/components/ui/Container";
import { CoverImage } from "@/components/media/CoverImage";
import { usePublicServices } from "@/lib/admin/usePublicServices";
import { services, type Service } from "@/lib/site";

export function ServicesPreview() {
  const fromStore = usePublicServices(services);
  const rows = fromStore ?? services;

  if (fromStore !== null && rows.length === 0) return null;

  return (
    <section className="bg-ink pb-8 pt-4 lg:pb-10 lg:pt-6" aria-labelledby="services-heading">
      <Container>
        <h2
          id="services-heading"
          className="mb-6 text-center font-display text-3xl uppercase tracking-[0.22em] text-cream sm:text-4xl lg:mb-8"
        >
          Our Services
        </h2>

        <ul className="divide-y divide-line-soft border-y border-line-soft lg:hidden">
          {rows.map((service) => (
            <li key={service.title} className="group/item -mx-2 px-2 transition-colors hover:bg-moss active:bg-moss">
              <details className="group" name="home-services">
                <summary className="flex cursor-pointer list-none items-center gap-3 py-3 outline-none transition-colors group-open:flex-col group-open:items-stretch group-open:gap-0 group-open:py-0 [&::-webkit-details-marker]:hidden">
                  <div className="relative h-[4.5rem] w-24 shrink-0 overflow-hidden bg-panel group-open:aspect-[4/3] group-open:h-auto group-open:w-full">
                    <CoverImage
                      src={service.image.src}
                      alt={service.image.alt}
                      sizes="(min-width: 1024px) 50vw, 100vw"
                    />
                    <div
                      className="pointer-events-none absolute inset-3 hidden border border-brass/35 group-open:block"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-3 group-open:py-3">
                    <h3 className="min-w-0 flex-1 font-display text-xl leading-snug text-cream transition-colors group-hover/item:text-brass">
                      {service.title}
                    </h3>
                    <svg
                      viewBox="0 0 12 12"
                      className="h-3.5 w-3.5 shrink-0 text-brass transition duration-200 group-open:rotate-180 group-hover/item:text-[#dcc392]"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </div>
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-parchment">
                  {service.description}
                </p>
              </details>
            </li>
          ))}
        </ul>

        <div className="hidden gap-4 lg:grid lg:grid-cols-12">
          {rows.slice(0, 10).map((service, index) => (
            <ServiceCard
              key={service.title}
              service={service}
              className={serviceCellClass(Math.min(rows.length, 10), index)}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

const SERVICE_ROWS: Record<number, number[]> = {
  1: [1],
  2: [2],
  3: [3],
  4: [2, 2],
  5: [3, 2],
  6: [3, 3],
  7: [3, 2, 2],
  8: [4, 4],
  9: [3, 3, 3],
  10: [4, 3, 3],
};

const SPAN_CLASS = {
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  6: "lg:col-span-6",
} as const;

const START_CLASS = {
  2: "lg:col-start-2",
  3: "lg:col-start-3",
  4: "lg:col-start-4",
  5: "lg:col-start-5",
} as const;

function serviceCellClass(count: number, index: number) {
  const plan = SERVICE_ROWS[count] ?? [3];
  let cursor = 0;

  for (const size of plan) {
    if (index < cursor + size) {
      const position = index - cursor;
      const span = size >= 4 ? 3 : size === 3 ? 4 : 6;
      const used = size * span;
      const start = position === 0 && used < 12 ? (12 - used) / 2 + 1 : 0;
      const spanClass = SPAN_CLASS[span as keyof typeof SPAN_CLASS];
      const startClass = START_CLASS[start as keyof typeof START_CLASS] ?? "";
      return `${spanClass} ${startClass}`.trim();
    }
    cursor += size;
  }

  return SPAN_CLASS[4];
}

function ServiceCard({
  service,
  className,
}: {
  service: Service;
  className: string;
}) {
  return (
    <article className={`flex flex-col bg-moss ${className}`}>
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
  );
}
