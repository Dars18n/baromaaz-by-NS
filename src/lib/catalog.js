import "server-only";
import { unstable_cache } from "next/cache";
import { supabase, isSupabaseConfigured } from "./supabase";
import { SIZES } from "./sizes";
import { SITE } from "./site";
import sampleProducts from "@/data/products.json";
import sampleCategories from "@/data/categories.json";
import looks from "@/data/looks.json";

export { SIZES };

// How often the site re-reads the database (seconds).
export const CATALOG_REVALIDATE = 60;

// ─────────── normalisers: database rows → the shape the site uses ───────────
function fromDb(p, currentDropId) {
  const images = (p.product_images || []).sort((a, b) => a.position - b.position).map((i) => i.url);
  const variants = (p.product_variants || []).sort((a, b) => SIZES.indexOf(a.size) - SIZES.indexOf(b.size));
  const stock = Object.fromEntries(variants.map((v) => [v.size, v.stock]));
  const storageBase = images[0]?.split("/storage/v1/object/public/")[0];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    price: p.price,
    mrp: p.mrp,
    color: p.color || "",
    fabric: p.fabric || "",
    description: p.description || "",
    added: (p.created_at || "").slice(0, 10),
    drop: Boolean(currentDropId && p.drop_id === currentDropId),
    mostWanted: Boolean(p.most_wanted),
    images: images.length ? images : ["/images/placeholder.webp"],
    og: storageBase ? `${storageBase}/storage/v1/object/public/product-images/og/${p.slug}.jpg` : "/images/og/og-default.jpg",
    sizes: variants.map((v) => v.size),
    stock,
    inStock: variants.some((v) => v.stock > 0),
  };
}

function fromSample(p) {
  const sizes = p.sizes || SIZES;
  return {
    ...p,
    images: [1, 2, 3].map((n) => `/images/products/${p.slug}-${n}.webp`),
    og: `/images/og/${p.slug}.jpg`,
    sizes,
    stock: Object.fromEntries(sizes.map((s) => [s, 10])),
    inStock: true,
  };
}

// ─────────── one cached read of the whole catalogue ───────────
const loadCatalog = unstable_cache(
  async () => {
    if (!isSupabaseConfigured) {
      // Never let a live site silently show sample products.
      if (process.env.NODE_ENV === "production" && process.env.ALLOW_SAMPLE_CATALOG !== "1") {
        throw new Error(
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY " +
            "to your hosting environment variables (Vercel → Project → Settings → Environment Variables), then redeploy."
        );
      }
      console.warn("[catalog] Supabase not configured — showing SAMPLE products from src/data/products.json");
      return {
        source: "sample",
        products: sampleProducts.map(fromSample),
        categories: sampleCategories.map((c) => ({ ...c, showOnHome: c.showOnHome !== false })),
        reviews: [],
      };
    }
    const [prodRes, catRes, dropRes, revRes] = await Promise.all([
      supabase
        .from("products")
        .select("id,slug,name,category,price,mrp,color,fabric,description,most_wanted,drop_id,created_at,product_images(url,position),product_variants(size,stock)")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("slug,name,image_url,show_on_home,sort_order").order("sort_order"),
      supabase.from("drops").select("id").eq("is_current", true).maybeSingle(),
      supabase.from("reviews").select("id,product_id,name,city,rating,title,body,size,photos,created_at").eq("is_approved", true).order("created_at", { ascending: false }),
    ]);
    for (const r of [prodRes, catRes, revRes]) if (r.error) throw new Error(`[catalog] ${r.error.message}`);
    const dropId = dropRes.data?.id;
    const products = prodRes.data.map((p) => fromDb(p, dropId));
    const bySlugId = Object.fromEntries(products.map((p) => [p.id, p.slug]));
    return {
      source: "supabase",
      products,
      // Category photos come from src/data/categories.json when set there (so new photos only need a push),
      // otherwise from the database.
      categories: catRes.data.map((c) => ({ slug: c.slug, name: c.name, image: sampleCategories.find((s) => s.slug === c.slug)?.image || c.image_url, showOnHome: c.show_on_home })),
      reviews: revRes.data.map((r) => ({ ...r, product: bySlugId[r.product_id], text: r.body, date: r.created_at.slice(0, 10) })),
    };
  },
  ["baromaaz-catalog"],
  { revalidate: CATALOG_REVALIDATE, tags: ["catalog"] }
);

export const getCatalog = () => loadCatalog();

// ─────────── helpers (all async) ───────────
export async function getProducts() {
  return (await getCatalog()).products;
}
export async function getCategories() {
  return (await getCatalog()).categories;
}
export async function getProduct(slug) {
  return (await getProducts()).find((p) => p.slug === slug) || null;
}
export async function getCategory(slug) {
  return (await getCategories()).find((c) => c.slug === slug) || null;
}
export const byNewest = (list) => [...list].sort((a, b) => b.added.localeCompare(a.added));

