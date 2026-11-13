import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";

export const BUCKET = "product-images";
export const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

// Make the shop show catalogue changes straight away instead of waiting up to a minute.
export function refreshShop() {
  revalidateTag("catalog");
  revalidatePath("/", "layout");
}

export const slugify = (s) =>
  String(s).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

// Works out what a file really is from its first bytes (not from the name the browser claims).
export function sniffImage(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", type: "image/jpeg" };
  if (buf[0] === 0x89 && buf.toString("ascii", 1, 4) === "PNG") return { ext: "png", type: "image/png" };
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return { ext: "webp", type: "image/webp" };
  return null;
}

// "https://x.supabase.co/storage/v1/object/public/product-images/products/a/1.webp" → "products/a/1.webp"
export function storagePathFromUrl(url) {
  const marker = `/object/public/${BUCKET}/`;
  const i = String(url).indexOf(marker);
  return i === -1 ? null : decodeURIComponent(String(url).slice(i + marker.length).split("?")[0]);
}
