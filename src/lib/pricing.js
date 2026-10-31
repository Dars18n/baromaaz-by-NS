import { getProducts } from "./catalog";
import { SITE } from "./site";

// Server-side source of truth for the amount charged — never trust totals sent from the browser.
// Re-reads prices and stock from the catalogue.
export async function priceCart(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) throw new Error("Cart is empty or invalid");
  const products = await getProducts();
  const lines = items.map(({ slug, size, qty }) => {
    const p = products.find((x) => x.slug === slug);
    const q = Number(qty);
    if (!p || !p.sizes.includes(size) || !Number.isInteger(q) || q < 1 || q > 10) throw new Error("Invalid cart item");
    const left = p.stock?.[size] ?? 0;
    if (left < q) throw new Error(left > 0 ? `Only ${left} left of ${p.name} in size ${size}` : `${p.name} in size ${size} just sold out`);
    return { slug, productId: p.id ?? null, name: p.name, size, qty: q, price: p.price };
  });
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const shipping = subtotal >= SITE.freeShippingAbove ? 0 : SITE.shippingFee;
  return { lines, subtotal, shipping, total: subtotal + shipping };
}
