import type { Metadata } from "next";
import { BrandLogo } from "@/components/cards/BrandLogo";
import { PageHero } from "@/components/interior/PageHero";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { brands } from "@/lib/site";

export const metadata: Metadata = {
  title: "Brands",
  description:
    "Firearms, optics and field brands stocked by Barron Sports in Ennis, including Browning, Beretta, Tikka, Zeiss, DogTrace and Lithgow Arms.",
};

export default function BrandsPage() {
  return (
    <>
      <PageHero
        compact
        eyebrow="The makers"
        title="Brands We Work With"
        description="We stock brands we are prepared to recommend. If a name is not listed, ask — we can often source it."
        image={{
          src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2200&q=80",
          alt: "Sun through a mature woodland canopy",
        }}
      />
      <section className="bg-ink py-8 lg:py-10">
        <Container>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {brands.map((brand) => (
              <li key={brand.name}>
                <BrandLogo brand={brand} />
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button href="/contact-us" variant="ghost">
              Ask about a brand
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
