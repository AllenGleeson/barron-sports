/**
 * Site content. Shop details, navigation and services live here; larger
 * content sets live in src/lib/content/ and are re-exported so everything
 * imports from "@/lib/site".
 */
import { categories } from "@/lib/content/categories";

export * from "@/lib/content/categories";
export * from "@/lib/content/offers";
export * from "@/lib/content/brands";
export * from "@/lib/content/course";
export * from "@/lib/content/products";
export * from "@/lib/content/catalogues";

export const site = {
  name: "Barron Sports",
  tagline: "For All Your Shooting Needs",
  description:
    "Specialist sporting and outdoor equipment retailer in Ennis, Co. Clare. Quality firearms, optics, DogTrace systems, accessories and trusted brands.",
  location: "Ennis, Co. Clare",
  address: {
    lines: ["Barron Sports", "Newpark, Ennis", "Co. Clare, Ireland"],
    eircode: "V95 XPK8",
    full: "Barron Sports, Newpark, Ennis, Co. Clare, Ireland V95 XPK8",
  },
  phone: {
    display: "+353 87 744 1042",
    href: "tel:+353877441042",
  },
  email: {
    display: "Gbarron@hotmail.com",
    href: "mailto:Gbarron@hotmail.com",
  },
  hours: [
    { day: "Monday – Friday", time: "10:00 – 19:00" },
    { day: "Saturday", time: "10:00 – 12:30" },
    { day: "Sunday", time: "Closed" },
  ],
  visitNote: "Please call before you come.",
} as const;

/** Photos used on more than one page, or outside a category or course entry. */
export const pageImages = {
  shopInterior: {
    src: "/home/shop-background.jpg",
    alt: "Inside Barron Sports in Ennis, with glass cabinets of shooting equipment and outdoor clothing",
  },
  aboutHero: {
    src: "/pages/about-hero.webp",
    alt: "Rifles and shotguns on the walls of Barron Sports in Ennis",
  },
  aboutPreview: {
    src: "/pages/about-preview.webp",
    alt: "Still lake and wooded hills in the west of Ireland",
  },
  brandsHero: {
    src: "/pages/brands-hero.webp",
    alt: "Sun through a mature woodland canopy",
  },
  contactHero: {
    src: "/contact/contact-fanore.jpg",
    alt: "Fanore Beach on the Atlantic coast of County Clare",
  },
  contactCta: {
    src: "/pages/contact-cta.webp",
    alt: "Tall pine forest in low light",
  },
  offersHero: {
    src: "/pages/offers-hero.webp",
    alt: "Mountain country under a clearing sky",
  },
} as const;

export const footerNav = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Special Offers", href: "/special-offers" },
  { label: "Brands", href: "/brands" },
  { label: "Course", href: "/course" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact-us" },
];

export type NavItem = {
  label: string;
  href: string;
  prominent?: boolean;
  children?: { label: string; href: string; description: string }[];
};

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Products",
    href: "/products",
    children: categories.map((category) => ({
      label: category.name,
      href: category.href,
      description: category.menuDescription,
    })),
  },
  { label: "Special Offers", href: "/special-offers", prominent: true },
  { label: "Brands", href: "/brands" },
  { label: "Course", href: "/course" },
  { label: "About", href: "/about" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Admin", href: "/admin" },
];

export type Service = {
  title: string;
  description: string;
  image: { src: string; alt: string };
};

export const services: Service[] = [
  {
    title: "Gun Repairs",
    description:
      "Most firearm repairs are carried out in-house for Barron Sports customers in Ennis, with practical workshop support rather than a distant service centre.",
    image: {
      src: "/services/service-gun-repairs.jpg",
      alt: "Sporting rifle on a gunsmith workbench with tools under warm workshop light",
    },
  },
  {
    title: "Dent Removal",
    description:
      "Careful dent removal to restore barrels and metalwork without unnecessary refinishing. Ask in-store about the condition of your gun before work begins.",
    image: {
      src: "/services/service-dent-removal.jpg",
      alt: "Blued shotgun barrel in a padded vice during precision dent removal",
    },
  },
  {
    title: "Barrel Threading",
    description:
      "Barrel threading for silencers and sound moderators, carried out in-house. Bring the rifle and moderator so the thread, length and fit can be checked before work starts.",
    image: {
      src: "/services/service-barrel-threading.jpg",
      alt: "Rifle barrel in a padded vice being threaded for a sound moderator",
    },
  },
  {
    title: "Rifle Customisations",
    description:
      "Rifle custom work including stocks, threading, mounts and package builds, set up for how you actually use the rifle.",
    image: {
      src: "/services/service-rifle-custom.jpg",
      alt: "Custom hunting rifle with walnut stock, scope and bipod laid out for a package build",
    },
  },
  {
    title: "Parts Supplied",
    description:
      "Parts supplied for servicing and repairs. If you need a specific component, ask — we can often source it.",
    image: {
      src: "/services/service-parts.jpg",
      alt: "Organised gunsmith parts, springs, screws and tins on a dark oak bench",
    },
  },
];
