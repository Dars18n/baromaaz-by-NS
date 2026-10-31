"use client";
import { useRef } from "react";
import { ChevronIcon } from "../Icons";

// Horizontal scroll-snap row with desktop arrow buttons. Scrolls inside its own box, never the page.
export default function Scroller({ children, label, className = "" }) {
  const ref = useRef(null);
  const go = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <div className={`relative ${className}`}>
      <div ref={ref} role="region" aria-label={label} tabIndex={0} className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 sm:gap-5 sm:px-6 lg:px-10 [scroll-padding-inline:1rem] sm:[scroll-padding-inline:1.5rem] lg:[scroll-padding-inline:2.5rem]">
        {children}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-3 md:flex">
        <button type="button" onClick={() => go(-1)} aria-label={`Scroll ${label} left`} className="pointer-events-auto flex h-11 w-11 rotate-180 items-center justify-center rounded-full bg-ivory/95 shadow-md transition hover:bg-ink hover:text-ivory"><ChevronIcon /></button>
        <button type="button" onClick={() => go(1)} aria-label={`Scroll ${label} right`} className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-ivory/95 shadow-md transition hover:bg-ink hover:text-ivory"><ChevronIcon /></button>
      </div>
    </div>
  );
}
