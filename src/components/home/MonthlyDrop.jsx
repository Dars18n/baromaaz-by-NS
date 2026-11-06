"use client";

import Link from "next/link";
import { useState } from "react";
import Img from "../Img";
import Price from "../Price";
import Reveal from "../Reveal";
import { SITE } from "@/lib/site";

export default function MonthlyDrop({ products }) {
  const [active, setActive] = useState(0);
  const current = products[active];
  const n = products.length;

  return (
    <section aria-labelledby="drop-heading" className="mt-20 overflow-hidden bg-beige py-20 md:mt-28 md:py-28">
      <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <Reveal className="order-2 lg:order-1">
          <p className="eyebrow">Monthly Drop · {SITE.drop.month}</p>
          <h2 id="drop-heading" className="h-display mt-3 text-5xl md:text-6xl">The {SITE.drop.name} Edit<span className="mt-2 block font-serif text-2xl font-medium text-ink-soft md:text-3xl">Festive ethnic wear for women</span></h2>
          <p className="mt-4 max-w-md text-[15px] leading-7 text-ink-soft">{SITE.drop.blurb}</p>

          <div key={current.slug} className="mt-8 animate-fadeIn border-t border-ink/15 pt-6" aria-live="polite">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">Now viewing · {active + 1} of {n}</p>
            <h3 className="mt-2 font-serif text-3xl">{current.name}</h3>
            {(current.color || current.fabric) && <p className="mt-1 text-sm text-ink-muted">{[current.color, current.fabric].filter(Boolean).join(" · ")}</p>}
            <div className="mt-3"><Price price={current.price} mrp={current.mrp} size="lg" /></div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/product/${current.slug}`} className="btn-dark">View product</Link>
              <Link href="/drop" className="btn-outline">Shop the full drop</Link>
            </div>
          </div>
        </Reveal>

        <div className="order-1 mx-auto w-full max-w-[560px] lg:order-2">
          <div className="relative aspect-square w-full">
            {/* orbit ring */}
            <div aria-hidden="true" className="absolute inset-[9%] rounded-full border border-dashed border-terracotta/40" />
            {/* center product */}
            <Link
              href={`/product/${current.slug}`}
              className="absolute left-1/2 top-1/2 block w-[50%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-t-full bg-ivory shadow-xl"
            >
              <Img key={current.slug} src={current.images[0]} alt={`${current.name} — featured in this month's drop`} className="aspect-[4/5] w-full animate-fadeIn object-cover" />
            </Link>
            {/* orbiting circles */}
            <ul aria-label="Pieces in this month's drop">
              {products.map((p, i) => {
                const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
                const r = 41; // % of container
                const x = 50 + r * Math.cos(angle);
                const y = 50 + r * Math.sin(angle);
                const isActive = i === active;
                return (
                  <li key={p.slug} className="absolute w-[19%] -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-pressed={isActive}
                      aria-label={`Show ${p.name}`}
                      className={`block aspect-square w-full overflow-hidden rounded-full border-[3px] bg-ivory transition-all duration-500 hover:scale-110 ${isActive ? "scale-110 border-terracotta-dark shadow-lg" : "border-ivory shadow"}`}
                    >
                      <Img src={p.images[0]} alt={`${p.name} — Baromaaz ${SITE.drop.name} drop`} className="h-full w-full scale-[1.7] object-cover object-[50%_30%]" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
