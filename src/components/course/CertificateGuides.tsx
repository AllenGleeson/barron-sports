import { Button } from "@/components/ui/Button";
import { AccordionItem, AccordionList } from "@/components/ui/Accordion";
import { Container } from "@/components/ui/Container";
import {
  GARDA_COMMISSIONER_GUIDELINES_HREF,
  GARDA_LICENSING_HREF,
  certificateGuides,
  type CertificateGuide,
  type GuideBlock,
  type GuideItem,
} from "@/lib/site";

function guideItemKey(item: GuideItem) {
  return (typeof item === "string" ? item : item.text).slice(0, 48);
}

function GuideLinkedText({ item }: { item: GuideItem }) {
  if (typeof item === "string") return item;

  const start = item.text.indexOf(item.linkText);
  if (start === -1) {
    return (
      <>
        {item.text}{" "}
        <a
          href={item.href}
          className="text-brass hover:text-cream"
          target="_blank"
          rel="noopener noreferrer"
        >
          {item.linkText}
        </a>
      </>
    );
  }

  return (
    <>
      {item.text.slice(0, start)}
      <a
        href={item.href}
        className="text-brass hover:text-cream"
        target="_blank"
        rel="noopener noreferrer"
      >
        {item.linkText}
      </a>
      {item.text.slice(start + item.linkText.length)}
    </>
  );
}

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
                <li key={guideItemKey(item)}>
                  <GuideLinkedText item={item} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
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
            the application is made using the FCA1 form, submitted to your local
            Garda station. The notes below are a practical shop guidance for our
            customers. They are not legal advice, and they do not replace the{" "}
            <a
              href={GARDA_COMMISSIONER_GUIDELINES_HREF}
              className="text-brass hover:text-cream"
              target="_blank"
              rel="noopener noreferrer"
            >
              Garda Commissioner’s Guidelines
            </a>{" "}
            or the form itself.
          </p>
          <div className="mt-6">
            <Button href={GARDA_LICENSING_HREF}>Garda firearms licensing</Button>
          </div>
        </div>

        <AccordionList className="mt-10 sm:hidden">
          {certificateGuides.map((guide) => (
            <AccordionItem key={guide.title} name="certificate-guides" title={guide.title}>
              <div className="pb-5">
                <p className="mb-4 text-sm leading-relaxed text-stone">{guide.summary}</p>
                <GuideBlocks blocks={guide.blocks} />
              </div>
            </AccordionItem>
          ))}
        </AccordionList>

        <div className="mt-10 hidden space-y-4 sm:block">
          {certificateGuides.map((guide) => (
            <GuideArticle key={guide.title} guide={guide} />
          ))}
        </div>
      </Container>
    </section>
  );
}
