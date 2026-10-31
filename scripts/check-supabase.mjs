// Checks the Supabase connection.  Run:  npm run db:check
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

// load .env.local without extra packages
for (const f of [".env.local", ".env"]) {
  if (!fs.existsSync(f)) continue;
  for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ok = (m) => console.log("  ✓ " + m);
const bad = (m) => { console.log("  ✗ " + m); process.exitCode = 1; };

console.log("\nBaromaaz → Supabase connection check\n");
if (!url) bad("NEXT_PUBLIC_SUPABASE_URL is missing in .env.local"); else ok("Project URL found");
if (!anon) bad("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing in .env.local"); else ok("Anon key found");
if (!service) bad("SUPABASE_SERVICE_ROLE_KEY is missing in .env.local"); else ok("Service role key found");
if (!url || !anon) process.exit();

const pub = createClient(url, anon, { auth: { persistSession: false } });
const { data: cats, error } = await pub.from("categories").select("slug,name").order("sort_order");
if (error) {
  bad(`Connected, but couldn't read categories: ${error.message}`);
  console.log("    → Did you run supabase/schema.sql in the SQL Editor?");
} else {
  ok(`Database reachable — ${cats.length} categories: ${cats.map((c) => c.name).join(", ")}`);
}

if (service) {
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { error: e2 } = await admin.from("orders").select("id", { count: "exact", head: true });
  e2 ? bad(`Service key can't read orders: ${e2.message}`) : ok("Service key works (orders table reachable)");
  const { data: buckets, error: e3 } = await admin.storage.listBuckets();
  if (e3) bad(`Storage: ${e3.message}`);
  else buckets.some((b) => b.id === "product-images") ? ok("Photo storage bucket 'product-images' ready") : bad("Bucket 'product-images' not found — re-run schema.sql");
  const { data: leak } = await pub.from("orders").select("id").limit(1);
  (leak && leak.length) ? bad("SECURITY: visitors can read orders — check Row Level Security") : ok("Orders are private (visitors can't read them)");
}
console.log(process.exitCode ? "\nSomething needs fixing (see ✗ above).\n" : "\nAll good — Supabase is connected.\n");
