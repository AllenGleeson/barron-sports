import type { Metadata } from "next";
import { FeaturedCollectionCard } from "@/components/cards/FeaturedCollectionCard";
import { PageHero } from "@/components/interior/PageHero";
import { ProductSearch } from "@/components/products/ProductSearch";
import { Container } from "@/components/ui/Container";
import { categories, getAllProducts } from "@/lib/site";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Rifles, shotguns, DogTrace systems, night vision, flashlights and accessories from Barron Sports in Ennis.",
};

export default function ProductsIndexPage() {
  const products = getAllProducts();

  return (
    <>
      <PageHero
        compact
        title="Products"
        description="Rifles, shotguns, DogTrace systems, night vision, flashlights and accessories from the shop in Ennis."
        image={{
          src: "/c02b5778-328b-4785-a803-92733866897c.jpg",
          alt: "Inside Barron Sports in Ennis, with glass cabinets of shooting equipment and outdoor clothing",
        }}
      />
      <section className="bg-ink py-8 lg:py-10">
        <Container>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <FeaturedCollectionCard key={category.slug} collection={category} compact />
            ))}
          </div>
          <div className="mt-10">
            <ProductSearch products={products} showCategory />
          </div>
        </Container>
      </section>
    </>
  );
}
