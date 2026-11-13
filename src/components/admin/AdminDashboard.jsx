"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";
import { api, chime } from "./api";
import OrderCard from "./OrderCard";
import ProductsPanel from "./ProductsPanel";

const FILTERS = [["new", "New"], ["active", "In progress"], ["pending", "Awaiting payment"], ["delivered", "Delivered"], ["all", "All"]];
const POLL_MS = 15000;

export default function AdminDashboard({ email }) {
  const [tab, setTab] = useState("orders"); // orders | cancellations | products
  const [filter, setFilter] = useState("active");
  const [q, setQ] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [toasts, setToasts] = useState([]);
  const [sound, setSound] = useState(true);
  const [perm, setPerm] = useState("default");
  const announced = useRef(null); // alert ids already announced in this visit
  const soundOn = useRef(true);
  useEffect(() => { soundOn.current = sound; }, [sound]);
  useEffect(() => { if (typeof Notification !== "undefined") setPerm(Notification.permission); }, []);

  const toast = useCallback((title, body = "", kind = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, title, body, kind }].slice(-4));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "cancel" ? 20000 : 10000);
  }, []);
  const notify = useCallback((msg, kind) => toast(msg, "", kind === "error" ? "cancel" : "info"), [toast]);

  const announce = useCallback((items) => {
    items.slice(0, 3).forEach(({ kind, o }) => {
      const title = kind === "order" ? `New order ${o.order_number}` : `Order ${o.order_number} was cancelled`;
      const body = kind === "order" ? `${o.customer_name} · ${formatPrice(o.total)} · ${o.payment_method === "cod" ? "Cash on delivery" : "Paid online"}` : `Reason: ${o.cancel_reason || "not given"}`;
      toast(title, body, kind === "order" ? "order" : "cancel");
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try { new Notification(title, { body }); } catch {}
      }
    });
    if (soundOn.current) chime(items.some((i) => i.kind === "cancel") ? "cancel" : "order");
  }, [toast]);

  const listFilter = tab === "cancellations" ? "cancelled" : filter;
  const load = useCallback(async () => {
    try {
      const d = await api(`/api/admin/orders?filter=${listFilter}&q=${encodeURIComponent(q)}`);
      setData(d);
      setError("");
      const items = [
        ...d.alerts.newOrders.map((o) => ({ key: `n:${o.id}`, kind: "order", o })),
        ...d.alerts.cancellations.map((o) => ({ key: `c:${o.id}`, kind: "cancel", o })),
      ];
      if (announced.current === null) announced.current = new Set(items.map((i) => i.key)); // first load: just show badges
      else {
        const fresh = items.filter((i) => !announced.current.has(i.key));
        fresh.forEach((i) => announced.current.add(i.key));
        if (fresh.length) announce(fresh);
      }
    } catch (e) {
      if (e.message !== "Signed out") setError(e.message);
    }
  }, [listFilter, q, announce]);

  useEffect(() => {
    if (tab === "products") return;
    const first = setTimeout(load, q ? 300 : 0);
    const timer = setInterval(load, POLL_MS);
    const onVisible = () => { if (!document.hidden) load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearTimeout(first); clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [load, tab, q]);

  // keep counting new orders / cancellations while the Products tab is open
  useEffect(() => {
    if (tab !== "products") return;
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [tab, load]);

  const counts = data?.counts || { newOrders: 0, unreadCancellations: 0 };
  useEffect(() => {
    const n = counts.newOrders + counts.unreadCancellations;
    document.title = `${n ? `(${n}) ` : ""}Baromaaz Admin`;
  }, [counts.newOrders, counts.unreadCancellations]);

  const act = useCallback(async (body) => {
    await api("/api/admin/orders", { method: "PATCH", body });
    if (body.action === "cancel") toast("Order cancelled", "Stock has been put back.", "info");
    await load();
  }, [load, toast]);

  const signOut = async () => {
    try { await api("/api/admin/logout", { method: "POST" }); } catch {}
    window.location.href = "/admin/login";
  };

  const enableDesktop = async () => {
    if (typeof Notification === "undefined") return;
    setPerm(await Notification.requestPermission());
  };

  const tabs = [
    ["orders", "Orders", counts.newOrders],
    ["cancellations", "Cancellations", counts.unreadCancellations],
    ["products", "Products", 0],
  ];
  const orders = data?.orders || [];

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-ink/10 bg-white/60">
        <div className="container-x flex flex-wrap items-center gap-x-6 gap-y-3 py-4">
          <div>
            <p className="font-logo text-xl tracking-brand">BAROMAAZ</p>
            <p className="eyebrow">Admin dashboard</p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.14em]">
            <button onClick={() => setSound((s) => !s)} className="underline underline-offset-4" aria-pressed={sound}>Alert sound: {sound ? "on" : "off"}</button>
            {perm === "default" && <button onClick={enableDesktop} className="underline underline-offset-4">Enable desktop alerts</button>}
            <span className="hidden normal-case tracking-normal text-ink-muted sm:inline">{email}</span>
            <button onClick={signOut} className="underline underline-offset-4">Sign out</button>
          </div>
        </div>
        <nav className="container-x flex gap-1 overflow-x-auto" aria-label="Dashboard sections">
          {tabs.map(([id, label, badge]) => (
            <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? "page" : undefined}
              className={`flex min-h-[48px] items-center gap-2 border-b-2 px-4 text-sm font-medium uppercase tracking-[0.14em] ${tab === id ? "border-ink text-ink" : "border-transparent text-ink-muted hover:text-ink"}`}>
              {label}
              {badge > 0 && <span className={`min-w-[22px] px-1.5 py-0.5 text-center text-[11px] text-white ${id === "cancellations" ? "bg-[#b3261e]" : "bg-terracotta-dark"}`}>{badge}</span>}
            </button>
          ))}
        </nav>
      </header>

      <main className="container-x py-8">
        {error && <p role="alert" className="mb-5 border border-[#b3261e]/40 bg-[#b3261e]/5 px-4 py-3 text-sm text-[#b3261e]">{error}</p>}

        {tab === "orders" && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {FILTERS.map(([id, label]) => (
                <button key={id} onClick={() => setFilter(id)} aria-pressed={filter === id}
                  className={`min-h-[40px] border px-4 text-xs font-medium uppercase tracking-[0.14em] ${filter === id ? "border-ink bg-ink text-ivory" : "border-ink/25 hover:border-ink"}`}>
                  {label}{id === "new" && counts.newOrders > 0 ? ` (${counts.newOrders})` : ""}
                </button>
              ))}
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order no., name or phone" aria-label="Search orders" className="input ml-auto max-w-xs" />
              {counts.newOrders > 0 && <button onClick={() => act({ action: "seen_all" })} className="text-xs uppercase tracking-[0.14em] underline underline-offset-4">Mark all as seen</button>}
            </div>
            <ul className="mt-6 space-y-3">
              {data === null && <li className="text-sm text-ink-muted">Loading orders…</li>}
              {orders.map((o) => <OrderCard key={o.id} order={o} onAction={act} />)}
              {data && !orders.length && <li className="border border-ink/10 bg-beige px-6 py-12 text-center"><p className="font-serif text-2xl">No orders here</p><p className="mt-1 text-sm text-ink-muted">New orders appear automatically — this page checks every few seconds.</p></li>}
            </ul>
          </>
        )}

        {tab === "cancellations" && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-xl text-sm text-ink-soft">Every cancelled order with the reason given. Unread ones are marked in red until you open them.</p>
              {counts.unreadCancellations > 0 && <button onClick={() => act({ action: "cancel_seen" })} className="btn-outline min-h-[42px] px-5">Mark all as read</button>}
            </div>
            <ul className="mt-6 space-y-3">
              {data === null && <li className="text-sm text-ink-muted">Loading…</li>}
              {orders.map((o) => <OrderCard key={o.id} order={o} onAction={act} defaultOpen={!o.cancel_seen} />)}
              {data && !orders.length && <li className="border border-ink/10 bg-beige px-6 py-12 text-center"><p className="font-serif text-2xl">No cancellations</p></li>}
            </ul>
          </>
        )}

        {tab === "products" && <ProductsPanel notify={notify} />}
      </main>

      <div className="pointer-events-none fixed right-3 top-3 z-[300] flex w-[min(92vw,380px)] flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`pointer-events-auto border-l-4 bg-white px-4 py-3 shadow-lg ${t.kind === "cancel" ? "border-[#b3261e]" : t.kind === "order" ? "border-terracotta-dark" : "border-ink"}`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{t.title}</p>
              <button onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} aria-label="Dismiss" className="text-ink-muted">×</button>
            </div>
            {t.body && <p className="mt-0.5 text-sm text-ink-soft">{t.body}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
