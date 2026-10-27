/** Special offers shown on the home page and /special-offers. */

import { categoryHref } from "@/lib/content/categories";
import type { Product } from "@/lib/content/products";

export type SpecialOffer = {
  id: string;
  category: string;
  title: string;
  image: string;
  description: string[];
  summary?: string;
  kind?: "offer" | "package";
  rrp?: string;
  price: string;
  badge?: string;
  href?: string;
};

export const SPECIAL_OFFERS: SpecialOffer[] = [
  {
    id: "howa-1500-223",
    category: "Rifles",
    title: "Howa 1500",
    image:
      "https://d2f0ora2gkri0g.cloudfront.net/63/f0/63f091be-4fce-4925-b832-45a38dfd4efb.png",
    description: [
      ".223 Sporter (Upgraded from standard package)",
      "Nikko Stirling Diamond Long Range 4-16x50 scope",
      "RCC Mod",
      "Bipod",
      "Rifle bag",
    ],
    price: "€1,399",
  },
  {
    id: "dogtrace-gps",
    category: "DogTrace",
    title: "GPS Dog Tracking Systems",
    image: "/offers/dogtrace-gps.jpg",
    description: [
      "Full line-up of GPS tracking systems",
      "No subscription required",
      "High-visibility fluorescent orange collar",
    ],
    price: "Inquire for Pricing",
    badge: "Full Lineup",
    href: categoryHref("dogtrace"),
  },
  {
    id: "barron-ao-scope",
    category: "Scopes",
    title: "Barron Sports AO Illuminated Scope",
    image:
      "https://d2f0ora2gkri0g.cloudfront.net/6e/ad/6ead7c06-ffd5-4cd0-8d0e-8aeb0698e482.jpeg",
    description: [
      "Mil-dot reticle 6-24x50",
      "1-inch tube with illumination",
      "Includes mounting rings",
    ],
    rrp: "€225",
    price: "€175",
  },
  {
    id: "champion-clay-trap",
    category: "Clay Traps",
    title: "Champion Clay Trap - Workhorse",
    image: "/offers/champion-clay-trap.jpg",
    description: [
      "12V electronic operation",
      "50-clay capacity stack",
      "25' foot pedal release",
      "Lightweight and compact design",
      "Next day delivery available (€25)",
    ],
    price: "€599",
  },
  {
    id: "impact-ear-muffs",
    category: "Ear Protection",
    title: "Impact Electronic Ear Muffs",
    image:
      "https://d2f0ora2gkri0g.cloudfront.net/47/d5/47d5386e-8c4d-4ea2-b126-6a17a9c5ff01.png",
    description: [
      "Adjustable closure headband",
      "Actively shuts off impulse noise over 82 dB",
      "4X sound amplification for commands and ambient sounds",
    ],
    price: "€85",
  },
  {
    id: "pard-thermal-spotter",
    category: "Thermal Optics",
    title: "Pard Thermal Image Spotters",
    image: "https://cdn-new.pard.com/mall/landing/product/leopard-256/carousel/01.png",
    description: [
      "High-resolution thermal imaging optics",
      "Compact handheld design for field tracking",
    ],
    price: "From €599",
  },
];

/** Which product category each offer's category label belongs to. */
export const OFFER_CATEGORY_SLUGS: Record<string, string> = {
  Rifles: "rifles",
  DogTrace: "dogtrace",
  Scopes: "accessories",
  "Clay Traps": "accessories",
  "Ear Protection": "accessories",
  "Thermal Optics": "night-vision-optics",
};

export function offerHref(offer: SpecialOffer) {
  if (offer.href) return offer.href;
  const slug = OFFER_CATEGORY_SLUGS[offer.category];
  return slug ? categoryHref(slug) : "/special-offers";
}

/** Only DogTrace offers get a "View Offer" button, linking to the DogTrace catalogue. */
export function offerHasViewLink(offer: Pick<SpecialOffer, "category">) {
  return OFFER_CATEGORY_SLUGS[offer.category] === "dogtrace";
}

/**
 * Offers are linked to catalogue products by title, because products in this
 * file have no ids. Use this everywhere the two are compared.
 */
export function sameTitle(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function isSpecialOfferProduct(product: Pick<Product, "name">) {
  return SPECIAL_OFFERS.some((offer) => sameTitle(offer.title, product.name));
}
