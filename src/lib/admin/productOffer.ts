import type { AdminProduct, AdminStoreData } from "@/lib/admin/models";
import { formatEuro, isDiscounted } from "@/lib/admin/money";
import { PRODUCT_PLACEHOLDER_IMAGE, type SpecialOffer } from "@/lib/site";

export function adminProductToOffer(
  product: AdminProduct,
  categoryName: string,
  categorySlug: string,
): SpecialOffer {
  const discounted = isDiscounted(product);
  return {
    id: product.id,
    category: categoryName,
    title: product.name,
    image: product.imageUrl || PRODUCT_PLACEHOLDER_IMAGE,
    description: product.summary ? [product.summary] : [],
    rrp: discounted ? formatEuro(product.priceCents) : undefined,
    price: discounted
      ? formatEuro(product.discountPriceCents)
      : formatEuro(product.priceCents, product.priceDisplay),
    badge: "Special Offer",
    href: categorySlug ? `/products/${categorySlug}/` : "/products/",
  };
}

export function specialOfferProductsFromStore(
  store: AdminStoreData,
): SpecialOffer[] {
  return store.products
    .filter((product) => product.published && product.specialOffer)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((product) => {
      const category = store.categories.find(
        (item) => item.id === product.categoryId,
      );
      return adminProductToOffer(
        product,
        category?.name ?? "Products",
        category?.slug ?? "",
      );
    });
}
