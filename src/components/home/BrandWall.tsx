import { BrandLogo } from "@/components/cards/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { brands, type Brand } from "@/lib/site";

export function BrandWall() {
  const mid = Math.ceil(brands.length / 2);
  const topRow = brands.slice(0, mid);
  const bottomRow = brands.slice(mid);

  return (
    <section className="bg-ink py-8 lg:py-10" aria-labelledby="brands-heading">
      <Container>
        <h2
          id="brands-heading"
          className="mb-6 text-center font-display text-3xl uppercase tracking-[0.22em] text-cream sm:text-4xl lg:mb-8"
        >
          Brands We Work With
        </h2>
      </Container>
      <div className="brands-marquee space-y-3" aria-label="Brand logos">
        <BrandRow items={topRow} />
        <BrandRow items={bottomRow} reverse />
      </div>
      <Container>
        <div className="mt-6 flex justify-center lg:mt-8">
          <Button href="/brands" variant="ghost">
            View All Brands
          </Button>
        </div>
      </Container>
    </section>
  );
}

function BrandRow({ items, reverse = false }: { items: Brand[]; reverse?: boolean }) {
  return (
    <div className="brands-marquee-row w-full min-w-0 overflow-hidden" aria-hidden="true">
      <div
        className={`flex w-max ${
          reverse ? "brands-marquee-track-reverse" : "brands-marquee-track"
        }`}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-3 pr-3">
            {items.map((brand) => (
              <div
                key={`${copy}-${brand.name}`}
                className="w-[11.5rem] shrink-0 sm:w-[13.5rem]"
              >
                <BrandLogo brand={brand} loading="eager" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
