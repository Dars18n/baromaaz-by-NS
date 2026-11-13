import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/admin-auth";
import { cancelOrder } from "@/lib/cancel";
import { supabaseAdmin } from "@/lib/supabase";

const COLS = "id,order_number,status,customer_name,customer_email,customer_phone,address,landmark,city,state,pincode,subtotal,shipping,cod_fee,total,payment_method,razorpay_payment_id,paid_at,tracking_url,created_at,admin_seen,cancel_reason,cancelled_at,cancelled_by,cancel_seen,order_items(name,size,qty,price)";
const NEEDS_ACTION = ["confirmed", "paid"];

// Everything the dashboard shows: the list for the chosen filter, badge counts, and any unread alerts.
export async function GET(req) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const db = supabaseAdmin();
  const url = new URL(req.url);
  const filter = url.searchParams.get("filter") || "active";
  const q = (url.searchParams.get("q") || "").replace(/[^\w\s@.+-]/g, "").trim().slice(0, 60);

  let query = db.from("orders").select(COLS).order("created_at", { ascending: false }).limit(150);
  if (filter === "new") query = query.eq("admin_seen", false).in("status", NEEDS_ACTION);
  else if (filter === "active") query = query.in("status", ["confirmed", "paid", "packed", "shipped"]);
  else if (filter === "pending") query = query.eq("status", "pending");
  else if (filter === "delivered") query = query.eq("status", "delivered");
  else if (filter === "cancelled") query = query.not("cancelled_at", "is", null).order("cancelled_at", { ascending: false });
  if (q) query = query.or(`order_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%`);

  const [list, newCount, cancelCount, newAlerts, cancelAlerts] = await Promise.all([
    query,
    db.from("orders").select("id", { count: "exact", head: true }).eq("admin_seen", false).in("status", NEEDS_ACTION),
    db.from("orders").select("id", { count: "exact", head: true }).eq("cancel_seen", false).not("cancelled_at", "is", null),
    db.from("orders").select("id,order_number,customer_name,total,payment_method").eq("admin_seen", false).in("status", NEEDS_ACTION).order("created_at", { ascending: false }).limit(20),
    db.from("orders").select("id,order_number,customer_name,cancel_reason,cancelled_by").eq("cancel_seen", false).not("cancelled_at", "is", null).order("cancelled_at", { ascending: false }).limit(20),
  ]);
  if (list.error) return NextResponse.json({ error: list.error.message }, { status: 500 });
  return NextResponse.json({
    orders: list.data,
    counts: { newOrders: newCount.count || 0, unreadCancellations: cancelCount.count || 0 },
    alerts: { newOrders: newAlerts.data || [], cancellations: cancelAlerts.data || [] },
  });
}

const FLOW = { confirmed: ["packed"], paid: ["packed"], packed: ["shipped"], shipped: ["delivered"], cancelled: ["refunded"] };

export async function PATCH(req) {
  const denied = await guardAdmin(req, { mutating: true });
  if (denied) return denied;
  let b;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const db = supabaseAdmin();
  const fail = (error, status = 400) => NextResponse.json({ error }, { status });

  // ── mark things as read ──
  if (b.action === "seen") {
    await db.from("orders").update({ admin_seen: true }).eq("id", b.id);
    return NextResponse.json({ ok: true });
  }
  if (b.action === "seen_all") {
    await db.from("orders").update({ admin_seen: true }).eq("admin_seen", false);
    return NextResponse.json({ ok: true });
  }
  if (b.action === "cancel_seen") {
    let u = db.from("orders").update({ cancel_seen: true }).eq("cancel_seen", false);
    if (b.id) u = u.eq("id", b.id);
    await u;
    return NextResponse.json({ ok: true });
  }

  if (!b.id) return fail("Missing order");

  // ── cancel (by the shop) ──
  if (b.action === "cancel") {
    const reason = String(b.reason || "").replace(/\s+/g, " ").trim().slice(0, 500);
    if (reason.length < 3) return fail("Please write the reason for cancelling.");
    try {
      const r = await cancelOrder({ orderId: b.id, reason, by: "admin" });
      return r.ok ? NextResponse.json({ ok: true }) : fail(r.message, 409);
    } catch (e) {
      console.error("[admin cancel]", e.message);
      return fail("Could not cancel the order.", 500);
    }
  }

  // ── move along: packed → shipped → delivered (or cancelled → refunded) ──
  if (b.action === "status") {
    const { data: o } = await db.from("orders").select("status").eq("id", b.id).single();
    if (!o) return fail("Order not found", 404);
    if (!(FLOW[o.status] || []).includes(b.status)) return fail(`An order that is "${o.status}" can't be moved to "${b.status}".`, 409);
    const patch = { status: b.status, admin_seen: true };
    if (b.status === "shipped" && b.trackingUrl) {
      const t = String(b.trackingUrl).trim().slice(0, 300);
      if (!/^https?:\/\//i.test(t)) return fail("Tracking link must start with http:// or https://");
      patch.tracking_url = t;
    }
    const { error } = await db.from("orders").update(patch).eq("id", b.id);
    return error ? fail(error.message, 500) : NextResponse.json({ ok: true });
  }
  return fail("Unknown action");
}
