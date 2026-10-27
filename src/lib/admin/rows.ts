import {
  normalizeAdminProduct,
  type AdminBrand,
  type AdminCategory,
  type AdminProduct,
  type AdminService,
} from "@/lib/admin/models";

/**
 * Converts admin records to and from Supabase rows. Columns are the record's
 * fields in snake_case (see supabase/migrations), so the conversion is by name.
 */

export type AdminTable = "categories" | "brands" | "services" | "products";

type DbRow = Record<string, unknown>;

const toSnake = (key: string) => key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
const toCamel = (key: string) => key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

function mapKeys(source: object, convert: (key: string) => string): DbRow {
  return Object.fromEntries(Object.entries(source).map(([key, value]) => [convert(key), value]));
}

export function toRow(table: AdminTable, record: object): DbRow {
  const row = mapKeys(record, toSnake);
  // Packages without a category are "" in the app and NULL in the database.
  if (table === "products" && row.category_id === "") row.category_id = null;
  return row;
}

export function categoryFromRow(row: DbRow) {
  return mapKeys(row, toCamel) as AdminCategory;
}

export function brandFromRow(row: DbRow) {
  return mapKeys(row, toCamel) as AdminBrand;
}

export function serviceFromRow(row: DbRow) {
  return mapKeys(row, toCamel) as AdminService;
}

export function productFromRow(row: DbRow) {
  const product = mapKeys(row, toCamel) as AdminProduct;
  return normalizeAdminProduct({ ...product, categoryId: product.categoryId ?? "" });
}
