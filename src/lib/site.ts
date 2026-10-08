import { rifleStock, shotgunStock } from "@/data/firearm-stock";

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
  { label: "Course", href: "/course" },
  { label: "About", href: "/about" },
  { label: "Contact Us", href: "/contact-us" },
];

export const footerNav = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Special Offers", href: "/special-offers" },
  { label: "Brands", href: "/brands" },
  { label: "Course", href: "/course" },
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
      src: "/categories/category-dogtrace-v3.jpg",
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
      "A carefully chosen selection of rifles from Howa, Tikka, Bergara, CZ, Steyr, Ruger, Anschütz and others. Advice, threading, mounting and package builds available in-store. Stock changes — please call to confirm before you travel.",
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
      "Shotguns from Beretta, Browning, Blaser, Miroku, Yildiz, Huglu and Webley & Scott, suited to Irish game, wildfowl and clay shooting. Stock changes — please call to confirm before you travel.",
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

const BRAND_ALIASES: Record<string, string> = {
  browning: "Browning Arms Company",
  "j. g. anschütz gmbh & co. kg": "J. G. Anschütz GmbH & Co. KG",
  anschütz: "J. G. Anschütz GmbH & Co. KG",
  beretta: "Fabbrica d'Armi Pietro Beretta",
  "fabbrica d'armi pietro beretta": "Fabbrica d'Armi Pietro Beretta",
  cz: "Česká zbrojovka (CZ)",
  "česká zbrojovka (cz)": "Česká zbrojovka (CZ)",
  howa: "Howa Machinery Company",
  huglu: "Huğlu Hunting Firearms Cooperative",
  ruger: "Sturm, Ruger & Co.",
  steyr: "Steyr Mannlicher",
  silma: "Silma Arms S.r.l.",
  tikka: "Tikka T3",
  yildiz: "Yildiz Shotgun",
};

export function brandLogoFor(name?: string) {
  if (!name) return undefined;
  const needle = name.trim().toLowerCase();
  const aliased = BRAND_ALIASES[needle] ?? name;
  const exact = brands.find((brand) => brand.name === aliased);
  if (exact) return exact;
  return brands.find((brand) => {
    const brandName = brand.name.toLowerCase();
    return brandName.includes(needle) || needle.includes(brandName);
  });
}

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

export const firearmsCourse = {
  title: "Firearms Safety Course",
  href: "https://hcap.ie/",
  cta: "Go to the course",
  provider: "Hunter Competence Assessment Programme",
  summary:
    "If you have completed Form FCA1 and An Garda Síochána have granted your firearm certificate, proceed to this course. HCAP is Ireland’s recognised Hunter Competence Assessment Programme for safe firearm handling and competent hunting practice.",
  image: {
    src: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=1600&q=80",
    alt: "Sporting rifle on a dark studio background",
  },
  topics: [
    {
      title: "Safe handling",
      body: "How to pick up, carry, pass and put down a firearm so the muzzle is always under control.",
    },
    {
      title: "Storage and transport",
      body: "Secure storage at home and safe transport in the vehicle, in line with Irish firearms law.",
    },
    {
      title: "Field and range conduct",
      body: "When it is safe to shoot, and when it is not — livestock, buildings, dogs and other people.",
    },
    {
      title: "Competence in the field",
      body: "Identification, shot placement and the habits expected of a responsible Irish hunter.",
    },
  ],
} as const;

export const GARDA_FCA1_HREF =
  "https://www.garda.ie/en/about-us/online-services/firearms-licensing/fca1_firearm_certificate_application-copy.pdf";
export const GARDA_LICENSING_HREF =
  "https://www.garda.ie/en/about-us/online-services/firearms-licensing/";

export type GuideBlock = {
  heading?: string;
  paragraphs?: string[];
  items?: string[];
};

export type CertificateGuide = {
  title: string;
  summary: string;
  blocks: GuideBlock[];
};

