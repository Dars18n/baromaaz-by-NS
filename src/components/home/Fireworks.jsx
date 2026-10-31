"use client";

import { useEffect, useRef } from "react";

// Diwali fireworks drawn on a transparent canvas behind the hero text.
// - Opening show for a few seconds, then an occasional burst while the hero is visible
// - Stops completely after `durationMs` to save battery
// - Skipped entirely for visitors who prefer reduced motion
const COLORS = ["#ffd27a", "#f6b042", "#ff9a3c", "#ffe9b8", "#e8603c", "#fff4d6", "#f2c14e"];

export default function Fireworks({ durationMs = 60000 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    const phone = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const SPARKS = phone ? 54 : 90;
    let w = 0, h = 0;
    let rockets = [];
    let sparks = [];
    let flashes = [];
    let raf = 0;
    let visible = true;
    let running = true;
    const start = performance.now();
    let nextLaunch = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const rand = (a, b) => a + Math.random() * (b - a);

    const launch = () => {
      rockets.push({
        x: phone ? rand(w * 0.15, w * 0.85) : rand(w * 0.35, w * 0.92), // desktop: away from the text on the left
        y: h + 10,
        vy: -rand(h * 0.016, h * 0.02),
        targetY: phone ? rand(h * 0.14, h * 0.32) : rand(h * 0.12, h * 0.42), // stay above the text
        color: COLORS[(Math.random() * COLORS.length) | 0],
      });
    };

    const explode = (x, y, color) => {
      flashes.push({ x, y, r: phone ? 46 : 70, life: 1 });
      const second = COLORS[(Math.random() * COLORS.length) | 0];
      const speed = rand(3.6, 5.4) * (phone ? 0.8 : 1);
      for (let i = 0; i < SPARKS; i++) {
        const a = (Math.PI * 2 * i) / SPARKS + rand(-0.05, 0.05);
        const v = speed * rand(0.55, 1);
        sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, decay: rand(0.009, 0.015), color: i % 3 ? color : second, size: rand(1.6, 2.8), twinkle: Math.random() < 0.35 });
      }
    };

    const frame = (t) => {
      if (!running) return;
      const elapsed = t - start;

      // fade previous frame for soft trails, keeping the canvas transparent
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      // schedule: busy opening show (first 6s), then a burst every few seconds
      if (visible && elapsed < durationMs && t > nextLaunch) {
        launch();
        if (elapsed < 600) launch(), launch(); // opening salvo of three
        nextLaunch = t + (elapsed < 7000 ? rand(280, 560) : rand(1800, 3200));
      }

      rockets = rockets.filter((r) => {
        r.y += r.vy;
        r.vy *= 0.975;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        if (r.y <= r.targetY || r.vy > -1.2) {
          explode(r.x, r.y, r.color);
          return false;
        }
        return true;
      });

      flashes = flashes.filter((f) => {
        f.life -= 0.08;
        if (f.life <= 0) return false;
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
        g.addColorStop(0, `rgba(255,226,170,${0.3 * f.life})`);
        g.addColorStop(1, "rgba(255,200,120,0)");
        ctx.fillStyle = g;
        ctx.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
        return true;
      });

      sparks = sparks.filter((s) => {
        s.vx *= 0.985;
        s.vy = s.vy * 0.985 + 0.035; // gravity
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;
        if (s.life <= 0) return false;
        ctx.globalAlpha = Math.max(s.life, 0) * 0.8 * (s.twinkle && Math.random() < 0.3 ? 0.25 : 1);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (0.6 + s.life * 0.6), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        return true;
      });

      // stop once the show is over and the last sparks have faded
      if (elapsed > durationMs && !rockets.length && !sparks.length && !flashes.length) {
        ctx.clearRect(0, 0, w, h);
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // only launch new rockets while the hero is on screen and the tab is open
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting && !document.hidden));
    io.observe(canvas);
    const onVis = () => (visible = !document.hidden);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", resize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
    };
  }, [durationMs]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-[5] h-full w-full" />;
}
