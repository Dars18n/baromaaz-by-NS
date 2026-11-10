"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "./StoreProvider";
import { CartIcon, HeartIcon, HomeIcon, ShopBagIcon } from "./Icons";

// Phone-only bottom tab bar: Home · New In · Wishlist · Cart
const TABS = [
  { href: "/", label: "Home", Icon: HomeIcon, match: (p) => p === "/" },
  { href: "/new-in", label: "New In", Icon: ShopBagIcon, match: (p) => /^\/(new-in|drop|product)(\/|$)/.test(p) },
  { href: "/wishlist", label: "Wishlist", Icon: HeartIcon, match: (p) => p.startsWith("/wishlist"), count: "wishlist" },
  { href: "/cart", label: "Cart", Icon: CartIcon, match: (p) => p.startsWith("/cart") || p.startsWith("/checkout"), count: "cart" },
];

export default function BottomNav() {
  const pathname = usePathname() || "/";
  const { cartCount, wishlist, ready } = useStore();
  const counts = { cart: cartCount, wishlist: wishlist.length };

  return (
    <nav
      aria-label="Quick links"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ivory/10 bg-ink text-ivory md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid h-16 grid-cols-4">
        {TABS.map(({ href, label, Icon, match, count }) => {
          const active = match(pathname);
          const n = ready && count ? counts[count] : 0;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                aria-label={n ? `${label}, ${n} ${n === 1 ? "item" : "items"}` : label}
                className={`flex h-full flex-col items-center justify-center gap-1 transition-colors ${active ? "text-terracotta-light" : "text-ivory/70 hover:text-ivory"}`}
              >
                <span className="relative">
                  <Icon width={24} height={24} strokeWidth={active ? 1.8 : 1.5} />
                  {n > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-medium leading-none text-ivory">
                      {n > 9 ? "9+" : n}
                    </span>
                  )}
                </span>
                <span className="text-[12px] font-medium tracking-[0.04em]">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
