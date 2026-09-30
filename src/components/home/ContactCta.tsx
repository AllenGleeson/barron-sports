import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CoverImage } from "@/components/media/CoverImage";
import { site } from "@/lib/site";

export function ContactCta() {
  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="contact-cta-heading">
      <CoverImage
        src="https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=2200&q=80"
        alt="Tall pine forest in low light"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-ink/78" aria-hidden="true" />
      <Container className="relative py-14 text-center lg:py-16">
        <p className="text-[11px] uppercase tracking-[0.32em] text-brass">
          Visit or call
        </p>
        <h2
          id="contact-cta-heading"
          className="mx-auto mt-5 max-w-3xl font-display text-4xl leading-tight text-cream sm:text-5xl"
        >
          Need Help Finding the Right Equipment?
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-parchment">
          Speak with Barron Sports in Ennis. Whether you need a rifle package,
          a thermal spotter, a DogTrace collar or straightforward advice, we
          would rather talk it through than sell you the wrong thing.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/contact-us">Contact Us</Button>
          <Button href={site.phone.href} variant="secondary">
            Get in Touch
          </Button>
        </div>
      </Container>
    </section>
  );
}
