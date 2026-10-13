import type { Metadata } from "next";
import { OfferCard } from "@/components/cards/OfferCard";
import { PageHero } from "@/components/interior/PageHero";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { offers } from "@/lib/site";

export const metadata: Metadata = {
  title: "Special Offers",
  description:
    "Current special offers on rifles, optics, clay traps, DogTrace systems and thermal equipment from Barron Sports in Ennis.",
};

export default function SpecialOffersPage() {
  return (
    <>
      <PageHero
        eyebrow="While stock lasts"
        title="Special Offers"
        description="Selected packages and reduced-price equipment, available from the shop in Newpark, Ennis. Prices and stock can change — call before you travel."
        image={{
          src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=80",
          alt: "Mountain country under a clearing sky",
        }}
      />
      <section className="bg-ink py-16 lg:py-24">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
          <div className="mt-12">
            <Button href="/contact-us" variant="secondary">
              Enquire about an offer
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
