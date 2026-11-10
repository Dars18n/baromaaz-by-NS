"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/components/StoreProvider";

export default function WishlistView() {
  const { wishlist, ready, products } = useStore();
  const items = products.filter((p) => wishlist.includes(p.slug));
  return (
    <div className="container-x pt-8 md:pt-14">
      <h1 className="h-display text-5xl md:text-6xl">Wishlist</h1>
      {!ready ? <div className="min-h-[40vh]" /> : items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-serif text-3xl">Nothing saved yet</p>
          <p className="mt-2 text-sm text-ink-muted">Tap the heart on any piece to keep it here.</p>
          <Link href="/drop" className="btn-dark mt-6">Explore the collection</Link>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-ink-muted">{items.length} saved {items.length === 1 ? "piece" : "pieces"}. Monthly Drop pieces are limited — don&rsquo;t wait too long.</p>
          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </>
      )}
    </div>
  );
}
