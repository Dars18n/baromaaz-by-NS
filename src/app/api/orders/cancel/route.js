import { NextResponse } from "next/server";
import { CANCEL_REASONS, cancelOrder } from "@/lib/cancel";
import { clientIp, hit } from "@/lib/ratelimit";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

// A customer cancels their own order. They must give the order number AND the mobile number used at checkout.
export async function POST(req) {
  if (!hit(`cancel:${clientIp(req)}`, { max: 10, windowMs: 60 * 60 * 1000 }).ok)
    return NextResponse.json({ error: "Too many attempts. Please WhatsApp us and we'll cancel it for you." }, { status: 429 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const orderNumber = String(body.orderNumber || "").trim().toUpperCase().slice(0, 40);
  const phone = String(body.phone || "").replace(/\D/g, "").slice(-10);
  const choice = String(body.reason || "");
  const details = String(body.details || "").replace(/\s+/g, " ").trim().slice(0, 300);
  if (!orderNumber || phone.length !== 10) return NextResponse.json({ error: "Please enter your order number and the 10-digit mobile number used at checkout." }, { status: 400 });
  if (!CANCEL_REASONS.includes(choice)) return NextResponse.json({ error: "Please choose a reason." }, { status: 400 });
  if (choice === "Other" && details.length < 3) return NextResponse.json({ error: "Please tell us the reason." }, { status: 400 });
  if (!isSupabaseConfigured) return NextResponse.json({ error: "Cancellation isn't available right now. Please WhatsApp us." }, { status: 503 });

  const { data: order } = await supabaseAdmin().from("orders").select("id").eq("order_number", orderNumber).eq("customer_phone", phone).maybeSingle();
  if (!order) return NextResponse.json({ error: "We couldn't find an order with that number and mobile number." }, { status: 404 });

  try {
    const reason = details ? `${choice} — ${details}` : choice;
    const r = await cancelOrder({ orderId: order.id, reason, by: "customer" });
    return NextResponse.json({ ok: r.ok, message: r.message }, { status: r.ok ? 200 : 409 });
  } catch (e) {
    console.error("[customer cancel]", e.message);
    return NextResponse.json({ error: "Could not cancel the order. Please try again." }, { status: 500 });
  }
}
