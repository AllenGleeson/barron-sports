import type { NextConfig } from "next";

function sanitizeBasePath(raw: string | undefined) {
  const value = (raw ?? "").trim();
  if (!value || value === "/") return "";
  const withSlash = value.startsWith("/") ? value : `/${value}`;
  return withSlash.replace(/\/+$/, "");
}

const pagesBasePath = sanitizeBasePath(process.env.PAGES_BASE_PATH);

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
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
  env: {
    NEXT_PUBLIC_BASE_PATH: pagesBasePath,
  },
};

if (pagesBasePath) {
  nextConfig.basePath = pagesBasePath;
}

export default nextConfig;
