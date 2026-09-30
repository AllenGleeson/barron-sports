import type { Metadata } from "next";
import { PageHero } from "@/components/interior/PageHero";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CoverImage } from "@/components/media/CoverImage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Barron Sports is a specialist shooting and hunting retailer in Newpark, Ennis, Co. Clare, supplying quality equipment and in-house service.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Ennis, Co. Clare"
        title="About Barron Sports"
        description="A specialist sporting and outdoor equipment shop, not a general sports warehouse."
        image={{
          src: "/about/about-cliffs-of-moher.jpg",
          alt: "The Cliffs of Moher on the Atlantic coast of County Clare",
        }}
      />
      <section className="bg-ink py-16 lg:py-24">
        <Container className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-display text-3xl text-cream sm:text-4xl">
              Trusted supplier of shooting and hunting products
            </h2>
            <p className="mt-6 text-base leading-relaxed text-parchment">
              Barron Sports is based in Newpark, Ennis. We supply rifles, shotguns,
              night vision, thermal optics, DogTrace GPS systems, hunting lamps and
              the accessories that make a kit work in the field.
            </p>
            <p className="mt-4 text-base leading-relaxed text-parchment">
              The emphasis is on quality, fit-for-purpose equipment and the
              knowledge to match it to the job. Customers come in for a collar,
              a scope, a package rifle or a conversation about what will actually
              hold up in Clare weather.
            </p>
            <p className="mt-4 text-base leading-relaxed text-parchment">
              After the sale we still have a workshop: barrel threading, mounts,
              parts, and in-house DogTrace repairs for our own customers, including
              the exclusive protective armour fitted free on every collar we sell.
            </p>
            <p className="mt-8 text-sm text-stone">
              Contact Gary on {site.phone.display}, or visit the shop during opening hours.
            </p>
            <div className="mt-8">
              <Button href="/contact-us">Contact Us</Button>
            </div>
          </div>
          <div className="relative min-h-[22rem] overflow-hidden">
            <CoverImage
              src="/about/about-burren.jpg"
              alt="Limestone pavement of the Burren looking toward the Atlantic in County Clare"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </div>
        </Container>
      </section>
    </>
  );
}
