"use client";

import { BrandLogo } from "@/components/cards/BrandLogo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { usePublicOfferBrands } from "@/lib/admin/usePublicOfferBrands";
import { splitBrandsByStock } from "@/lib/content/brands";
import type { Brand } from "@/lib/site";

type BrandSectionsProps = {
  /** Brand names on catalogue products, worked out when the page is built. */
  productBrandNames: string[];
};

export function BrandSections({ productBrandNames }: BrandSectionsProps) {
  const offerBrandNames = usePublicOfferBrands();
  const { inStock, onRequest } = splitBrandsByStock([
    ...productBrandNames,
    ...(offerBrandNames ?? []),
  ]);

  return (
    <div className="space-y-14">
      {inStock.length > 0 ? (
        <BrandGroup
          id="brands-in-stock"
          title="In Stock"
          description="Brands with products or special offers in the shop now."
          brands={inStock}
        />
      ) : null}
      {onRequest.length > 0 ? (
        <BrandGroup
          id="brands-on-request"
          title="Available on Request"
          description="Not on the shelf at the moment, but we can order them in. Get in touch and we will source it for you."
          brands={onRequest}
        />
      ) : null}
    </div>
  );
}

function BrandGroup({
  id,
  title,
  description,
  brands,
}: {
  id: string;
  title: string;
  description: string;
  brands: Brand[];
}) {
  return (
    <section aria-labelledby={id}>
      <SectionHeading id={id} title={title} description={description} />
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {brands.map((brand) => (
          <li key={brand.name}>
            <BrandLogo brand={brand} />
          </li>
        ))}
      </ul>
    </section>
  );
}
