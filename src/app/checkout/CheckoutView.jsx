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

const CONTACT = [
  { name: "name", label: "Full name", autoComplete: "name", required: true },
  { name: "phone", label: "Mobile number", type: "tel", autoComplete: "tel", required: true, pattern: "[6-9][0-9]{9}", inputMode: "numeric", maxLength: 10, hint: "10-digit number — we'll WhatsApp your order updates" },
  { name: "email", label: "Email (optional)", type: "email", autoComplete: "email", full: true },
];
const ADDRESS = [
  { name: "flat", label: "Flat / house no.", autoComplete: "address-line1", required: true, placeholder: "e.g. Flat 304, B-wing" },
  { name: "building", label: "Building / society name", autoComplete: "address-line2", required: true, placeholder: "e.g. Shanti Kunj Society" },
  { name: "area", label: "Area / street", autoComplete: "address-line3", required: true, full: true },
  { name: "landmark", label: "Landmark (optional)", full: true, placeholder: "e.g. near Kothrud bus depot" },
  { name: "city", label: "City", autoComplete: "address-level2", required: true },
  { name: "pincode", label: "PIN code", autoComplete: "postal-code", required: true, pattern: "[1-9][0-9]{5}", inputMode: "numeric", maxLength: 6 },
];

const fullAddress = (f) => [f.flat, f.building, f.area, f.landmark && `Near ${f.landmark}`].filter(Boolean).join(", ");

function Field({ f, form, set }) {
  return (
    <div className={f.full ? "sm:col-span-2" : ""}>
      <label htmlFor={`co-${f.name}`} className="label">{f.label}</label>
      <input id={`co-${f.name}`} name={f.name} type={f.type || "text"} required={f.required} autoComplete={f.autoComplete} pattern={f.pattern} inputMode={f.inputMode} maxLength={f.maxLength} placeholder={f.placeholder} value={form[f.name] || ""} onChange={set(f.name)} className="input" aria-describedby={f.hint ? `co-${f.name}-hint` : undefined} />
      {f.hint && <p id={`co-${f.name}-hint`} className="mt-1 text-xs text-ink-muted">{f.hint}</p>}
    </div>
  );
}

