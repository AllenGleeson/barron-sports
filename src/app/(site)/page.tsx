import { BrandWall } from "@/components/home/BrandWall";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { CourseFeature } from "@/components/home/CourseFeature";
import { Hero } from "@/components/home/Hero";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { SpecialOffers } from "@/components/home/SpecialOffers";
import { SHOW_COURSE } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      {SHOW_COURSE && <CourseFeature />}
      <SpecialOffers />
      <ServicesPreview />
      <BrandWall />
    </>
  );
}
