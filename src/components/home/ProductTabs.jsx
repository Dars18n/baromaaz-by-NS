"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import ProductCard from "../ProductCard";
import Reveal from "../Reveal";
import { FlameIcon, SparkleIcon } from "../Icons";

const ICONS = { new: SparkleIcon, wanted: FlameIcon };

export default function ProductTabs({ tabs }) {
  const [active, setActive] = useState(0);
  const refs = useRef([]);
  const current = tabs[active];

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
    <section aria-labelledby="tabs-heading" className="container-x pt-20 md:pt-28">
      <Reveal>
        <p className="flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.2em] text-terracotta-dark">
          <SparkleIcon width={16} height={16} /> Fresh monthly drops
        </p>
        <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
          <h2 id="tabs-heading" className="h-display text-4xl md:text-5xl">{current.heading || current.label}</h2>

          {tabs.length > 1 && (
            <div role="tablist" aria-label="Featured products" className="flex w-full rounded-full border border-ink/5 bg-beige p-1.5 md:w-auto">
              {tabs.map((t, i) => {
                const on = active === i;
                const Icon = ICONS[t.id] || SparkleIcon;
                return (
                  <button
                    key={t.id}
                    ref={(el) => (refs.current[i] = el)}
                    role="tab"
                    id={`tab-${t.id}`}
                    aria-selected={on}
                    aria-controls={`panel-${t.id}`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => setActive(i)}
                    onKeyDown={(e) => onKey(e, i)}
                    className={`flex min-h-[46px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-[14px] font-medium transition-all duration-300 md:flex-none md:px-6 ${
                      on ? "bg-ink text-ivory shadow-md" : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    <Icon width={17} height={17} />
                    {t.label}
                    <span
                      className={`flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                        on ? "bg-ivory/20 text-ivory" : t.id === "wanted" ? "bg-[#fde2e2] text-[#c4314b]" : "bg-ink/10 text-ink-soft"
                      }`}
                      aria-label={`${t.products.length} products`}
                    >
                      {t.products.length}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
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
