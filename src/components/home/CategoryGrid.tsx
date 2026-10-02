import { FeaturedCollectionCard } from "@/components/cards/FeaturedCollectionCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { categories } from "@/lib/site";

export function CategoryGrid() {
  return (
    <section className="bg-ink pb-8 pt-2 lg:pb-10 lg:pt-3" aria-labelledby="categories-heading">
      <Container>
        <h2
          id="categories-heading"
          className="mb-6 text-center font-display text-3xl uppercase tracking-[0.22em] text-cream sm:text-4xl lg:mb-8"
        >
          Products
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {categories.map((category) => (
            <FeaturedCollectionCard key={category.slug} collection={category} />
          ))}
        </div>
        <div className="mt-6 flex justify-center lg:mt-8">
          <Button href="/products" variant="ghost">
            View All Products
          </Button>
        </div>
      </Container>
    </section>
  );
}
