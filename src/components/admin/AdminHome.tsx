"use client";

import Link from "next/link";
import { useAdminStore } from "@/lib/admin/store";
import { adminButton } from "@/components/admin/fields";

export function AdminHome() {
  const { data, reset } = useAdminStore();
  const cards = [
    { href: "/admin/services/", label: "Services", count: data.services.length },
    { href: "/admin/products/", label: "Products", count: data.products.length },
    { href: "/admin/brands/", label: "Brands", count: data.brands.length },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl text-cream">Overview</h1>
      <p className="mt-3 max-w-2xl text-sm text-parchment">
        Edit shop records in this browser. Changes are saved locally and do not
        publish to the live pages until a database is connected.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
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
      <div className="mt-10 border border-line-soft bg-forest p-5">
        <p className="text-sm text-parchment">
          Categories ({data.categories.length}) are used as product folders and
          are not edited here. Reset restores the current site content and
          discards local admin edits.
        </p>
        <button
          type="button"
          className={`${adminButton.secondary} mt-4`}
          onClick={() => {
            if (
              window.confirm(
                "Reset admin data to the current site content? Local edits will be lost.",
              )
            ) {
              reset();
            }
          }}
        >
          Reset to site data
        </button>
      </div>
    </div>
  );
}
