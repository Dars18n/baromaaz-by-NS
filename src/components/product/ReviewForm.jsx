"use client";

import { useState } from "react";
import { StarIcon } from "../Icons";

export default function ReviewForm({ slug }) {
  const [f, setF] = useState({ name: "", city: "", title: "", text: "", website: "" });
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState("idle");
  const [err, setErr] = useState("");
  const [files, setFiles] = useState([]);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  // Shrinks big phone photos in the browser so uploads are fast and fit the size limit.
  async function shrink(file) {
    try {
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, 1400 / Math.max(bmp.width, bmp.height));
      const c = document.createElement("canvas");
      c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
      c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
      const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.82));
      return blob ? new File([blob], "photo.jpg", { type: "image/jpeg" }) : file;
    } catch { return file; }
  }
  async function onPick(e) {
    const picked = [...e.target.files].filter((f) => f.type.startsWith("image/")).slice(0, 3);
    e.target.value = "";
    setFiles(await Promise.all(picked.map(shrink)));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!rating) { setErr("Please choose a star rating."); return; }
    setStatus("loading"); setErr("");
    try {
      const fd = new FormData();
      Object.entries({ ...f, slug, rating }).forEach(([k, v]) => fd.append(k, v));
      files.forEach((file) => fd.append("photos", file));
      const res = await fetch("/api/reviews", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong — please try again.");
      setStatus("done");
    } catch (e2) {
      setErr(e2.message); setStatus("idle");
    }
  }

  if (status === "done") {
    return <p role="status" className="mt-10 bg-beige px-6 py-8 text-center font-serif text-xl">Thank you! Your review is with us and will appear here once it&rsquo;s approved.</p>;
  }

  return (
    <form id="write-review" onSubmit={onSubmit} className="mt-10 grid gap-4 bg-beige p-6 sm:grid-cols-2 md:p-8">
      <h3 className="font-serif text-2xl sm:col-span-2">Write a review</h3>
      <div className="sm:col-span-2">
        <p className="label" id="rv-rating">Your rating</p>
        <div role="radiogroup" aria-labelledby="rv-rating" className="mt-1 flex gap-1 text-terracotta-dark">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={`${i} star${i > 1 ? "s" : ""}`} onClick={() => setRating(i)} className="p-1">
              <StarIcon width={26} height={26} filled={i <= rating} />
            </button>
          ))}
        </div>
      </div>
      <div><label htmlFor="rv-name" className="label">Name</label><input id="rv-name" required maxLength={60} autoComplete="name" value={f.name} onChange={set("name")} className="input" /></div>
      <div><label htmlFor="rv-city" className="label">City (optional)</label><input id="rv-city" maxLength={60} value={f.city} onChange={set("city")} className="input" /></div>
      <div className="sm:col-span-2"><label htmlFor="rv-title" className="label">Headline (optional)</label><input id="rv-title" maxLength={100} value={f.title} onChange={set("title")} className="input" /></div>
      <div className="sm:col-span-2"><label htmlFor="rv-text" className="label">Your review</label><textarea id="rv-text" required minLength={10} maxLength={1200} rows={4} value={f.text} onChange={set("text")} className="input py-3" /></div>
      <div className="sm:col-span-2">
        <label htmlFor="rv-photos" className="label">Photos (optional, up to 3)</label>
        <input id="rv-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={onPick} className="mt-1 block w-full text-sm file:mr-3 file:border file:border-ink/30 file:bg-transparent file:px-4 file:py-2 file:text-sm" />
        {files.length > 0 && <p className="mt-1 text-xs text-ink-muted">{files.length} photo{files.length > 1 ? "s" : ""} ready to upload</p>}
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set("website")} className="hidden" />
      {err && <p role="alert" className="text-sm text-terracotta-dark sm:col-span-2">{err}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={status === "loading"} className="btn-dark">{status === "loading" ? "Sending…" : "Submit review"}</button>
        <p className="mt-2 text-xs text-ink-muted">Reviews are checked before they go live.</p>
      </div>
    </form>
  );
}
