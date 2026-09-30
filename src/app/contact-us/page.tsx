import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { CoverImage } from "@/components/media/CoverImage";
import { PageHero } from "@/components/interior/PageHero";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address.full)}`;

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Barron Sports in Newpark, Ennis, Co. Clare. Phone, email, address and opening hours.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Newpark, Ennis"
        title="Contact Us"
        description="If you have an enquiry about stock, a repair or the right piece of equipment, ask here or call the shop."
        image={{
          src: "/contact/contact-fanore.jpg",
          alt: "Fanore Beach on the Atlantic coast of County Clare",
        }}
      />
      <section className="bg-ink py-8 lg:py-10">
        <Container className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl text-cream">Visit the shop</h2>
            <address className="mt-4 space-y-3 text-base not-italic leading-relaxed text-parchment">
              <p>
                Phone{" "}
                <a className="text-brass hover:text-cream" href={site.phone.href}>
                  {site.phone.display}
                </a>
              </p>
              <p>
                Email{" "}
                <a className="text-brass hover:text-cream" href={site.email.href}>
                  {site.email.display}
                </a>
              </p>
              <p>
                {site.address.full}
              </p>
            </address>
            <h3 className="mt-6 text-[11px] uppercase tracking-[0.28em] text-brass">
              Opening hours
            </h3>
            <ul className="mt-3 max-w-sm space-y-1 text-sm text-parchment">
              {site.hours.map((item) => (
                <li key={item.day} className="flex justify-between gap-6 border-b border-line-soft py-1.5">
                  <span>{item.day}</span>
                  <span>{item.time}</span>
                </li>
              ))}
            </ul>
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="relative mt-6 block aspect-[16/9] overflow-hidden border border-line"
            >
              <CoverImage
                src="/contact/contact-map-placeholder.jpg"
                alt="Map of Barron Sports in Newpark, Ennis, Co. Clare"
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </a>
          </div>
          <div>
            <h2 className="mb-4 font-display text-3xl text-cream">Send a message</h2>
            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  );
}
