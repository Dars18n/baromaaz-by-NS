"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Img from "../Img";
import Price from "../Price";
import Reveal from "../Reveal";
import Scroller from "./Scroller";
import SectionHeading from "./SectionHeading";
import SizePicker from "../SizePicker";
import { CloseIcon, PlusIcon } from "../Icons";
import { useStore } from "../StoreProvider";

function LookSheet({ look, products, onClose }) {
  const { addToCart, notify } = useStore();
  const [sizes, setSizes] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const add = (p) => {
    if (!sizes[p.slug]) return setErrors((e) => ({ ...e, [p.slug]: "Please choose a size" }));
    addToCart(p.slug, sizes[p.slug], 1, { open: false });
    notify(`${p.name} (${sizes[p.slug]}) added to your bag`);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-labelledby="look-title">
      <button type="button" aria-label="Close" className="absolute inset-0 animate-fadeIn bg-ink/50" onClick={onClose} />
      <div className="relative max-h-[88vh] w-full max-w-lg animate-fadeUp overflow-y-auto bg-ivory p-5 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Shop the look</p>
            <h3 id="look-title" className="mt-1 font-serif text-3xl">{look.title}</h3>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center"><CloseIcon /></button>
        </div>
        <ul className="mt-5 divide-y divide-ink/10">
          {products.map((p) => (
            <li key={p.slug} className="flex gap-4 py-5">
              <Link href={`/product/${p.slug}`} className="w-24 shrink-0 bg-beige"><Img src={p.images[0]} alt={`${p.name} by Baromaaz — ${look.title} look`} className="aspect-[4/5] w-full object-cover" /></Link>
              <div className="min-w-0 flex-1">
                <Link href={`/product/${p.slug}`} className="font-serif text-xl leading-tight">{p.name}</Link>
                <div className="mb-3 mt-1"><Price price={p.price} mrp={p.mrp} /></div>
                <SizePicker name={`look-${look.id}-${p.slug}`} sizes={p.sizes} stock={p.stock} value={sizes[p.slug]} onChange={(s) => { setSizes((x) => ({ ...x, [p.slug]: s })); setErrors((e) => ({ ...e, [p.slug]: null })); }} error={errors[p.slug]} />
                <button type="button" onClick={() => add(p)} className="btn-dark mt-3 min-h-[44px] w-full">Add to bag</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ShopTheLook({ looks, productsBySlug }) {
  const [open, setOpen] = useState(null);
  const openLook = looks.find((l) => l.id === open);
  return (
    <section aria-labelledby="look-heading" className="pt-20 md:pt-28">
      <Reveal className="container-x mb-8">
        <SectionHeading id="look-heading" eyebrow="Styled by us" title="Shop the Look — Styled Ethnic Outfits">Swipe through this month&rsquo;s editorial — tap Add + to shop every piece in a look.</SectionHeading>
      </Reveal>
      <Scroller label="Editorial looks">
        {looks.map((look) => {
          const items = look.products.map((s) => productsBySlug[s]).filter(Boolean);
          return (
            <figure key={look.id} className="w-[80%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]">
              <div className="group relative aspect-[4/5] overflow-hidden bg-beige">
                <Img src={look.image} alt={`${look.title}: ${look.note}`} className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.05]" />
                <button type="button" onClick={() => setOpen(look.id)} className="absolute bottom-4 right-4 inline-flex min-h-[44px] items-center gap-2 bg-ivory px-4 text-[12px] font-medium uppercase tracking-[0.16em] text-ink shadow-md transition-colors hover:bg-ink hover:text-ivory" aria-label={`Add pieces from the look ${look.title}`}>
                  Add <PlusIcon width={16} height={16} />
                </button>
              </div>
              <figcaption className="pt-3">
                <p className="font-serif text-2xl">{look.title}</p>
                <p className="text-sm text-ink-muted">{items.map((p) => p.name).join(" · ")}</p>
              </figcaption>
            </figure>
          );
        })}
      </Scroller>
      {openLook && <LookSheet look={openLook} products={openLook.products.map((s) => productsBySlug[s]).filter(Boolean)} onClose={() => setOpen(null)} />}
    </section>
  );
}
