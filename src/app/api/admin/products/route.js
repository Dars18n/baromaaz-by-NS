import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/admin-auth";
import { ALL_SIZES, BUCKET, refreshShop, slugify, sniffImage } from "@/lib/admin-products";
import { supabaseAdmin } from "@/lib/supabase";

export const maxDuration = 30;

// Every product (including hidden ones) + the lists the "Add product" form needs.
export async function GET(req) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const db = supabaseAdmin();
  const [products, categories, drop] = await Promise.all([
    db.from("products").select("id,slug,name,category,price,mrp,color,fabric,is_active,most_wanted,drop_id,created_at,product_images(url,position),product_variants(size,stock)").order("created_at", { ascending: false }),
    db.from("categories").select("slug,name").order("sort_order"),
    db.from("drops").select("id,name").eq("is_current", true).maybeSingle(),
  ]);
  if (products.error) return NextResponse.json({ error: products.error.message }, { status: 500 });
  return NextResponse.json({
    products: products.data.map((p) => ({
      ...p,
      image: (p.product_images || []).sort((a, b) => a.position - b.position)[0]?.url || null,
      variants: (p.product_variants || []).sort((a, b) => ALL_SIZES.indexOf(a.size) - ALL_SIZES.indexOf(b.size)),
      inCurrentDrop: Boolean(drop.data && p.drop_id === drop.data.id),
    })),
    categories: categories.data || [],
    currentDrop: drop.data || null,
  });
}

const MAX_IMAGE_BYTES = 900 * 1024;
const text = (v, max) => String(v ?? "").replace(/\r/g, "").trim().slice(0, max);

// Adds a product. Photos arrive already resized by the browser.
export async function POST(req) {
  const denied = await guardAdmin(req, { mutating: true });
  if (denied) return denied;
  const fail = (error, status = 400) => NextResponse.json({ error }, { status });

  let form;
  try { form = await req.formData(); } catch { return fail("Invalid form"); }

  const name = text(form.get("name"), 120);
  const category = text(form.get("category"), 60);
  const price = Number(form.get("price"));
  const mrp = Number(form.get("mrp") || price);
  if (name.length < 2) return fail("Please enter the product name.");
  if (!category) return fail("Please choose a category.");
  if (!Number.isInteger(price) || price < 1) return fail("Selling price must be a whole number of rupees.");
  if (!Number.isInteger(mrp) || mrp < price) return fail("MRP can't be lower than the selling price.");

  let sizes;
  try { sizes = JSON.parse(String(form.get("sizes") || "{}")); } catch { return fail("Invalid sizes"); }
  const sizeRows = Object.entries(sizes).filter(([s]) => ALL_SIZES.includes(s)).map(([size, stock]) => ({ size, stock: Math.max(0, Math.min(9999, parseInt(stock, 10) || 0)) }));
  if (!sizeRows.length) return fail("Select at least one size.");

  const images = [];
  for (const f of form.getAll("images")) {
    if (typeof f === "string" || !f.size) continue;
    if (f.size > MAX_IMAGE_BYTES) return fail("Each photo must be under 900 KB (the form shrinks them automatically — try again).");
    const buf = Buffer.from(await f.arrayBuffer());
    const kind = sniffImage(buf);
    if (!kind) return fail("Photos must be JPG, PNG or WebP.");
    images.push({ buf, ...kind });
  }
  if (!images.length) return fail("Please add at least one photo.");
  if (images.length > 6) return fail("You can add up to 6 photos.");

  let og = null;
  const ogFile = form.get("og");
  if (ogFile && typeof ogFile !== "string" && ogFile.size && ogFile.size <= MAX_IMAGE_BYTES) {
    const buf = Buffer.from(await ogFile.arrayBuffer());
    if (sniffImage(buf)?.ext === "jpg") og = buf;
  }

  const db = supabaseAdmin();

  // unique URL name
  const base = slugify(name) || "product";
  let slug = base;
  for (let n = 2; n < 50; n++) {
    const { data } = await db.from("products").select("id").eq("slug", slug).maybeSingle();
    if (!data) break;
    slug = `${base}-${n}`;
  }

  let dropId = null;
  if (form.get("inDrop") === "true") {
    const { data } = await db.from("drops").select("id").eq("is_current", true).maybeSingle();
    dropId = data?.id || null;
  }

  const uploaded = [];
  let productId = null;
  try {
    const { data: row, error } = await db.from("products").insert({
      slug, name, category, price, mrp,
      color: text(form.get("color"), 60) || null,
      fabric: text(form.get("fabric"), 80) || null,
      description: text(form.get("description"), 2000) || null,
      care: text(form.get("care"), 600) || null,
      most_wanted: form.get("mostWanted") === "true",
      is_active: form.get("active") !== "false",
      drop_id: dropId,
    }).select("id").single();
    if (error) throw new Error(error.code === "23503" ? "That category doesn't exist." : error.message);
    productId = row.id;

    const { error: vErr } = await db.from("product_variants").insert(sizeRows.map((r) => ({ product_id: productId, size: r.size, stock: r.stock, sku: `${slug}-${r.size}`.toUpperCase().replace(/\s+/g, "") })));
    if (vErr) throw new Error(vErr.message);

    const urls = [];
    for (const [n, img] of images.entries()) {
      const path = `products/${slug}/${n + 1}.${img.ext}`;
      const { error: uErr } = await db.storage.from(BUCKET).upload(path, img.buf, { contentType: img.type, upsert: true, cacheControl: "31536000" });
      if (uErr) throw new Error(`Photo upload failed: ${uErr.message}`);
      uploaded.push(path);
      urls.push(db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
    }
    const { error: iErr } = await db.from("product_images").insert(urls.map((url, n) => ({ product_id: productId, url, position: n, alt: n === 0 ? `${name} — front view` : `${name} — view ${n + 1}` })));
    if (iErr) throw new Error(iErr.message);

    if (og) {
      const { error: oErr } = await db.storage.from(BUCKET).upload(`og/${slug}.jpg`, og, { contentType: "image/jpeg", upsert: true, cacheControl: "31536000" });
      if (!oErr) uploaded.push(`og/${slug}.jpg`);
    }
  } catch (e) {
    // undo everything so no half-made product is left behind
    if (productId) await db.from("products").delete().eq("id", productId);
    if (uploaded.length) await db.storage.from(BUCKET).remove(uploaded);
    console.error("[admin add product]", e.message);
    return fail(e.message, 500);
  }

  refreshShop();
  return NextResponse.json({ ok: true, slug });
}
