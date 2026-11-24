"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOutAdmin, useAdminAuth } from "@/lib/admin/auth";
import { adminButton } from "@/components/admin/fields";
import { Eyebrow } from "@/components/ui/Eyebrow";

/** Shows Payments in the admin menu. The page still works at /admin/payments when false. */
const SHOW_PAYMENTS = false;

const nav = [
  { href: "/admin/", label: "Overview" },
  { href: "/admin/services/", label: "Services" },
  { href: "/admin/products/", label: "Products" },
  { href: "/admin/brands/", label: "Brands" },
  { href: "/admin/users/", label: "Users" },
  ...(SHOW_PAYMENTS ? [{ href: "/admin/payments/", label: "Payments" }] : []),
];

function isActive(pathname: string, href: string) {
  const current = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return current === href || (href !== "/admin/" && current.startsWith(href));
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAdminAuth();

  return (
    <div className="min-h-dvh bg-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-forest">
        <div className="mx-auto flex w-full max-w-[96rem] flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Eyebrow>
              Barron Sports
            </Eyebrow>
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
          <div className="flex flex-wrap items-center gap-3">
            {auth.status === "signed-in" ? (
              <span className="text-xs text-stone">{auth.email}</span>
            ) : null}
            <Link href="/" className={adminButton.ghost}>
              View site
            </Link>
            <button
              type="button"
              className={adminButton.secondary}
              onClick={async () => {
                await signOutAdmin();
                router.push("/admin");
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
