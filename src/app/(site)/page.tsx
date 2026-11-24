import { BrandWall } from "@/components/home/BrandWall";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { CourseFeature } from "@/components/home/CourseFeature";
import { Hero } from "@/components/home/Hero";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { SpecialOffers } from "@/components/home/SpecialOffers";
import type { Metadata } from "next";
import { localBusinessJsonLd, pageMetadata } from "@/lib/seo";
import { site, SHOW_COURSE } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMetadata({ title: site.tagline, description: site.description, path: "/" }),
  // The home page keeps the full "Barron Sports | For All Your Shooting Needs" title.
  title: { absolute: `${site.name} | ${site.tagline}` },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so the JSON can't close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessJsonLd()).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      <CategoryGrid />
      {SHOW_COURSE && <CourseFeature />}
      <SpecialOffers />
      <ServicesPreview />
      <BrandWall />
    </>
  );
}
