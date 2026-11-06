"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Img from "../Img";
import Price from "../Price";
import Reveal from "../Reveal";
import SizePicker from "../SizePicker";
import { BagIcon, ChevronIcon, CloseIcon, FlameIcon } from "../Icons";
import { useStore } from "../StoreProvider";
import { formatPrice } from "@/lib/format";

// Column pattern, repeated: two small cards stacked, then two tall cards (one narrower, one wider).
const PATTERN = [2, 1, 1];
const WIDTHS = { stack: 0.56, a: 0.68, b: 0.86 }; // × the row height

function toColumns(products) {
  const cols = [];
  let i = 0;
  let step = 0;
  while (i < products.length) {
    const n = PATTERN[step % PATTERN.length];
    const items = products.slice(i, i + n);
    cols.push({ items, width: n === 2 ? WIDTHS.stack : step % PATTERN.length === 1 ? WIDTHS.a : WIDTHS.b });
    i += n;
    step += 1;
  }
  return cols;
}

// Small "pick a size" sheet opened by the Add + button.
function QuickAdd({ product, onClose }) {
  const { addToCart, notify } = useStore();
  const [size, setSize] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const add = () => {
    if (!size) return setError("Please choose a size");
    addToCart(product.slug, size, 1, { open: false });
    notify(`${product.name} (${size}) added to your bag`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-labelledby="mw-title">
      <button type="button" aria-label="Close" className="absolute inset-0 animate-fadeIn bg-ink/50" onClick={onClose} />
      <div className="relative w-full max-w-md animate-fadeUp bg-ivory p-5 md:p-7">
        <div className="flex gap-4">
          <div className="w-24 shrink-0 bg-beige"><Img src={product.image} alt={`${product.name} by Baromaaz`} className="aspect-[4/5] w-full object-cover" /></div>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">Most wanted</p>
            <h3 id="mw-title" className="mt-1 font-serif text-2xl leading-tight">{product.name}</h3>
            <div className="mt-1"><Price price={product.price} mrp={product.mrp} /></div>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center"><CloseIcon /></button>
        </div>
        <div className="mt-5">
          <SizePicker name={`mw-${product.slug}`} sizes={product.sizes} stock={product.stock} value={size} onChange={(s) => { setSize(s); setError(null); }} error={error} />
        </div>
        <button type="button" onClick={add} className="btn-dark mt-5 w-full">Add to bag</button>
        <Link href={`/product/${product.slug}`} onClick={onClose} className="mt-3 block text-center text-sm underline underline-offset-4">View full details</Link>
      </div>
    </div>
  );
}

function Card({ product, tall, priority, onAdd }) {
  return (
    <article className="group relative h-full w-full overflow-hidden rounded-[28px] bg-beige shadow-sm">
      <Img
        src={product.image}
        alt={`${product.name}${product.color ? ` in ${product.color.toLowerCase()}` : ""} by Baromaaz — most wanted`}
        priority={priority}
        className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      {/* whole card opens the product page; the Add + button sits above it */}
      <Link href={`/product/${product.slug}`} aria-label={`View ${product.name}`} className="absolute inset-0 z-[1]" />
      <span className="pointer-events-none absolute left-3 top-3 z-[2] inline-flex items-center gap-1.5 rounded-full bg-ivory/95 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink sm:left-4 sm:top-4">
        <FlameIcon width={13} height={13} className="text-terracotta-dark" /> Most wanted
      </span>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between gap-2 p-4 text-ivory sm:p-5">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-sand">Baromaaz</p>
          <h3 className={`mt-1 font-serif font-medium leading-tight ${tall ? "text-[26px] sm:text-[30px]" : "text-[19px] sm:text-[22px]"}`}>{product.name}</h3>
          <p className={`mt-1 font-medium ${tall ? "text-xl" : "text-lg"}`}>
            <span className="sr-only">Price </span>{formatPrice(product.price)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onAdd(product)}
          aria-label={`Add ${product.name} to bag`}
          className="pointer-events-auto z-[3] inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full bg-ivory px-3.5 text-[13px] sm:px-4 font-medium text-ink shadow-md transition-colors hover:bg-terracotta-dark hover:text-ivory"
        >
          <BagIcon width={16} height={16} /> Add +
        </button>
      </div>
    </article>
  );
}

export default function MostWanted({ products }) {
  const track = useRef(null);
  const [adding, setAdding] = useState(null);
  const cols = toColumns(products);

  const go = (dir) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section aria-labelledby="wanted-heading" className="pt-20 md:pt-28">
      <Reveal className="container-x mb-8 flex items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.2em] text-terracotta-dark"><FlameIcon width={16} height={16} /> Customer favourites</p>
          <h2 id="wanted-heading" className="h-display mt-3 text-4xl md:text-5xl">Most Wanted<span className="sr-only"> — best-selling handcrafted Indian ethnic wear</span></h2>
          <p className="mt-3 text-[15px] leading-7 text-ink-soft md:text-base">The pieces everyone keeps coming back to — signature fits, loved again and again. Selling fast, in limited numbers.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => go(-1)} aria-label="Scroll most wanted left" className="flex h-11 w-11 rotate-180 items-center justify-center rounded-full border border-ink/10 bg-ivory shadow-sm transition hover:bg-ink hover:text-ivory md:h-12 md:w-12"><ChevronIcon /></button>
          <button type="button" onClick={() => go(1)} aria-label="Scroll most wanted right" className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-ivory shadow-sm transition hover:bg-ink hover:text-ivory md:h-12 md:w-12"><ChevronIcon /></button>
        </div>
      </Reveal>

      <div
        ref={track}
        role="region"
        aria-label="Most wanted products"
        tabIndex={0}
        style={{ "--h": "clamp(440px, 118vw, 620px)" }}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 sm:gap-5 sm:px-6 lg:px-10 [scroll-padding-inline:1rem] sm:[scroll-padding-inline:1.5rem] lg:[scroll-padding-inline:2.5rem] md:[--h:600px]"
      >
        {cols.map((col, ci) => (
          <div
            key={ci}
            className="flex h-[var(--h)] shrink-0 snap-start flex-col gap-3 sm:gap-5"
            style={{ width: `calc(var(--h) * ${col.width})` }}
          >
            {col.items.map((p, k) => (
              <div key={p.slug} className="min-h-0 flex-1">
                <Card product={p} tall={col.items.length === 1} priority={false} onAdd={setAdding} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/shop" className="btn-outline">Shop all</Link>
      </div>
      {adding && <QuickAdd product={adding} onClose={() => setAdding(null)} />}
    </section>
  );
}
