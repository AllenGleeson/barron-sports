import type { Metadata } from "next";
import { BrandSections } from "@/components/brands/BrandSections";
import { PageHero } from "@/components/interior/PageHero";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { catalogueBrandNames, pageImages, SHOW_CONTACT_PAGE, site } from "@/lib/site";

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
        image={pageImages.brandsHero}
      />
      <section className="bg-ink py-8 lg:py-10">
        <Container>
          <BrandSections productBrandNames={catalogueBrandNames()} />
          {SHOW_CONTACT_PAGE ? (
            <div className="mt-10">
              <Button href="/contact-us" variant="ghost">
                Ask about a brand
              </Button>
            </div>
          ) : (
            <p className="mt-10 text-base text-parchment">
              Looking for a brand? Call us on {site.phone.display}.
            </p>
          )}
        </Container>
      </section>
    </>
  );
}
