import { FeaturedCollectionCard } from "@/components/cards/FeaturedCollectionCard";
import { Container } from "@/components/ui/Container";
import { categories } from "@/lib/site";

export function CategoryGrid() {
  return (
    <section className="bg-ink pb-8 pt-6 lg:pb-10 lg:pt-8" aria-labelledby="categories-heading">
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
      </Container>
    </section>
  );
}
