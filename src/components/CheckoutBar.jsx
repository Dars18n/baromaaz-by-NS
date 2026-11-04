"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "./StoreProvider";
import { formatPrice } from "@/lib/format";

// Sticky "Proceed to checkout" — shows on every page once the bag has something in it.
// Phones: slim bar just above the bottom tab bar. Tablets/computers: floating button bottom-right.
export default function CheckoutBar() {
  const { cartCount, subtotal, ready, cartOpen } = useStore();
  const pathname = usePathname() || "/";
  const visible = ready && cartCount > 0 && !cartOpen && !pathname.startsWith("/checkout");

  // tell the rest of the page how much room the bar takes, so nothing hides behind it
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--cobar", visible ? "3.5rem" : "0px");
    root.setProperty("--cobar-desk", visible ? "6rem" : "0px");
    return () => {
      root.setProperty("--cobar", "0px");
      root.setProperty("--cobar-desk", "0px");
    };
  }, [visible]);

  if (!visible) return null;
  const items = `${cartCount} ${cartCount === 1 ? "item" : "items"}`;

  return (
    <>
      {/* phones */}
      <Link
        href="/checkout"
        aria-label={`Proceed to checkout — ${items}, ${formatPrice(subtotal)}`}
        className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-[35] flex h-14 animate-fadeUp items-center justify-between gap-3 bg-terracotta-dark px-4 text-ivory shadow-[0_-4px_18px_rgba(0,0,0,0.12)] md:hidden"
      >
        <span className="min-w-0">
          <span className="block text-[12px] uppercase tracking-[0.14em] text-ivory/80">{items}</span>
          <span className="block text-[16px] font-medium leading-tight">{formatPrice(subtotal)}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ivory px-4 py-2 text-[13px] font-medium uppercase tracking-[0.12em] text-ink">
          Proceed to checkout <span aria-hidden="true">→</span>
        </span>
      </Link>

      {/* tablets & computers */}
      <Link
        href="/checkout"
        aria-label={`Proceed to checkout — ${items}, ${formatPrice(subtotal)}`}
        className="fixed bottom-6 right-6 z-[35] hidden animate-fadeUp items-center gap-4 rounded-full bg-ink py-2 pl-6 pr-2 text-ivory shadow-2xl transition-colors hover:bg-terracotta-dark md:inline-flex"
      >
        <span className="text-sm">
          <span className="text-ivory/75">{items} · </span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-3 text-[13px] font-medium uppercase tracking-[0.14em]">
          Proceed to checkout <span aria-hidden="true">→</span>
        </span>
      </Link>
    </>
  );
}
