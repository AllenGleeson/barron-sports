import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import {
  GARDA_FCA1_HREF,
  GARDA_LICENSING_HREF,
  certificateGuides,
  type CertificateGuide,
  type GuideBlock,
} from "@/lib/site";

function GuideBlocks({ blocks }: { blocks: GuideBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, index) => (
        <div key={block.heading ?? index}>
          {block.heading ? (
            <h4 className="font-display text-xl text-cream">{block.heading}</h4>
          ) : null}
          {block.paragraphs?.map((paragraph, paragraphIndex) => (
            <p
              key={paragraph.slice(0, 48)}
              className={`text-sm leading-relaxed text-parchment ${
                paragraphIndex > 0 || block.heading ? "mt-2" : ""
              }`}
            >
              {paragraph}
            </p>
          ))}
          {block.items ? (
            <ul className={`list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-parchment ${block.heading ? "mt-2" : ""}`}>
              {block.items.map((item) => (
                <li key={item.slice(0, 48)}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function GuideChevron() {
  return (
    <svg
      viewBox="0 0 12 12"
      className="h-3.5 w-3.5 shrink-0 text-brass transition duration-200 group-open:rotate-180 group-hover/item:text-[#dcc392]"
      fill="none"
      aria-hidden="true"
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function GuideArticle({ guide }: { guide: CertificateGuide }) {
  return (
    <article className="border border-line bg-moss px-5 py-6">
      <h3 className="font-display text-2xl text-cream">{guide.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-stone">{guide.summary}</p>
      <div className="mt-5">
        <GuideBlocks blocks={guide.blocks} />
      </div>
    </article>
  );
}

export function CertificateGuides() {
  return (
    <section className="bg-ink pb-10 lg:pb-16" aria-labelledby="certificate-heading">
      <Container>
        <div className="max-w-3xl">
          <h2
            id="certificate-heading"
            className="font-display text-3xl text-cream sm:text-4xl"
          >
            Firearm certificate applications
          </h2>
          <p className="mt-6 text-base leading-relaxed text-parchment">
            If you are applying for a first certificate, or substituting a gun,
            the application is Form FCA1, submitted to your local Garda station.
            The notes below are practical shop guidance for customers in Ennis.
            They are not legal advice, and they do not replace the Garda
            Commissioner’s Guidelines or the form itself.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href={GARDA_FCA1_HREF}>Official FCA1 form</Button>
            <Button href={GARDA_LICENSING_HREF} variant="ghost">
              Garda firearms licensing
            </Button>
          </div>
        </div>

        <ul className="mt-10 divide-y divide-line-soft border-y border-line-soft sm:hidden">
          {certificateGuides.map((guide) => (
            <li
              key={guide.title}
              className="group/item -mx-2 px-2 transition-colors hover:bg-moss active:bg-moss"
            >
              <details className="group" name="certificate-guides">
                <summary className="flex cursor-pointer list-none items-center gap-3 py-3 outline-none [&::-webkit-details-marker]:hidden">
                  <h3 className="min-w-0 flex-1 font-display text-xl leading-snug text-cream transition-colors group-hover/item:text-brass">
                    {guide.title}
                  </h3>
                  <GuideChevron />
                </summary>
                <div className="pb-5">
                  <p className="mb-4 text-sm leading-relaxed text-stone">{guide.summary}</p>
                  <GuideBlocks blocks={guide.blocks} />
                </div>
              </details>
            </li>
          ))}
        </ul>

        <div className="mt-10 hidden space-y-4 sm:block">
          {certificateGuides.map((guide) => (
            <GuideArticle key={guide.title} guide={guide} />
          ))}
        </div>
      </Container>
    </section>
  );
}
