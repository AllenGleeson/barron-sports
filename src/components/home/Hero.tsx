import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CoverImage } from "@/components/media/CoverImage";

export function Hero() {
  return (
    <section className="relative isolate min-h-[56vh] overflow-hidden">
      <CoverImage
        src="/c02b5778-328b-4785-a803-92733866897c.jpg"
        alt="Inside Barron Sports in Ennis, with glass cabinets of shooting equipment and outdoor clothing"
        priority
        className="scale-105 object-[center_40%]"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-ink via-ink/78 to-ink/25"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40"
        aria-hidden="true"
      />

      <Container className="relative flex min-h-[56vh] items-end pt-4 sm:items-center sm:pt-6">
        <div className="max-w-2xl">
          <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.36em] text-brass">
            <span className="inline-block h-px w-8 bg-brass" aria-hidden="true" />
            Ennis, County Clare
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] text-cream sm:text-6xl lg:text-7xl">
            Equipment for the Outdoors
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-parchment">
            Quality sporting equipment, optics, firearms, accessories and
            specialist products from trusted brands.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="/products">Explore Products</Button>
            <Button href="/special-offers" variant="secondary">
              Special Offers
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
