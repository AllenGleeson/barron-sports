import Link from "next/link";
import { CoverImage } from "@/components/media/CoverImage";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  site,
  type CategoryCatalogContent,
  type CategoryCatalogFeatured,
  type CategoryCatalogHighlight,
} from "@/lib/site";

function HighlightCard({ item }: { item: CategoryCatalogHighlight }) {
  const body = (
    <>
      <div className="relative aspect-[4/3] bg-white">
        <div className="absolute inset-5">
          <CoverImage
            src={item.image.src}
            alt={item.image.alt}
            fit="contain"
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-2xl text-cream">{item.name}</h3>
        <p className="mt-3 text-sm leading-relaxed text-parchment">{item.summary}</p>
        {item.cta ? (
          <span className="mt-5 text-[11px] uppercase tracking-[0.18em] text-brass">
            {item.cta} →
          </span>
        ) : null}
      </div>
    </>
  );

  const className = "flex h-full flex-col border border-line bg-moss";

  if (item.href) {
    return (
      <li id={item.id} className="scroll-mt-24">
        <Link href={item.href} className={`${className} transition-colors hover:border-brass`}>
          {body}
        </Link>
      </li>
    );
  }

  return (
    <li id={item.id} className={`scroll-mt-24 ${className}`}>
      {body}
    </li>
  );
}

function FeaturedImages({
  images,
  compact = false,
}: {
  images: CategoryCatalogFeatured["images"];
  compact?: boolean;
}) {
  return (
    <div className={`grid bg-white ${images.length > 1 ? "sm:grid-cols-2" : ""}`}>
      {images.map((image) => (
        <div
          key={image.src}
          className={`relative ${compact ? "min-h-[14rem]" : "min-h-[16rem] lg:min-h-[22rem]"}`}
        >
          <div className="absolute inset-6">
            <CoverImage
              src={image.src}
              alt={image.alt}
              fit="contain"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function FeaturedCopy({
  product,
  compact = false,
}: {
  product: CategoryCatalogFeatured;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-1 flex-col ${compact ? "p-5" : "px-5 py-7 sm:px-8 lg:py-10"}`}>
      {product.eyebrow ? (
        <p className="text-[11px] uppercase tracking-[0.22em] text-brass">{product.eyebrow}</p>
      ) : null}
      {product.price ? (
        <p
          className={`text-[11px] uppercase tracking-[0.22em] text-brass ${
            product.eyebrow ? "mt-2" : ""
          }`}
        >
          {product.price}
        </p>
      ) : null}
      <h3
        className={`font-display text-cream ${compact ? "text-2xl" : "text-3xl"} ${
          product.eyebrow || product.price ? "mt-2" : ""
        }`}
      >
        {product.name}
      </h3>
      <p className="mt-4 text-sm leading-relaxed text-parchment">{product.summary}</p>
      {product.extras ? (
        <p className="mt-3 text-sm leading-relaxed text-parchment">{product.extras}</p>
      ) : null}
      {product.properties?.length ? (
        <ul className="mt-5 space-y-1.5 text-sm leading-relaxed text-parchment">
          {product.properties.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function FeaturedGridCard({ product }: { product: CategoryCatalogFeatured }) {
  return (
    <article id={product.id} className="scroll-mt-24 flex h-full flex-col border border-line bg-moss">
      <FeaturedImages images={product.images} compact />
      <FeaturedCopy product={product} compact />
    </article>
  );
}

function FeaturedStackCard({
  product,
  index,
}: {
  product: CategoryCatalogFeatured;
  index: number;
}) {
  return (
    <article
      id={product.id}
      className="scroll-mt-24 grid overflow-hidden border border-line bg-moss lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
    >
      <div className={index % 2 === 1 ? "lg:order-2" : undefined}>
        <FeaturedImages images={product.images} />
      </div>
      <FeaturedCopy product={product} />
    </article>
  );
}

function CatalogCta() {
  return (
    <div className="mt-12 flex flex-col gap-3 sm:flex-row">
      <Button href="/contact-us">Ask about availability</Button>
      <Button href={site.phone.href} variant="secondary">
        Call {site.phone.display}
      </Button>
    </div>
  );
}

export function CategoryCatalog({ catalog }: { catalog: CategoryCatalogContent }) {
  const featuredLayout = catalog.featuredLayout ?? "stack";
  const hasHighlights = Boolean(catalog.highlights?.length);
  const hasFeatured = Boolean(catalog.featured?.length);
  const hasNotes = Boolean(catalog.notes?.length);

  return (
    <>
      {hasHighlights ? (
        <section className="bg-ink py-10 lg:py-16">
          <Container>
            {catalog.highlightsTitle ? (
              <SectionHeading
                title={catalog.highlightsTitle}
                description={catalog.highlightsDescription}
              />
            ) : null}
            <ul
              className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${
                catalog.highlightsTitle ? "mt-10" : ""
              }`}
            >
              {catalog.highlights?.map((item) => (
                <HighlightCard key={item.id} item={item} />
              ))}
            </ul>
            {!hasFeatured && !hasNotes ? <CatalogCta /> : null}
          </Container>
        </section>
      ) : null}

      {hasFeatured ? (
        <section className={`py-10 lg:py-16 ${hasHighlights ? "bg-forest" : "bg-ink"}`}>
          <Container>
            {catalog.featuredTitle ? (
              <SectionHeading
                title={catalog.featuredTitle}
                description={catalog.featuredDescription}
              />
            ) : null}
            {featuredLayout === "grid" ? (
              <div
                className={`grid gap-4 lg:grid-cols-3 ${catalog.featuredTitle ? "mt-10" : ""}`}
              >
                {catalog.featured?.map((product) => (
                  <FeaturedGridCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className={`space-y-6 ${catalog.featuredTitle ? "mt-10" : ""}`}>
                {catalog.featured?.map((product, index) => (
                  <FeaturedStackCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}
            {!hasNotes ? <CatalogCta /> : null}
          </Container>
        </section>
      ) : null}

      {hasNotes ? (
        <section className="bg-forest py-8 lg:py-12">
          <Container>
            <ul className="grid gap-4 sm:grid-cols-3">
              {catalog.notes?.map((note) => (
                <li
                  key={note}
                  className="border border-line bg-moss px-5 py-5 text-sm leading-relaxed text-parchment"
                >
                  {note}
                </li>
              ))}
            </ul>
            <CatalogCta />
          </Container>
        </section>
      ) : null}
    </>
  );
}
