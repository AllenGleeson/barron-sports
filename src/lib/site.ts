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
    display: "gary@barronsports.ie",
    href: "mailto:gary@barronsports.ie",
  },
  hours: [
    { day: "Monday – Friday", time: "10:00 – 19:00" },
    { day: "Saturday", time: "10:00 – 12:30" },
    { day: "Sunday", time: "Closed" },
  ],
} as const;

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
    children: [
      {
        label: "Accessories",
        href: "/products/accessories",
        description: "Sights, mounts, traps and field equipment",
      },
      {
        label: "DogTrace",
        href: "/products/dogtrace",
        description: "GPS tracking and training collars",
      },
      {
        label: "Night Vision Optics",
        href: "/products/night-vision-optics",
        description: "Thermal imaging and digital night vision",
      },
      {
        label: "Flashlights",
        href: "/products/flashlights",
        description: "Hunting lamps and IR torches",
      },
      {
        label: "Rifles",
        href: "/products/rifles",
        description: "Centrefire, rimfire and air rifles",
      },
      {
        label: "Shotguns",
        href: "/products/shotguns",
        description: "Game, clay and sporting guns",
      },
    ],
  },
  { label: "Special Offers", href: "/special-offers", prominent: true },
  { label: "Brands", href: "/brands" },
  { label: "About", href: "/about" },
  { label: "Contact Us", href: "/contact-us" },
];

export const footerNav = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Special Offers", href: "/special-offers" },
  { label: "Brands", href: "/brands" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact-us" },
];

export type FeaturedCollection = {
  name: string;
  href: string;
  image: { src: string; alt: string };
};

export type Category = {
  slug: string;
  name: string;
  href: string;
  shortDescription: string;
  description: string;
  image: { src: string; alt: string };
};

export const categories: Category[] = [
  {
    slug: "accessories",
    name: "Accessories",
    href: "/products/accessories",
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
    href: "/products/dogtrace",
    shortDescription: "GPS dog tracking and training systems, fitted in-house.",
    description:
      "Official DogTrace GPS collars and training systems with Barron Sports’ exclusive heat-shrink protective armour fitted free of charge. In-house repairs for our customers.",
    image: {
      src: "/categories/category-dogtrace.jpg",
      alt: "Working gundog in Irish grassland wearing a GPS tracking collar",
    },
  },
  {
    slug: "night-vision-optics",
    name: "Night Vision Optics",
    href: "/products/night-vision-optics",
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
    href: "/products/flashlights",
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
    href: "/products/rifles",
    shortDescription: "Centrefire, rimfire and air rifles from trusted makers.",
    description:
      "A carefully chosen selection of rifles from Howa, Tikka, Bergara, CZ, Steyr, Ruger, Anschütz and others. Advice, threading, mounting and package builds available in-store.",
    image: {
      src: "/categories/category-rifles.jpg",
      alt: "Sporting rifle with walnut stock on a dark workbench",
    },
  },
  {
    slug: "shotguns",
    name: "Shotguns",
    href: "/products/shotguns",
    shortDescription: "Game and clay guns from established European makers.",
    description:
      "Shotguns from Beretta, Browning, Blaser, Miroku, Yildiz, Huglu and Webley & Scott, suited to Irish game, wildfowl and clay shooting.",
    image: {
      src: "/categories/category-shotguns.jpg",
      alt: "Pair of over-under sporting shotguns on dark cloth",
    },
  },
];