export async function newArrivals(n = 8) {
  return byNewest(await getProducts()).slice(0, n);
}
// The current Monthly Drop; if no drop is set up yet, show the newest pieces.
export async function dropProducts(n = 7) {
  const all = await getProducts();
  const flagged = all.filter((p) => p.drop);
  return flagged.length ? flagged : byNewest(all).slice(0, n);
}
// Hand-picked "most_wanted" products first; if none are picked yet,
// the pieces with the fewest units left (i.e. selling fastest) — based on real stock.
export async function mostWanted(n = 8) {
  const all = await getProducts();
  const picked = all.filter((p) => p.mostWanted);
  if (picked.length) return picked.slice(0, n);
  const left = (p) => Object.values(p.stock || {}).reduce((s, v) => s + v, 0);
  return all.filter((p) => p.inStock && left(p) > 0).sort((a, b) => left(a) - left(b)).slice(0, n);
}
export async function relatedProducts(product, n = 4) {
  const all = await getProducts();
  const same = all.filter((p) => p.category === product.category && p.slug !== product.slug);
  const rest = byNewest(all).filter((p) => p.category !== product.category && p.slug !== product.slug);
  return [...same, ...rest].slice(0, n);
}
export async function reviewsFor(slug) {
  return (await getCatalog()).reviews.filter((r) => r.product === slug);
}
// Only real, approved reviews ever produce a rating.
export async function ratingFor(slug) {
  const list = await reviewsFor(slug);
  if (!list.length) return null;
  const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;
  return { average: Math.round(avg * 10) / 10, count: list.length };
}
// Shop-the-Look entries whose products all still exist.
export async function getLooks() {
  const slugs = new Set((await getProducts()).map((p) => p.slug));
  return looks.map((l) => ({ ...l, products: l.products.filter((s) => slugs.has(s)) })).filter((l) => l.products.length);
}

// Small version of each product for the browser (cart, wishlist) — keeps pages light.
export async function getProductIndex() {
  return (await getProducts()).map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
    price: p.price,
    mrp: p.mrp,
    color: p.color,
    added: p.added,
    drop: p.drop,
    images: p.images.slice(0, 2),
    sizes: p.sizes,
    stock: p.stock,
  }));
}

// ─────────── "12 months, 12 drops" ───────────
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Current year + month in India (the site's home time zone).
function nowInIndia() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit" }).formatToParts(new Date());
  return { year: Number(parts.find((p) => p.type === "year").value), month: Number(parts.find((p) => p.type === "month").value) };
}

// One entry per month of the current year. A product belongs to the month it was added.
// Past months with no new products are filled with a different piece from the collection,
// so all months up to now are shown; future months appear as "coming soon".
export async function getMonthlyDrops() {
  const { year, month: current } = nowInIndia();
  const all = await getProducts();
  const bySlug = Object.fromEntries(all.map((p) => [p.slug, p]));
  const card = (p) => ({ slug: p.slug, name: p.name, price: p.price, mrp: p.mrp, image: p.images[0] });
  const overrides = SITE.monthlyFeatured || {};
  const used = new Set();

  const months = MONTHS.map((name, i) => {
    const number = i + 1;
    const key = `${year}-${String(number).padStart(2, "0")}`;
    const items = all
      .filter((p) => p.added?.startsWith(key))
      .sort((a, b) => Number(b.mostWanted) - Number(a.mostWanted) || b.added.localeCompare(a.added));
    const chosen = bySlug[overrides[number]];
    const featured = chosen || items[0] || null;
    if (featured) used.add(featured.slug);
    return {
      key, number, name,
      short: name.slice(0, 3).toUpperCase(),
      status: items.length || chosen ? "live" : number > current ? "upcoming" : "fill",
      count: items.length,
      featured: featured ? card(featured) : null,
    };
  });

  // Fill empty past months with unused pieces, rotating through categories for variety.
  const pool = byNewest(all).filter((p) => !used.has(p.slug) && p.images[0] && !p.images[0].includes("placeholder"));
  const cats = [...new Set(pool.map((p) => p.category))];
  let c = 0;
  for (const m of months) {
    if (m.status !== "fill") continue;
    let pick = null;
    for (let tries = 0; tries < cats.length && !pick; tries++, c++) {
      const cat = cats[c % cats.length];
      pick = pool.find((p) => p.category === cat && !used.has(p.slug));
    }
    pick = pick || pool.find((p) => !used.has(p.slug));
    if (pick) {
      used.add(pick.slug);
      c++;
      m.featured = card(pick);
      m.status = "live";
    } else {
      m.status = "none";
    }
  }

  const shown = months.filter((m) => m.status !== "none");
  const live = shown.filter((m) => m.status === "live");
  const start = live.find((m) => m.number === current) || live.filter((m) => m.number <= current).pop() || live[0] || shown[0];
  return { year, months: shown, startKey: start?.key ?? null };
}
