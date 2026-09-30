import { BrandLogo } from "@/components/cards/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { brands } from "@/lib/site";

export function BrandWall() {
  const loopedBrands = [...brands, ...brands];

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
      <div className="overflow-hidden" aria-label="Brand logos">
        <div className="brands-marquee-track flex w-max gap-3 px-3">
          {loopedBrands.map((brand, index) => (
            <div
              key={`${brand.name}-${index}`}
              className="w-[11.5rem] shrink-0 sm:w-[13.5rem]"
            >
              <BrandLogo brand={brand} />
            </div>
          ))}
        </div>
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
