"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [menuMounted, setMenuMounted] = useState(false);
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

    const syncMenuTop = () => {
      if (!header) return;
      const bottom = `${header.getBoundingClientRect().bottom}px`;
      header.style.setProperty("--header-bottom", bottom);
      document.documentElement.style.setProperty("--header-bottom", bottom);
    };

    const setHide = (next: number) => {
      hideOffset.current = next;
      if (!header) return;
      header.style.transform = next > 0 ? `translate3d(0, ${-next}px, 0)` : "";
      syncMenuTop();
    };

    setHide(0);
    syncMenuTop();

    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 12);
      syncMenuTop();

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
    window.addEventListener("resize", syncMenuTop);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", syncMenuTop);
    };
  }, [mobileOpen, pathname, productsOpen]);

  useEffect(() => {
    setMenuMounted(true);
  }, []);

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
    closeTimer.current = window.setTimeout(() => setProductsOpen(false), 200);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
    <header
      ref={headerRef}
      className={`site-header sticky top-0 z-[100] overflow-visible border-b transition-[color,background-color,border-color] duration-300 ${
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
                  data-products
                  className="group/products relative flex h-[6.75rem] items-center"
                  onMouseEnter={openProducts}
                  onMouseLeave={delayCloseProducts}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1.5 px-2 py-2 text-[12px] uppercase tracking-[0.14em] transition-colors xl:px-3 xl:text-[13px] xl:tracking-[0.16em] ${
                      pathname.startsWith("/products") || productsOpen
                        ? "text-brass hover:text-cream/85"
                        : "text-cream/85 hover:text-brass"
                    }`}
                    aria-expanded={productsOpen}
                    aria-controls={productsId}
                    onFocus={openProducts}
                  >
                    {item.label}
                    <Chevron down={productsOpen} />
                  </Link>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 py-2 text-[12px] uppercase tracking-[0.14em] transition-colors xl:px-3 xl:text-[13px] xl:tracking-[0.16em] ${
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
        id={mobilePanelId}
        className={`lg:hidden ${mobileOpen ? "block" : "hidden"} border-t border-line bg-ink`}
      >
        <nav className="max-h-[calc(100dvh-6.75rem)] overflow-y-auto px-5 py-6" aria-label="Mobile">
          <ul className="flex flex-col">
            {primaryNav.map((item) => (
              <li key={item.label} className="border-b border-line-soft">
                {item.children ? (
                  <div>
                    <div className="flex items-center justify-between gap-3 border-b border-line-soft">
                      <Link
                        href={item.href}
                        className="flex-1 py-4 text-sm uppercase tracking-[0.18em] text-cream hover:text-brass"
                      >
                        {item.label}
                      </Link>
                      <button
                        type="button"
                        className="p-4 text-cream"
                        aria-expanded={mobileProductsOpen}
                        aria-label={mobileProductsOpen ? "Hide product categories" : "Show product categories"}
                        onClick={() => setMobileProductsOpen((open) => !open)}
                      >
                        <Chevron down={mobileProductsOpen} />
                      </button>
                    </div>
                    {mobileProductsOpen ? (
                      <ul className="mb-3 ml-1 border-l border-line pl-4">
                        <li>
                          <Link
                            href={item.href}
                            className="block py-2.5 text-sm text-parchment hover:text-brass"
                          >
                            All Products
                          </Link>
                        </li>
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
      {menuMounted && productsOpen
        ? createPortal(
            <div
              id={productsId}
              className="fixed inset-x-0 z-[200] border-b border-line bg-forest/98 shadow-2xl shadow-black/40 backdrop-blur-md"
              style={{ top: "var(--header-bottom, 6.75rem)" }}
              onMouseEnter={openProducts}
              onMouseLeave={delayCloseProducts}
            >
              <Container className="py-8">
                <div className="grid grid-cols-3 gap-px">
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
                </div>
                <div className="mt-6 flex justify-center">
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center border border-brass/40 px-6 py-3 text-[12px] font-medium uppercase tracking-[0.18em] text-brass transition-colors hover:border-brass hover:bg-brass/10"
                  >
                    All Products
                  </Link>
                </div>
              </Container>
            </div>,
            document.body,
          )
        : null}
    </>
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