export type SpecialOffer = {
  id: string;
  category: string;
  title: string;
  image: string;
  description: string[];
  rrp?: string;
  price: string;
  badge?: string;
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

export const offers = SPECIAL_OFFERS;
export const featuredOffers = SPECIAL_OFFERS;

const offerCategoryHrefs: Record<string, string> = {
  Rifles: "/products/rifles",
  DogTrace: "/products/dogtrace",
  Scopes: "/products/night-vision-optics",
  "Clay Traps": "/products/accessories",
  "Ear Protection": "/products/accessories",
  "Thermal Optics": "/products/night-vision-optics",
};

export function offerHref(offer: SpecialOffer) {
  return offerCategoryHrefs[offer.category] ?? "/special-offers";
}

export type Brand = {
  name: string;
  logo: string;
};

export const brands: Brand[] = [
  {
    name: "DogTrace",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/24/5b/245baf83-e8c8-472a-a52a-33e764453e0b.png",
  },
  {
    name: "Lithgow Arms",
    logo: "https://www.lithgowarms.com/wp-content/uploads/2023/08/footer-lithgow-logo.png",
  },
  {
    name: "Browning Arms Company",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/71/9b/719bacc0-a758-4cbc-a744-667303ef1b8e.png",
  },
  {
    name: "Bushnell Outdoor Products",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/f4/17/f4171de5-f5c1-4105-a187-3abbbfd8312d.png",
  },
  {
    name: "J. G. Anschütz GmbH & Co. KG",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/01/da/01da4bbe-29ee-49bf-a9da-25dd6202c885.png",
  },
  {
    name: "Fabbrica d'Armi Pietro Beretta",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/15/1e/151e9e3c-7a46-47cb-9f69-b43ad60eb0cf.png",
  },
  {
    name: "Howard Leight by Honeywell",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/79/26/79268012-2770-49f5-93ae-58094deb072e.png",
  },
  {
    name: "Bergara",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/30/28/30286d60-7d7c-4e3a-b506-0c6e1e3b6aee.png",
  },
  {
    name: "Blaser",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/b5/49/b549b6fb-603a-4073-b4ce-e3c5658a8430.png",
  },
  {
    name: "LPA",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/85/00/8500a6a7-ee8b-4db6-ae0d-434200860812.png",
  },
  {
    name: "Česká zbrojovka (CZ)",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/07/4c/074c8b9d-3e8a-43a1-ab3a-a428faea4eda.png",
  },
  {
    name: "Cogswell & Harrison",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/d6/a1/d6a14617-7c96-4bda-ad45-d9cec06ac43b.png",
  },
  {
    name: "Leupold & Stevens",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/36/91/3691d857-bbca-4926-977a-86fb1af6e737.png",
  },
  {
    name: "Howa Machinery Company",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/49/65/49656029-29d3-4802-acd9-6cc883d5b657.png",
  },
  {
    name: "Huğlu Hunting Firearms Cooperative",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/78/71/7871d5b8-b686-48bc-9865-76619afcb561.png",
  },
  {
    name: "Meopta",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/66/59/66591fcb-093d-4ee8-bd02-0bcf703e208b.png",
  },
  {
    name: "Sturm, Ruger & Co.",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/77/a1/77a1c348-3c1a-41f3-8a1f-d8fd8c438752.png",
  },
  {
    name: "Miroku Corporation",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/82/4c/824c1de9-e7c4-4b3c-ba58-dc27bf0a8076.png",
  },
  {
    name: "Steyr Mannlicher",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/72/f1/72f1120b-8f1a-4f90-8c4d-7dc132739650.png",
  },
  {
    name: "Silma Arms S.r.l.",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/07/da/07dafa2e-1982-43c0-8c35-affdefa898b2.png",
  },
  {
    name: "Nikko Stirling",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/8c/af/8caf3d27-31e1-405f-86a7-46ab2c84b689.png",
  },
  {
    name: "Tikka T3",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/b8/a8/b8a8c7ef-a0b1-4ca2-9169-e7181b02083e.png",
  },
  {
    name: "Webley & Scott",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/19/b8/19b86c94-b13a-472c-8732-f8741e1c37f7.png",
  },
  {
    name: "Weihrauch & Weihrauch GmbH & Co. KG",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/dc/ec/dcec583b-e58b-45e6-8fde-6d0a862b634f.jpg",
  },
  {
    name: "Winchester",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/1e/3b/1e3b1206-1ea2-4865-ae4d-a4e45b1aa3c2.png",
  },
  {
    name: "Yildiz Shotgun",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/4c/61/4c615896-6ef3-49eb-b107-ce360c8a5ace.png",
  },
  {
    name: "Carl Zeiss AG",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/3a/70/3a70b99c-ea46-402d-aaa2-517a04483c36.png",
  },
  {
    name: "Gamo Outdoor, S.L.",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/7a/a9/7aa9501a-2c7b-4746-b4d3-cc9b4a5fdbd9.png",
  },
  {
    name: "Cascade Cartridge",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/cd/60/cd6076d7-9fa2-47cd-8da8-a228f6e2d1c9.png",
  },
  {
    name: "Ardee Sports Company",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/d1/e9/d1e96add-ae4a-4fb6-9737-72a9e1fa259b.png",
  },
  {
    name: "Eley Hawk",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/72/13/7213e5c9-6207-4a7b-8278-3854c5a3592b.png",
  },
  {
    name: "Federal Premium Ammunition",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/10/27/1027ff50-f87f-4e94-97e7-c7d6a59e2e07.png",
  },
  {
    name: "Fiocchi Munizioni",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/36/a8/36a84c66-e0d8-4dc8-9be4-da0019f5c058.jpg",
  },
  {
    name: "Hornady Manufacturing Company",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/92/00/9200cacb-acf6-44f8-9805-e8ba033a6759.png",
  },
  {
    name: "RC Eximport S.R.L.",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/28/4d/284d97b5-d5f5-4221-b6ed-89f650c8eee9.png",
  },
  {
    name: "Lakeland Shooting Center",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/4d/b5/4db5c177-be5b-45ac-a9bc-b48dab99c1bb.png",
  },
  {
    name: "Gowen & Bradshaw",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/16/68/1668ed4c-79d0-4795-a368-06cede00983d.png",
  },
  {
    name: "Highland Outdoors",
    logo: "https://d2f0ora2gkri0g.cloudfront.net/be/9c/be9cbfb6-f9b8-4b72-a864-870c5f45c284.png",
  },
];

export const featuredBrands = brands;

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

export type Product = {
  name: string;
  price?: string;
  originalPrice?: string;
  summary: string;
  href?: string;
  image?: string;
  brands?: string[];
};

export const PRODUCT_PLACEHOLDER_IMAGE = "/products/product-placeholder.jpg";

export const categoryProducts: Record<string, Product[]> = {
  accessories: [
    {
      name: "Vortex sights",
      brands: ["Vortex"],
      summary: "Full line of Vortex sights at competitive prices.",
    },
    {
      name: "Champion Workhorse clay trap",
      price: "€625",
      brands: ["Champion"],
      summary:
        "50-clay stack, 25-foot pedal release, remote-control upgrade, up to 75-yard throwing distance. Light portable 12V design. Next-day delivery available.",
    },
    {
      name: "Scope rings, mounts & moderators",
      summary:
        "Rings, mounts, lights, aftermarket stocks and barrel threading arranged in-store.",
    },
  ],
  dogtrace: [
    {
      name: "DOG GPS X20 starter set",
      price: "€475",
      brands: ["DogTrace"],
      summary:
        "Collar, handset and chargers. Locate dogs up to 20 km. Additional collars €250.",
    },
    {
      name: "DOG GPS X25 / X25T",
      price: "From €525",
      brands: ["DogTrace"],
      summary:
        "X25 without training €525. X25T with training function €575. Additional collars from €275.",
    },
    {
      name: "DOG GPS X30 / X30T",
      price: "From €649",
      brands: ["DogTrace"],
      summary:
        "Phone-linked sets. X30 €649, X30T with training €699. Maps, routes and barking indication via the Dogtrace app.",
    },
    {
      name: "d-control Professional 2000",
      price: "From €100",
      brands: ["DogTrace"],
      summary:
        "Electronic training collars with over 30 models, from under €100 up to the Pro 2000.",
    },
  ],
  "night-vision-optics": [
    {
      name: "InfiRay Tube-TD50L",
      brands: ["InfiRay"],
      summary:
        "Digital night vision riflescope in a traditional day-optic form. 13+ hour runtime, IP67, designed for bolt-action rifles.",
    },
    {
      name: "Pixfra thermal cameras",
      brands: ["Pixfra"],
      summary:
        "Proprietary heat-detection thermal cameras for identifying quarry and observing wildlife in complete darkness.",
    },
    {
      name: "Pulsar Axion 2 XQ35 Pro",
      brands: ["Pulsar"],
      summary:
        "Compact thermal spotter with AMOLED HD display, swappable APS3 battery and 16 GB internal memory.",
    },
    {
      name: "Pard thermal spotters",
      price: "From €599",
      href: "/special-offers",
      brands: ["Pard"],
      summary: "Thermal image spotters currently on offer.",
    },
  ],
  flashlights: [
    {
      name: "Tri-colour hunting flashlight",
      price: "€149",
      summary:
        "50 mm front lens, focusable beam to 400 m, red / green / white without refocusing. Dimmable, aluminium body, rechargeable battery included.",
    },
    {
      name: "IR torch for night vision",
      price: "€159",
      summary:
        "White, IR850 and IR940 beams for digital night vision. High output or near-covert illumination, with accessories and fast mode switching.",
    },
  ],
  rifles: [
    {
      name: "Howa, Tikka, Bergara & CZ",
      brands: ["Howa", "Tikka", "Bergara", "CZ"],
      summary:
        "Centrefire sporting rifles from established makers. Package builds with scope, moderator and bag available.",
    },
    {
      name: "Anschütz, Steyr, Ruger & Weihrauch",
      brands: ["Anschütz", "Steyr", "Ruger", "Weihrauch"],
      summary:
        "Precision rimfire, hunting rifles and air rifles. Ask about current stock in Ennis.",
    },
    {
      name: "Howa 1500 .223 Sporter package",
      price: "€1,399",
      href: "/special-offers",
      brands: ["Howa"],
      summary: "Upgraded package currently on special offer.",
    },
  ],
  shotguns: [
    {
      name: "Beretta, Browning & Blaser",
      brands: ["Beretta", "Browning", "Blaser"],
      summary:
        "Game and sporting shotguns from the names Irish shots know. Advice on fit, choke and cartridge in-store.",
    },
    {
      name: "Miroku, Yildiz, Huglu & Webley & Scott",
      brands: ["Miroku", "Yildiz", "Huglu", "Webley & Scott"],
      summary:
        "A spread of price points for clays, walked-up game and wildfowling.",
    },
  ],
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

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}