export const certificateGuides: CertificateGuide[] = [
  {
    title: "Filling in Form FCA1",
    summary:
      "What to attach, how to hand it in, the 90-day decision window, and what to do if the application is refused.",
    blocks: [
      {
        paragraphs: [
          "An Garda Síochána is expected to decide a firearm certificate application within 90 days. That clock starts only when a fully completed Form FCA1 is received. Missing signatures, photographs or supporting papers can stop the clock before it starts.",
        ],
      },
      {
        heading: "What to include",
        items: [
          "Two recent passport-sized photographs.",
          "Two character referees: names, addresses and contact numbers. They should have known you for at least two years. Family members, registered firearms dealers and serving Gardaí are not suitable referees.",
          "Your GP’s name and contact details, so the Gardaí can make medical enquiries about suitability if they need to.",
          "First-time applicants, or anyone whose previous certificate lapsed more than three years ago, should attach proof of competency — a Garda-recognised firearms safety course, or evidence of joining an authorised target shooting club.",
          "If you have held a certificate before, quote the certificate number or expiry instead of repeating a competency course, unless you are asked for more.",
          "Attach landowner permission, club membership or an NPWS foreshore licence where they support your reason for the gun.",
        ],
      },
      {
        heading: "Stating every use you intend",
        paragraphs: [
          "On Section 5 of Form FCA1, list every lawful activity you actually intend — for example vermin control and clay shooting, or foreshore wildfowling and hunting on private land. If the certificate is limited to one stated use, you cannot legally switch to another without a fresh application or substitution.",
        ],
      },
      {
        heading: "Handing it in",
        items: [
          "Call the local station first and ask which member deals with firearm certificates, and when they are on duty.",
          "Hand the completed form to that officer rather than leaving it at the public counter.",
          "Ask them to date-stamp it as received in front of you, check the date, and keep a copy of the stamped front page or a receipt. That stamp is your proof that the 90-day period has started.",
        ],
      },
      {
        heading: "If it is refused, or there is no decision",
        paragraphs: [
          "You may appeal to the District Court under Section 15A of the Firearms Act 1925 (as amended). A written refusal starts that right. If 90 days pass from a date-stamped complete application with neither grant nor refusal, the law treats that as a refusal and you may also appeal.",
          "An appeal must be lodged at the District Court office for the area where you live, within 30 days of the refusal (or of the 90 days running out). Name the Superintendent or Chief Superintendent as respondent, state the grounds, and serve a copy on the Gardaí. Ask a solicitor if you are going down this road — Barron Sports can talk you through the paperwork, but we do not run court applications.",
        ],
      },
    ],
  },
  {
    title: "Good reason for the application",
    summary:
      "An Garda Síochána will only consider an application that shows a recognised good reason. Personal protection is not one of them.",
    blocks: [
      {
        paragraphs: [
          "Irish firearms law requires a good reason for the particular firearm. The categories below are the ones applicants commonly rely on. You still have to evidence the one that applies to you.",
        ],
      },
      {
        heading: "Land and land management",
        items: [
          "Landowner, vermin control — pests that harm property, crops or livelihood.",
          "Landowner, hunting — shooting game on your own land.",
          "Authorised agent of a landowner — for example a farm manager acting for vermin control or hunting.",
        ],
      },
      {
        heading: "Hunting, shooting rights and foreshore",
        items: [
          "Written permission from a landowner to hunt or shoot over their ground.",
          "Membership of a recognised hunting or wildfowling club with shooting rights over club land.",
          "NPWS foreshore licences — required for shooting on or over state-owned foreshore, tidal areas, certain inland waters and larger lakes. Apply through the NPWS Wildlife Licensing Unit, not through the shop.",
        ],
      },
      {
        heading: "Target shooting and sport",
        items: [
          "Competitive or recreational target shooting. Rifles and pistols generally require membership of an authorised club, on a certified range.",
          "A blank-firing starting pistol used only to start races or similar events.",
        ],
      },
      {
        heading: "Work, heritage and visitors",
        items: [
          "Employment where a firearm is part of the job — for example NPWS or similar wildlife work, veterinary or authorised humane dispatch, or a registered firearms dealer.",
          "A firearm of genuine historical, monetary or family-heirloom value. These are often tightly conditioned, deactivated, or held as non-firing pieces.",
          "Theatre, film or television use, typically through an armourer, with firearms modified for blanks or as specialised replicas.",
          "Non-residents coming to Ireland to hunt or compete, on a non-resident certificate, with an invitation, hunting permission or the relevant NPWS licence.",
        ],
      },
      {
        paragraphs: [
          "Personal protection is not a valid reason for a firearm certificate in Ireland.",
        ],
      },
    ],
  },
  {
    title: "Storage and transport",
    summary:
      "The Firearms (Secure Accommodation) Regulations set a legal minimum. Your local Superintendent can require more.",
    blocks: [
      {
        paragraphs: [
          "These points are the statutory baseline under the Firearms (Secure Accommodation) Regulations 2009 and S.I. No. 420 of 2019. A crime prevention officer can inspect storage before a certificate is granted or renewed.",
        ],
      },
      {
        heading: "Ammunition",
        items: [
          "Store ammunition separately from the firearm. Do not leave a gun loaded, and do not keep ammunition in the same primary compartment as the gun.",
          "Keep ammunition in its own locked receptacle, or in a separate locked compartment inside the safe.",
          "Keep keys, codes and combinations where children and other unauthorised people cannot find them.",
        ],
      },
      {
        heading: "In the vehicle",
        items: [
          "The firearm must be unloaded, out of sight, and in a proper case or sleeve.",
          "Carry ammunition separately — for example the gun in a locked boot and ammunition in a locked glove box or other locked receptacle.",
          "Where you can, take a vital part with you (bolt, forend, slide or magazine) rather than leaving a complete gun in the car.",
          "Do not leave a firearm in the passenger area. If you step away, lock the vehicle, take the bolt and the certificate if you can, and hide anything that advertises shooting gear.",
        ],
      },
      {
        heading: "Safes, by how many guns you keep",
        items: [
          "One shotgun only — disassembled with parts stored separately, or a trigger lock in a sturdy locked receptacle, or a compliant gun safe.",
          "One unrestricted firearm other than a shotgun — a BS 7558-type gun safe, bolted to a solid wall or floor.",
          "Up to three unrestricted firearms — a compliant safe, securely anchored.",
          "Four or five unrestricted firearms — a compliant safe, plus an intruder alarm meeting I.S. EN 50131.",
          "Six or more unrestricted firearms, or three or more restricted firearms — a compliant safe, a monitored alarm, and robust locks on accessible external doors and windows.",
        ],
      },
      {
        heading: "What a gun safe has to be",
        items: [
          "Solid steel, with a proper lock (including close-shackle padlock, safe lock or digital lock).",
          "Fixed to a load-bearing internal wall or concrete floor with heavy-duty masonry anchors.",
        ],
      },
      {
        paragraphs: [
          "Meeting the minimum does not stop An Garda Síochána asking for a higher standard if they judge the house, the area or the firearm to be a greater risk.",
        ],
      },
    ],
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
  badge?: string;
  condition?: string;
  featured?: boolean;
};

export const PRODUCT_PLACEHOLDER_IMAGE = "/products/product-placeholder.jpg";

export const dogTraceCatalog = {
  logo: "https://d2f0ora2gkri0g.cloudfront.net/6c/55/6c5599ee-c1dc-4d88-ab4e-6b31cc995eca.png",
  appHref: "https://play.google.com/store/apps/details?id=cz.vnt.dogtrace.gps",
  exclusive:
    "Free extra-tough protective sleeving is added to all our collars. Only available at Barron Sports.",
  armour:
    "All collars sold by Barron Sports have our exclusive heat-shrink protective armour fitted free of charge.",
  repairs: "Most repairs can be performed in-house for our customers only.",
  tracking: [
    "The DOG GPS is used to locate dogs for distances up to 20 km, and can locate up to 9, 13 or 18 dogs depending on the model.",
    "To keep range as long as possible, DogTrace uses LoRa (Long Range) radio signal modulation. The setup is one or more transmitter collars and a handheld receiver that shows the distance and direction of each dog. The display also monitors RF signal strength, GPS accuracy, and transmitter or receiver battery status.",
    "The functions are built for hunters. The receiver is made of robust materials, collars are comfortable for every breed, and several colour variations are available. A smaller version is also available.",
  ],
  series: [
    {
      name: "X20",
      note: "Starter GPS tracking",
      items: [
        { name: "Starter set — collar, handset, chargers", price: "€475" },
        { name: "Additional collar", price: "€250" },
      ],
    },
    {
      name: "X25 / X25T",
      note: "GPS, with or without training",
      items: [
        { name: "X25 set — without training function", price: "€525" },
        { name: "X25T set — with training function", price: "€575" },
        { name: "X25 additional collar", price: "€275" },
        { name: "X25T additional collar", price: "€325" },
      ],
    },
    {
      name: "X30 / X30T",
      note: "Phone-linked GPS",
      items: [
        { name: "X30 set — without training function", price: "€649" },
        { name: "X30T set — with training function", price: "€699" },
        { name: "X30 additional collar", price: "€290" },
        { name: "X30T additional collar", price: "€340" },
      ],
    },
  ],
  accessories: [
    { name: "Replacement batteries", price: "€25" },
    { name: "Replacement antennas", price: "€25" },
    {
      name: "Replacement collar straps — red, yellow, black, blue, orange, green, pink, camo",
      price: "€10",
    },
  ],
  featured: [
    {
      id: "x20",
      name: "DOG GPS X20",
      price: "€475",
      image: {
        src: "https://d2f0ora2gkri0g.cloudfront.net/25/dd/25ddbf2c-16bc-4628-88ac-1a3f33c0e5b1.jpg",
        alt: "DogTrace DOG GPS X20 orange starter set",
      },
      summary:
        "A device for locating your dogs up to 20 km. It consists of a transmitter collar and a handheld receiver in neon orange, on which the handler monitors the distance and direction to each dog. The transmitter acquires its position from GPS satellites and sends that information to the receiver over a radio frequency signal.",
      extras:
        "The receiver display also monitors RF signal strength, GPS accuracy, and transmitter and receiver battery status. Extra functions include compass, FENCE — an acoustic threshold when the dog exceeds a set distance — BEEPER to show whether the dog is moving or standing still, and a waypoint function to store the current position and navigate back to it.",
      properties: [
        "Range between transmitter and receiver up to 20 km in direct line of sight, depending on terrain, vegetation and other factors",
        "Up to 9 dogs per receiver, viewed individually",
        "High GPS sensitivity in both receiver and transmitter",
        "Readable display in direct sunlight and in the dark",
        "Fully waterproof receiver and transmitter",
        "Long battery life — more than 40 hours — with a charger for receiver and transmitter",
        "Compass function",
        "FENCE function — acoustic boundary around the receiver",
        "BEEPER function — movement or stand detection",
        "Waypoint function — store 4 GPS coordinates and navigate to them",
        "CAR mode for using the handheld receiver in a vehicle",
        "Quick start on the handheld receiver",
        "The smallest and lightest collar among competing devices",
        "Simple control",
      ],
      includes: [
        "Receiver including Li-Pol 1850 mAh battery",
        "Belt clip for the receiver and 2 screws",
        "Transmitter including 1850 mAh Li-Pol battery and 70 cm orange strap",
        "Dual power adapter with USB cables and clips — charges collar and receiver together",
        "Cord for hanging the receiver",
        "Instructions and warranty card",
        "Suitcase",
      ],
    },
    {
      id: "x30t",
      name: "DOG GPS Finder X30T",
      price: "From €649",
      image: {
        src: "https://d2f0ora2gkri0g.cloudfront.net/2a/a7/2aa7a223-dfa6-4d30-bc41-5a2366b8edec.jpg",
        alt: "DogTrace DOG GPS X30T phone-linked tracking set",
      },
      summary:
        "Locates dogs up to 20 km away. A transmitter on the collar and a neon-orange handheld receiver show distance and direction. The transmitter takes its position from GPS satellites and sends it to the receiver over radio. The X30T kit also includes a training module, so a stimulation pulse can be sent from the receiver over that same distance.",
      extras:
        "The receiver can connect wirelessly to an Android phone or tablet so every paired device can be viewed on the map in the DogTrace GPS app. Compass, FENCE, BEEPER and waypoint functions are included, as on the X20.",
      properties: [
        "Range between transmitter and receiver up to 20 km in direct line of sight, depending on terrain, vegetation and other factors",
        "Watch up to 13 dogs, handlers or waypoints",
        "High GPS sensitivity in both receiver and transmitter",
        "Readable display in direct sunlight and in the dark",
        "Fully waterproof receiver and transmitter",
        "Long battery life — more than 40 hours — with a charger for receiver and transmitter",
        "2 acoustic signal modes — quiet / loud",
        "15 stimulus levels (DOG GPS X30T only)",
        "Light mode to recognise the dog in the dark (DOG GPS X30T only)",
        "Switch channels for communication between transmitter and receiver",
        "Compass, FENCE, BEEPER and waypoint functions — store up to 13 coordinates",
        "CAR mode for using the handheld receiver in a vehicle",
        "Quick start on the handheld receiver",
        "The smallest and lightest collar among competing devices",
        "Simple control",
        "Receiver is compatible with X20 / X20+ transmitters, with some features limited",
      ],
      appFeatures: [
        "View all devices — dogs, other handlers, waypoints — on the map",
        "Maps online and offline",
        "Compass",
        "Record routes for all devices",
        "Acoustic signal",
        "Indication of barking, with a track record on the map",
        "DOG GPS X30T — stimulation pulse and light function",
      ],
      includes: [
        "Neon orange receiver including Li-Pol 1850 mAh battery",
        "Plastic belt clip for the receiver and 2 screws",
        "Transmitter including 1850 mAh Li-Pol battery and 70 cm orange strap",
        "Contact point set — 2 × 10 mm and 2 × 17 mm (X30T only)",
        "Dual power adapter with USB cables and clips — charges collar and receiver together",
        "Cord for hanging the receiver",
        "Instructions and warranty card",
        "Transport bag",
        "The kit does not contain a mobile phone",
      ],
    },
    {
      id: "d-control",
      name: "d-control Professional 2000",
      price: "From under €100 to €280",
      image: {
        src: "https://d2f0ora2gkri0g.cloudfront.net/bf/75/bf754dd9-6740-4890-83d3-d394b7bceb4c.jpg",
        alt: "DogTrace d-control Professional 2000 orange training collar",
      },
      summary:
        "Electronic training collar suitable for all dog breeds thanks to its range of stimulation pulses. From the size of the receiver we recommend it for medium and large breeds. Range up to 2,000 m, in orange neon or camouflage. Over 30 models are available, from under €100 up to the Pro 2000.",
      extras:
        "The new Professional 2000 orange neon transmitter will not get lost in the forest. A rechargeable receiver with charger is a particular advantage of this model. Functions can be assigned to any button, and battery status is shown on the backlit display.",
      properties: [
        "Two levels of acoustic signal",
        "40 stimulation levels — short and long stimulation impulse",
        "8 light modes",
        "4 vibration modes",
      ],
    },
  ],
} as const;

export type CategoryCatalogHighlight = {
  id: string;
  name: string;
  summary: string;
  image: { src: string; alt: string };
  href?: string;
  cta?: string;
};

export type CategoryCatalogFeatured = {
  id: string;
  name: string;
  price?: string;
  eyebrow?: string;
  images: { src: string; alt: string }[];
  summary: string;
  extras?: string;
  properties?: string[];
};

export type CategoryCatalogContent = {
  highlightsTitle?: string;
  highlightsDescription?: string;
  highlights?: CategoryCatalogHighlight[];
  featuredTitle?: string;
  featuredDescription?: string;
  featuredLayout?: "stack" | "grid";
  featured?: CategoryCatalogFeatured[];
  notes?: string[];
};

export const accessoriesCatalog: CategoryCatalogContent = {
  highlightsTitle: "In the shop",
  highlightsDescription:
    "Sights, tracking systems, mounts and workshop work from the counter in Ennis.",
  highlights: [
    {
      id: "sights",
      name: "Sights",
      summary: "Full line of Vortex sights at unbeatable prices.",
      image: {
        src: "https://d2f0ora2gkri0g.cloudfront.net/7e/d4/7ed4aa28-ac94-4f6b-baf8-c47d3d3b4192.jpg",
        alt: "Vortex riflescope",
      },
    },
    {
      id: "dogtrace",
      name: "DogTrace",
      summary: "The best tracking set available.",
      href: "/products/dogtrace",
      cta: "View DogTrace",
      image: {
        src: "https://d2f0ora2gkri0g.cloudfront.net/25/dd/25ddbf2c-16bc-4628-88ac-1a3f33c0e5b1.jpg",
        alt: "DogTrace GPS X20 tracking set",
      },
    },
    {
      id: "more",
      name: "Rings, mounts and more",
      summary:
        "Scope rings and mounts, moderators, lights, aftermarket stocks, barrel threading and more.",
      image: {
        src: "https://d2f0ora2gkri0g.cloudfront.net/df/02/df02345d-8686-4776-b3ce-ce0f695a4690.jpg",
        alt: "Scope rings and mounts",
      },
    },
  ],
  featuredTitle: "Clay trap",
  featured: [
    {
      id: "champion-workhorse",
      name: "Champion Workhorse",
      price: "€625",
      eyebrow: "Including next-day delivery",
      images: [
        {
          src: "https://d2f0ora2gkri0g.cloudfront.net/a2/4f/a24ff790-6e38-4573-99e7-3f81293a5ed3.jpg",
          alt: "Champion Workhorse clay trap",
        },
      ],
      summary:
        "50-clay stack, 25-foot pedal release with a remote-control upgrade available. Throws up to 75 yards. Light, portable 12V design.",
    },
  ],
};

export const nightVisionCatalog: CategoryCatalogContent = {
  featuredTitle: "Night vision products",
  featuredDescription:
    "Digital night vision riflescopes and thermal cameras for low-light observation and hunting.",
  featuredLayout: "grid",
  featured: [
    {
      id: "infiray-td50l",
      name: "InfiRay Tube-TD50L",
      images: [
        {
          src: "https://d2f0ora2gkri0g.cloudfront.net/b2/ed/b2ed1a7e-fe9f-417f-b727-3fd0b8c977d5.png",
          alt: "InfiRay Tube-TD50L digital night vision riflescope",
        },
      ],
      summary:
        "A high-performance digital night vision riflescope in the traditional day-optic form, made for use on bolt-action rifles. The TD50L suits hunters who want classic aesthetics with excellent low-light sensor sensitivity.",
      extras:
        "A 13+ hour run time and an IP67 rating mean the TD50L can last all night in any hunting conditions.",
    },
    {
      id: "pixfra",
      name: "Pixfra",
      images: [
        {
          src: "https://d2f0ora2gkri0g.cloudfront.net/99/b3/99b3daa6-1da7-4a0c-a6d8-9e4f37689af4.png",
          alt: "Pixfra thermal camera",
        },
      ],
      summary:
        "Advanced thermal imaging. Pixfra cameras use proprietary heat-detection technology to capture minute temperature differences with exceptional clarity, so you can identify quarry and observe wildlife in complete darkness.",
    },
    {
      id: "pulsar-axion",
      name: "Pulsar Axion 2 XQ35 Pro",
      images: [
        {
          src: "https://d2f0ora2gkri0g.cloudfront.net/36/50/3650fe40-e709-437c-aa4e-63da2e9a903e.png",
          alt: "Pulsar Axion 2 XQ35 Pro thermal spotter",
        },
      ],
      summary:
        "Easy observation from a compact, light, ergonomic build. Remote real-time image viewing with cloud storage.",
      properties: [
        "16 GB internal memory",
        "Swappable APS3 battery",
        "AMOLED HD display",
        "Remote viewing with cloud storage",
      ],
    },
  ],
};

export const flashlightsCatalog: CategoryCatalogContent = {
  featuredTitle: "Hunting lamps",
  featuredDescription:
    "Focusable tri-colour lamps and dedicated IR torches for digital night vision.",
  featured: [
    {
      id: "tri-colour",
      name: "Tri-colour flashlight",
      price: "€149",
      eyebrow: "Illuminate your hunt",
      images: [
        {
          src: "https://d2f0ora2gkri0g.cloudfront.net/26/08/260854f7-85af-41dc-be7e-da3d293b6686.gif",
          alt: "Tri-colour hunting flashlight in use",
        },
        {
          src: "https://d2f0ora2gkri0g.cloudfront.net/4d/38/4d383f28-ddfb-4acf-8b9d-3a8f76b7c7f4.png",
          alt: "Tri-colour hunting flashlight",
        },
      ],
      summary:
        "A 50 mm front lens and a slender 25 mm body give both power and portability. Powered by a rechargeable battery, with a focusable beam from wide to narrow and dimmable control. Solid aluminium construction for rough use. The white beam reaches up to 400 m. Switch between red, green and clear white at the flick of a switch, without refocusing.",
    },
    {
      id: "ir-torch",
      name: "IR torch",
      price: "€159",
      eyebrow: "For use with night vision scopes",
      images: [
        {
          src: "https://d2f0ora2gkri0g.cloudfront.net/83/8f/838f34d8-1468-4514-9c7d-813a7b56c434.JPG",
          alt: "IR torch mounted for night vision",
        },
        {
          src: "https://d2f0ora2gkri0g.cloudfront.net/b8/bd/b8bdad65-e76b-46d3-8beb-daefcea48c76.jpg",
          alt: "Hunting flashlight on a rifle",
        },
      ],
      summary:
        "Built for night vision equipment, with white light, IR850 and IR940 beams for digital night vision. High output or near-covert illumination, depending on the format. Accessories are included, and modes switch quickly in the field.",
    },
  ],
  notes: [
    "All flashlights are dimmable, zoomable and adjustable.",
    "Each flashlight comes with one 18650 rechargeable battery and kit.",
    "Additional batteries are available separately for €15 each.",
  ],
};

export const categoryCatalogs: Record<string, CategoryCatalogContent> = {
  accessories: accessoriesCatalog,
  "night-vision-optics": nightVisionCatalog,
  flashlights: flashlightsCatalog,
};

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
      name: "Champion Workhorse clay trap",
      price: "€625",
      brands: ["Champion"],
      href: "/products/accessories#champion-workhorse",
      image:
        "https://d2f0ora2gkri0g.cloudfront.net/a2/4f/a24ff790-6e38-4573-99e7-3f81293a5ed3.jpg",
      summary:
        "50-clay stack, 25-foot pedal release, remote-control upgrade, up to 75-yard throwing distance. Light portable 12V design. Next-day delivery available.",
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
      name: "Pard thermal spotters",
      price: "From €599",
      href: "/special-offers",
      brands: ["Pard"],
      image: "https://cdn-new.pard.com/mall/landing/product/leopard-256/carousel/01.png",
      summary: "Thermal image spotters currently on offer.",
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
  rifles: rifleStock,
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

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}
