import Image from "next/image";
import { CoverImage } from "@/components/media/CoverImage";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { dogTraceCatalog, site } from "@/lib/site";

function SpecList({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <>
      <details className="group mt-5 border-t border-line-soft sm:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 outline-none [&::-webkit-details-marker]:hidden">
          <h3 className="font-display text-xl text-cream">{title}</h3>
          <svg
            viewBox="0 0 12 12"
            className="h-3.5 w-3.5 shrink-0 text-brass transition duration-200 group-open:rotate-180"
            fill="none"
            aria-hidden="true"
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </summary>
        <ul className="space-y-1.5 pb-4 text-sm leading-relaxed text-parchment">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </details>
      <div className="mt-6 hidden sm:block">
        <h3 className="font-display text-xl text-cream">{title}</h3>
        <ul className="mt-3 grid gap-x-8 gap-y-1.5 text-sm leading-relaxed text-parchment sm:grid-cols-2">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function DogTraceCatalog() {
  return (
    <>
      <section className="bg-ink py-10 lg:py-16">
        <Container>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-14">
            <div className="max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.28em] text-brass">
                Official stockist
              </p>
              <h2 className="mt-3 font-display text-3xl text-cream sm:text-4xl">
                DogTrace tracking systems
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-parchment">
                {dogTraceCatalog.tracking.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
            <aside className="w-full shrink-0 lg:max-w-sm">
              <div className="relative h-24 bg-white px-8 py-5">
                <Image
                  src={dogTraceCatalog.logo}
                  alt="DogTrace"
                  fill
                  sizes="320px"
                  className="object-contain"
                />
              </div>
              <p className="mt-4 border border-brass/50 bg-moss px-5 py-4 text-sm leading-relaxed text-cream">
                {dogTraceCatalog.exclusive}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-stone">
                Secure phone payment on{" "}
                <a href={site.phone.href} className="text-brass hover:text-cream">
                  {site.phone.display}
                </a>
                . {site.visitNote}
              </p>
            </aside>
          </div>
        </Container>
      </section>

      <section className="bg-forest py-10 lg:py-16" id="prices" aria-labelledby="dogtrace-prices">
        <Container>
          <SectionHeading
            id="dogtrace-prices"
            eyebrow="In stock"
            title="Current prices"
            description="Sets include a collar, handset and chargers. Additional collars, batteries, antennas and straps are available separately."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {dogTraceCatalog.series.map((series) => (
              <article
                key={series.name}
                id={`range-${series.name.split(" / ")[0].toLowerCase()}`}
                className="border border-line bg-moss px-5 py-6"
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-brass">{series.note}</p>
                <h3 className="mt-2 font-display text-2xl text-cream">{series.name}</h3>
                <ul className="mt-5 divide-y divide-line-soft border-t border-line-soft">
                  {series.items.map((item) => (
                    <li key={item.name} className="flex items-baseline justify-between gap-4 py-3">
                      <span className="text-sm leading-relaxed text-parchment">{item.name}</span>
                      <span className="shrink-0 text-brass">{item.price}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="mt-4 border border-line bg-moss px-5 py-6">
            <h3 className="font-display text-2xl text-cream">Accessories</h3>
            <ul className="mt-5 grid gap-x-10 divide-y divide-line-soft border-t border-line-soft sm:grid-cols-3 sm:divide-y-0 sm:border-t-0">
              {dogTraceCatalog.accessories.map((item) => (
                <li
                  key={item.name}
                  className="flex items-baseline justify-between gap-4 py-3 sm:border-t sm:border-line-soft"
                >
                  <span className="text-sm leading-relaxed text-parchment">{item.name}</span>
                  <span className="shrink-0 text-brass">{item.price}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-brass">{dogTraceCatalog.armour}</p>
          <p className="mt-2 text-sm leading-relaxed text-stone">{dogTraceCatalog.repairs}</p>
        </Container>
      </section>

      <section className="bg-ink py-10 lg:py-16">
        <Container>
          <SectionHeading
            eyebrow="Product detail"
            title="Featured models"
            description="The GPS X20, phone-linked X30T and d-control Professional 2000 are the sets most often asked for in the shop."
          />
          <div className="mt-10 space-y-6">
            {dogTraceCatalog.featured.map((product, index) => {
              const appFeatures = "appFeatures" in product ? product.appFeatures : undefined;
              const includes = "includes" in product ? product.includes : undefined;
              return (
                <article
                  key={product.id}
                  id={product.id}
                  className="scroll-mt-24 grid overflow-hidden border border-line bg-moss lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
                >
                  <div
                    className={`relative min-h-[16rem] bg-white lg:min-h-full ${
                      index % 2 === 1 ? "lg:order-2" : ""
                    }`}
                  >
                    <div className="absolute inset-6">
                      <CoverImage
                        src={product.image.src}
                        alt={product.image.alt}
                        fit="contain"
                        sizes="(min-width: 1024px) 40vw, 100vw"
                      />
                    </div>
                  </div>
                  <div className="px-5 py-7 sm:px-8 lg:py-10">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-brass">
                      {product.price}
                    </p>
                    <h3 className="mt-2 font-display text-3xl text-cream">{product.name}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-parchment">{product.summary}</p>
                    <p className="mt-3 text-sm leading-relaxed text-parchment">{product.extras}</p>
                    {product.id === "x30t" ? (
                      <p className="mt-4 text-sm text-stone">
                        Android app:{" "}
                        <a
                          href={dogTraceCatalog.appHref}
                          className="text-brass hover:text-cream"
                          target="_blank"
                          rel="noreferrer"
                        >
                          DogTrace GPS on Google Play
                        </a>
                      </p>
                    ) : null}
                    <SpecList title="Device properties" items={product.properties} />
                    {appFeatures ? <SpecList title="DogTrace GPS app" items={appFeatures} /> : null}
                    {includes ? <SpecList title="Package contents" items={includes} /> : null}
                  </div>
                </article>
              );
            })}
          </div>
          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <Button href="/contact-us">Ask about availability</Button>
            <Button href={site.phone.href} variant="secondary">
              Call {site.phone.display}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
