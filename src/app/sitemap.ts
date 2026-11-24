import type { MetadataRoute } from "next";
import { categories, categoryHref, SHOW_CONTACT_PAGE, SHOW_COURSE, site } from "@/lib/site";

/** Public pages for search engines. Paths end in "/" to match `trailingSlash`. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/products/",
    ...categories.map((category) => `${categoryHref(category.slug)}/`),
    "/special-offers/",
    "/brands/",
    "/about/",
    ...(SHOW_CONTACT_PAGE ? ["/contact-us/"] : []),
    ...(SHOW_COURSE ? ["/course/"] : []),
  ];
  return paths.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
