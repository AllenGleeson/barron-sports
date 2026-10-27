"use client";

import Link from "next/link";
import { isPackage } from "@/lib/admin/models";
import { useAdminStore } from "@/lib/admin/store";

export function AdminHome() {
  const { data } = useAdminStore();
  const cards = [
    {
      href: "/admin/products/",
      label: "Products",
      count: data.products.filter((row) => !isPackage(row)).length,
    },
    {
      href: "/admin/products/?view=offers",
      label: "Special offers",
      count: data.products.filter((row) => row.specialOffer).length,
    },
    {
      href: "/admin/products/?view=packages",
      label: "Packages",
      count: data.products.filter(isPackage).length,
    },
    { href: "/admin/services/", label: "Services", count: data.services.length },
    { href: "/admin/brands/", label: "Brands", count: data.brands.length },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl text-cream">Overview</h1>
      <p className="mt-3 max-w-2xl text-sm text-parchment">
        Changes are saved to the shop database. Special offers, packages and
        services update on the live site straight away; the rest of the product
        pages still come from the site files.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="border border-line bg-moss p-5 hover:border-brass"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-brass">
              {card.label}
            </p>
            <p className="mt-3 font-display text-4xl text-cream">{card.count}</p>
          </Link>
        ))}
      </div>
      <p className="mt-10 text-sm text-stone">
        Categories ({data.categories.length}) are used as product folders and are
        not edited here.
      </p>
    </div>
  );
}
