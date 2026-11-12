"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { SITE } from "@/lib/site";
import { track } from "@/lib/analytics";

const StoreContext = createContext(null);
const KEY = "baromaaz-store-v1";
const empty = { cart: [], wishlist: [], orders: [], returns: [], profile: { name: "", phone: "", address: "", city: "", pincode: "" } };

function readStore() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const stored = JSON.parse(raw);
    const profile = Object.fromEntries(Object.entries(stored.profile || {}).filter(([key]) => key !== "email"));
    return { ...empty, ...stored, profile: { ...empty.profile, ...profile } };
  } catch {
    return empty;
  }
}

export function StoreProvider({ children, products = [] }) {
  const [state, setState] = useState(empty);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const toastTimer = useRef();

  useEffect(() => {
    setState(readStore());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state, ready]);

  const notify = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  // most you can buy of one size: what's in stock, and never more than 10
  const maxQty = useCallback((slug, size) => {
    const p = products.find((x) => x.slug === slug);
    const inStock = p?.stock?.[size];
    return Math.min(10, typeof inStock === "number" ? inStock : 10);
  }, [products]);

  const addToCart = useCallback((slug, size, qty = 1, { open = true } = {}) => {
    const cap = maxQty(slug, size);
    let capped = false;
    setState((s) => {
      const key = `${slug}|${size}`;
      const found = s.cart.find((i) => i.key === key);
      const want = (found?.qty || 0) + qty;
      capped = want > cap;
      const next = Math.min(cap, want);
      const cart = found
        ? s.cart.map((i) => (i.key === key ? { ...i, qty: next } : i))
        : next > 0 ? [...s.cart, { key, slug, size, qty: next }] : s.cart;
      return { ...s, cart };
    });
    setTimeout(() => capped && notify(`Only ${cap} available in size ${size}`), 0);
    track("add_to_cart", { item: slug, size, qty });
    if (open) setCartOpen(true);
  }, [maxQty]);

  const updateQty = useCallback((key, qty) => {
    const [slug, size] = key.split("|");
    const cap = maxQty(slug, size);
    setState((s) => ({
      ...s,
      cart: qty <= 0 ? s.cart.filter((i) => i.key !== key) : s.cart.map((i) => (i.key === key ? { ...i, qty: Math.min(cap, qty) } : i)),
    }));
  }, [maxQty]);

  const removeFromCart = useCallback((key) => setState((s) => ({ ...s, cart: s.cart.filter((i) => i.key !== key) })), []);
  const clearCart = useCallback(() => setState((s) => ({ ...s, cart: [] })), []);

  const toggleWishlist = useCallback(
    (slug) => {
      let added = false;
      setState((s) => {
        added = !s.wishlist.includes(slug);
        return { ...s, wishlist: added ? [...s.wishlist, slug] : s.wishlist.filter((x) => x !== slug) };
      });
      setTimeout(() => {
        notify(added ? "Saved to your wishlist" : "Removed from wishlist");
        if (added) track("add_to_wishlist", { item: slug });
      }, 0);
    },
    [notify]
  );

  const saveProfile = useCallback((profile) => setState((s) => ({ ...s, profile: { ...s.profile, ...profile } })), []);
  const addOrder = useCallback((order) => setState((s) => ({ ...s, orders: [order, ...s.orders] })), []);
  const addReturn = useCallback((req) => setState((s) => ({ ...s, returns: [req, ...s.returns] })), []);

  const cartLines = useMemo(
    () =>
      state.cart
        .map((i) => ({ ...i, product: products.find((p) => p.slug === i.slug) }))
        .filter((i) => i.product),
    [state.cart, products]
  );
  const subtotal = cartLines.reduce((s, i) => s + i.product.price * i.qty, 0);
  const mrpTotal = cartLines.reduce((s, i) => s + i.product.mrp * i.qty, 0);
  const shipping = subtotal === 0 || subtotal >= SITE.freeShippingAbove ? 0 : SITE.shippingFee;
  const cartCount = state.cart.reduce((s, i) => s + i.qty, 0);

  const value = {
    ...state,
    ready,
    products,
    cartLines,
    cartCount,
    subtotal,
    mrpTotal,
    shipping,
    total: subtotal + shipping,
    cartOpen,
    setCartOpen,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    toggleWishlist,
    isWishlisted: (slug) => state.wishlist.includes(slug),
    saveProfile,
    addOrder,
    addReturn,
    notify,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom)+var(--cobar)+var(--pbar))] z-[80] flex justify-center px-4 md:bottom-[calc(1.25rem+var(--cobar-desk))]">
        {toast && <div className="animate-fadeUp bg-ink px-5 py-3 text-sm text-ivory shadow-lg">{toast}</div>}
      </div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
