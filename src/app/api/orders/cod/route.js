import { NextResponse } from "next/server";
import { priceCart } from "@/lib/pricing";
import { orderNumberFor, placeCodOrder, validateCustomer } from "@/lib/orders";
import { isSupabaseConfigured } from "@/lib/supabase";
import { SITE } from "@/lib/site";

// Places a Cash-on-Delivery order. Total = items + shipping + COD handling fee, all worked out on the server.
export async function POST(req) {
  if (!SITE.cod?.enabled) return NextResponse.json({ error: "Cash on Delivery isn't available right now." }, { status: 403 });
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  let priced, customer;
  try {
    priced = await priceCart(body.items, { method: "cod" });
    customer = validateCustomer(body.customer);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  const orderNumber = orderNumberFor();
  if (!isSupabaseConfigured) {
    const demoAllowed = process.env.NODE_ENV !== "production" || process.env.CHECKOUT_DEMO === "1";
    if (!demoAllowed) return NextResponse.json({ error: "Ordering is opening soon. Please message us on WhatsApp." }, { status: 503 });
    return NextResponse.json({ demo: true, receipt: orderNumber, ...priced });
  }

  try {
    const result = await placeCodOrder({ orderNumber, customer, priced });
    if (result !== "confirmed") throw new Error(result);
  } catch (e) {
    console.error("[cod order]", e.message);
    return NextResponse.json({ error: "Could not place your order. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ demo: false, receipt: orderNumber, ...priced });
}
