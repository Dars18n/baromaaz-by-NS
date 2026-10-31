"use client";

import Link from "next/link";
import CartLine from "@/components/CartLine";
import { useStore } from "@/components/StoreProvider";
import { formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site";

export default function CartView() {
  const { cartLines, subtotal, mrpTotal, shipping, total, ready } = useStore();
  return (
    <div className="container-x pt-8 md:pt-14">
      <h1 className="h-display text-5xl md:text-6xl">Your bag</h1>
      {!ready ? (
        <div className="min-h-[40vh]" />
      ) : cartLines.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-serif text-3xl">Your bag is empty</p>
          <p className="mt-2 text-sm text-ink-muted">Pieces sell out fast — this month&rsquo;s drop is waiting.</p>
          <Link href="/drop" className="btn-dark mt-6">Shop the drop</Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            {cartLines.map((l) => <li key={l.key} className="py-6"><CartLine line={l} /></li>)}
          </ul>
          <aside aria-label="Order summary" className="h-fit bg-beige p-6">
            <h2 className="font-serif text-2xl">Order summary</h2>
            <dl className="mt-5 space-y-3 text-[15px]">
              <div className="flex justify-between"><dt>MRP total</dt><dd><s className="text-ink-muted">{formatPrice(mrpTotal)}</s></dd></div>
              <div className="flex justify-between"><dt>Discount</dt><dd className="text-terracotta-dark">−{formatPrice(mrpTotal - subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping ? formatPrice(shipping) : "Free"}</dd></div>
              <div className="flex justify-between border-t border-ink/15 pt-3 text-lg font-medium"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
            </dl>
            <p className="mt-2 text-xs text-ink-muted">Inclusive of GST. {shipping ? `Add ${formatPrice(SITE.freeShippingAbove - subtotal)} more for free shipping.` : ""}</p>
            <Link href="/checkout" className="btn-dark mt-6 w-full">Proceed to checkout</Link>
            <p className="mt-4 text-center text-xs text-ink-muted">Secure payment via Razorpay · UPI, cards, netbanking & wallets</p>
          </aside>
        </div>
      )}
    </div>
  );
}
