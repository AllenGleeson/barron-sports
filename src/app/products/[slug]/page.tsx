import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCardList } from "@/components/cards/ProductCard";
import { PageHero } from "@/components/interior/PageHero";
import { ProductSearch } from "@/components/products/ProductSearch";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import {
  categories,
  categoryProducts,
  getCategory,
  MIN_PRODUCTS_FOR_SEARCH,
  site,
} from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: "Products" };
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const products = categoryProducts[category.slug] ?? [];
  const showSearch = products.length >= MIN_PRODUCTS_FOR_SEARCH;

  return (
    <>
      <PageHero
        eyebrow="Products"
        title={category.name}
        description={category.description}
        image={category.image}
      />
      <section className="bg-ink py-8 lg:py-10">
        <Container>
          {products.length > 0 ? (
            showSearch ? (
              <ProductSearch products={products} />
            ) : (
              <ProductCardList products={products} />
            )
          ) : (
            <p className="max-w-xl text-parchment">
              Current stock changes regularly. Call or visit the shop in Ennis
              for the latest {category.name.toLowerCase()}.
            </p>
          )}
          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <Button href="/contact-us">Ask about availability</Button>
            <Button href={site.phone.href} variant="secondary">
              Call {site.phone.display}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
