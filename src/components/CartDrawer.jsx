"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useStore } from "./StoreProvider";
import { CloseIcon } from "./Icons";
import CartLine from "./CartLine";
import { formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site";

export default function CartDrawer() {
  const { cartOpen, setCartOpen, cartLines, subtotal } = useStore();

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e) => e.key === "Escape" && setCartOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [cartOpen, setCartOpen]);

  if (!cartOpen) return null;
  const remaining = SITE.freeShippingAbove - subtotal;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <button type="button" aria-label="Close shopping bag" className="absolute inset-0 animate-fadeIn bg-ink/40" onClick={() => setCartOpen(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[420px] animate-fadeIn flex-col bg-ivory shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <p id="cart-title" className="font-serif text-2xl">Your bag</p>
          <button type="button" aria-label="Close shopping bag" className="flex h-11 w-11 items-center justify-center" onClick={() => setCartOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        {cartLines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-serif text-2xl">Your bag is empty</p>
            <p className="text-sm text-ink-muted">This month&rsquo;s pieces are made in small numbers — find yours before they go.</p>
            <Link href="/drop" className="btn-dark mt-2" onClick={() => setCartOpen(false)}>Shop the drop</Link>
          </div>
        ) : (
          <>
            <p className="bg-beige px-5 py-2.5 text-center text-xs text-ink-soft">
              {remaining > 0 ? <>You&rsquo;re {formatPrice(remaining)} away from free shipping</> : <>You&rsquo;ve unlocked free shipping</>}
            </p>
            <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto px-5">
              {cartLines.map((line) => (
                <li key={line.key} className="py-4"><CartLine line={line} compact /></li>
              ))}
            </ul>
            <div className="border-t border-ink/10 px-5 py-5">
              <div className="flex justify-between text-[15px]"><span>Subtotal</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
              <p className="mt-1 text-xs text-ink-muted">Shipping calculated at checkout.</p>
              <Link href="/checkout" className="btn-dark mt-4 w-full" onClick={() => setCartOpen(false)}>Checkout</Link>
              <Link href="/cart" className="mt-3 block text-center text-xs uppercase tracking-[0.16em] underline underline-offset-4" onClick={() => setCartOpen(false)}>View bag</Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
