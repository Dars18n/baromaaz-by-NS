"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { when } from "./api";

const STATUS = {
  pending: ["Awaiting payment", "bg-ink/10 text-ink-soft"],
  confirmed: ["Confirmed (COD)", "bg-[#2e7d32]/10 text-[#2e7d32]"],
  paid: ["Paid", "bg-[#2e7d32]/10 text-[#2e7d32]"],
  packed: ["Packed", "bg-[#1565c0]/10 text-[#1565c0]"],
  shipped: ["Shipped", "bg-[#1565c0]/10 text-[#1565c0]"],
  delivered: ["Delivered", "bg-ink/10 text-ink"],
  cancelled: ["Cancelled", "bg-[#b3261e]/10 text-[#b3261e]"],
  refunded: ["Refunded", "bg-[#b3261e]/10 text-[#b3261e]"],
};

export default function OrderCard({ order: o, onAction, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");
  const [tracking, setTracking] = useState(o.tracking_url || "");

  const isNew = !o.admin_seen && ["confirmed", "paid"].includes(o.status);
  const unreadCancel = Boolean(o.cancelled_at) && !o.cancel_seen;
  const refundDue = Boolean(o.cancelled_at) && o.status === "cancelled" && o.payment_method === "online" && Boolean(o.paid_at);
  const [label, tone] = STATUS[o.status] || [o.status, "bg-ink/10"];
  const canCancel = ["pending", "confirmed", "paid", "packed"].includes(o.status);

  const run = async (body) => {
    setBusy(true);
    setErr("");
    try { await onAction({ id: o.id, ...body }); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && isNew) onAction({ action: "seen", id: o.id }).catch(() => {});
    if (next && unreadCancel) onAction({ action: "cancel_seen", id: o.id }).catch(() => {});
  };

  return (
    <li className={`border bg-white/60 ${unreadCancel ? "border-[#b3261e]/60" : isNew ? "border-terracotta-dark" : "border-ink/10"}`}>
      <button type="button" onClick={toggle} aria-expanded={open} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-4 text-left">
        <span className="min-w-[150px] font-medium">{o.order_number}</span>
        <span className={`px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${tone}`}>{label}</span>
        {isNew && <span className="bg-terracotta-dark px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-ivory">New</span>}
        {unreadCancel && <span className="bg-[#b3261e] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-white">Unread</span>}
        <span className="text-sm text-ink-soft">{o.customer_name}</span>
        <span className="ml-auto text-sm font-medium">{formatPrice(o.total)} <span className="font-normal text-ink-muted">· {o.payment_method === "cod" ? "COD" : "Online"}</span></span>
        <span className="w-full text-xs text-ink-muted sm:w-auto">{when(o.cancelled_at || o.created_at)}</span>
      </button>

      {/* the reason is always visible on a cancelled order */}
      {o.cancelled_at && (
        <div className="mx-4 mb-4 border-l-4 border-[#b3261e] bg-[#b3261e]/5 px-4 py-3 text-sm">
          <p className="font-medium text-[#b3261e]">Cancelled by {o.cancelled_by === "customer" ? "the customer" : "you"} · {when(o.cancelled_at)}</p>
          <p className="mt-1"><span className="text-ink-muted">Reason:</span> {o.cancel_reason || "No reason given"}</p>
          {refundDue && <p className="mt-2 font-medium">Refund due: {formatPrice(o.total)} (Razorpay payment {o.razorpay_payment_id || "—"}). Refund it in the Razorpay dashboard, then tap &ldquo;Mark refunded&rdquo;.</p>}
        </div>
      )}

      {open && (
        <div className="grid gap-6 border-t border-ink/10 p-4 md:grid-cols-2">
          <div>
            <p className="label">Items</p>
            <ul className="space-y-1 text-sm">
              {o.order_items.map((i, n) => (
                <li key={n} className="flex justify-between gap-3"><span>{i.name} · {i.size} · Qty {i.qty}</span><span>{formatPrice(i.price * i.qty)}</span></li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-ink-soft">Items {formatPrice(o.subtotal)} · Shipping {formatPrice(o.shipping)}{o.cod_fee ? ` · COD fee ${formatPrice(o.cod_fee)}` : ""}</p>
            <p className="mt-1 text-sm font-medium">Total {formatPrice(o.total)} {o.payment_method === "cod" ? "— collect in cash on delivery" : o.paid_at ? "— paid online" : "— not paid yet"}</p>
          </div>
          <div className="text-sm">
            <p className="label">Deliver to</p>
            <p>{o.customer_name}</p>
            <p>{o.address}{o.landmark ? `, near ${o.landmark}` : ""}</p>
            <p>{o.city}, {o.state} {o.pincode}</p>
            <p className="mt-2 flex flex-wrap gap-x-4">
              <a href={`tel:+91${o.customer_phone}`} className="underline underline-offset-4">{o.customer_phone}</a>
              <a href={`https://wa.me/91${o.customer_phone}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">WhatsApp</a>
              {o.customer_email && <a href={`mailto:${o.customer_email}`} className="underline underline-offset-4">{o.customer_email}</a>}
            </p>
            {o.tracking_url && <p className="mt-2">Tracking: <a href={o.tracking_url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">open link</a></p>}
          </div>

          <div className="space-y-4 md:col-span-2">
            <div className="flex flex-wrap items-center gap-3">
              {["confirmed", "paid"].includes(o.status) && <button disabled={busy} onClick={() => run({ action: "status", status: "packed" })} className="btn-dark min-h-[42px] px-5">Mark packed</button>}
              {o.status === "packed" && (
                <>
                  <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Tracking link (optional)" aria-label="Tracking link" className="input max-w-xs" />
                  <button disabled={busy} onClick={() => run({ action: "status", status: "shipped", trackingUrl: tracking })} className="btn-dark min-h-[42px] px-5">Mark shipped</button>
                </>
              )}
              {o.status === "shipped" && <button disabled={busy} onClick={() => run({ action: "status", status: "delivered" })} className="btn-dark min-h-[42px] px-5">Mark delivered</button>}
              {refundDue && <button disabled={busy} onClick={() => run({ action: "status", status: "refunded" })} className="btn-dark min-h-[42px] px-5">Mark refunded</button>}
              {unreadCancel && <button disabled={busy} onClick={() => run({ action: "cancel_seen" })} className="btn-outline min-h-[42px] px-5">Mark as read</button>}
              {canCancel && !cancelling && <button onClick={() => setCancelling(true)} className="text-xs font-medium uppercase tracking-[0.14em] text-[#b3261e] underline underline-offset-4">Cancel this order</button>}
            </div>

            {cancelling && (
              <div className="max-w-xl border border-[#b3261e]/40 p-4">
                <label htmlFor={`cr-${o.id}`} className="label">Reason for cancelling (the customer is not notified automatically)</label>
                <textarea id={`cr-${o.id}`} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} className="input py-3" placeholder="e.g. Size out of stock" />
                <div className="mt-3 flex items-center gap-4">
                  <button disabled={busy || reason.trim().length < 3} onClick={() => run({ action: "cancel", reason })} className="bg-[#b3261e] px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-white disabled:opacity-50">Confirm cancellation</button>
                  <button onClick={() => setCancelling(false)} className="text-sm underline">Keep order</button>
                </div>
              </div>
            )}
            {err && <p role="alert" className="text-sm text-[#b3261e]">{err}</p>}
          </div>
        </div>
      )}
    </li>
  );
}
