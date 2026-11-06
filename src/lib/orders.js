import "server-only";
import crypto from "node:crypto";
import { supabaseAdmin } from "./supabase";
import { formatPrice } from "./format";
import { SITE } from "./site";

const PHONE = /^[6-9][0-9]{9}$/;
const PIN = /^[1-9][0-9]{5}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v, max = 200) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

// Checks the delivery details sent from checkout. Throws a friendly message if something's wrong.
export function validateCustomer(c = {}) {
  const out = {
    name: clean(c.name, 80),
    phone: clean(c.phone, 10).replace(/\D/g, ""),
    email: clean(c.email, 120).toLowerCase(),
    flat: clean(c.flat, 80),
    building: clean(c.building, 120),
    area: clean(c.area, 200),
    landmark: clean(c.landmark, 120),
    city: clean(c.city, 60),
    state: clean(c.state, 60),
    pincode: clean(c.pincode, 6),
  };
  if (!out.name) throw new Error("Please enter your name");
  if (!PHONE.test(out.phone)) throw new Error("Please enter a valid 10-digit mobile number");
  if (out.email && !EMAIL.test(out.email)) throw new Error("Please check your email address");
  if (!out.flat || !out.building || !out.area) throw new Error("Please complete your address");
  if (!out.city || !out.state) throw new Error("Please enter your city and state");
  if (!PIN.test(out.pincode)) throw new Error("Please enter a valid 6-digit PIN code");
  out.address = [out.flat, out.building, out.area].join(", ");
  return out;
}

// Saves a new order (status "pending") right after the Razorpay order is created.
export async function savePendingOrder({ orderNumber, razorpayOrderId, customer, priced }) {
  const db = supabaseAdmin();
  const { data: order, error } = await db
    .from("orders")
    .insert({
      order_number: orderNumber,
      status: "pending",
      customer_name: customer.name,
      customer_email: customer.email || null,
      customer_phone: customer.phone,
      address: customer.address,
      landmark: customer.landmark || null,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
      subtotal: priced.subtotal,
      shipping: priced.shipping,
      total: priced.total,
      payment_method: priced.method === "cod" ? "cod" : "online",
      cod_fee: priced.codFee || 0,
      razorpay_order_id: razorpayOrderId || null,
    })
    .select("id")
    .single();
  if (error) throw new Error(`Could not save order: ${error.message}`);
  const { error: e2 } = await db.from("order_items").insert(
    priced.lines.map((l) => ({ order_id: order.id, product_id: l.productId, name: l.name, size: l.size, qty: l.qty, price: l.price }))
  );
  if (e2) throw new Error(`Could not save order items: ${e2.message}`);
  return order.id;
}

// Marks paid + reduces stock (once), then emails the shop. Safe to call twice.
export async function markPaid(razorpayOrderId, paymentId, source) {
  const db = supabaseAdmin();
  const { data: result, error } = await db.rpc("mark_order_paid", { p_razorpay_order_id: razorpayOrderId, p_payment_id: paymentId, p_source: source });
  if (error) throw new Error(`mark_order_paid: ${error.message}`);
  if (result === "paid") await sendOrderAlert("razorpay_order_id", razorpayOrderId).catch((e) => console.error("[order alert]", e.message));
  return result;
}

// Cash on Delivery: save + confirm (reduces stock) + email the shop.
export async function placeCodOrder({ orderNumber, customer, priced }) {
  const id = await savePendingOrder({ orderNumber, razorpayOrderId: null, customer, priced });
  const { data: result, error } = await supabaseAdmin().rpc("confirm_cod_order", { p_order_id: id });
  if (error) throw new Error(`confirm_cod_order: ${error.message}`);
  if (result === "confirmed") await sendOrderAlert("id", id).catch((e) => console.error("[order alert]", e.message));
  return result;
}

export async function getOrderNumber(razorpayOrderId) {
  const { data } = await supabaseAdmin().from("orders").select("order_number").eq("razorpay_order_id", razorpayOrderId).maybeSingle();
  return data?.order_number || null;
}

// Email to the shop for every paid order (via Resend — free tier). Skipped if not set up.
async function sendOrderAlert(column, value) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_ALERT_EMAIL;
  if (!key || !to) return console.warn("[order alert] RESEND_API_KEY / ORDER_ALERT_EMAIL not set — no email sent");
  const db = supabaseAdmin();
  const { data: o } = await db.from("orders").select("*, order_items(name,size,qty,price)").eq(column, value).single();
  if (!o || o.alert_sent) return;
  const cod = o.payment_method === "cod";
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const rows = o.order_items.map((i) => `<tr><td>${esc(i.name)}</td><td>${esc(i.size)}</td><td>${i.qty}</td><td>${formatPrice(i.price * i.qty)}</td></tr>`).join("");
  const html = `<h2>New ${cod ? "CASH ON DELIVERY" : "paid"} order ${esc(o.order_number)}</h2>
    <p>${cod ? `<b style="color:#b3261e">Collect ${formatPrice(o.total)} in cash on delivery</b> (includes ${formatPrice(o.cod_fee)} COD handling)` : `<b>${formatPrice(o.total)}</b> paid online · Razorpay payment ${esc(o.razorpay_payment_id)}`}</p>
    <table cellpadding="6" border="1" style="border-collapse:collapse"><tr><th>Item</th><th>Size</th><th>Qty</th><th>Amount</th></tr>${rows}</table>
    <h3>Deliver to</h3>
    <p>${esc(o.customer_name)} · ${esc(o.customer_phone)}${o.customer_email ? ` · ${esc(o.customer_email)}` : ""}<br>
    ${esc(o.address)}${o.landmark ? `, near ${esc(o.landmark)}` : ""}<br>${esc(o.city)}, ${esc(o.state)} ${esc(o.pincode)}</p>
    <p>Shipping charged: ${formatPrice(o.shipping)}</p>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.ORDER_ALERT_FROM || "Baromaaz Orders <onboarding@resend.dev>",
      to: to.split(",").map((s) => s.trim()),
      subject: `New ${cod ? "COD " : ""}order ${o.order_number} — ${formatPrice(o.total)} (${o.customer_name})`,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  await db.from("orders").update({ alert_sent: true }).eq("id", o.id);
}

export function hmacEqual(expectedHex, givenHex) {
  const a = Buffer.from(expectedHex);
  const b = Buffer.from(String(givenHex || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const orderNumberFor = () => `BRZ-${Date.now().toString(36).toUpperCase()}${crypto.randomInt(100, 999)}`;
export { SITE };
