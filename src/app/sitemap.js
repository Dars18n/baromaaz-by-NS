import { getCategories, getProducts } from "@/lib/catalog";

export const revalidate = 3600;
import { SITE } from "@/lib/site";

export default async function sitemap() {
  const [allProducts, allCategories] = await Promise.all([getProducts(), getCategories()]);
  const now = new Date();
  const page = (path, priority = 0.6, changeFrequency = "monthly") => ({ url: `${SITE.url}${path}`, lastModified: now, changeFrequency, priority });
  return [
    page("/", 1, "weekly"),
    page("/drop", 0.9, "weekly"),
    page("/new-in", 0.8, "weekly"),
    ...allProducts.map((p) => ({ ...page(`/product/${p.slug}`, 0.7, "monthly"), lastModified: new Date(p.added), images: p.images.map((i) => (i.startsWith("http") ? i : `${SITE.url}${i}`)) })),
    page("/about", 0.5),
    page("/contact", 0.5),
    ...["/shipping-policy", "/returns-exchange-policy", "/privacy-policy", "/terms-of-service", "/grievance-officer"].map((p) => page(p, 0.3, "yearly")),
  ];
}
