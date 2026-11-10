import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

const clean = (v, max) => String(v ?? "").replace(/[<>]/g, "").trim().slice(0, max);

// Saves a review as PENDING (is_approved = false). It only appears on the product page after you
// approve it in Supabase (Table editor → reviews → tick is_approved).
export async function POST(req) {
  // Accepts multipart form data (text fields + up to 3 photos).
  const form = await req.formData().catch(() => null);
  const b = form ? Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")) : null;
  if (!b) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (b.website) return NextResponse.json({ ok: true }); // honeypot: bots fill this, humans never see it

  const slug = clean(b.slug, 120);
  const name = clean(b.name, 60);
  const text = clean(b.text, 1200);
  const rating = Number(b.rating);
  if (!slug || name.length < 2 || text.length < 10 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Please add your name, a rating and a review of at least 10 characters." }, { status: 400 });
  }
  if (!isSupabaseConfigured) return NextResponse.json({ error: "Reviews are opening soon." }, { status: 503 });

  const files = form.getAll("photos").filter((f) => typeof f !== "string" && f.size > 0).slice(0, 3);
  for (const f of files) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type) || f.size > 3 * 1024 * 1024) {
      return NextResponse.json({ error: "Photos must be JPG, PNG or WebP, up to 3 MB each." }, { status: 400 });
    }
  }

  try {
    const db = supabaseAdmin();
    // Photos go in the existing public "product-images" bucket under reviews/ (no new setup needed).
    const photos = [];
    for (const f of files) {
      const ext = f.type === "image/png" ? "png" : f.type === "image/webp" ? "webp" : "jpg";
      const path = `reviews/${slug}/${randomUUID()}.${ext}`;
      const { error: upErr } = await db.storage.from("product-images").upload(path, Buffer.from(await f.arrayBuffer()), { contentType: f.type });
      if (upErr) throw upErr;
      photos.push(db.storage.from("product-images").getPublicUrl(path).data.publicUrl);
    }
    const { data: product } = await db.from("products").select("id").eq("slug", slug).maybeSingle();
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const { error } = await db.from("reviews").insert({
      product_id: product.id,
      name,
      city: clean(b.city, 60) || null,
      rating,
      title: clean(b.title, 100) || null,
      body: text,
      size: clean(b.size, 10) || null,
      photos,
      is_approved: false,
    });
    if (error) throw error;
  } catch (e) {
    console.error("[review]", e.message);
    return NextResponse.json({ error: "Could not save your review. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
