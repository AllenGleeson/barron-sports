import { learnerCourse } from "@/lib/course/curriculum";
import { site } from "@/lib/site";

export function recordCode(name: string, issuedAt: string) {
  const raw = `${name.trim().toLowerCase()}|${issuedAt}|barron-sports-safety`;
  let hash = 2166136261;
  for (let index = 0; index < raw.length; index += 1) {
    hash ^= raw.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `BS-${(hash >>> 0).toString(16).toUpperCase().padStart(8, "0")}`;
}

export function formatRecordDate(issuedAt: string) {
  return new Intl.DateTimeFormat("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(issuedAt));
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * The downloaded SVG stands alone, so it can't use the site's CSS variables.
 * These mirror the theme colours in src/app/globals.css.
 */
const colors = {
  ink: "#1e271c",
  brass: "#c9b17a",
  cream: "#f1eadc",
  parchment: "#d4ccb6",
  stone: "#9a9784",
} as const;

const SERIF = "Georgia, 'Times New Roman', serif";

function displayName(name: string) {
  const clean = name.trim().replace(/\s+/g, " ");
  if (clean.length <= 42) return clean;
  return `${clean.slice(0, 41)}…`;
}

function nameSize(name: string) {
  if (name.length > 36) return 32;
  if (name.length > 24) return 42;
  return 56;
}

export function certificateSvg(name: string, issuedAt: string) {
  const shown = displayName(name);
  const code = recordCode(name, issuedAt);
  const date = formatRecordDate(issuedAt);
  const lessonLine = learnerCourse.lessons.map((lesson) => lesson.title).join("  ·  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 848" role="img" aria-labelledby="record-title">
  <title id="record-title">Course completion record for ${escapeXml(shown)}</title>
  <rect width="1200" height="848" fill="${colors.ink}"/>
  <rect x="28" y="28" width="1144" height="792" fill="none" stroke="${colors.brass}" stroke-width="2"/>
  <rect x="42" y="42" width="1116" height="764" fill="none" stroke="${colors.brass}" stroke-width="0.6"/>
  <text x="180" y="470" fill="${colors.brass}" fill-opacity="0.14" font-family="${SERIF}" font-size="150" transform="rotate(-18 600 424)">PREVIEW</text>
  <text x="600" y="132" text-anchor="middle" fill="${colors.brass}" font-family="${SERIF}" font-size="18" letter-spacing="8">${escapeXml(site.name.toUpperCase())}</text>
  <text x="600" y="164" text-anchor="middle" fill="${colors.stone}" font-family="${SERIF}" font-size="14" letter-spacing="4">${escapeXml(site.location.toUpperCase())}</text>
  <line x1="430" y1="196" x2="770" y2="196" stroke="${colors.brass}" stroke-width="0.6"/>
  <text x="600" y="250" text-anchor="middle" fill="${colors.brass}" font-family="${SERIF}" font-size="15" letter-spacing="5">COURSE COMPLETION RECORD</text>
  <text x="600" y="360" text-anchor="middle" fill="${colors.cream}" font-family="${SERIF}" font-size="${nameSize(shown)}">${escapeXml(shown)}</text>
  <text x="600" y="420" text-anchor="middle" fill="${colors.parchment}" font-family="${SERIF}" font-size="22">has completed the Firearms Safety course</text>
  <text x="600" y="458" text-anchor="middle" fill="${colors.stone}" font-family="${SERIF}" font-size="16">Each lesson passed at the ${learnerCourse.passPercent}% mark</text>
  <line x1="360" y1="500" x2="840" y2="500" stroke="${colors.brass}" stroke-width="0.6"/>
  <text x="330" y="548" text-anchor="middle" fill="${colors.stone}" font-family="${SERIF}" font-size="13" letter-spacing="3">DATE</text>
  <text x="330" y="582" text-anchor="middle" fill="${colors.cream}" font-family="${SERIF}" font-size="20">${escapeXml(date)}</text>
  <text x="600" y="548" text-anchor="middle" fill="${colors.stone}" font-family="${SERIF}" font-size="13" letter-spacing="3">LESSONS</text>
  <text x="600" y="582" text-anchor="middle" fill="${colors.cream}" font-family="${SERIF}" font-size="20">${learnerCourse.lessons.length} of ${learnerCourse.lessons.length}</text>
  <text x="870" y="548" text-anchor="middle" fill="${colors.stone}" font-family="${SERIF}" font-size="13" letter-spacing="3">RECORD</text>
  <text x="870" y="582" text-anchor="middle" fill="${colors.cream}" font-family="${SERIF}" font-size="20">${escapeXml(code)}</text>
  <text x="600" y="650" text-anchor="middle" fill="${colors.stone}" font-family="${SERIF}" font-size="15">${escapeXml(lessonLine)}</text>
  <text x="600" y="720" text-anchor="middle" fill="${colors.stone}" font-family="${SERIF}" font-size="14">Sample record for this course preview. A firearm certificate is issued only by An Garda Síochána.</text>
  <text x="600" y="746" text-anchor="middle" fill="${colors.stone}" font-family="${SERIF}" font-size="14">This page confirms that the name above finished the placeholder lessons on this device.</text>
</svg>`;
}

export function downloadCertificate(svg: string, code: string) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `barron-sports-${code}.svg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
