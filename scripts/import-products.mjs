// Loads products into Supabase from supabase/seed/products.json
//   npm run db:import            → import everything (safe to re-run; updates existing products)
//   npm run db:import -- --dry   → only show what would happen
//
// For each product it:
//   1. creates/updates the product row (matched by slug)
//   2. sets stock per size
//   3. downloads each photo, converts it to WebP (≤1000px wide, <200 KB),
//      uploads it to the "product-images" bucket, and saves the links in order
//   4. makes a 1200×630 JPEG share image for WhatsApp/Instagram previews
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

// ── load .env.local ──
for (const f of [".env.local", ".env"]) {
  if (!fs.existsSync(f)) continue;
  for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("✗ Supabase keys missing in .env.local — run `npm run db:check` first.");
  process.exit(1);
}
const DRY = process.argv.includes("--dry");
const db = createClient(url, key, { auth: { persistSession: false } });
const BUCKET = "product-images";
const MAX_BYTES = 200 * 1024;
const products = JSON.parse(fs.readFileSync(path.join("supabase", "seed", "products.json"), "utf8"));

async function download(src) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (attempt === 3) throw e;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

async function toWebp(buf) {
  for (let q = 82; q >= 46; q -= 6) {
    const out = await sharp(buf).rotate().resize({ width: 1000, withoutEnlargement: true }).webp({ quality: q, effort: 5 }).toBuffer();
    if (out.length <= MAX_BYTES) return out;
  }
  return sharp(buf).rotate().resize({ width: 800, withoutEnlargement: true }).webp({ quality: 50 }).toBuffer();
}

async function upload(file, body, contentType) {
  const { error } = await db.storage.from(BUCKET).upload(file, body, { contentType, upsert: true, cacheControl: "31536000" });
  if (error) throw new Error(`upload ${file}: ${error.message}`);
  return db.storage.from(BUCKET).getPublicUrl(file).data.publicUrl;
}

// ── safety check: make sure these are the tables created by supabase/schema.sql ──
{
  const { error } = await db.from("products").select("slug,mrp,category,is_active").limit(1);
  const { error: e2 } = await db.from("product_variants").select("size,stock").limit(1);
  if (error || e2) {
    console.error(`\n✗ This Supabase project doesn't have the Baromaaz tables yet (${(error || e2).message}).`);
    console.error("  Run supabase/schema.sql in the SQL Editor first, then try again. Nothing was changed.\n");
    process.exit(1);
  }
  const host = new URL(url).host;
  const oldHost = new URL(products[0].images[0]).host;
  console.log(host === oldHost
    ? "Note: photos are being copied within the same Supabase project."
    : `Photos will be copied from ${oldHost} (old store) into ${host} (this project).`);
}

let ok = 0, failed = 0, imgCount = 0, totalKb = 0;
const problems = [];
console.log(`\n${DRY ? "[DRY RUN] " : ""}Importing ${products.length} products into ${url}\n`);

for (const [i, p] of products.entries()) {
  const label = `[${String(i + 1).padStart(2)}/${products.length}] ${p.name}`;
  try {
    if (DRY) {
      console.log(`${label} — ${p.category}, ₹${p.price}, ${p.variants.length} sizes, ${p.images.length} photos`);
      continue;
    }
    // 1. product row
    const { data: row, error } = await db
      .from("products")
      .upsert(
        {
          slug: p.slug,
          name: p.name,
          category: p.category,
          price: p.price,
          mrp: p.mrp,
          color: p.color ?? null,
          fabric: p.fabric ?? null,
          description: p.description ?? null,
          is_active: true,
          created_at: `${p.added}T09:00:00+05:30`,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();
    if (error) throw new Error(`product: ${error.message}`);

    // 2. stock per size
    const { error: vErr } = await db
      .from("product_variants")
      .upsert(p.variants.map((v) => ({ product_id: row.id, size: v.size, stock: v.stock, sku: `${p.slug}-${v.size}`.toUpperCase() })), { onConflict: "product_id,size" });
    if (vErr) throw new Error(`stock: ${vErr.message}`);

    // 3. photos
    const urls = [];
    let firstBuf = null;
    for (const [n, src] of p.images.entries()) {
      try {
        const original = await download(src);
        const webp = await toWebp(original);
        if (n === 0) firstBuf = original;
        urls.push(await upload(`products/${p.slug}/${n + 1}.webp`, webp, "image/webp"));
        imgCount++;
        totalKb += webp.length / 1024;
      } catch (e) {
        problems.push(`${p.name} photo ${n + 1}: ${e.message}`);
      }
    }
    if (urls.length) {
      await db.from("product_images").delete().eq("product_id", row.id);
      const { error: iErr } = await db.from("product_images").insert(
        urls.map((u, n) => ({ product_id: row.id, url: u, position: n, alt: n === 0 ? `${p.name} — front view` : `${p.name} — view ${n + 1}` }))
      );
      if (iErr) throw new Error(`images: ${iErr.message}`);
    }

    // 4. share image for WhatsApp / Instagram (JPEG on purpose)
    if (firstBuf) {
      const og = await sharp(firstBuf).rotate().resize(1200, 630, { fit: "cover", position: "attention" }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
      await upload(`og/${p.slug}.jpg`, og, "image/jpeg");
    }

    ok++;
    console.log(`✓ ${label} — ${urls.length}/${p.images.length} photos`);
  } catch (e) {
    failed++;
    problems.push(`${p.name}: ${e.message}`);
    console.log(`✗ ${label} — ${e.message}`);
  }
}

if (!DRY) {
  console.log(`\nDone: ${ok} products imported, ${failed} failed, ${imgCount} photos uploaded (avg ${imgCount ? Math.round(totalKb / imgCount) : 0} KB each).`);
  if (problems.length) console.log("\nNeeds attention:\n  - " + problems.join("\n  - "));
  console.log("\nRefresh the website — new products appear within a minute.\n");
}
