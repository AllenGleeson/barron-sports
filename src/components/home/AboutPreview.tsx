import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CoverImage } from "@/components/media/CoverImage";

export function AboutPreview() {
  return (
    <section className="bg-ink py-10 lg:py-12" aria-labelledby="about-heading">
      <Container className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative min-h-[22rem] overflow-hidden lg:min-h-[28rem]">
          <CoverImage
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80"
            alt="Still lake and wooded hills in the west of Ireland"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-brass">
            Established in Ennis
          </p>
          <h2
            id="about-heading"
            className="mt-4 font-display text-4xl leading-tight text-cream sm:text-5xl"
          >
            About Barron Sports
          </h2>
          <span className="mt-5 block h-px w-14 bg-brass/80" aria-hidden="true" />
          <p className="mt-6 text-base leading-relaxed text-parchment">
            Barron Sports is a specialist sporting and outdoor equipment retailer
            in Newpark, Ennis, County Clare. We supply Ireland’s shooting and
            hunting community with rifles, shotguns, optics, DogTrace systems and
            field accessories from makers we are prepared to stand behind.
          </p>
          <p className="mt-4 text-base leading-relaxed text-parchment">
            The shop is run with a practical eye: quality over volume, honest
            advice, and customer service that continues after the sale — from
            barrel threading and scope mounting to in-house DogTrace repairs.
          </p>
          <blockquote className="mt-8 border-l border-brass pl-5 font-display text-2xl leading-snug text-cream">
            Expertise, quality and straightforward service, for people who use
            their equipment.
          </blockquote>
          <div className="mt-8">
            <Button href="/about" variant="secondary">
              Learn More
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
