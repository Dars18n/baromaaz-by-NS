"use client";

import { useRef, useState } from "react";
import Img from "../Img";

export default function Gallery({ images, name, color }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(null); // {x, y} in % while hovering (desktop only)
  const track = useRef(null);
  const alts = [`${name}${color ? ` in ${color.toLowerCase()}` : ""} — front view`, `${name} — alternate view`, `${name} — close-up of fabric and detailing`];

  const goTo = (i) => {
    setActive(i);
    const el = track.current;
    if (el) el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" });
  };
  const onScroll = () => {
    const el = track.current;
    if (el) setActive(Math.round(el.scrollLeft / el.clientWidth));
  };
  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 sm:px-6 md:flex-col md:overflow-visible md:px-0" role="group" aria-label="Product images">
        {images.map((src, i) => (
          <button key={src} type="button" onClick={() => goTo(i)} aria-label={`Show image ${i + 1} of ${images.length}`} aria-current={active === i} className={`w-16 shrink-0 overflow-hidden border transition md:w-20 ${active === i ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"}`}>
            <Img src={src} alt="" className="aspect-[4/5] w-full object-cover" />
          </button>
        ))}
      </div>
      <div className="relative min-w-0 flex-1">
        <div ref={track} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto md:overflow-hidden" aria-live="polite">
          {images.map((src, i) => (
            <div
              key={src}
              className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden bg-beige md:cursor-zoom-in"
              onPointerMove={onMove}
              onPointerLeave={() => setZoom(null)}
            >
              <Img
                src={src}
                alt={alts[i] || `${name} — image ${i + 1}`}
                priority={i === 0}
                className="h-full w-full object-cover transition-transform duration-300 ease-out"
                style={zoom && active === i ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
              />
            </div>
          ))}
        </div>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden" aria-hidden="true">
          {images.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${active === i ? "w-5 bg-ink" : "w-1.5 bg-ink/30"}`} />)}
        </div>
      </div>
    </div>
  );
}
