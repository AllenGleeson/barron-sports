/** Firearms course page and certificate application guides. */

export const firearmsCourse = {
  title: "Firearms Safety Course",
  href: "https://hcap.ie/",
  cta: "Go to the course",
  provider: "Hunter Competence Assessment Programme",
  summary:
    "If you have completed Form FCA1 and An Garda Síochána have granted your firearm certificate, proceed to this course. HCAP is Ireland’s recognised Hunter Competence Assessment Programme for safe firearm handling and competent hunting practice.",
  image: {
    src: "/course/course-hero.jpg",
    alt: "Hunting rifle and shotgun on an outdoor shooting bench at dusk",
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

export const GARDA_LICENSING_HREF =
  "https://www.garda.ie/en/about-us/online-services/firearms-licensing/";
export const GARDA_COMMISSIONER_GUIDELINES_HREF =
  "https://www.garda.ie/en/about-us/online-services/firearms-licensing/commissioner-s-guidelines-2018.pdf";
export const NPWS_FORESHORE_HREF =
  "https://www.npws.ie/licencesandconsents/hunting/fauna-state-owned-foreshore";

export type GuideItem =
  | string
  | {
      text: string;
      href: string;
      linkText: string;
    };

export type GuideBlock = {
  heading?: string;
  paragraphs?: string[];
  items?: GuideItem[];
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
          "An Garda Síochána are expected to decide a firearm certificate application within 90 days. That clock starts only when a fully completed Form FCA1 is received. Missing signatures, photographs or supporting papers can stop the clock before it starts.",
        ],
      },
      {
        heading: "What to include",
        items: [
          "Two recent passport-sized photographs.",
          "Two character referees: names, addresses and contact numbers. They should have known you for at least two years. Only one family member can be included. Registered firearms dealers and serving Gardaí are not suitable referees.",
          "Your GP’s name and contact details, so the Gardaí can make medical enquiries about suitability if they need to.",
          "First-time applicants, or anyone whose previous certificate lapsed more than three years ago, should attach proof of competency — a Garda-recognised firearms safety course, or evidence of joining an authorised target shooting club.",
          "If you have held a certificate before, quote the certificate number or expiry instead of repeating a competency course, unless you are asked for more.",
          "Attach landowner permission, lease agreements, club membership or an NPWS foreshore licence where they support your reason for the gun use.",
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
          "Call the local station first and ask which member or staff deals with firearm certificates, and when they are on duty.",
          "Hand the completed form to that officer rather than leaving it at the public counter.",
          "Ask them to date-stamp it as received in front of you, check the date, and keep a copy of the stamped front page or a receipt. That stamp is your proof that the 90-day period has started.",
        ],
      },
      {
        heading: "If it is refused, or there is no decision",
        paragraphs: [
          "Applications that exceed 90 days default to a refusal.",
          "You may appeal to the District Court under Section 15A of the Firearms Act 1925 (as amended). A written refusal starts that right. If 90 days pass from a date-stamped complete application with neither grant nor refusal, the law treats that as a refusal and you may also appeal.",
          "An appeal must be lodged at the District Court office for the area where you live, within 30 days of the refusal (or of the 90 days running out). Name the Superintendent or Chief Superintendent (for restricted firearms) as respondent, state the grounds, and serve a copy on the Gardaí. Ask a solicitor if you are going down this road — Barron Sports can talk you through the paperwork, but we do not run court applications.",
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
          "Written permission from a landowner to hunt or shoot over their ground and an indication of land size.",
          "Membership of a recognised hunting or wildfowling club with shooting rights over club land.",
          {
            text: "NPWS foreshore licences — required for shooting on or over state-owned foreshore, tidal areas, certain inland waters and larger lakes. Apply through the NPWS Wildlife Licensing Unit, not through the shop.",
            href: NPWS_FORESHORE_HREF,
            linkText: "NPWS Wildlife Licensing Unit",
          },
        ],
      },
      {
        heading: "Target shooting and sport",
        items: [
          "Competitive or recreational target shooting. Rifles and pistols generally require membership of an authorised club, on a certified range or clay pigeon club.",
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
        heading: "Ammunition",
        items: [
          "Store ammunition separately from the firearm. Do not leave a gun loaded, and do not keep ammunition in the same primary compartment as the gun.",
          "Keep ammunition in its own locked receptacle, or in a separate locked compartment inside the safe.",
          "Keep keys, codes and combinations where children and other unauthorised people cannot find them.",
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
