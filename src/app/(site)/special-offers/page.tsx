import type { Metadata } from "next";
import { SpecialOffersGrid } from "@/components/offers/SpecialOffersGrid";
import { PageHero } from "@/components/interior/PageHero";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { pageImages, SPECIAL_OFFERS } from "@/lib/site";

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
        image={pageImages.offersHero}
      />
      <section className="bg-ink py-16 lg:py-24">
        <Container>
          <SpecialOffersGrid offers={SPECIAL_OFFERS} />
          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="/contact-us" variant="secondary">
              Enquire about an offer
            </Button>
            <Button href="/products" variant="ghost">
              All products
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
