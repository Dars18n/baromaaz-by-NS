"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "./StoreProvider";
import { BagIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from "./Icons";
import { SITE } from "@/lib/site";
import { formatPrice } from "@/lib/format";
import Logo from "./Logo";

function Badge({ n }) {
  if (!n) return null;
  return (
    <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-terracotta-dark px-1 text-[10px] font-medium leading-none text-ivory">
      {n}
    </span>
  );
}

export default function Header({ categories = [] }) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const { cartCount, wishlist, setCartOpen, ready } = useStore();
  const mobileSearchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen) mobileSearchRef.current?.focus();
  }, [searchOpen]);

  const solid = !isHome || scrolled || menuOpen || searchOpen;
  const tone = solid ? "text-ink" : "text-ivory";

  const submitSearch = (e) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  };

  const iconBtn = "relative flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-70";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color] duration-500 ${
          solid ? "bg-ivory/95 shadow-[0_1px_0_rgba(31,26,23,0.08)] backdrop-blur-md" : "bg-gradient-to-b from-black/40 to-transparent"
        }`}
      >
        <p className="flex h-9 items-center justify-center bg-ink px-3 text-center text-[11px] uppercase tracking-[0.08em] text-ivory sm:tracking-[0.18em]">
          <span>Free shipping above {formatPrice(SITE.freeShippingAbove)}</span>
          <span aria-hidden="true" className="mx-2 max-[359px]:hidden">·</span>
          <Link href="/drop" className="flex h-9 items-center underline underline-offset-2 max-[359px]:hidden">
            The {SITE.drop.name} Drop is live
          </Link>
        </p>
        <div className={`container-x flex h-16 items-center justify-between gap-2 md:h-20 ${tone}`}>
          {/* left: mobile menu + desktop nav */}
          <div className="flex flex-1 items-center gap-1 lg:gap-8">
            <button type="button" className={`${iconBtn} -ml-2 lg:hidden`} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <nav aria-label="Main" className="hidden items-center gap-7 text-[13px] uppercase tracking-[0.16em] lg:flex">
              <Link href="/shop" className="link-underline py-1">Shop</Link>
              <Link href="/new-in" className="link-underline py-1">New In</Link>
              <Link
                href="/drop"
                className={`border px-4 py-2 transition-colors ${solid ? "border-terracotta-dark bg-terracotta-dark text-ivory hover:bg-ink hover:border-ink" : "border-ivory/80 hover:bg-ivory hover:text-ink"}`}
              >
                This Month&rsquo;s Drop
              </Link>
            </nav>
          </div>

          <Link href="/" aria-label="Baromaaz — home" className="flex min-h-[44px] shrink-0 items-center text-center">
            <Logo className="text-[22px] md:text-[28px]" />
          </Link>

          {/* right: search + icons */}
          <div className="flex flex-1 items-center justify-end gap-0.5 md:gap-1">
            <form role="search" onSubmit={submitSearch} className="mr-2 hidden xl:block">
              <label htmlFor="desk-search" className="sr-only">Search products</label>
              <div className={`flex items-center border-b ${solid ? "border-ink/40" : "border-ivory/70"}`}>
                <input
                  id="desk-search"
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search kurtis, corsets…"
                  className="w-44 bg-transparent py-1.5 text-base xl:text-sm placeholder:text-current placeholder:opacity-70 focus:outline-none"
                />
                <button type="submit" aria-label="Search" className="p-1"><SearchIcon width={18} height={18} /></button>
              </div>
            </form>
            <button type="button" className={`${iconBtn} xl:hidden`} aria-label="Search" aria-expanded={searchOpen} onClick={() => setSearchOpen((v) => !v)}>
              <SearchIcon />
            </button>
            <Link href="/wishlist" className={iconBtn} aria-label={`Wishlist${ready && wishlist.length ? `, ${wishlist.length} items` : ""}`}>
              <HeartIcon />
              {ready && <Badge n={wishlist.length} />}
            </Link>
            <Link href="/account" className={`${iconBtn} hidden sm:flex`} aria-label="Account">
              <UserIcon />
            </Link>
            <button type="button" className={`${iconBtn} -mr-2`} aria-label={`Shopping bag${ready && cartCount ? `, ${cartCount} items` : ""}`} onClick={() => setCartOpen(true)}>
              <BagIcon />
              {ready && <Badge n={cartCount} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <form role="search" onSubmit={submitSearch} className="container-x animate-fadeIn pb-4 xl:hidden">
            <label htmlFor="mob-search" className="sr-only">Search products</label>
            <div className="flex items-center border border-ink/30 bg-white">
              <input ref={mobileSearchRef} id="mob-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search kurtis, corsets, co-ords…" className="min-h-[46px] w-full bg-transparent px-4 text-[16px] text-ink focus:outline-none" />
              <button type="submit" aria-label="Search" className="flex h-[46px] w-12 items-center justify-center text-ink"><SearchIcon /></button>
            </div>
          </form>
        )}

        {/* mobile drawer */}
        {menuOpen && (
          <div className="h-[calc(100dvh-100px)] animate-fadeIn overflow-y-auto border-t border-ink/10 bg-ivory lg:hidden">
            <nav aria-label="Mobile" className="container-x py-6">
              <Link href="/drop" className="btn-terra w-full">This Month&rsquo;s Drop</Link>
              <ul className="mt-6 divide-y divide-ink/10 font-serif text-2xl">
                <li><Link href="/shop" className="block py-3">Shop all</Link></li>
                <li><Link href="/new-in" className="block py-3">New In</Link></li>
                {categories.map((c) => (
                  <li key={c.slug}><Link href={`/shop/${c.slug}`} className="block py-3">{c.name}</Link></li>
                ))}
              </ul>
              <ul className="mt-6 space-y-3 text-sm uppercase tracking-[0.14em] text-ink-soft">
                <li><Link href="/account">My account</Link></li>
                <li><Link href="/wishlist">Wishlist</Link></li>
                <li><Link href="/about">Our story</Link></li>
                <li><Link href="/contact">Contact us</Link></li>
              </ul>
            </nav>
          </div>
        )}
      </header>
      {/* spacer so content starts below the fixed header (home hero sits underneath it) */}
      {!isHome && <div aria-hidden="true" className="h-[100px] md:h-[116px]" />}
    </>
  );
}
