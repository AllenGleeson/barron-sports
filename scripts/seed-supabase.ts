/**
 * Loads the site's built-in content (src/lib/site.ts) into Supabase.
 *
 * Only adds rows that don't exist yet (matched by id), so it never overwrites
 * changes made in the admin. Safe to run again after adding new content.
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (bypasses access
 * rules, so keep it out of the browser and out of git):
 *   npm run db:seed
 */
import { createClient } from "@supabase/supabase-js";
import { toRow, type AdminTable } from "@/lib/admin/rows";
import { createSeedStore } from "@/lib/admin/seed";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (e.g. in .env.local).");
  process.exit(1);
}

const supabase = createClient(url, secretKey, { auth: { persistSession: false } });
const seed = createSeedStore();

// Categories first: products refer to them.
const tables: [AdminTable, object[]][] = [
  ["categories", seed.categories],
  ["brands", seed.brands],
  ["services", seed.services],
  ["products", seed.products],
];

async function main() {
  for (const [table, records] of tables) {
    const { data, error } = await supabase
      .from(table)
      .upsert(
        records.map((record) => toRow(table, record)),
        { onConflict: "id", ignoreDuplicates: true },
      )
      .select("id");
    if (error) {
      console.error(`${table}: ${error.message}`);
      process.exit(1);
    }
    console.log(`${table}: ${data.length} added, ${records.length - data.length} already there`);
  }
}

void main();
