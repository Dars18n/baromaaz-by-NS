"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Img from "@/components/Img";
import { useStore } from "@/components/StoreProvider";
import { formatPrice } from "@/lib/format";
import { INDIAN_STATES } from "@/lib/states";
import { SITE } from "@/lib/site";

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const FIELDS = [
  { name: "name", label: "Full name", autoComplete: "name", required: true },
  { name: "email", label: "Email", type: "email", autoComplete: "email", required: true },
  { name: "phone", label: "Mobile number", type: "tel", autoComplete: "tel", required: true, pattern: "[6-9][0-9]{9}", inputMode: "numeric", maxLength: 10, hint: "10-digit Indian mobile number" },
  { name: "address", label: "Address (house no., street, area)", autoComplete: "street-address", required: true, full: true },
  { name: "city", label: "City", autoComplete: "address-level2", required: true },
  { name: "pincode", label: "PIN code", autoComplete: "postal-code", required: true, pattern: "[1-9][0-9]{5}", inputMode: "numeric", maxLength: 6 },
];

export default function CheckoutView() {
  const { cartLines, subtotal, shipping, total, profile, saveProfile, addOrder, clearCart, ready } = useStore();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "Maharashtra", pincode: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [placed, setPlaced] = useState(null);

  useEffect(() => {
    if (ready) setForm((f) => ({ ...f, ...Object.fromEntries(Object.entries(profile).filter(([, v]) => v)) }));
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const finish = (order) => {
    addOrder(order);
    saveProfile(form);
    clearCart();
    setPlaced(order);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const items = cartLines.map((l) => ({ slug: l.slug, size: l.size, qty: l.qty }));
      const res = await fetch("/api/razorpay/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start payment");

      const baseOrder = {
        id: data.receipt || `BRZ-${Date.now()}`,
        date: new Date().toISOString(),
        items: cartLines.map((l) => ({ slug: l.slug, name: l.product.name, size: l.size, qty: l.qty, price: l.product.price, image: l.product.images[0] })),
        total: data.total,
        shipping: data.shipping,
        address: form,
      };

      if (data.demo) {
        finish({ ...baseOrder, status: "Test order — payment not taken", demo: true });
        return;
      }

      const ok = await loadRazorpay();
      if (!ok) throw new Error("Could not load Razorpay. Check your connection and try again.");
      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: "Baromaaz",
        description: SITE.tagline,
        image: "/icon.png",
        prefill: { name: form.name, email: form.email, contact: form.phone },
        notes: { address: `${form.address}, ${form.city}, ${form.state} ${form.pincode}` },
        theme: { color: "#86432b" },
        handler: async (resp) => {
          const v = await fetch("/api/razorpay/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(resp) }).then((r) => r.json()).catch(() => ({}));
          if (v.verified) finish({ ...baseOrder, paymentId: resp.razorpay_payment_id, status: "Confirmed" });
          else setError("We couldn't verify your payment. If money was debited, contact us with your payment ID: " + resp.razorpay_payment_id);
          setBusy(false);
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.on("payment.failed", (r) => { setError(r.error?.description || "Payment failed. Please try again."); setBusy(false); });
      rzp.open();
      return;
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  if (placed) {
    return (
      <div className="container-x max-w-2xl pt-12 text-center md:pt-20">
        <p className="eyebrow">Thank you, {placed.address.name.split(" ")[0]}</p>
        <h1 className="h-display mt-3 text-5xl md:text-6xl">Your order is placed</h1>
        <p className="mt-4 text-[15px] leading-7 text-ink-soft">Order <strong className="font-medium">{placed.id}</strong> · {formatPrice(placed.total)}. We&rsquo;ll send updates to {placed.address.email} and WhatsApp you when it ships.</p>
        {placed.demo && <p className="mx-auto mt-4 max-w-md bg-beige px-4 py-3 text-sm text-ink-soft">Demo mode: Razorpay keys aren&rsquo;t configured yet, so no payment was taken.</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/account?tab=orders" className="btn-dark">View my orders</Link>
          <Link href="/shop" className="btn-outline">Continue shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x pt-8 md:pt-14">
      <h1 className="h-display text-5xl md:text-6xl">Checkout</h1>
      {!ready ? <div className="min-h-[50vh]" /> : cartLines.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-serif text-3xl">Your bag is empty</p>
          <Link href="/shop" className="btn-dark mt-6">Explore the collection</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]" noValidate={false}>
          <fieldset className="grid gap-5 sm:grid-cols-2">
            <legend className="mb-5 font-serif text-2xl">Delivery details</legend>
            {FIELDS.map((f) => (
              <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
                <label htmlFor={`co-${f.name}`} className="label">{f.label}</label>
                <input id={`co-${f.name}`} name={f.name} type={f.type || "text"} required={f.required} autoComplete={f.autoComplete} pattern={f.pattern} inputMode={f.inputMode} maxLength={f.maxLength} value={form[f.name]} onChange={set(f.name)} className="input" aria-describedby={f.hint ? `co-${f.name}-hint` : undefined} />
                {f.hint && <p id={`co-${f.name}-hint`} className="mt-1 text-xs text-ink-muted">{f.hint}</p>}
              </div>
            ))}
            <div>
              <label htmlFor="co-state" className="label">State</label>
              <select id="co-state" required value={form.state} onChange={set("state")} autoComplete="address-level1" className="input">
                {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </fieldset>

          <aside aria-label="Order summary" className="h-fit bg-beige p-6">
            <h2 className="font-serif text-2xl">Your order</h2>
            <ul className="mt-5 space-y-4">
              {cartLines.map((l) => (
                <li key={l.key} className="flex gap-3">
                  <div className="w-14 shrink-0 bg-ivory"><Img src={l.product.images[0]} alt={l.product.name} className="aspect-[4/5] w-full object-cover" /></div>
                  <div className="min-w-0 flex-1 text-sm"><p className="font-medium">{l.product.name}</p><p className="text-ink-muted">Size {l.size} · Qty {l.qty}</p></div>
                  <p className="text-sm">{formatPrice(l.product.price * l.qty)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-ink/15 pt-4 text-[15px]">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping ? formatPrice(shipping) : "Free"}</dd></div>
              <div className="flex justify-between pt-2 text-lg font-medium"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
            </dl>
            {error && <p role="alert" className="mt-4 bg-ivory px-3 py-2 text-sm text-terracotta-dark">{error}</p>}
            <button type="submit" disabled={busy} className="btn-dark mt-6 w-full">{busy ? "Please wait…" : `Pay ${formatPrice(total)}`}</button>
            <p className="mt-3 text-center text-xs leading-5 text-ink-muted">Payments are processed securely by Razorpay. By placing this order you agree to our <Link href="/terms-of-service" className="underline">Terms</Link> and <Link href="/returns-exchange-policy" className="underline">Returns Policy</Link>.</p>
          </aside>
        </form>
      )}
    </div>
  );
}
