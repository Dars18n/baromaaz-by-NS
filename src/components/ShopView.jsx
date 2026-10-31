"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { CloseIcon } from "./Icons";
import { SIZES } from "@/lib/sizes";

const PRICE_RANGES = [
  { id: "under-1000", label: "Under ₹1,000", min: 0, max: 999 },
  { id: "1000-1500", label: "₹1,000 – ₹1,499", min: 1000, max: 1499 },
  { id: "1500-2000", label: "₹1,500 – ₹1,999", min: 1500, max: 1999 },
  { id: "2000-plus", label: "₹2,000 & above", min: 2000, max: Infinity },
];
const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest first" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
];

const list = (v) => (v ? v.split(",").filter(Boolean) : []);

export default function ShopView({ products, categories = [], lockedCategory = null, defaultSort = "featured" }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [panelOpen, setPanelOpen] = useState(false);

  const cats = lockedCategory ? [lockedCategory] : list(params.get("category"));
  const sizes = list(params.get("size"));
  const prices = list(params.get("price"));
  const sort = params.get("sort") || defaultSort;
  const q = (params.get("q") || "").trim().toLowerCase();

  useEffect(() => {
    document.body.style.overflow = panelOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [panelOpen]);

  const setParam = (key, values) => {
    const next = new URLSearchParams(params.toString());
    const v = Array.isArray(values) ? values.join(",") : values;
    if (!v || (key === "sort" && v === defaultSort)) next.delete(key);
    else next.set(key, v);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const toggle = (key, current, value) => setParam(key, current.includes(value) ? current.filter((x) => x !== value) : [...current, value]);
  const clearAll = () => router.replace(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname, { scroll: false });

  const filtered = useMemo(() => {
    let out = products.filter((p) => {
      if (cats.length && !cats.includes(p.category)) return false;
      if (sizes.length && !sizes.some((s) => (p.stock?.[s] ?? 0) > 0)) return false;
      if (prices.length && !prices.some((id) => { const r = PRICE_RANGES.find((x) => x.id === id); return r && p.price >= r.min && p.price <= r.max; })) return false;
      if (q && !`${p.name} ${p.color} ${p.fabric} ${p.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sort === "newest") out = [...out].sort((a, b) => b.added.localeCompare(a.added));
    if (sort === "price-asc") out = [...out].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") out = [...out].sort((a, b) => b.price - a.price);
    return out;
  }, [products, cats.join(), sizes.join(), prices.join(), sort, q]);

  const activeCount = (lockedCategory ? 0 : cats.length) + sizes.length + prices.length;

  const Check = ({ checked, onChange, children }) => (
    <label className="flex min-h-[40px] cursor-pointer items-center gap-3 text-[15px]">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-[18px] w-[18px] accent-[#1f1a17]" />
      {children}
    </label>
  );

  const panel = (
    <div className="space-y-8">
      {!lockedCategory && (
        <fieldset>
          <legend className="label">Category</legend>
          {categories.map((c) => (
            <Check key={c.slug} checked={cats.includes(c.slug)} onChange={() => toggle("category", cats, c.slug)}>{c.name}</Check>
          ))}
        </fieldset>
      )}
      <fieldset>
        <legend className="label">Size</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button key={s} type="button" aria-pressed={sizes.includes(s)} onClick={() => toggle("size", sizes, s)} className={`h-11 min-w-[48px] border px-3 text-sm transition-colors ${sizes.includes(s) ? "border-ink bg-ink text-ivory" : "border-ink/30 hover:border-ink"}`}>{s}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="label">Price</legend>
        {PRICE_RANGES.map((r) => (
          <Check key={r.id} checked={prices.includes(r.id)} onChange={() => toggle("price", prices, r.id)}>{r.label}</Check>
        ))}
      </fieldset>
      {activeCount > 0 && <button type="button" onClick={clearAll} className="text-xs uppercase tracking-[0.16em] underline underline-offset-4">Clear all filters</button>}
    </div>
  );

  return (
    <div className="container-x">
      {q && (
        <p className="mb-6 text-[15px]">
          Showing results for &ldquo;<strong className="font-medium">{params.get("q")}</strong>&rdquo; ·{" "}
          <Link href={pathname} className="underline underline-offset-4">clear search</Link>
        </p>
      )}
      <div className="sticky top-[100px] z-30 -mx-4 mb-6 flex items-center justify-between gap-3 border-y border-ink/10 bg-ivory/95 px-4 py-3 backdrop-blur md:top-[116px] lg:static lg:mx-0 lg:border-x-0 lg:bg-transparent lg:px-0">
        <button type="button" onClick={() => setPanelOpen(true)} className="min-h-[44px] border border-ink/30 px-4 text-[12px] uppercase tracking-[0.16em] lg:hidden" aria-haspopup="dialog">
          Filter{activeCount ? ` (${activeCount})` : ""}
        </button>
        <p className="hidden text-sm text-ink-muted lg:block" aria-live="polite">{filtered.length} {filtered.length === 1 ? "piece" : "pieces"}</p>
        <label className="flex items-center gap-2 text-sm">
          <span className="hidden text-ink-muted sm:inline">Sort by</span>
          <span className="sr-only sm:hidden">Sort by</span>
          <select value={sort} onChange={(e) => setParam("sort", e.target.value)} className="min-h-[44px] border border-ink/30 bg-transparent px-3 pr-8 text-base focus:border-ink focus:outline-none">
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside aria-label="Filters" className="hidden lg:block">{panel}</aside>
        <div>
          <p className="mb-4 text-sm text-ink-muted lg:hidden" aria-live="polite">{filtered.length} {filtered.length === 1 ? "piece" : "pieces"}</p>
          {filtered.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3">
              {filtered.map((p, i) => <ProductCard key={p.slug} product={p} priority={i < 2} />)}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="font-serif text-3xl">Nothing matches — yet.</p>
              <p className="mt-2 text-sm text-ink-muted">Try removing a filter, or come back for next month&rsquo;s drop.</p>
              <button type="button" onClick={clearAll} className="btn-outline mt-6">Clear filters</button>
            </div>
          )}
        </div>
      </div>

      {panelOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-labelledby="filter-title">
          <button type="button" aria-label="Close filters" className="absolute inset-0 bg-ink/40" onClick={() => setPanelOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-[86%] max-w-sm animate-fadeIn flex-col bg-ivory">
            <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3">
              <p id="filter-title" className="font-serif text-2xl">Filter</p>
              <button type="button" aria-label="Close filters" onClick={() => setPanelOpen(false)} className="flex h-11 w-11 items-center justify-center"><CloseIcon /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">{panel}</div>
            <div className="border-t border-ink/10 p-4"><button type="button" onClick={() => setPanelOpen(false)} className="btn-dark w-full">Show {filtered.length} pieces</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
