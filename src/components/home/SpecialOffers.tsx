import { OffersCarousel } from "@/components/home/OffersCarousel";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function SpecialOffers() {
  return (
    <section className="bg-ink py-8 lg:py-10" aria-labelledby="offers-heading">
      <Container>
        <h2
          id="offers-heading"
          className="mb-6 text-center font-display text-3xl uppercase tracking-[0.22em] text-cream sm:text-4xl lg:mb-8"
        >
          Special Offers
        </h2>
        <OffersCarousel />
        <div className="mt-6 flex justify-center lg:mt-8">
          <Button href="/special-offers" variant="ghost">
            View All Special Offers
          </Button>
        </div>
      </Container>
    </section>
  );
}
