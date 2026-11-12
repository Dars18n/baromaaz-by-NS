"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Img from "../Img";
import Reveal from "../Reveal";
import { formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site";

const ACTIVE_AT = 150;   // the gold spot on the ring (degrees; 0 = right, 90 = bottom)
const SPIN_DEG_PER_SEC = 9; // slow continuous spin (one full turn ≈ 40 s)
const JUMP_MS = 900;        // how long a click takes to bring a piece to the gold spot

// "The November Drop" — this month's pieces in a slowly spinning ring of photo circles around a tall card.
// Whichever piece reaches the gold spot is shown in the card; tap/click a circle to bring it there.
export default function MonthlyDrop({ products }) {
  const items = products.slice(0, 12);
  const n = items.length;
  const step = 360 / n;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const boxRef = useRef(null);
  const rot = useRef(ACTIVE_AT);   // current ring angle
  const jump = useRef(null);       // { from, to, start } while animating to a clicked piece
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  // which piece is nearest the gold spot for a given ring angle
  const nearest = useCallback((r) => {
    let best = 0, bestD = 999;
    for (let i = 0; i < n; i++) {
      const d = Math.abs((((r + i * step - ACTIVE_AT) % 360) + 540) % 360 - 180);
      if (d < bestD) (bestD = d), (best = i);
    }
    return best;
  }, [n, step]);

  const apply = useCallback((r) => {
    boxRef.current?.style.setProperty("--rot", `${r}deg`);
    const i = nearest(r);
    setActive((cur) => (cur === i ? cur : i));
  }, [nearest]);

  // the animation loop: spin, or ease to a clicked piece
  useEffect(() => {
    if (n < 2) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf, last = performance.now();
    const tick = (now) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (jump.current) {
        const t = Math.min(1, (now - jump.current.start) / (still ? 1 : JUMP_MS));
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // ease in-out
        rot.current = jump.current.from + (jump.current.to - jump.current.from) * e;
        if (t >= 1) jump.current = null;
        apply(rot.current);
      } else if (!still && !pausedRef.current && !document.hidden) {
        rot.current += (SPIN_DEG_PER_SEC * dt) / 1000;
        apply(rot.current);
      }
      raf = requestAnimationFrame(tick);
    };
    apply(rot.current);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [n, apply]);

  // bring piece i to the gold spot, turning the short way round
  const select = useCallback((i) => {
    const target = ACTIVE_AT - i * step;
    let delta = (target - rot.current) % 360;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    jump.current = { from: rot.current, to: rot.current + delta, start: performance.now() };
  }, [step]);

  if (!n) return null;
  const current = items[active];
  const onKey = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") (e.preventDefault(), select((active + 1) % n));
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") (e.preventDefault(), select((active - 1 + n) % n));
  };
  const R = 40; // ring radius, % of the box
  const pos = (i) => {
    const a = ((i * step) * Math.PI) / 180;
    return { x: 50 + R * Math.cos(a), y: 50 + R * Math.sin(a) };
  };

  return (
    <section aria-labelledby="drop-heading" className="mt-20 overflow-hidden bg-white py-16 md:mt-28 md:py-24">
      <Reveal className="container-x text-center">
        <h2 id="drop-heading" className="h-display text-4xl md:text-6xl">{SITE.drop.name} Drop</h2>
        {SITE.drop.tagline && <p className="mt-3 text-[15px] text-ink-soft md:text-lg">{SITE.drop.tagline}</p>}
      </Reveal>

      <div
        ref={boxRef}
        style={{ "--rot": `${ACTIVE_AT}deg` }}
        className="relative mx-auto mt-8 aspect-square w-[min(100%-1.5rem,720px)] md:mt-12"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setTimeout(() => setPaused(false), 2500)}
        onKeyDown={onKey}
      >
        {/* the turning ring: connector lines + photo circles */}
        <div className="absolute inset-0 [transform:rotate(var(--rot))] [will-change:transform]">
          <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            {items.map((p, i) => {
              const { x, y } = pos(i);
              return <line key={p.slug} x1="50" y1="50" x2={x} y2={y} stroke={i === active ? "#c9a54a" : "#e2d9c6"} strokeWidth="0.25" />;
            })}
          </svg>
          <ul aria-label={`Pieces in the ${SITE.drop.name} drop`}>
            {items.map((p, i) => {
              const { x, y } = pos(i);
              const on = i === active;
              return (
                <li key={p.slug} className="absolute w-[15.5%] -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
                  <button
                    type="button"
                    onClick={() => select(i)}
                    aria-pressed={on}
                    aria-label={`Show ${p.name}`}
                    className={`block aspect-square w-full rounded-full bg-white p-[3px] transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${on ? "scale-[1.14] border-[3px] border-[#c9a54a] shadow-[0_0_0_7px_rgba(201,165,74,0.22)]" : "border-2 border-[#d8ccb2] hover:scale-105 hover:border-[#c9a54a]"}`}
                  >
                    {/* counter-rotate so the photo stays upright while the ring turns */}
                    <span className="block h-full w-full overflow-hidden rounded-full [transform:rotate(calc(var(--rot)*-1))]">
                      <Img src={p.images[0]} alt="" width={200} height={250} className="h-full w-full object-cover object-[50%_20%]" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* centre card (does not turn) */}
        <div className="absolute left-1/2 top-1/2 flex h-[63%] w-[37%] -translate-x-1/2 -translate-y-1/2 flex-col items-center overflow-hidden rounded-full bg-white p-[3.2%] shadow-[0_18px_50px_rgba(31,26,23,0.14)]" aria-live="polite">
          <Link href={`/product/${current.slug}`} className="block min-h-0 w-full flex-1 overflow-hidden rounded-t-full rounded-b-[18px]" tabIndex={-1}>
            <Img key={current.slug} src={current.images[0]} alt={`${current.name} — ${SITE.drop.name} drop`} className="h-full w-full animate-fadeIn object-cover object-top" />
          </Link>
          <div key={`t-${current.slug}`} className="flex w-full animate-fadeIn flex-col items-center px-1 pb-[6%] pt-[5%] text-center">
            <p className="w-full truncate font-serif text-[clamp(0.8rem,2.6vw,1.2rem)] font-semibold leading-tight">{current.name}</p>
            <p className="mt-0.5 text-[clamp(0.72rem,2.2vw,0.95rem)] font-medium text-terracotta-dark">
              {formatPrice(current.price)}
              {current.mrp > current.price && <span className="ml-1.5 text-ink-muted line-through">{formatPrice(current.mrp)}</span>}
            </p>
            <Link href={`/product/${current.slug}`} className="mt-[6%] inline-flex min-h-[30px] items-center rounded-full bg-ink px-[clamp(0.7rem,3vw,1.4rem)] text-[clamp(0.58rem,1.8vw,0.75rem)] font-medium uppercase tracking-[0.1em] text-ivory transition-colors hover:bg-terracotta-dark md:min-h-[36px]">
              View details
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-8 text-center md:mt-10">
        <Link href="/drop" className="btn-outline">Shop the full {SITE.drop.name} drop</Link>
      </p>
    </section>
  );
}
