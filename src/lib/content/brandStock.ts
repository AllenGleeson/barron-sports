import { getAllProducts } from "@/lib/content/products";

/** Brand names given on catalogue products (as written, e.g. "Howa"). */
export function catalogueBrandNames(): string[] {
  return [...new Set(getAllProducts().flatMap((product) => product.brands ?? []))];
}
