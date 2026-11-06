import { NextResponse } from "next/server";
import { priceCart } from "@/lib/pricing";

// Creates a Razorpay order. Amount is recomputed on the server from the catalogue.
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  let priced;
  try {
    priced = await priceCart(body.items);
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
    return NextResponse.json({ demo: true, amount: priced.total * 100, currency: "INR", ...priced });
  }

  const receipt = `BRZ-${Date.now()}`;
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(`${keyId}:${secret}`).toString("base64") },
    body: JSON.stringify({
      amount: priced.total * 100, // paise
      currency: "INR",
      receipt,
      notes: { items: priced.lines.map((l) => `${l.slug}:${l.size}x${l.qty}`).join(", ").slice(0, 250) },
    }),
  });
  if (!res.ok) return NextResponse.json({ error: "Could not start payment. Please try again." }, { status: 502 });
  const order = await res.json();
  return NextResponse.json({ demo: false, keyId, orderId: order.id, amount: order.amount, currency: order.currency, receipt, ...priced });
}
