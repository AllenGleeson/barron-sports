/** Product categories: the source for category pages, nav and links. */

export type FeaturedCollection = {
  name: string;
  href: string;
  image: { src: string; alt: string };
};

export function categoryHref(slug: string) {
  return `/products/${slug}`;
}

/** Firearm categories list stock without product images. */
export const FIREARM_CATEGORY_SLUGS = ["rifles", "shotguns"] as const;

export function isFirearmCategory(slug: string) {
  return (FIREARM_CATEGORY_SLUGS as readonly string[]).includes(slug);
}

export type Category = {
  slug: string;
  name: string;
  href: string;
  /** One-line description in the header's Products menu. */
  menuDescription: string;
  shortDescription: string;
  description: string;
  image: { src: string; alt: string };
};

export const categories: Category[] = (
  [
    {
      slug: "accessories",
      name: "Accessories",
      menuDescription: "Sights, mounts, traps and field equipment",
      shortDescription: "Sights, mounts, clay traps and field essentials.",
      description:
        "From Vortex sights and scope rings to Champion clay traps, moderators and aftermarket stocks. Practical equipment chosen for Irish hunting and clay shooting.",
      image: {
        src: "/categories/category-accessories.jpg",
        alt: "Hunting accessories including a cartridge belt, binoculars and scope rings",
      },
    },
    {
      slug: "dogtrace",
      name: "DogTrace",
      menuDescription: "GPS tracking and training collars",
      shortDescription: "GPS dog tracking and training systems, fitted in-house.",
      description:
        "Official DogTrace GPS collars and training systems with Barron Sports’ exclusive heat-shrink protective armour fitted free of charge. In-house repairs for our customers.",
      image: {
        src: "/categories/category-dogtrace.png",
        alt: "DogTrace GPS handheld tracker and orange tracking collar",
      },
    },
    {
      slug: "night-vision-optics",
      name: "Night Vision Optics",
      menuDescription: "Thermal imaging and digital night vision",
      shortDescription: "Thermal spotters and digital night vision riflescopes.",
      description:
        "InfiRay, Pixfra, Pulsar and Pard thermal and digital night vision for low-light observation and hunting. Selected for performance in Irish conditions.",
      image: {
        src: "/categories/category-night-vision.jpg",
        alt: "Thermal and digital night vision optics in low light",
      },
    },
    {
      slug: "flashlights",
      name: "Flashlights",
      menuDescription: "Hunting lamps and IR torches",
      shortDescription: "Dimmable hunting lamps and IR torches for night vision.",
      description:
        "Focusable tri-colour hunting flashlights and dedicated IR torches for digital night vision. Each lamp is dimmable, zoomable and supplied with a rechargeable 18650 battery.",
      image: {
        src: "/categories/category-flashlights.jpg",
        alt: "Hunting flashlight projecting a focused beam in the dark",
      },
    },
    {
      slug: "rifles",
      name: "Rifles",
      menuDescription: "Centrefire, rimfire and air rifles",
      shortDescription: "Centrefire, rimfire and air rifles from trusted makers.",
      description:
        "A carefully chosen selection of rifles from Howa, Tikka, Bergara, CZ, Steyr, Ruger, Anschütz and others. Advice, threading, mounting and package builds available in-store. Stock changes — please call to confirm before you travel.",
      image: {
        src: "/categories/category-rifles.jpg",
        alt: "Sporting rifle with walnut stock on a dark workbench",
      },
    },
    {
      slug: "shotguns",
      name: "Shotguns",
      menuDescription: "Game, clay and sporting guns",
      shortDescription: "Game and clay guns from established European makers.",
      description:
        "Shotguns from Beretta, Browning, Blaser, Miroku, Yildiz, Huglu and Webley & Scott, suited to Irish game, wildfowl and clay shooting. Stock changes — please call to confirm before you travel.",
      image: {
        src: "/categories/category-shotguns.jpg",
        alt: "Pair of over-under sporting shotguns on dark cloth",
      },
    },
  ] satisfies Omit<Category, "href">[]
).map((category) => ({ ...category, href: categoryHref(category.slug) }));

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}
