import { rifleStock, shotgunStock } from "@/data/firearm-stock";
import { categories } from "@/lib/content/categories";

export type Product = {
  name: string;
  price?: string;
  originalPrice?: string;
  summary: string;
  href?: string;
  image?: string;
  brands?: string[];
  badge?: string;
  condition?: string;
  featured?: boolean;
};

export const PRODUCT_PLACEHOLDER_IMAGE = "/products/product-placeholder.jpg";

export const categoryProducts: Record<string, Product[]> = {
  accessories: [
    {
      name: "Vortex sights",
      brands: ["Vortex"],
      href: "/products/accessories#sights",
      image:
        "https://d2f0ora2gkri0g.cloudfront.net/7e/d4/7ed4aa28-ac94-4f6b-baf8-c47d3d3b4192.jpg",
      summary: "Full line of Vortex sights at competitive prices.",
    },
    {
      name: "Champion Clay Trap - Workhorse",
      price: "€599",
      brands: ["Champion"],
      href: "/products/accessories#champion-workhorse",
      image: "/offers/champion-clay-trap.jpg",
      summary:
        "12V electronic operation, 50-clay stack, 25-foot pedal release, light portable design. Next-day delivery available (€25).",
    },
    {
      name: "Barron Sports AO Illuminated Scope",
      price: "€175",
      originalPrice: "€225",
      href: "/products/accessories",
      image:
        "https://d2f0ora2gkri0g.cloudfront.net/6e/ad/6ead7c06-ffd5-4cd0-8d0e-8aeb0698e482.jpeg",
      summary:
        "Mil-dot reticle 6-24x50, 1-inch tube with illumination, includes mounting rings.",
    },
    {
      name: "Impact Electronic Ear Muffs",
      price: "€85",
      brands: ["Howard Leight by Honeywell"],
      href: "/products/accessories",
      image:
        "https://d2f0ora2gkri0g.cloudfront.net/47/d5/47d5386e-8c4d-4ea2-b126-6a17a9c5ff01.png",
      summary:
        "Adjustable headband, shuts off impulse noise over 82 dB, 4X sound amplification.",
    },
    {
      name: "Scope rings, mounts & moderators",
      href: "/products/accessories#more",
      image:
        "https://d2f0ora2gkri0g.cloudfront.net/df/02/df02345d-8686-4776-b3ce-ce0f695a4690.jpg",
      summary:
        "Rings, mounts, lights, aftermarket stocks and barrel threading arranged in-store.",
    },
  ],
  dogtrace: [
    {
      name: "GPS Dog Tracking Systems",
      price: "Inquire for Pricing",
      brands: ["DogTrace"],
      href: "/products/dogtrace",
      image: "/offers/dogtrace-gps.jpg",
      badge: "Full Lineup",
      summary:
        "Full line-up of GPS tracking systems. No subscription required. High-visibility fluorescent orange collar.",
    },
    {
      name: "DOG GPS X20 starter set",
      price: "€475",
      brands: ["DogTrace"],
      href: "/products/dogtrace#x20",
      image:
        "https://d2f0ora2gkri0g.cloudfront.net/25/dd/25ddbf2c-16bc-4628-88ac-1a3f33c0e5b1.jpg",
      summary:
        "Collar, handset and chargers. Locate dogs up to 20 km. Additional collars €250.",
    },
    {
      name: "DOG GPS X25 / X25T",
      price: "From €525",
      brands: ["DogTrace"],
      href: "/products/dogtrace#range-x25",
      image:
        "https://d2f0ora2gkri0g.cloudfront.net/25/dd/25ddbf2c-16bc-4628-88ac-1a3f33c0e5b1.jpg",
      summary:
        "X25 without training €525. X25T with training function €575. Additional collars from €275.",
    },
    {
      name: "DOG GPS X30 / X30T",
      price: "From €649",
      brands: ["DogTrace"],
      href: "/products/dogtrace#x30t",
      image:
        "https://d2f0ora2gkri0g.cloudfront.net/2a/a7/2aa7a223-dfa6-4d30-bc41-5a2366b8edec.jpg",
      summary:
        "Phone-linked sets. X30 €649, X30T with training €699. Maps, routes and barking indication via the DogTrace app.",
    },
    {
      name: "d-control Professional 2000",
      price: "From €100",
      brands: ["DogTrace"],
      href: "/products/dogtrace#d-control",
      image:
        "https://d2f0ora2gkri0g.cloudfront.net/bf/75/bf754dd9-6740-4890-83d3-d394b7bceb4c.jpg",
      summary:
        "Electronic training collars with over 30 models, from under €100 up to the Pro 2000.",
    },
  ],
  "night-vision-optics": [
    {
      name: "InfiRay Tube-TD50L",
      brands: ["InfiRay"],
      href: "/products/night-vision-optics#infiray-td50l",
      image:
        "https://d2f0ora2gkri0g.cloudfront.net/b2/ed/b2ed1a7e-fe9f-417f-b727-3fd0b8c977d5.png",
      summary:
        "Digital night vision riflescope in a traditional day-optic form. 13+ hour runtime, IP67, designed for bolt-action rifles.",
    },
    {
      name: "Pixfra thermal cameras",
      brands: ["Pixfra"],
      href: "/products/night-vision-optics#pixfra",
      image:
        "https://d2f0ora2gkri0g.cloudfront.net/99/b3/99b3daa6-1da7-4a0c-a6d8-9e4f37689af4.png",
      summary:
        "Proprietary heat-detection thermal cameras for identifying quarry and observing wildlife in complete darkness.",
    },
    {
      name: "Pulsar Axion 2 XQ35 Pro",
      brands: ["Pulsar"],
      href: "/products/night-vision-optics#pulsar-axion",
      image:
        "https://d2f0ora2gkri0g.cloudfront.net/36/50/3650fe40-e709-437c-aa4e-63da2e9a903e.png",
      summary:
        "Compact thermal spotter with AMOLED HD display, swappable APS3 battery and 16 GB internal memory.",
    },
    {
      name: "Pard Thermal Image Spotters",
      price: "From €599",
      href: "/products/night-vision-optics",
      brands: ["Pard"],
      image: "https://cdn-new.pard.com/mall/landing/product/leopard-256/carousel/01.png",
      summary:
        "High-resolution thermal imaging optics in a compact handheld design for field tracking.",
    },
  ],
  flashlights: [
    {
      name: "Tri-colour hunting flashlight",
      price: "€149",
      href: "/products/flashlights#tri-colour",
      image:
        "https://d2f0ora2gkri0g.cloudfront.net/4d/38/4d383f28-ddfb-4acf-8b9d-3a8f76b7c7f4.png",
      summary:
        "50 mm front lens, focusable beam to 400 m, red / green / white without refocusing. Dimmable, aluminium body, rechargeable battery included.",
    },
    {
      name: "IR torch for night vision",
      price: "€159",
      href: "/products/flashlights#ir-torch",
      image:
        "https://d2f0ora2gkri0g.cloudfront.net/b8/bd/b8bdad65-e76b-46d3-8beb-daefcea48c76.jpg",
      summary:
        "White, IR850 and IR940 beams for digital night vision. High output or near-covert illumination, with accessories and fast mode switching.",
    },
    {
      name: "Additional 18650 battery",
      price: "€15",
      href: "/products/flashlights",
      summary: "Spare rechargeable battery for Barron Sports hunting flashlights.",
    },
  ],
  rifles: [
    {
      name: "Howa 1500",
      price: "€1,399",
      brands: ["Howa"],
      featured: true,
      href: "/products/rifles",
      image:
        "https://d2f0ora2gkri0g.cloudfront.net/63/f0/63f091be-4fce-4925-b832-45a38dfd4efb.png",
      summary:
        ".223 · Sporter package with Nikko Stirling Diamond Long Range 4-16x50, RCC moderator, bipod and rifle bag.",
    },
    ...rifleStock,
  ],
  shotguns: shotgunStock,
};

export const MIN_PRODUCTS_FOR_SEARCH = 6;

export type CatalogProduct = Product & {
  categorySlug: string;
  categoryName: string;
  categoryHref: string;
};

export function getAllProducts(): CatalogProduct[] {
  return categories.flatMap((category) =>
    (categoryProducts[category.slug] ?? []).map((product) => ({
      ...product,
      categorySlug: category.slug,
      categoryName: category.name,
      categoryHref: category.href,
    })),
  );
}
