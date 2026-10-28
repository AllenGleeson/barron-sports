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
        "/catalogues/accessories/sights.webp",
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
        "/offers/barron-sports-ao-illuminated-scope.webp",
      summary:
        "Mil-dot reticle 6-24x50, 1-inch tube with illumination, includes mounting rings.",
    },
    {
      name: "Impact Electronic Ear Muffs",
      price: "€85",
      brands: ["Howard Leight by Honeywell"],
      href: "/products/accessories",
      image:
        "/offers/impact-electronic-ear-muffs.webp",
      summary:
        "Adjustable headband, shuts off impulse noise over 82 dB, 4X sound amplification.",
    },
    {
      name: "Scope rings, mounts & moderators",
      href: "/products/accessories#more",
      image:
        "/catalogues/accessories/rings-mounts-and-more.webp",
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
        "/catalogues/dogtrace/dog-gps-x20.webp",
      summary:
        "Collar, handset and chargers. Locate dogs up to 20 km. Additional collars €250.",
    },
    {
      name: "DOG GPS X25 / X25T",
      price: "From €525",
      brands: ["DogTrace"],
      href: "/products/dogtrace#range-x25",
      image:
        "/catalogues/dogtrace/dog-gps-x20.webp",
      summary:
        "X25 without training €525. X25T with training function €575. Additional collars from €275.",
    },
    {
      name: "DOG GPS X30 / X30T",
      price: "From €649",
      brands: ["DogTrace"],
      href: "/products/dogtrace#x30t",
      image:
        "/catalogues/dogtrace/dog-gps-finder-x30t.webp",
      summary:
        "Phone-linked sets. X30 €649, X30T with training €699. Maps, routes and barking indication via the DogTrace app.",
    },
    {
      name: "d-control Professional 2000",
      price: "From €100",
      brands: ["DogTrace"],
      href: "/products/dogtrace#d-control",
      image:
        "/catalogues/dogtrace/d-control-professional-2000.webp",
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
        "/catalogues/night-vision-optics/infiray-tube-td50l.webp",
      summary:
        "Digital night vision riflescope in a traditional day-optic form. 13+ hour runtime, IP67, designed for bolt-action rifles.",
    },
    {
      name: "Pixfra thermal cameras",
      brands: ["Pixfra"],
      href: "/products/night-vision-optics#pixfra",
      image:
        "/catalogues/night-vision-optics/pixfra.webp",
      summary:
        "Proprietary heat-detection thermal cameras for identifying quarry and observing wildlife in complete darkness.",
    },
    {
      name: "Pulsar Axion 2 XQ35 Pro",
      brands: ["Pulsar"],
      href: "/products/night-vision-optics#pulsar-axion",
      image:
        "/catalogues/night-vision-optics/pulsar-axion-2-xq35-pro.webp",
      summary:
        "Compact thermal spotter with AMOLED HD display, swappable APS3 battery and 16 GB internal memory.",
    },
    {
      name: "Pard Thermal Image Spotters",
      price: "From €599",
      href: "/products/night-vision-optics",
      brands: ["Pard"],
      image: "/offers/pard-thermal-image-spotters.webp",
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
        "/catalogues/flashlights/tri-colour-flashlight-2.webp",
      summary:
        "50 mm front lens, focusable beam to 400 m, red / green / white without refocusing. Dimmable, aluminium body, rechargeable battery included.",
    },
    {
      name: "IR torch for night vision",
      price: "€159",
      href: "/products/flashlights#ir-torch",
      image:
        "/catalogues/flashlights/ir-torch-2.webp",
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
        "/offers/howa-1500.webp",
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
