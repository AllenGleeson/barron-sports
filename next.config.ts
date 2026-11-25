import type { NextConfig } from "next";
import { SHOW_CONTACT_PAGE, SHOW_COURSE } from "./src/lib/features";

const nextConfig: NextConfig = {
  trailingSlash: true,
  async redirects() {
    return [
      // Hidden features send visitors to the home page. Temporary (307), so
      // browsers and Google don't remember it once the page goes live.
      ...(SHOW_CONTACT_PAGE ? [] : [{ source: "/contact-us", destination: "/", permanent: false }]),
      ...(SHOW_COURSE
        ? []
        : [
            { source: "/course", destination: "/", permanent: false },
            { source: "/course/:path*", destination: "/", permanent: false },
          ]),
      // The old enrolment preview; enrolment now starts from the course dashboard.
      { source: "/course/enrol", destination: "/course/dashboard/", permanent: false },
      // Addresses from the old BaseKit site (www.barronsports.ie), so search
      // rankings and bookmarks carry over. Permanent (308) redirects.
      { source: "/products1", destination: "/products/", permanent: true },
      { source: "/products1/index", destination: "/products/", permanent: true },
      { source: "/products1/pulsar-axion-xm30f", destination: "/products/night-vision-optics/", permanent: true },
      { source: "/products1/infiray-tube-td50l", destination: "/products/night-vision-optics/", permanent: true },
      { source: "/products1/pixfra", destination: "/products/night-vision-optics/", permanent: true },
      { source: "/products1/:slug", destination: "/products/:slug/", permanent: true },
      { source: "/services", destination: "/#services", permanent: true },
      { source: "/gallery", destination: "/about/", permanent: true },
      { source: "/confirmation", destination: "/", permanent: true },
    ];
  },
  images: {
    // Admin users can paste any image URL (or upload a data: URL), so images
    // are served as-is rather than through the optimiser, which only accepts
    // the hosts listed below and counts against Vercel's image quota.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "d2f0ora2gkri0g.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "www.lithgowarms.com",
      },
      {
        protocol: "https",
        hostname: "img.fruugo.com",
      },
      {
        protocol: "https",
        hostname: "www.championtarget.com",
      },
      {
        protocol: "https",
        hostname: "cdn-new.pard.com",
      },
      {
        // Supabase Storage (admin uploads).
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
