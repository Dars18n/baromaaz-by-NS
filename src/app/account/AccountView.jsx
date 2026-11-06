"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Img from "@/components/Img";
import { useStore } from "@/components/StoreProvider";
import { formatPrice } from "@/lib/format";
import { SIZES } from "@/lib/sizes";
import { SITE } from "@/lib/site";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "orders", label: "Orders" },
  { id: "returns", label: "Returns & exchanges" },
];

function Profile() {
  const { profile, saveProfile, notify, ready } = useStore();
  const [f, setF] = useState(profile);
  useEffect(() => { if (ready) setF(profile); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const fields = [["name", "Full name", "text", "name"], ["email", "Email", "email", "email"], ["phone", "Mobile number", "tel", "tel"], ["address", "Address", "text", "street-address"], ["city", "City", "text", "address-level2"], ["pincode", "PIN code", "text", "postal-code"]];
  return (
    <form onSubmit={(e) => { e.preventDefault(); saveProfile(f); notify("Profile saved"); }} className="grid max-w-2xl gap-5 sm:grid-cols-2">
      {fields.map(([k, label, type, ac]) => (
        <div key={k} className={k === "address" ? "sm:col-span-2" : ""}>
          <label htmlFor={`p-${k}`} className="label">{label}</label>
          <input id={`p-${k}`} type={type} autoComplete={ac} value={f[k] || ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="input" />
        </div>
      ))}
      <div className="sm:col-span-2"><button type="submit" className="btn-dark">Save profile</button></div>
    </form>
  );
}

function Orders() {
  const { orders } = useStore();
  if (!orders.length) return (
    <div className="bg-beige px-6 py-12 text-center">
      <p className="font-serif text-2xl">No orders yet</p>
      <Link href="/drop" className="btn-dark mt-5">Shop this month&rsquo;s drop</Link>
    </div>
  );
  return (
    <ul className="space-y-6">
      {orders.map((o) => (
        <li key={o.id} className="border border-ink/10 bg-white/50 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-medium">Order {o.id}</p>
            <p className="text-sm text-ink-muted">{new Date(o.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <p className="mt-1 text-sm text-terracotta-dark">{o.status}</p>
          <ul className="mt-4 space-y-3">
            {o.items.map((i) => (
              <li key={`${i.slug}-${i.size}`} className="flex items-center gap-3 text-sm">
                <div className="w-12 shrink-0 bg-beige"><Img src={i.image} alt={`${i.name} by Baromaaz`} className="aspect-[4/5] w-full object-cover" /></div>
                <span className="flex-1">{i.name} · Size {i.size} · Qty {i.qty}</span>
                <span>{formatPrice(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4">
            <p className="font-medium">Total {formatPrice(o.total)}</p>
            <Link href={`/account?tab=returns&order=${o.id}`} className="text-xs uppercase tracking-[0.14em] underline underline-offset-4">Return or exchange</Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Returns({ preselect }) {
  const { orders, returns, addReturn, notify } = useStore();
  const [f, setF] = useState({ order: preselect || "", item: "", type: "Exchange", size: "", reason: "Size doesn't fit", details: "" });
  const order = orders.find((o) => o.id === f.order);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const req = { ...f, id: `RX-${Date.now().toString().slice(-6)}`, date: new Date().toISOString(), status: "Requested" };
    addReturn(req);
    notify("Request saved — opening WhatsApp to send it to us");
    const msg = `Hi Baromaaz! ${f.type} request ${req.id}\nOrder: ${f.order}\nItem: ${f.item}${f.type === "Exchange" && f.size ? `\nNew size: ${f.size}` : ""}\nReason: ${f.reason}\n${f.details}`;
    window.open(`${SITE.whatsappLink}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    setF({ ...f, item: "", details: "" });
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
      <form onSubmit={submit} className="grid content-start gap-5">
        <p className="text-[15px] leading-7 text-ink-soft">Unworn pieces with tags can be returned or exchanged within 7 days of delivery. See our <Link href="/returns-exchange-policy" className="underline">Returns &amp; Exchange Policy</Link>.</p>
        <div>
          <label htmlFor="rx-order" className="label">Order number</label>
          {orders.length ? (
            <select id="rx-order" required value={f.order} onChange={set("order")} className="input">
              <option value="">Select an order</option>
              {orders.map((o) => <option key={o.id} value={o.id}>{o.id} · {formatPrice(o.total)}</option>)}
            </select>
          ) : (
            <input id="rx-order" required value={f.order} onChange={set("order")} className="input" placeholder="e.g. BRZ-1730000000000" />
          )}
        </div>
        <div>
          <label htmlFor="rx-item" className="label">Item</label>
          {order ? (
            <select id="rx-item" required value={f.item} onChange={set("item")} className="input">
              <option value="">Select an item</option>
              {order.items.map((i) => <option key={`${i.slug}-${i.size}`} value={`${i.name} (${i.size})`}>{i.name} — Size {i.size}</option>)}
            </select>
          ) : (
            <input id="rx-item" required value={f.item} onChange={set("item")} className="input" placeholder="Product name and size" />
          )}
        </div>
        <fieldset>
          <legend className="label">I&rsquo;d like to</legend>
          <div className="flex gap-6">
            {["Exchange", "Return"].map((t) => (
              <label key={t} className="flex min-h-[44px] items-center gap-2 text-[15px]"><input type="radio" name="rx-type" value={t} checked={f.type === t} onChange={set("type")} className="accent-[#1f1a17]" /> {t}</label>
            ))}
          </div>
        </fieldset>
        {f.type === "Exchange" && (
          <div>
            <label htmlFor="rx-size" className="label">New size</label>
            <select id="rx-size" value={f.size} onChange={set("size")} className="input"><option value="">Select size</option>{SIZES.map((s) => <option key={s}>{s}</option>)}</select>
          </div>
        )}
        <div>
          <label htmlFor="rx-reason" className="label">Reason</label>
          <select id="rx-reason" value={f.reason} onChange={set("reason")} className="input">
            {["Size doesn't fit", "Received a damaged/defective piece", "Received the wrong item", "Looks different from the photos", "Changed my mind"].map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="rx-details" className="label">Details (optional)</label>
          <textarea id="rx-details" rows={3} value={f.details} onChange={set("details")} className="input py-3" />
        </div>
        <button type="submit" className="btn-dark">Submit request via WhatsApp</button>
      </form>
      <div>
        <h3 className="font-serif text-2xl">Your requests</h3>
        {returns.length === 0 ? <p className="mt-3 text-sm text-ink-muted">No return or exchange requests yet.</p> : (
          <ul className="mt-4 space-y-3">
            {returns.map((r) => (
              <li key={r.id} className="border border-ink/10 bg-white/50 p-4 text-sm">
                <p className="font-medium">{r.type} · {r.id}</p>
                <p className="mt-1 text-ink-soft">{r.item} · Order {r.order}</p>
                <p className="mt-1 text-ink-muted">{r.reason} · {r.status}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function AccountView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { profile, ready } = useStore();
  const tab = TABS.some((t) => t.id === params.get("tab")) ? params.get("tab") : "profile";
  return (
    <div className="container-x pt-8 md:pt-14">
      <p className="eyebrow">My account</p>
      <h1 className="h-display mt-2 text-5xl md:text-6xl">{ready && profile.name ? `Hello, ${profile.name.split(" ")[0]}` : "Your account"}</h1>
      <p className="mt-3 max-w-xl text-sm text-ink-muted">Your profile, orders and requests are saved in this browser on this device.</p>
      <div role="tablist" aria-label="Account sections" className="no-scrollbar mt-8 flex gap-6 overflow-x-auto border-b border-ink/10">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} aria-controls={`acc-${t.id}`} id={`acc-tab-${t.id}`} onClick={() => router.replace(`${pathname}?tab=${t.id}`, { scroll: false })} className={`-mb-px min-h-[44px] shrink-0 border-b-2 pb-3 pt-2 text-[13px] uppercase tracking-[0.16em] ${tab === t.id ? "border-ink text-ink" : "border-transparent text-ink-muted hover:text-ink"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`acc-${tab}`} aria-labelledby={`acc-tab-${tab}`} className="pt-10">
        {!ready ? <div className="min-h-[30vh]" /> : tab === "profile" ? <Profile /> : tab === "orders" ? <Orders /> : <Returns preselect={params.get("order")} />}
      </div>
    </div>
  );
}
