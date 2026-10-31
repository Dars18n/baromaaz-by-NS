"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Img from "../Img";
import Reveal from "../Reveal";
import { ChevronIcon } from "../Icons";
import { formatPrice } from "@/lib/format";

// "12 months, 12 drops" — one card per month; swipe, arrows, keyboard or the month circles to move.
export default function MonthDrops({ year, months, startKey }) {
  const startIndex = Math.max(0, months.findIndex((m) => m.key === startKey));
  const [i, setI] = useState(startIndex);
  const rowRef = useRef(null);
  const touch = useRef(null);
  const m = months[i];

  const go = useCallback((n) => setI((cur) => Math.min(months.length - 1, Math.max(0, typeof n === "function" ? n(cur) : n))), [months.length]);
  const prev = () => go((c) => c - 1);
  const next = () => go((c) => c + 1);

  // keep the active month circle centred in the row (scrolls the row only, never the page)
  useEffect(() => {
    const row = rowRef.current;
    const el = row?.querySelector(`[data-key="${m.key}"]`);
    if (!row || !el) return;
    row.scrollTo({ left: el.offsetLeft - row.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [m.key]);

  // warm up the neighbouring months' photos so switching feels instant
  useEffect(() => {
    [months[i - 1], months[i + 1]].forEach((n) => {
      if (n?.featured?.image) {
        const img = new window.Image();
        img.src = n.featured.image;
      }
    });
  }, [i, months]);

  const onKey = (e) => {
    if (e.key === "ArrowLeft") (e.preventDefault(), prev());
    if (e.key === "ArrowRight") (e.preventDefault(), next());
  };
  const onTouchStart = (e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY });
  const onTouchEnd = (e) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? next() : prev();
    touch.current = null;
  };

  if (!m) return null;
  const roundBtn = "flex h-11 w-11 items-center justify-center rounded-full bg-ivory/95 text-ink shadow-md transition hover:bg-ivory disabled:opacity-0";

  return (
    <section aria-labelledby="months-heading" className="overflow-hidden pt-20 md:pt-28">
      <div className="container-x grid grid-cols-[minmax(0,1fr)] items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,440px)] md:gap-16">
        {/* copy */}
        <Reveal className="md:order-1 md:self-end">
          <p className="eyebrow">Har Mahina, Naya Libaas</p>
          <h2 id="months-heading" className="h-display mt-3 text-4xl md:text-6xl">12 Months.<br className="hidden md:block" /> 12 Drops.</h2>
          <p className="mt-4 max-w-md text-[15px] leading-7 text-ink-soft">
            Baromaaz means twelve months. Every month brings one small, handcrafted collection — browse the {year} drops month by month.
          </p>
        </Reveal>

        {/* card */}
        <div
          className="md:order-2 md:row-span-2"
          role="region"
          aria-roledescription="carousel"
          aria-label={`Monthly drops ${year}`}
          tabIndex={0}
          onKeyDown={onKey}
        >
          <article className="overflow-hidden rounded-[28px] bg-ink text-ivory shadow-xl" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div className="flex items-center justify-between px-5 py-4">
              <span className="rounded-full bg-terracotta px-3.5 py-1.5 text-[12px] font-medium uppercase tracking-[0.14em] text-ivory">{m.short} Drop</span>
              <span className="text-sm tracking-wide text-ivory/70" aria-label={`Month ${m.number} of 12`}>{m.number} / 12</span>
            </div>

            <div className="relative aspect-[4/5] overflow-hidden bg-[#2a2420]" aria-live="polite">
              {m.status === "live" ? (
                <Img key={m.key} src={m.featured.image} alt={`${m.featured.name} — ${m.name} ${year} drop`} className="h-full w-full animate-fadeIn object-cover object-top" />
              ) : (
                <div key={m.key} className="flex h-full w-full animate-fadeIn flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_40%,#5a2c1e,#1f1a17_70%)] px-8 text-center">
                  <p className="font-script text-[96px] leading-none text-terracotta-light">{m.number}</p>
                  <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-ivory/70">Coming soon</p>
                  <p className="mt-2 font-serif text-3xl">The {m.name} Drop</p>
                </div>
              )}
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-3">
                <button type="button" onClick={prev} disabled={i === 0} aria-label="Previous month" className={`${roundBtn} rotate-180`}><ChevronIcon /></button>
                <button type="button" onClick={next} disabled={i === months.length - 1} aria-label="Next month" className={roundBtn}><ChevronIcon /></button>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5">
                {m.status === "live" ? (
                  <>
                    <h3 className="font-serif text-[28px] font-semibold leading-tight">{m.featured.name}</h3>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xl font-medium text-terracotta-light">{formatPrice(m.featured.price)}</p>
                      <Link href={`/product/${m.featured.slug}`} className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-terracotta px-5 text-sm font-medium text-ivory transition-colors hover:bg-terracotta-dark">
                        View Details <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                    {m.count === 0 && (
                      <Link href="/shop" className="mt-3 inline-block py-1 text-xs uppercase tracking-[0.14em] text-ivory/85 underline underline-offset-4">
                        Explore the collection
                      </Link>
                    )}
                    {m.count > 1 && (
                      <Link href={`/shop?month=${m.key}`} className="mt-3 inline-block py-1 text-xs uppercase tracking-[0.14em] text-ivory/85 underline underline-offset-4">
                        +{m.count - 1} more from the {m.short.charAt(0) + m.short.slice(1).toLowerCase()} drop
                      </Link>
                    )}
                  </>
                ) : (
                  <a href="#home-newsletter" className="flex min-h-[44px] w-full items-center justify-center rounded-full bg-terracotta px-5 text-sm font-medium text-ivory transition-colors hover:bg-terracotta-dark">
                    Get notified when it drops
                  </a>
                )}
              </div>
            </div>
          </article>
        </div>

        {/* month circles */}
        <div className="md:order-3 md:col-start-1 md:self-start md:pt-4">
          <div className="flex items-center gap-2">
            <button type="button" onClick={prev} disabled={i === 0} aria-label="Previous month" className="flex h-10 w-10 shrink-0 rotate-180 items-center justify-center rounded-full bg-ink text-ivory transition disabled:opacity-30"><ChevronIcon width={18} height={18} /></button>
            <div ref={rowRef} className="no-scrollbar flex min-w-0 flex-1 gap-3 overflow-x-auto px-1 py-2 md:max-w-[400px]" role="group" aria-label="Choose a month">
              {months.map((mo, k) => {
                const active = k === i;
                return (
                  <button key={mo.key} data-key={mo.key} type="button" onClick={() => go(k)} aria-pressed={active} aria-label={`${mo.name}${mo.status === "upcoming" ? " — coming soon" : mo.count ? ` — ${mo.count} ${mo.count === 1 ? "piece" : "pieces"}` : ""}`} className="flex w-[62px] shrink-0 flex-col items-center gap-1.5">
                    <span className={`block overflow-hidden rounded-full transition-all duration-300 ${active ? "h-[60px] w-[60px] ring-[3px] ring-terracotta ring-offset-2 ring-offset-ivory" : "h-[54px] w-[54px] opacity-80 hover:opacity-100"}`}>
                      {mo.status === "live" ? (
                        <Img src={mo.featured.image} alt="" width={200} height={250} className="h-full w-full object-cover object-top" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-ink font-script text-2xl text-terracotta-light">{mo.number}</span>
                      )}
                    </span>
                    <span className={`text-[12px] font-medium tracking-[0.12em] ${active ? "text-terracotta-dark" : "text-ink-muted"}`}>{mo.short}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={next} disabled={i === months.length - 1} aria-label="Next month" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory text-ink shadow-md transition disabled:opacity-30"><ChevronIcon width={18} height={18} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
