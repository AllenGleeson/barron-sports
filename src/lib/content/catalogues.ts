/** Rich category pages (DogTrace, accessories, night vision, flashlights). */

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
      price: "€599",
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
