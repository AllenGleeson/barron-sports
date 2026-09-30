import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <section className="bg-ink py-32">
      <Container className="max-w-xl">
        <p className="text-[11px] uppercase tracking-[0.32em] text-brass">404</p>
        <h1 className="mt-4 font-display text-5xl text-cream">Page not found</h1>
        <p className="mt-5 text-parchment">
          That page is not on the Barron Sports site. Return home or browse the product range.
        </p>
        <div className="mt-8">
          <Button href="/">Back to home</Button>
        </div>
      </Container>
    </section>
  );
}
