"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { api } from "./api";
import ProductForm from "./ProductForm";

export default function ProductsPanel({ notify }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try { setData(await api("/api/admin/products")); setError(""); } catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (id, fn, okMsg) => {
    setBusyId(id);
    try { await fn(); notify(okMsg); await load(); } catch (e) { notify(e.message, "error"); } finally { setBusyId(null); setConfirmId(null); }
  };

  if (error) return <p role="alert" className="text-sm text-[#b3261e]">{error}</p>;
  if (!data) return <p className="text-sm text-ink-muted">Loading products…</p>;

  const list = data.products.filter((p) => !q || `${p.name} ${p.category} ${p.color || ""}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      {adding ? (
        <ProductForm
          categories={data.categories}
          currentDrop={data.currentDrop}
          onCancel={() => setAdding(false)}
          onDone={async () => { setAdding(false); notify("Product added — it is live on the shop."); await load(); }}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setAdding(true)} className="btn-dark">+ Add product</button>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" aria-label="Search products" className="input max-w-xs" />
          <p className="text-sm text-ink-muted">{data.products.length} products</p>
        </div>
      )}

      <ul className="mt-6 divide-y divide-ink/10 border border-ink/10 bg-white/50">
        {list.map((p) => {
          const units = p.variants.reduce((s, v) => s + v.stock, 0);
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="w-14 shrink-0 bg-beige">
                {p.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.image} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover" />}
              </div>
              <div className="min-w-[180px] flex-1">
                <p className="font-medium">{p.name} {!p.is_active && <span className="ml-1 bg-ink/10 px-2 py-0.5 text-[11px] uppercase tracking-wider">Hidden</span>}</p>
                <p className="text-sm text-ink-muted">{p.category} · {formatPrice(p.price)}{p.mrp > p.price ? <span className="line-through"> {formatPrice(p.mrp)}</span> : null}</p>
                <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-ink-soft">
                  {p.variants.map((v) => <span key={v.size} className={v.stock === 0 ? "text-[#b3261e]" : ""}>{v.size}: {v.stock}</span>)}
                  <span className="text-ink-muted">({units} total)</span>
                </p>
              </div>
              {confirmId === p.id ? (
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span>Delete permanently?</span>
                  <button disabled={busyId === p.id} onClick={() => run(p.id, () => api(`/api/admin/products/${p.id}`, { method: "DELETE" }), "Product deleted")} className="bg-[#b3261e] px-4 py-2 text-xs font-medium uppercase tracking-wider text-white disabled:opacity-50">Yes, delete</button>
                  <button onClick={() => setConfirmId(null)} className="underline">Keep</button>
                </div>
              ) : (
                <div className="flex items-center gap-4 text-xs uppercase tracking-[0.14em]">
                  <button disabled={busyId === p.id} onClick={() => run(p.id, () => api(`/api/admin/products/${p.id}`, { method: "PATCH", body: { is_active: !p.is_active } }), p.is_active ? "Hidden from the shop" : "Now showing on the shop")} className="underline underline-offset-4">{p.is_active ? "Hide" : "Show"}</button>
                  <button onClick={() => setConfirmId(p.id)} className="text-[#b3261e] underline underline-offset-4">Delete</button>
                </div>
              )}
            </li>
          );
        })}
        {!list.length && <li className="p-8 text-center text-sm text-ink-muted">No products found.</li>}
      </ul>
    </div>
  );
}
