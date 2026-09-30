"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { CoverImage } from "@/components/media/CoverImage";
import { Container } from "@/components/ui/Container";
import { categories, primaryNav, site } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [navPath, setNavPath] = useState(pathname);
  const closeTimer = useRef<number | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const hideOffset = useRef(0);
  const productsId = useId();
  const mobilePanelId = useId();

  if (pathname !== navPath) {
    setNavPath(pathname);
    setMobileOpen(false);
    setProductsOpen(false);
    setMobileProductsOpen(false);
  }

  useEffect(() => {
    const header = headerRef.current;
    lastScrollY.current = window.scrollY;

    const setHide = (next: number) => {
      hideOffset.current = next;
      if (header) {
        header.style.transform = `translate3d(0, ${-next}px, 0)`;
      }
    };

    setHide(0);

    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 12);

      const height = header?.offsetHeight ?? 180;
      const delta = currentY - lastScrollY.current;
      lastScrollY.current = currentY;

      if (mobileOpen || productsOpen || currentY < 8) {
        setHide(0);
        return;
      }

      const next = Math.min(height, Math.max(0, hideOffset.current + delta * 0.65));
      setHide(next);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileOpen, pathname, productsOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProductsOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (desktopQuery.matches) {
        setMobileOpen(false);
        setMobileProductsOpen(false);
      }
    };
    desktopQuery.addEventListener("change", onChange);
    return () => desktopQuery.removeEventListener("change", onChange);
  }, []);

  const openProducts = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setProductsOpen(true);
  };

  const delayCloseProducts = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setProductsOpen(false), 140);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 border-b will-change-transform transition-[color,background-color,border-color] duration-300 ${
        scrolled
          ? "border-line bg-ink/95 backdrop-blur-md"
          : "border-transparent bg-ink"
      }`}
    >
      <div className="hidden border-b border-line-soft bg-forest text-[11px] uppercase tracking-[0.18em] text-stone lg:block">
        <Container className="flex items-center justify-between py-2">
          <p>{site.address.full}</p>
          <p className="flex items-center gap-6">
            <a href={site.phone.href} className="hover:text-brass">
              {site.phone.display}
            </a>
            <span>Mon–Fri 10:00–19:00 · Sat 10:00–12:30</span>
          </p>
        </Container>
      </div>

      <Container className="flex h-[6.75rem] items-center justify-between gap-3 xl:gap-6">
        <Logo className="shrink-0" priority />

        <nav className="hidden min-w-0 items-center whitespace-nowrap lg:flex" aria-label="Primary">
          {primaryNav.map((item) => {
            if (item.children) {
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={openProducts}
                  onMouseLeave={delayCloseProducts}
                >
                  <button
                    type="button"
                    className={`flex items-center gap-1.5 px-2 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors xl:px-3 xl:text-[12px] xl:tracking-[0.16em] ${
                      pathname.startsWith("/products1") || productsOpen
                        ? "text-brass hover:text-cream/85"
                        : "text-cream/85 hover:text-brass"
                    }`}
                    aria-expanded={productsOpen}
                    aria-controls={productsId}
                    onClick={() => setProductsOpen((open) => !open)}
                    onFocus={openProducts}
                  >
                    {item.label}
                    <Chevron down={productsOpen} />
                  </button>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors xl:px-3 xl:text-[12px] xl:tracking-[0.16em] ${
                  item.prominent || isActive(item.href)
                    ? "text-brass hover:text-cream/85"
                    : "text-cream/85 hover:text-brass"
                }`}
              >
                {item.prominent ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-brass" aria-hidden="true" />
                    {item.label}
                  </span>
                ) : (
                  item.label
                )}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="lg:hidden -mr-1 p-2 text-cream"
          aria-expanded={mobileOpen}
          aria-controls={mobilePanelId}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
          <span className="flex h-4 w-6 flex-col justify-between" aria-hidden="true">
            <span
              className={`h-px w-full bg-current transition ${mobileOpen ? "translate-y-[7.5px] rotate-45" : ""}`}
            />
            <span className={`h-px w-full bg-current transition ${mobileOpen ? "opacity-0" : ""}`} />
            <span
              className={`h-px w-full bg-current transition ${mobileOpen ? "-translate-y-[7.5px] -rotate-45" : ""}`}
            />
          </span>
        </button>
      </Container>

      <div
        id={productsId}
        onMouseEnter={openProducts}
        onMouseLeave={delayCloseProducts}
        className={`absolute inset-x-0 top-full hidden border-b border-line bg-forest/98 shadow-2xl shadow-black/40 backdrop-blur-md lg:block ${
          productsOpen ? "visible opacity-100" : "invisible pointer-events-none opacity-0"
        } transition-opacity duration-200`}
        aria-hidden={!productsOpen}
        inert={!productsOpen ? true : undefined}
      >
        <Container className="grid grid-cols-3 gap-px py-8">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={category.href}
              className="group grid grid-cols-[5.5rem_1fr] gap-4 p-4 transition-colors hover:bg-moss"
            >
              <span className="relative block aspect-[4/3] overflow-hidden bg-panel">
                <CoverImage
                  src={category.image.src}
                  alt=""
                  sizes="220px"
                  className="transition duration-500 group-hover:scale-105"
                />
              </span>
              <span className="flex flex-col justify-center">
                <span className="font-display text-xl text-cream group-hover:text-brass">
                  {category.name}
                </span>
                <span className="mt-1 text-sm text-stone">{category.shortDescription}</span>
              </span>
            </Link>
          ))}
        </Container>
      </div>

      <div
        id={mobilePanelId}
        className={`lg:hidden ${mobileOpen ? "block" : "hidden"} border-t border-line bg-ink`}
      >
        <nav className="max-h-[calc(100dvh-6.75rem)] overflow-y-auto px-5 py-6" aria-label="Mobile">
          <ul className="flex flex-col">
            {primaryNav.map((item) => (
              <li key={item.label} className="border-b border-line-soft">
                {item.children ? (
                  <div>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-4 text-left text-sm uppercase tracking-[0.18em] text-cream"
                      aria-expanded={mobileProductsOpen}
                      onClick={() => setMobileProductsOpen((open) => !open)}
                    >
                      {item.label}
                      <Chevron down={mobileProductsOpen} />
                    </button>
                    {mobileProductsOpen ? (
                      <ul className="mb-3 ml-1 border-l border-line pl-4">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block py-2.5 text-sm text-parchment hover:text-brass"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`block py-4 text-sm uppercase tracking-[0.18em] ${
                      item.prominent || isActive(item.href)
                        ? "text-brass hover:text-cream/85"
                        : "text-cream hover:text-brass"
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <a href={site.phone.href} className="mt-6 block text-sm text-stone">
            {site.phone.display}
          </a>
        </nav>
      </div>
    </header>
  );
}

function Chevron({ down }: { down: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`h-2.5 w-2.5 transition-transform ${down ? "rotate-180" : ""}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
