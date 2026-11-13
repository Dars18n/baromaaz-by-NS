import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/admin-auth";
import { BUCKET, refreshShop, storagePathFromUrl } from "@/lib/admin-products";
import { supabaseAdmin } from "@/lib/supabase";

// Show / hide a product on the shop (or flag it as Most Wanted).
export async function PATCH(req, { params }) {
  const denied = await guardAdmin(req, { mutating: true });
  if (denied) return denied;
  const { id } = await params;
  let b;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const patch = {};
  if (typeof b.is_active === "boolean") patch.is_active = b.is_active;
  if (typeof b.most_wanted === "boolean") patch.most_wanted = b.most_wanted;
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nothing to change" }, { status: 400 });
  const { error } = await supabaseAdmin().from("products").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  refreshShop();
  return NextResponse.json({ ok: true });
}

// Deletes the product, its stock rows and its photos. Past orders keep the item name and price.
export async function DELETE(req, { params }) {
  const denied = await guardAdmin(req, { mutating: true });
  if (denied) return denied;
  const { id } = await params;
  const db = supabaseAdmin();
  const { data: p } = await db.from("products").select("slug,product_images(url)").eq("id", id).maybeSingle();
  if (!p) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const { error } = await db.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const files = [...(p.product_images || []).map((i) => storagePathFromUrl(i.url)).filter(Boolean), `og/${p.slug}.jpg`];
  await db.storage.from(BUCKET).remove(files).catch((e) => console.error("[admin delete photos]", e.message));
  refreshShop();
  return NextResponse.json({ ok: true });
}
