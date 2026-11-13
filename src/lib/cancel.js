import "server-only";
import { supabaseAdmin } from "./supabase";
import { formatPrice } from "./format";

// Reasons a customer can pick when cancelling (shown in the account page).
export const CANCEL_REASONS = [
  "Changed my mind",
  "Ordered by mistake",
  "Found a better price elsewhere",
  "Want to change size or colour",
  "Delivery is taking too long",
  "Need to change the delivery address",
  "Other",
];

const MESSAGES = {
  not_found: "We couldn't find that order.",
  already_cancelled: "This order is already cancelled.",
  too_late: "This order has already been packed or shipped, so it can no longer be cancelled here.",
  bad_request: "Invalid request.",
};

// Cancels through the database function (puts stock back, saves the reason), then emails the shop.
export async function cancelOrder({ orderId, reason, by }) {
  const { data: result, error } = await supabaseAdmin().rpc("cancel_order", { p_order_id: orderId, p_reason: reason, p_by: by });
  if (error) throw new Error(`cancel_order: ${error.message}`);
  if (result === "cancelled") await sendCancelAlert(orderId).catch((e) => console.error("[cancel alert]", e.message));
  return { ok: result === "cancelled", result, message: result === "cancelled" ? "Order cancelled." : MESSAGES[result] || "Could not cancel this order." };
}

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Email to the shop when an order is cancelled (same Resend setup as new-order emails). Skipped if not set up.
async function sendCancelAlert(orderId) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_ALERT_EMAIL;
  if (!key || !to) return;
  const { data: o } = await supabaseAdmin().from("orders").select("*, order_items(name,size,qty,price)").eq("id", orderId).single();
  if (!o) return;
  const paidOnline = o.payment_method === "online" && o.paid_at;
  const rows = o.order_items.map((i) => `<li>${esc(i.name)} · ${esc(i.size)} · Qty ${i.qty}</li>`).join("");
  const html = `<h2>Order ${esc(o.order_number)} was cancelled by the ${esc(o.cancelled_by)}</h2>
    <p><b>Reason:</b> ${esc(o.cancel_reason) || "—"}</p>
    <p>${esc(o.customer_name)} · ${esc(o.customer_phone)} · ${formatPrice(o.total)} (${o.payment_method === "cod" ? "Cash on Delivery" : "paid online"})</p>
    <ul>${rows}</ul>
    ${paidOnline ? `<p style="color:#b3261e"><b>Refund due: ${formatPrice(o.total)}</b> — Razorpay payment ${esc(o.razorpay_payment_id)}. Refund it from the Razorpay dashboard, then mark it refunded in the admin dashboard.</p>` : ""}`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.ORDER_ALERT_FROM || "Baromaaz Orders <onboarding@resend.dev>",
      to: to.split(",").map((s) => s.trim()),
      subject: `CANCELLED: order ${o.order_number} — ${o.cancel_reason || "no reason given"}`.slice(0, 200),
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
