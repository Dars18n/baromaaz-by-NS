"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

// Rounded search bar — searches the whole collection on "Shop all".
function SearchBar({ className = "", autoFocus = false, onDone }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/new-in?q=${encodeURIComponent(term)}` : "/new-in");
    onDone?.();
  };
  return (
    <form role="search" onSubmit={submit} className={`relative ${className}`}>
      <label htmlFor={autoFocus ? "search-mobile" : "search-desktop"} className="sr-only">Search the collection</label>
      <input
        id={autoFocus ? "search-mobile" : "search-desktop"}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus={autoFocus}
        placeholder="Search dresses, kurtis, tops…"
        enterKeyHint="search"
        className="h-10 w-full rounded-full border border-ink/10 bg-white/95 pl-4 pr-11 text-[13px] text-ink shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-ink-muted/80 focus:border-terracotta-dark/50 focus:ring-2 focus:ring-terracotta/20 [&::-webkit-search-cancel-button]:hidden"
      />
      <button type="submit" aria-label="Search" className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5">
        <SearchIcon width={18} height={18} />
      </button>
    </form>
  );
}

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cartCount, wishlist, setCartOpen, ready } = useStore();

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

  const solid = !isHome || scrolled || menuOpen || searchOpen;
  const tone = solid ? "text-ink" : "text-ivory";

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
            <button type="button" className={`${iconBtn} -ml-2 lg:hidden`} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => (setMenuOpen((v) => !v), setSearchOpen(false))}>
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <nav aria-label="Main" className="hidden items-center gap-7 text-[13px] uppercase tracking-[0.16em] lg:flex">
              <Link href="/new-in" className="link-underline py-1">Shop all</Link>
              <Link
                href="/drop"
                className={`border px-4 py-2 transition-colors ${solid ? "border-terracotta-dark bg-terracotta-dark text-ivory hover:bg-ink hover:border-ink" : "border-ivory/80 hover:bg-ivory hover:text-ink"}`}
              >
                This Month&rsquo;s Drop
              </Link>
            </nav>
          </div>

          <Link href="/" aria-label="Baromaaz — home" className="flex min-h-[44px] shrink-0 items-center text-center">
            <Logo className={`text-[38.5px] md:text-[49px] [&_img]:transition-[filter] [&_img]:duration-300 ${solid ? "[&_img]:brightness-0" : ""}`} />
          </Link>

          {/* right: search + icons */}
          <div className="flex flex-1 items-center justify-end gap-0.5 md:gap-1">
            <SearchBar className="mr-2 hidden w-[230px] lg:block xl:w-[280px]" />
            <button type="button" className={`${iconBtn} lg:hidden`} aria-label={searchOpen ? "Close search" : "Open search"} aria-expanded={searchOpen} onClick={() => (setSearchOpen((v) => !v), setMenuOpen(false))}>
              {searchOpen ? <CloseIcon /> : <SearchIcon />}
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

        {/* phones & tablets: search bar under the header */}
        {searchOpen && (
          <div className="container-x animate-fadeIn pb-3 lg:hidden">
            <SearchBar autoFocus onDone={() => setSearchOpen(false)} />
          </div>
        )}

        {/* mobile drawer */}
        {menuOpen && (
          <div className="h-[calc(100dvh-100px)] animate-fadeIn overflow-y-auto border-t border-ink/10 bg-ivory lg:hidden">
            <nav aria-label="Mobile" className="container-x py-6">
              <Link href="/drop" className="btn-terra w-full">This Month&rsquo;s Drop</Link>
              <ul className="mt-6 space-y-3 text-sm uppercase tracking-[0.14em] text-ink-soft">
                <li><Link href="/new-in" className="block py-3">Shop all</Link></li>
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
