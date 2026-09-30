import { BrandWall } from "@/components/home/BrandWall";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { Hero } from "@/components/home/Hero";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { SpecialOffers } from "@/components/home/SpecialOffers";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <SpecialOffers />
      <ServicesPreview />
      <BrandWall />
    </>
  );
}
