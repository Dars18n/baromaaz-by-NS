import { NextResponse } from "next/server";
import { priceCart } from "@/lib/pricing";
import { orderNumberFor, savePendingOrder, validateCustomer } from "@/lib/orders";

// Creates a Razorpay order and saves it in Supabase as "pending".
// The amount is recomputed on the server from the catalogue — never trusted from the browser.
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  let priced, customer;
  try {
    priced = await priceCart(body.items);
    customer = validateCustomer(body.customer);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !secret) {
    // Demo checkout (no payment taken) only on your own computer, or when explicitly switched on
    // with CHECKOUT_DEMO=1 for a private preview. On a live site we never pretend to take an order.
    const demoAllowed = process.env.NODE_ENV !== "production" || process.env.CHECKOUT_DEMO === "1";
    if (!demoAllowed) {
      return NextResponse.json(
        { error: "Online payments are opening soon. Please message us on WhatsApp to place your order." },
        { status: 503 }
      );
    }
    return NextResponse.json({ demo: true, receipt: orderNumberFor(), amount: priced.total * 100, currency: "INR", ...priced });
  }

  const orderNumber = orderNumberFor();
  let res;
  try {
    res = await fetch("https://api.razorpay.com/v1/orders", {
      signal: AbortSignal.timeout(15000),
      method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(`${keyId}:${secret}`).toString("base64") },
    body: JSON.stringify({
      amount: priced.total * 100, // paise
      currency: "INR",
      receipt: orderNumber,
      notes: {
        source: "baromaaz-website",
        order_number: orderNumber,
        items: priced.lines.map((l) => `${l.slug}:${l.size}x${l.qty}`).join(", ").slice(0, 250),
      },
      }),
    });
  } catch {
    return NextResponse.json({ error: "Payment service is slow right now — please try again in a moment." }, { status: 504 });
  }
  if (!res.ok) {
    console.error("[razorpay order]", res.status, await res.text().catch(() => ""));
    return NextResponse.json({ error: "Could not start payment. Please try again." }, { status: 502 });
  }
  const rzpOrder = await res.json();

  try {
    await savePendingOrder({ orderNumber, razorpayOrderId: rzpOrder.id, customer, priced });
  } catch (e) {
    console.error("[save order]", e.message);
    return NextResponse.json({ error: "Could not start payment. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ demo: false, keyId, orderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency, receipt: orderNumber, ...priced });
}
