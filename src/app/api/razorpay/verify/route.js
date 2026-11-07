import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getOrderNumber, hmacEqual, markPaid } from "@/lib/orders";

// Called by checkout right after Razorpay says "paid".
// Verifies the signature (HMAC-SHA256 of "order_id|payment_id"), then marks the order paid,
// reduces stock and emails the shop. The webhook does the same as a backup.
export async function POST(req) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return NextResponse.json({ verified: false, error: "Payments not configured" }, { status: 400 });
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json().catch(() => ({}));
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ verified: false }, { status: 400 });
  }
  const expected = crypto.createHmac("sha256", secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  if (!hmacEqual(expected, razorpay_signature)) return NextResponse.json({ verified: false }, { status: 400 });

  try {
    await markPaid(razorpay_order_id, razorpay_payment_id, "checkout");
  } catch (e) {
    // Payment is genuine even if saving failed — the webhook will retry. Log it loudly.
    console.error("[verify → markPaid]", e.message);
  }
  const orderNumber = await getOrderNumber(razorpay_order_id).catch(() => null);
  return NextResponse.json({ verified: true, orderNumber });
}
