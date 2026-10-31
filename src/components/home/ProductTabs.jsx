"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import ProductCard from "../ProductCard";
import Reveal from "../Reveal";

export default function ProductTabs({ tabs }) {
  const [active, setActive] = useState(0);
  const refs = useRef([]);

  const onKey = (e, i) => {
    let next = null;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    if (next !== null) {
      e.preventDefault();
      setActive(next);
      refs.current[next]?.focus();
    }
  };

  return (
    <section aria-label="Featured products" className="container-x pt-20 md:pt-28">
      <Reveal>
        <div role="tablist" aria-label="Featured products" className="flex justify-center gap-6 border-b border-ink/10 md:gap-12">
          {tabs.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => (refs.current[i] = el)}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={active === i}
              aria-controls={`panel-${t.id}`}
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
              className={`-mb-px border-b-2 pb-3 font-serif text-3xl transition-colors md:text-4xl ${active === i ? "border-ink text-ink" : "border-transparent text-ink-muted hover:text-ink"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Reveal>
      {tabs.map((t, i) => (
        <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={active !== i} className="pt-10">
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
            {t.products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href={t.href} className="btn-outline">{t.cta}</Link>
          </div>
        </div>
      ))}
    </section>
  );
}
