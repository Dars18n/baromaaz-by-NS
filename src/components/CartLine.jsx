"use client";

import Link from "next/link";
import Img from "./Img";
import { MinusIcon, PlusIcon } from "./Icons";
import { useStore } from "./StoreProvider";
import { formatPrice } from "@/lib/format";

export default function CartLine({ line, compact = false }) {
  const { updateQty, removeFromCart, setCartOpen } = useStore();
  const { product: p, size, qty, key } = line;
  return (
    <div className="flex gap-4">
      <Link href={`/product/${p.slug}`} onClick={() => setCartOpen(false)} className={`shrink-0 overflow-hidden bg-beige ${compact ? "w-20" : "w-24 sm:w-28"}`}>
        <Img src={p.images[0]} alt={p.name} className="aspect-[4/5] h-full w-full object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/product/${p.slug}`} onClick={() => setCartOpen(false)} className="font-serif text-lg leading-tight">{p.name}</Link>
            <p className="mt-0.5 text-xs text-ink-muted">{[p.color, `Size ${size}`].filter(Boolean).join(" · ")}</p>
          </div>
          <p className="shrink-0 text-[15px] font-medium">{formatPrice(p.price * qty)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center border border-ink/20">
            <button type="button" className="flex h-9 w-9 items-center justify-center" aria-label={`Decrease quantity of ${p.name}`} onClick={() => updateQty(key, qty - 1)}><MinusIcon width={16} height={16} /></button>
            <span className="w-7 text-center text-sm" aria-live="polite" aria-label={`Quantity ${qty}`}>{qty}</span>
            <button type="button" className="flex h-9 w-9 items-center justify-center" aria-label={`Increase quantity of ${p.name}`} onClick={() => updateQty(key, qty + 1)}><PlusIcon width={16} height={16} /></button>
          </div>
          <button type="button" className="text-xs uppercase tracking-[0.14em] text-ink-muted underline underline-offset-4 hover:text-ink" onClick={() => removeFromCart(key)}>
            Remove<span className="sr-only"> {p.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
