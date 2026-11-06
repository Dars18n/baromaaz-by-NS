import { NextResponse } from "next/server";
import crypto from "node:crypto";

// Verifies the Razorpay payment signature (HMAC-SHA256 of "order_id|payment_id").
export async function POST(req) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return NextResponse.json({ verified: false, error: "Payments not configured" }, { status: 400 });
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json().catch(() => ({}));
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ verified: false }, { status: 400 });
  }
  const expected = crypto.createHmac("sha256", secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(razorpay_signature));
  const verified = a.length === b.length && crypto.timingSafeEqual(a, b);
  // TODO: save the paid order to your database / Google Sheet / email here before responding.
  return NextResponse.json({ verified }, { status: verified ? 200 : 400 });
}
