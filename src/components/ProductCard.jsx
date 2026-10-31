"use client";

import Link from "next/link";
import Img from "./Img";
import Price from "./Price";
import { HeartIcon } from "./Icons";
import { useStore } from "./StoreProvider";

export default function ProductCard({ product, priority = false, className = "" }) {
  const { toggleWishlist, isWishlisted, ready } = useStore();
  const saved = ready && isWishlisted(product.slug);
  return (
    <article className={`group relative ${className}`}>
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-beige">
          <Img
            src={product.images[0]}
            alt={`${product.name}${product.color ? ` in ${product.color.toLowerCase()}` : ""} — front view`}
            priority={priority}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
          />
          <Img
            src={product.images[1] || product.images[0]}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100 max-md:hidden"
          />
          {product.drop && (
            <span className="absolute left-2 top-2 bg-ivory/95 px-1.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-ink sm:left-2.5 sm:top-2.5 sm:px-2 sm:text-[10px] sm:tracking-[0.16em]">
              <span className="sm:hidden">Drop</span><span className="max-sm:hidden">Monthly Drop</span>
            </span>
          )}
        </div>
        <div className="pt-3">
          <h3 className="font-serif text-[19px] font-medium leading-tight text-ink md:text-xl">{product.name}</h3>
          <p className="mb-1 mt-0.5 min-h-[1rem] text-xs text-ink-muted">{product.color}</p>
          <Price price={product.price} mrp={product.mrp} />
        </div>
      </Link>
      <button
        type="button"
        onClick={() => toggleWishlist(product.slug)}
        aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        aria-pressed={saved}
        className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/90 text-ink transition hover:scale-110 hover:text-terracotta-dark"
      >
        <HeartIcon filled={saved} width={19} height={19} className={saved ? "text-terracotta-dark" : ""} />
      </button>
    </article>
  );
}
