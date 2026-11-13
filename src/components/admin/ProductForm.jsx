"use client";

import { useState } from "react";
import { makeShareImage, prepareImage } from "./imageTools";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const DEFAULT_ON = { XS: 5, S: 5, M: 5, L: 5, XL: 5 };

export default function ProductForm({ categories, currentDrop, onCancel, onDone }) {
  const [f, setF] = useState({ name: "", category: categories[0]?.slug || "", price: "", mrp: "", color: "", fabric: "", description: "", care: "", mostWanted: false, inDrop: false, active: true });
  const [stock, setStock] = useState(DEFAULT_ON); // size -> units; a size not in here isn't sold
  const [photos, setPhotos] = useState([]); // [{ id, blob, ext, preview, source }]
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const addPhotos = async (e) => {
    const files = [...e.target.files];
    e.target.value = "";
    if (!files.length) return;
    setError("");
    setBusy("Preparing photos…");
    try {
      const room = 6 - photos.length;
      const made = [];
      for (const file of files.slice(0, room)) made.push({ id: crypto.randomUUID(), ...(await prepareImage(file)) });
      setPhotos((p) => [...p, ...made]);
      if (files.length > room) setError("Only 6 photos are allowed — extra photos were skipped.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };

  const makeMain = (id) => setPhotos((p) => [p.find((x) => x.id === id), ...p.filter((x) => x.id !== id)]);
  const removePhoto = (id) => setPhotos((p) => p.filter((x) => x.id !== id));
  const toggleSize = (s) => setStock((st) => { const n = { ...st }; if (s in n) delete n[s]; else n[s] = 5; return n; });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!photos.length) return setError("Please add at least one photo.");
    if (!Object.keys(stock).length) return setError("Select at least one size.");
    setBusy("Saving product…");
    try {
      const fd = new FormData();
      for (const k of ["name", "category", "price", "mrp", "color", "fabric", "description", "care"]) fd.append(k, f[k]);
      fd.append("mostWanted", f.mostWanted);
      fd.append("inDrop", f.inDrop);
      fd.append("active", f.active);
      fd.append("sizes", JSON.stringify(stock));
      photos.forEach((p, i) => fd.append("images", p.blob, `${i + 1}.${p.ext}`));
      const share = await makeShareImage(photos[0].source);
      if (share) fd.append("og", share, "og.jpg");
      const res = await fetch("/api/admin/products", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) { window.location.href = "/admin/login"; return; }
      if (!res.ok) throw new Error(data.error || "Could not save the product.");
      photos.forEach((p) => URL.revokeObjectURL(p.preview));
      onDone(data.slug);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };

  return (
    <form onSubmit={submit} className="border border-ink/15 bg-white/60 p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-serif text-3xl">Add a product</h2>
        <button type="button" onClick={onCancel} className="text-xs uppercase tracking-[0.16em] underline underline-offset-4">Cancel</button>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="pf-name" className="label">Product name *</label>
          <input id="pf-name" required maxLength={120} value={f.name} onChange={set("name")} className="input" placeholder="e.g. Zari Brocade Corset" />
        </div>
        <div>
          <label htmlFor="pf-cat" className="label">Category *</label>
          <select id="pf-cat" required value={f.category} onChange={set("category")} className="input">
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="pf-price" className="label">Selling price (₹) *</label>
            <input id="pf-price" required type="number" inputMode="numeric" min="1" step="1" value={f.price} onChange={set("price")} className="input" />
          </div>
          <div>
            <label htmlFor="pf-mrp" className="label">MRP (₹)</label>
            <input id="pf-mrp" type="number" inputMode="numeric" min="1" step="1" value={f.mrp} onChange={set("mrp")} className="input" placeholder="same as price" />
          </div>
        </div>
        <div>
          <label htmlFor="pf-color" className="label">Colour</label>
          <input id="pf-color" maxLength={60} value={f.color} onChange={set("color")} className="input" placeholder="Black & Gold" />
        </div>
        <div>
          <label htmlFor="pf-fabric" className="label">Fabric</label>
          <input id="pf-fabric" maxLength={80} value={f.fabric} onChange={set("fabric")} className="input" placeholder="Banarasi brocade" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="pf-desc" className="label">Description</label>
          <textarea id="pf-desc" rows={4} maxLength={2000} value={f.description} onChange={set("description")} className="input py-3" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="pf-care" className="label">Care instructions</label>
          <textarea id="pf-care" rows={2} maxLength={600} value={f.care} onChange={set("care")} className="input py-3" placeholder="Dry clean only" />
        </div>

        <fieldset className="sm:col-span-2">
          <legend className="label">Sizes and stock *</legend>
          <div className="flex flex-wrap gap-3">
            {SIZES.map((s) => {
              const on = s in stock;
              return (
                <div key={s} className={`flex items-center gap-2 border px-3 py-2 ${on ? "border-ink bg-white" : "border-ink/20"}`}>
                  <label className="flex min-h-[36px] items-center gap-2 text-sm">
                    <input type="checkbox" checked={on} onChange={() => toggleSize(s)} className="accent-[#1f1a17]" /> {s}
                  </label>
                  {on && (
                    <input aria-label={`Units in stock for size ${s}`} type="number" min="0" max="9999" value={stock[s]} onChange={(e) => setStock({ ...stock, [s]: e.target.value })} className="w-16 border border-ink/25 bg-white px-2 py-1 text-sm" />
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>

        <div className="sm:col-span-2">
          <p className="label">Photos * (up to 6 — the first is the main photo)</p>
          <div className="flex flex-wrap gap-3">
            {photos.map((p, i) => (
              <div key={p.id} className="w-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.preview} alt={`Photo ${i + 1}`} className="aspect-[4/5] w-full border border-ink/15 object-cover" />
                <div className="mt-1 flex justify-between text-[11px]">
                  {i === 0 ? <span className="font-medium text-terracotta-dark">Main</span> : <button type="button" onClick={() => makeMain(p.id)} className="underline">Make main</button>}
                  <button type="button" onClick={() => removePhoto(p.id)} className="underline">Remove</button>
                </div>
              </div>
            ))}
            {photos.length < 6 && (
              <label className="flex aspect-[4/5] w-28 cursor-pointer items-center justify-center border border-dashed border-ink/40 bg-white/50 px-2 text-center text-xs text-ink-soft hover:border-ink">
                + Add photos
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} className="sr-only" />
              </label>
            )}
          </div>
          <p className="mt-2 text-xs text-ink-muted">Photos are resized automatically, so large camera photos are fine.</p>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-2 sm:col-span-2">
          <label className="flex min-h-[44px] items-center gap-2 text-sm"><input type="checkbox" checked={f.active} onChange={set("active")} className="accent-[#1f1a17]" /> Show on the shop now</label>
          <label className="flex min-h-[44px] items-center gap-2 text-sm"><input type="checkbox" checked={f.mostWanted} onChange={set("mostWanted")} className="accent-[#1f1a17]" /> Most Wanted</label>
          {currentDrop && (
            <label className="flex min-h-[44px] items-center gap-2 text-sm"><input type="checkbox" checked={f.inDrop} onChange={set("inDrop")} className="accent-[#1f1a17]" /> Part of this month&rsquo;s drop ({currentDrop.name})</label>
          )}
        </div>
      </div>

      {error && <p role="alert" className="mt-5 border border-[#b3261e]/40 bg-[#b3261e]/5 px-4 py-3 text-sm text-[#b3261e]">{error}</p>}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={Boolean(busy)} className="btn-dark">{busy || "Save product"}</button>
      </div>
    </form>
  );
}
