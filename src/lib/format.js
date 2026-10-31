// Always renders as "₹1,299" (Indian digit grouping, no decimals).
export function formatPrice(amount) {
  return "₹" + Math.round(Number(amount) || 0).toLocaleString("en-IN");
}

export function discountPercent(price, mrp) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}
