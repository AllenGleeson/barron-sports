import type { AdminService } from "@/lib/admin/models";
import type { OfferSource } from "@/lib/admin/productOffer";
import { categoryFromRow, productFromRow, serviceFromRow } from "@/lib/admin/rows";
import { getSupabaseBrowser } from "@/lib/supabase/client";

/**
 * Published content for public pages, read from Supabase in the browser.
 * The database access rules only return published rows to visitors.
 *
 * Each loader runs once per page load and resolves to null when Supabase
 * isn't configured, can't be reached, or hasn't been set up yet; callers then
 * keep showing the built-in site content.
 */

let offersRequest: Promise<OfferSource | null> | null = null;
let servicesRequest: Promise<AdminService[] | null> | null = null;

async function fetchOfferSource(): Promise<OfferSource | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;

  const [categories, offers] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("products").select("*").eq("special_offer", true).order("sort_order"),
  ]);
  if (categories.error || offers.error) return null;
  // No categories means the database hasn't been set up yet.
  if (!categories.data?.length) return null;

  const products = (offers.data ?? []).map(productFromRow);

  // Packages list their products by name, so load those too (names only).
  const offerIds = new Set(products.map((product) => product.id));
  const contentIds = [
    ...new Set(products.flatMap((product) => product.productIds)),
  ].filter((id) => !offerIds.has(id));
  if (contentIds.length > 0) {
    const contents = await supabase
      .from("products")
      .select("id, kind, name, category_id, published")
      .in("id", contentIds);
    if (!contents.error) products.push(...(contents.data ?? []).map(productFromRow));
  }

  return { categories: categories.data.map(categoryFromRow), products };
}

async function fetchServices(): Promise<AdminService[] | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;
  const [services, categories] = await Promise.all([
    supabase.from("services").select("*").order("sort_order"),
    supabase.from("categories").select("id", { count: "exact", head: true }),
  ]);
  if (services.error || categories.error) return null;
  // No categories means the database hasn't been set up yet; an empty
  // services list on a set-up database means the admin has hidden them all.
  if (!categories.count) return null;
  return (services.data ?? []).map(serviceFromRow);
}

export function loadOfferSource() {
  offersRequest ??= fetchOfferSource().catch(() => null);
  return offersRequest;
}

export function loadPublicServices() {
  servicesRequest ??= fetchServices().catch(() => null);
  return servicesRequest;
}
