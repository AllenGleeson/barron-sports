import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { Eyebrow } from "@/components/ui/Eyebrow";

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="bg-ink py-32">
        <Container className="max-w-xl">
          <Eyebrow wide>404</Eyebrow>
          <h1 className="mt-4 font-display text-5xl text-cream">Page not found</h1>
          <p className="mt-5 text-parchment">
            That page is not on the Barron Sports site. Return home or browse the product range.
          </p>
          <div className="mt-8">
            <Button href="/">Back to home</Button>
          </div>
        </Container>
      </section>
    </SiteChrome>
  );
}
