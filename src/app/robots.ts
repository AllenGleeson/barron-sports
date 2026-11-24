import type { MetadataRoute } from "next";
import { SHOW_COURSE, site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        // While the course is hidden, keep all of it out of search results;
        // once live, only the account pages stay out.
        ...(SHOW_COURSE
          ? ["/course/dashboard/", "/course/checkout/", "/course/learn/", "/course/reset-password/"]
          : ["/course/"]),
      ],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
