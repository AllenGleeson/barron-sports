import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
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
    ],
  },
};

export default nextConfig;
