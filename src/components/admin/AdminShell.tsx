"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { lockAdmin } from "@/lib/admin/auth";
import { adminButton } from "@/components/admin/fields";

const nav = [
  { href: "/admin/", label: "Overview" },
  { href: "/admin/services/", label: "Services" },
  { href: "/admin/products/", label: "Products" },
  { href: "/admin/brands/", label: "Brands" },
];

function isActive(pathname: string, href: string) {
  const current = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return current === href || (href !== "/admin/" && current.startsWith(href));
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-forest">
        <div className="mx-auto flex w-full max-w-[96rem] flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-brass">
              Barron Sports
            </p>
            <p className="font-display text-2xl text-cream">Admin</p>
          </div>
          <nav className="flex flex-1 flex-wrap gap-1 sm:justify-center">
            {nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-[11px] uppercase tracking-[0.18em] ${
                    active
                      ? "bg-brass text-ink"
                      : "text-parchment hover:text-brass"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex gap-3">
            <Link href="/" className={adminButton.ghost}>
              View site
            </Link>
            <button
              type="button"
              className={adminButton.secondary}
              onClick={() => {
                lockAdmin();
                window.location.assign("/admin/");
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {children}
      </div>
    </div>
  );
}
