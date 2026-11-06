import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { hmacEqual, markPaid } from "@/lib/orders";

// Razorpay → this site, server to server. Backup confirmation in case the shopper closes the page
// right after paying. Set it up in Razorpay → Account & Settings → Webhooks:
//   URL:    https://www.baromaaz.com/api/razorpay/webhook
//   Events: payment.captured, order.paid
//   Secret: any long random text — put the same value in RAZORPAY_WEBHOOK_SECRET on Vercel.
// The Razorpay account may also serve other sites; orders this site didn't create are ignored.
export async function POST(req) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });

  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  if (!hmacEqual(expected, signature)) return NextResponse.json({ error: "Bad signature" }, { status: 401 });

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = event.payload?.payment?.entity;
    const orderId = payment?.order_id || event.payload?.order?.entity?.id;
    if (orderId && payment?.id) {
      try {
        const result = await markPaid(orderId, payment.id, "webhook");
        return NextResponse.json({ ok: true, result });
      } catch (e) {
        console.error("[webhook → markPaid]", e.message);
        return NextResponse.json({ error: "retry" }, { status: 500 }); // Razorpay retries on non-2xx
      }
    }
  }
  return NextResponse.json({ ok: true, ignored: event.event });
}
