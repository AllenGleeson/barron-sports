import type { Metadata } from "next";
import { CertificateGuides } from "@/components/course/CertificateGuides";
import { PageHero } from "@/components/interior/PageHero";
import { CoverImage } from "@/components/media/CoverImage";
import { AccordionItem, AccordionList } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { firearmsCourse, site } from "@/lib/site";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Firearms Safety Course",
  description:
    "Firearms safety course information and practical guidance on Form FCA1 firearm certificate applications from Barron Sports in Ennis, Co. Clare.",
};

export default function CoursePage() {
  return (
    <>
      <PageHero
        compact
        eyebrow="Ennis, Co. Clare"
        title="Firearms safety course"
        description="A firearms safety course for people who want to handle a gun properly — in the shop, on the range, and in the field."
        image={firearmsCourse.image}
      />
      <section className="bg-ink py-10 lg:py-16">
        <Container>
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl text-cream sm:text-4xl">
              Safe handling from the start
            </h2>
            <p className="mt-6 text-base leading-relaxed text-parchment">
              Barron Sports is a firearms retailer, not a shortcut around the
              law. If you are applying for a first certificate, coming back to
              shooting, this safety course is the place to start — not a
              conversation over the counter and a box of ammunition.
            </p>
            <p className="mt-4 text-base leading-relaxed text-parchment">
              The course covers the habits that keep people, dogs and livestock
              safe: muzzle control, when to keep the action open, how a gun is
              stored at home, how it travels in a vehicle, and when you simply
              do not take the shot. Ask in the shop if you have a question about
              course dates or the application process.
            </p>
          </div>

          <AccordionList className="mt-10 sm:hidden">
            {firearmsCourse.topics.map((topic) => (
              <AccordionItem key={topic.title} name="course-topics" title={topic.title}>
                <p className="pb-4 text-sm leading-relaxed text-parchment">{topic.body}</p>
              </AccordionItem>
            ))}
          </AccordionList>

          <ul className="mt-10 hidden gap-4 sm:grid sm:grid-cols-2">
            {firearmsCourse.topics.map((topic) => (
              <li key={topic.title} className="border border-line bg-moss px-5 py-6">
                <h3 className="font-display text-2xl text-cream">{topic.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-parchment">{topic.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CertificateGuides />

      <section className="bg-forest py-10 lg:py-16" aria-labelledby="featured-course-heading">
        <Container>
          <Eyebrow className="mb-4 text-center">
            Featured
          </Eyebrow>
          <article className="grid overflow-hidden border border-line bg-moss lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="relative min-h-[16rem] lg:min-h-[28rem]">
              <CoverImage
                src={firearmsCourse.image.src}
                alt={firearmsCourse.image.alt}
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
            </div>
            <div className="flex flex-col justify-center px-6 py-8 sm:px-10">
              <Eyebrow>
                {firearmsCourse.provider}
              </Eyebrow>
              <h2
                id="featured-course-heading"
                className="mt-3 font-display text-3xl leading-tight text-cream sm:text-4xl"
              >
                {firearmsCourse.title}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-parchment">
                {firearmsCourse.summary}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-stone">
                Ask Gary in the shop if you need help choosing a date or an
                instructor once the certificate is through. Call {site.phone.display}.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href="/course/enrol">{firearmsCourse.cta}</Button>
                <Button href="/contact-us" variant="ghost">
                  Ask about the course
                </Button>
              </div>
            </div>
          </article>
        </Container>
      </section>
    </>
  );
}
