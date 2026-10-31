"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";
import SizePicker from "../SizePicker";
import { HeartIcon } from "../Icons";
import { useStore } from "../StoreProvider";

export default function ProductActions({ product }) {
  const [size, setSize] = useState(null);
  const [error, setError] = useState(null);
  const { addToCart, toggleWishlist, isWishlisted, ready } = useStore();
  const router = useRouter();
  const saved = ready && isWishlisted(product.slug);
  const soldOut = product.inStock === false;
  const buttonsRef = useRef(null);
  const [showBar, setShowBar] = useState(false);

  // show the sticky phone bar once the main buttons have scrolled off-screen
  useEffect(() => {
    const el = buttonsRef.current;
    if (!el) return;
    let raf = 0;
    const check = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setShowBar(el.getBoundingClientRect().bottom < 0));
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      document.body.style.paddingBottom = "";
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  // leave room at the page bottom so the bar never hides the footer on phones
  useEffect(() => {
    const phone = window.matchMedia("(max-width: 767px)").matches;
    document.body.style.paddingBottom = showBar && phone ? "80px" : "";
  }, [showBar]);

  const barAdd = () => {
    if (size) return addToCart(product.slug, size);
    setError("Please select a size");
    document.getElementById("size-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const requireSize = () => {
    if (size) return true;
    setError("Please select a size");
    return false;
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="label mb-0">Size{size ? `: ${size}` : ""}</p>
        <a href="#size-chart" className="-my-3 inline-block py-3 text-xs uppercase tracking-[0.14em] underline underline-offset-4" onClick={() => { const d = document.getElementById("size-chart"); if (d) d.open = true; }}>Size chart</a>
      </div>
      <div id="size-picker" className="mt-3 scroll-mt-32">
        <SizePicker name="size" sizes={product.sizes} stock={product.stock} value={size} onChange={(s) => { setSize(s); setError(null); }} error={error} />
      </div>
      {product.sizes.length < 5 && <p className="mt-2 text-xs text-ink-muted">Available in {product.sizes.join(", ")} only.</p>}

      <div ref={buttonsRef} className="mt-6 grid grid-cols-[1fr_auto] gap-3">
        <button type="button" className="btn-dark" disabled={soldOut} onClick={() => requireSize() && addToCart(product.slug, size)}>{soldOut ? "Sold out" : "Add to cart"}</button>
        <button type="button" onClick={() => toggleWishlist(product.slug)} aria-pressed={saved} aria-label={saved ? "Remove from wishlist" : "Add to wishlist"} className="flex h-12 w-12 items-center justify-center border border-ink/30 transition-colors hover:border-ink">
          <HeartIcon filled={saved} className={saved ? "text-terracotta-dark" : ""} />
        </button>
        <button type="button" className="btn-terra col-span-2" disabled={soldOut} onClick={() => { if (requireSize()) { addToCart(product.slug, size, 1, { open: false }); router.push("/checkout"); } }}>Buy now</button>
      </div>
      {showBar && !soldOut && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex animate-fadeIn items-center gap-3 border-t border-ink/10 bg-ivory/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur md:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <p className="text-sm text-ink-soft">{formatPrice(product.price)}{size ? ` · Size ${size}` : ""}</p>
          </div>
          <button type="button" onClick={barAdd} className="btn-dark min-h-[44px] shrink-0 px-5">{size ? "Add to cart" : "Select size"}</button>
        </div>
      )}
    </div>
  );
}
