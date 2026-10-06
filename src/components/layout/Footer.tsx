import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { categories, footerNav, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line bg-forest">
      <Container className="grid grid-cols-12 gap-x-6 gap-y-12 py-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <Logo compact />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-stone">
            Specialist sporting and outdoor equipment from Ennis, County Clare.
            Firearms, optics, DogTrace systems and trusted brands, with practical
            in-house service.
          </p>
        </div>

        <div className="col-span-6 lg:col-span-3">
          <h2 className="text-[11px] uppercase tracking-[0.28em] text-brass">
            Navigation
          </h2>
          <ul className="mt-5 space-y-2.5">
            {footerNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-parchment hover:text-brass"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-6 lg:col-span-3">
          <h2 className="text-[11px] uppercase tracking-[0.28em] text-brass">
            Product Categories
          </h2>
          <ul className="mt-5 space-y-2.5">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={category.href}
                  className="text-sm text-parchment hover:text-brass"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <h2 className="text-[11px] uppercase tracking-[0.28em] text-brass">
            Contact
          </h2>
          <address className="mt-5 space-y-3 text-sm not-italic leading-relaxed text-parchment">
            <p>
              <a href={site.phone.href} className="hover:text-brass">
                {site.phone.display}
              </a>
            </p>
            <p>
              <a href={site.email.href} className="hover:text-brass">
                {site.email.display}
              </a>
            </p>
            <p>
              {site.address.lines.join(", ")}
              <br />
              {site.address.eircode}
            </p>
          </address>
          <ul className="mt-6 space-y-1 text-sm text-stone">
            {site.hours.map((item) => (
              <li key={item.day} className="flex justify-between gap-4">
                <span>{item.day}</span>
                <span>{item.time}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-parchment">Please call before visiting.</p>
        </div>
      </Container>

      <div className="border-t border-line-soft">
        <Container className="flex flex-col gap-3 py-3 text-xs uppercase tracking-[0.16em] text-stone sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Barron Sports. Ennis, Co. Clare.
          </p>
          <p>Irish specialist sporting retailer</p>
        </Container>
      </div>
    </footer>
  );
}