// "Use my current location" → fills area, city, state and PIN (the shopper adds flat & building)
function LocateButton({ onFound }) {
  const [state, setState] = useState({ status: "idle", message: "" });

  const locate = () => {
    if (!("geolocation" in navigator)) return setState({ status: "error", message: "Your browser doesn't support location — please type your address." });
    setState({ status: "busy", message: "Finding your location…" });
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(`/api/geocode?lat=${coords.latitude}&lon=${coords.longitude}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          onFound(data.address);
          const where = [data.address.area.split(", ").pop(), data.address.city, data.address.pincode].filter(Boolean).join(", ");
          const rough = coords.accuracy > 200 ? ` Your location looks approximate (±${Math.round(coords.accuracy)} m), so please double-check the area and PIN.` : "";
          setState({ status: "done", message: `Filled from your location: ${where}. Please check it and add your flat and building.${rough}` });
        } catch (e) {
          setState({ status: "error", message: e.message || "Couldn't look up your address — please type it in." });
        }
      },
      (err) => {
        const message =
          err.code === 1
            ? "Location permission was blocked. You can type your address below, or allow location for this site in your browser settings."
            : err.code === 3
            ? "Finding your location took too long — please try again or type your address."
            : "We couldn't get your location — please type your address.";
        setState({ status: "error", message });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  return (
    <div className="sm:col-span-2">
      <button type="button" onClick={locate} disabled={state.status === "busy"} className="flex min-h-[50px] w-full items-center justify-center gap-2.5 border border-terracotta-dark bg-terracotta-dark/5 px-4 text-[14px] font-medium text-terracotta-dark transition-colors hover:bg-terracotta-dark hover:text-ivory disabled:opacity-60">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.4" /></svg>
        {state.status === "busy" ? "Finding your location…" : "Use my current location"}
      </button>
      <p role="status" aria-live="polite" className={`mt-2 text-xs leading-5 ${state.status === "error" ? "text-terracotta-dark" : "text-ink-muted"}`}>
        {state.message || "We'll fill in your area, city and PIN — you just add your flat and building."}
      </p>
    </div>
  );
}

export default function CheckoutView() {
  const { cartLines, subtotal, shipping, total: itemsTotal, profile, saveProfile, addOrder, clearCart, ready } = useStore();
  const [form, setForm] = useState({ name: "", email: "", phone: "", flat: "", building: "", area: "", landmark: "", city: "", state: "Maharashtra", pincode: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [placed, setPlaced] = useState(null);
  const codOn = Boolean(SITE.cod?.enabled);
  const [method, setMethod] = useState("online"); // "online" | "cod"
  const isCod = codOn && method === "cod";
  const codFee = isCod ? SITE.cod.fee : 0;
  const total = itemsTotal + codFee;

  useEffect(() => {
    if (!ready) return;
    const saved = Object.fromEntries(Object.entries(profile).filter(([, v]) => v));
    // older saved profiles kept the whole address in one line — use it as the area
    if (saved.address && !saved.area && !saved.flat) saved.area = saved.address;
    setForm((f) => ({ ...f, ...saved }));
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const fillFromLocation = (a) => {
    setForm((f) => ({
      ...f,
      area: a.area || f.area,
      city: a.city || f.city,
      state: a.state || f.state,
      pincode: a.pincode || f.pincode,
      building: f.building || a.building || "",
    }));
    setTimeout(() => document.getElementById("co-flat")?.focus(), 50);
  };

  const finish = (order) => {
    addOrder(order);
    saveProfile({ ...form, address: fullAddress(form) });
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
      const res = await fetch(isCod ? "/api/orders/cod" : "/api/razorpay/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, customer: form }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start payment");

      const baseOrder = {
        id: data.receipt || `BRZ-${Date.now()}`,
        date: new Date().toISOString(),
        items: cartLines.map((l) => ({ slug: l.slug, name: l.product.name, size: l.size, qty: l.qty, price: l.product.price, image: l.product.images[0] })),
        total: data.total,
        shipping: data.shipping,
        codFee: data.codFee || 0,
        method: isCod ? "cod" : "online",
        address: { ...form, address: fullAddress(form) },
      };

      if (isCod) {
        finish({ ...baseOrder, status: data.demo ? "Test COD order" : "Confirmed — pay on delivery", demo: data.demo });
        return;
      }

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
        prefill: { name: form.name, contact: form.phone, ...(form.email ? { email: form.email } : {}) },
        notes: { address: `${fullAddress(form)}, ${form.city}, ${form.state} ${form.pincode}` },
        theme: { color: "#86432b" },
        handler: async (resp) => {
          const v = await fetch("/api/razorpay/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(resp) }).then((r) => r.json()).catch(() => ({}));
          if (v.verified) finish({ ...baseOrder, id: v.orderNumber || baseOrder.id, paymentId: resp.razorpay_payment_id, status: "Confirmed" });
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
        <p className="mt-4 text-[15px] leading-7 text-ink-soft">Order <strong className="font-medium">{placed.id}</strong> · {formatPrice(placed.total)}{placed.method === "cod" ? " — please keep this amount ready in cash when it's delivered" : ""}. We&rsquo;ll WhatsApp updates to {placed.address.phone}{placed.address.email ? ` and email ${placed.address.email}` : ""} when it ships.</p>
        {placed.demo && placed.method !== "cod" && <p className="mx-auto mt-4 max-w-md bg-beige px-4 py-3 text-sm text-ink-soft">Demo mode: Razorpay keys aren&rsquo;t configured yet, so no payment was taken.</p>}
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
          <div className="space-y-10">
            <fieldset className="grid gap-5 sm:grid-cols-2">
              <legend className="mb-5 font-serif text-2xl">Your details</legend>
              {CONTACT.map((f) => <Field key={f.name} f={f} form={form} set={set} />)}
            </fieldset>
            <fieldset className="grid gap-5 sm:grid-cols-2">
              <legend className="mb-5 font-serif text-2xl">Delivery address</legend>
              <LocateButton onFound={fillFromLocation} />
              {ADDRESS.map((f) => <Field key={f.name} f={f} form={form} set={set} />)}
              <div>
                <label htmlFor="co-state" className="label">State</label>
                <select id="co-state" required value={form.state} onChange={set("state")} autoComplete="address-level1" className="input">
                  {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </fieldset>

            {codOn && (
              <fieldset>
                <legend className="mb-5 font-serif text-2xl">Payment method</legend>
                <div className="grid gap-3">
                  {[
                    { id: "online", title: "Pay online", sub: "UPI, cards, netbanking & wallets — secured by Razorpay" },
                    { id: "cod", title: "Cash on Delivery", sub: `Pay in cash when your order arrives · ${formatPrice(SITE.cod.fee)} handling charge` },
                  ].map((o) => (
                    <label key={o.id} className={`flex cursor-pointer items-start gap-3 border px-4 py-4 transition-colors ${method === o.id ? "border-terracotta-dark bg-terracotta-dark/5" : "border-ink/20 hover:border-ink/40"}`}>
                      <input type="radio" name="payment-method" value={o.id} checked={method === o.id} onChange={() => setMethod(o.id)} className="mt-1 h-4 w-4 accent-[#86432b]" />
                      <span className="min-w-0">
                        <span className="block text-[15px] font-medium">{o.title}</span>
                        <span className="mt-0.5 block text-[13px] leading-5 text-ink-muted">{o.sub}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </div>

          <aside aria-label="Order summary" className="h-fit bg-beige p-6">
            <h2 className="font-serif text-2xl">Your order</h2>
            <ul className="mt-5 space-y-4">
              {cartLines.map((l) => (
                <li key={l.key} className="flex gap-3">
                  <div className="w-14 shrink-0 bg-ivory"><Img src={l.product.images[0]} alt={`${l.product.name} by Baromaaz`} className="aspect-[4/5] w-full object-cover" /></div>
                  <div className="min-w-0 flex-1 text-sm"><p className="font-medium">{l.product.name}</p><p className="text-ink-muted">Size {l.size} · Qty {l.qty}</p></div>
                  <p className="text-sm">{formatPrice(l.product.price * l.qty)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-ink/15 pt-4 text-[15px]">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping ? formatPrice(shipping) : "Free"}</dd></div>
              {isCod && <div className="flex justify-between"><dt>COD handling charge</dt><dd>{formatPrice(codFee)}</dd></div>}
              <div className="flex justify-between pt-2 text-lg font-medium"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
            </dl>
            {error && <p role="alert" className="mt-4 bg-ivory px-3 py-2 text-sm text-terracotta-dark">{error}</p>}
            <button type="submit" disabled={busy} className="btn-dark mt-6 w-full">{busy ? "Please wait…" : isCod ? `Place order · ${formatPrice(total)}` : `Pay ${formatPrice(total)}`}</button>
            {isCod && <p className="mt-3 text-center text-xs leading-5 text-ink-muted">Pay {formatPrice(total)} in cash to the delivery partner. Save {formatPrice(SITE.cod.fee)} by paying online.</p>}
            <p className="mt-3 text-center text-xs leading-5 text-ink-muted">{isCod ? "" : "Payments are processed securely by Razorpay. "}By placing this order you agree to our <Link href="/terms-of-service" className="underline">Terms</Link> and <Link href="/returns-exchange-policy" className="underline">Returns Policy</Link>.</p>
          </aside>
        </form>
      )}
    </div>
  );
}
