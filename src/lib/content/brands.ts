export type Brand = {
  name: string;
  logo: string;
};

export const brands: Brand[] = [
  {
    name: "DogTrace",
    logo: "/brands/dogtrace.webp",
  },
  {
    name: "Lithgow Arms",
    logo: "/brands/lithgow-arms.webp",
  },
  {
    name: "Browning Arms Company",
    logo: "/brands/browning-arms-company.webp",
  },
  {
    name: "Bushnell Outdoor Products",
    logo: "/brands/bushnell-outdoor-products.webp",
  },
  {
    name: "J. G. Anschütz GmbH & Co. KG",
    logo: "/brands/j-g-anschutz-gmbh-co-kg.webp",
  },
  {
    name: "Fabbrica d'Armi Pietro Beretta",
    logo: "/brands/fabbrica-d-armi-pietro-beretta.webp",
  },
  {
    name: "Howard Leight by Honeywell",
    logo: "/brands/howard-leight-by-honeywell.webp",
  },
  {
    name: "Bergara",
    logo: "/brands/bergara.webp",
  },
  {
    name: "Blaser",
    logo: "/brands/blaser.webp",
  },
  {
    name: "LPA",
    logo: "/brands/lpa.webp",
  },
  {
    name: "Česká zbrojovka (CZ)",
    logo: "/brands/ceska-zbrojovka-cz.webp",
  },
  {
    name: "Cogswell & Harrison",
    logo: "/brands/cogswell-harrison.webp",
  },
  {
    name: "Leupold & Stevens",
    logo: "/brands/leupold-stevens.webp",
  },
  {
    name: "Howa Machinery Company",
    logo: "/brands/howa-machinery-company.webp",
  },
  {
    name: "Huğlu Hunting Firearms Cooperative",
    logo: "/brands/huglu-hunting-firearms-cooperative.webp",
  },
  {
    name: "Meopta",
    logo: "/brands/meopta.webp",
  },
  {
    name: "Sturm, Ruger & Co.",
    logo: "/brands/sturm-ruger-co.webp",
  },
  {
    name: "Miroku Corporation",
    logo: "/brands/miroku-corporation.webp",
  },
  {
    name: "Steyr Mannlicher",
    logo: "/brands/steyr-mannlicher.webp",
  },
  {
    name: "Silma Arms S.r.l.",
    logo: "/brands/silma-arms-s-r-l.webp",
  },
  {
    name: "Nikko Stirling",
    logo: "/brands/nikko-stirling.webp",
  },
  {
    name: "Tikka T3",
    logo: "/brands/tikka-t3.webp",
  },
  {
    name: "Webley & Scott",
    logo: "/brands/webley-scott.webp",
  },
  {
    name: "Weihrauch & Weihrauch GmbH & Co. KG",
    logo: "/brands/weihrauch-weihrauch-gmbh-co-kg.webp",
  },
  {
    name: "Winchester",
    logo: "/brands/winchester.webp",
  },
  {
    name: "Yildiz Shotgun",
    logo: "/brands/yildiz-shotgun.webp",
  },
  {
    name: "Carl Zeiss AG",
    logo: "/brands/carl-zeiss-ag.webp",
  },
  {
    name: "Gamo Outdoor, S.L.",
    logo: "/brands/gamo-outdoor-s-l.webp",
  },
  {
    name: "Cascade Cartridge",
    logo: "/brands/cascade-cartridge.webp",
  },
  {
    name: "Ardee Sports Company",
    logo: "/brands/ardee-sports-company.webp",
  },
  {
    name: "Eley Hawk",
    logo: "/brands/eley-hawk.webp",
  },
  {
    name: "Federal Premium Ammunition",
    logo: "/brands/federal-premium-ammunition.webp",
  },
  {
    name: "Fiocchi Munizioni",
    logo: "/brands/fiocchi-munizioni.webp",
  },
  {
    name: "Hornady Manufacturing Company",
    logo: "/brands/hornady-manufacturing-company.webp",
  },
  {
    name: "RC Eximport S.R.L.",
    logo: "/brands/rc-eximport-s-r-l.webp",
  },
  {
    name: "Lakeland Shooting Center",
    logo: "/brands/lakeland-shooting-center.webp",
  },
  {
    name: "Gowen & Bradshaw",
    logo: "/brands/gowen-bradshaw.webp",
  },
  {
    name: "Highland Outdoors",
    logo: "/brands/highland-outdoors.webp",
  },
];

export const brandAliases: Record<string, string> = {
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
  const aliased = brandAliases[needle] ?? name;
  const exact = brands.find((brand) => brand.name === aliased);
  if (exact) return exact;
  return brands.find((brand) => {
    const brandName = brand.name.toLowerCase();
    return brandName.includes(needle) || needle.includes(brandName);
  });
}
