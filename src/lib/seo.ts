import type { Metadata } from "next";
import { pageImages, site } from "@/lib/site";

/** Photo used when a page is shared on social media or messaging apps. */
export const SHARE_IMAGE = pageImages.shopInterior.src;

type PageMetadataInput = {
  /** Page name; the root layout adds " | Barron Sports". */
  title: string;
  description: string;
  /** Path with a trailing slash, e.g. "/products/dogtrace/" ("/" for home). */
  path: string;
  image?: string;
};

/**
 * Title, description, canonical URL and social card for a public page.
 * Use it in every public page's `metadata` / `generateMetadata` so each page
 * names its own address (and doesn't inherit the home page's).
 */
export function pageMetadata({ title, description, path, image = SHARE_IMAGE }: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url: path,
      siteName: site.name,
      locale: "en_IE",
      type: "website",
      images: [{ url: image }],
    },
  };
}

/** Home page structured data: the shop as a local business (name, address, phone, hours). */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SportingGoodsStore",
    name: site.name,
    url: site.url,
    logo: `${site.url}/brand/logo.png`,
    image: `${site.url}${SHARE_IMAGE}`,
    description: site.description,
    telephone: site.phone.href.replace("tel:", ""),
    email: site.email.display,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Newpark",
      addressLocality: "Ennis",
      addressRegion: "Co. Clare",
      postalCode: site.address.eircode,
      addressCountry: "IE",
    },
    openingHoursSpecification: openingHours(),
  };
}

const WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** `site.hours` ("Monday – Friday", "10:00 – 18:30") as schema.org opening hours. */
function openingHours() {
  return site.hours.flatMap((item) => {
    const times = item.time.split("–").map((part) => part.trim());
    if (times.length !== 2) return []; // "Closed"
    const [first, last = first] = item.day.split("–").map((part) => part.trim());
    const from = WEEK.indexOf(first);
    const to = WEEK.indexOf(last);
    if (from === -1 || to === -1) return [];
    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: WEEK.slice(from, to + 1),
        opens: times[0],
        closes: times[1],
      },
    ];
  });
}
