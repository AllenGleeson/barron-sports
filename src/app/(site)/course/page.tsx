import type { Metadata } from "next";
import { CertificateGuides } from "@/components/course/CertificateGuides";
import { PageHero } from "@/components/interior/PageHero";
import { CoverImage } from "@/components/media/CoverImage";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { firearmsCourse, site } from "@/lib/site";

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
        image={{
          src: "/course/course-hero.jpg",
          alt: "Hunting rifle and shotgun on an outdoor shooting bench at dusk",
        }}
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
              shooting, or hunting deer in Ireland, this safety course is the
              place to start — not a conversation over the counter and a box of
              ammunition.
            </p>
            <p className="mt-4 text-base leading-relaxed text-parchment">
              The course covers the habits that keep people, dogs and livestock
              safe: muzzle control, when the action is open, how a gun is stored
              at home, how it travels in a vehicle, and when you simply do not
              take the shot. Ask in the shop if you have a question about dates
              or the application.
            </p>
          </div>

          <ul className="mt-10 divide-y divide-line-soft border-y border-line-soft sm:hidden">
            {firearmsCourse.topics.map((topic) => (
              <li
                key={topic.title}
                className="group/item -mx-2 px-2 transition-colors hover:bg-moss active:bg-moss"
              >
                <details className="group" name="course-topics">
                  <summary className="flex cursor-pointer list-none items-center gap-3 py-3 outline-none [&::-webkit-details-marker]:hidden">
                    <h3 className="min-w-0 flex-1 font-display text-xl leading-snug text-cream transition-colors group-hover/item:text-brass">
                      {topic.title}
                    </h3>
                    <svg
                      viewBox="0 0 12 12"
                      className="h-3.5 w-3.5 shrink-0 text-brass transition duration-200 group-open:rotate-180 group-hover/item:text-[#dcc392]"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </summary>
                  <p className="pb-4 text-sm leading-relaxed text-parchment">{topic.body}</p>
                </details>
              </li>
            ))}
          </ul>

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
          <p className="mb-4 text-center text-[11px] uppercase tracking-[0.28em] text-brass">
            Featured
          </p>
          <article className="grid overflow-hidden border border-line bg-moss lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="relative min-h-[16rem] lg:min-h-[28rem]">
              <CoverImage
                src={firearmsCourse.image.src}
                alt={firearmsCourse.image.alt}
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
            </div>
            <div className="flex flex-col justify-center px-6 py-8 sm:px-10">
              <p className="text-[11px] uppercase tracking-[0.28em] text-brass">
                {firearmsCourse.provider}
              </p>
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
                <Button href={firearmsCourse.href}>{firearmsCourse.cta}</Button>
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
