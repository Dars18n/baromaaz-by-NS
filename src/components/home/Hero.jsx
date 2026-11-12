import Link from "next/link";
import { SITE } from "@/lib/site";
import Logo from "../Logo";
import Fireworks from "./Fireworks";

const ALT = "Three women in Baromaaz outfits — a striped jumpsuit, a red block-print cami and a black floral dress — seated against a warm wall";
// Must match the "wide" breakpoint in globals.css (.hero-*): tall screens get the tall photo.
const TALL = "(max-aspect-ratio: 1249/1000)";

// Wide screens: wide photo filling the screen, text centred on top.
// Tall screens (phones, upright tablets): tall photo filling the screen — all three women in full —
// with the tagline + logo on the wall above their faces and the buttons at the bottom.
export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem-env(safe-area-inset-bottom)-var(--cobar))] flex-col items-center justify-center overflow-hidden bg-ink text-ivory md:min-h-[100svh]">
      <picture>
        <source media={TALL} srcSet="/images/hero/hero-trio-phone-720.webp 720w, /images/hero/hero-trio-phone.webp 941w" sizes="100vw" width="941" height="1672" />
        <img
          src="/images/hero/hero-trio.webp"
          srcSet="/images/hero/hero-trio-960.webp 960w, /images/hero/hero-trio.webp 1815w"
          sizes="100vw"
          width="1815"
          height="867"
          alt={ALT}
          fetchPriority="high"
          decoding="async"
          className="hero-photo absolute inset-0 -z-10 h-full w-full animate-fadeIn object-cover"
        />
      </picture>
      <div aria-hidden="true" className="hero-shade absolute inset-0 -z-10" />
      {SITE.festive?.diwali && <Fireworks />}

      <div className="hero-content relative z-20 flex w-full flex-col items-center px-5 text-center">
        <div className="hero-mid flex flex-col items-center">
          <h1 className="animate-fadeUp whitespace-nowrap font-serif text-[clamp(1.75rem,8.4vw,2.6rem)] font-normal leading-[1.05] tracking-[0.005em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.45)] sm:text-[3.4rem] md:text-[clamp(1.9rem,min(4.3vw,8.5vh),5.25rem)]">
            <span className="sr-only">Baromaaz — handcrafted Indian ethnic wear online: kurtis, corsets, co-ord sets &amp; festive wear. </span>
            Har mahina, Naya libaas
          </h1>
          <p className="mt-3 animate-fadeUp text-white [animation-delay:150ms] md:mt-[min(2rem,3.5vh)]" aria-hidden="true">
            <Logo className="text-[clamp(2.2rem,10vw,4.5rem)] [filter:drop-shadow(0_2px_12px_rgba(0,0,0,0.35))] md:text-[clamp(2.2rem,min(6.2vw,12.5vh),7.5rem)]" />
          </p>
        </div>

        <div className="hero-buttons flex flex-col items-center">
          <Link
            href="/shop"
            className="inline-flex min-h-[52px] animate-fadeUp items-center justify-center rounded-full border border-white/80 bg-black/35 px-9 text-[17px] font-medium tracking-[0.01em] text-white backdrop-blur-[2px] transition-colors duration-300 [animation-delay:300ms] hover:bg-white hover:text-ink md:min-h-[58px] md:px-12 md:text-xl"
          >
            Explore our collection
          </Link>
          <Link
            href="/drop"
            className="mt-3.5 inline-flex min-h-[46px] animate-fadeUp items-center justify-center gap-2.5 rounded-full border border-[#e0a77d]/70 bg-[#6b3a22]/80 px-7 text-[16px] font-medium text-white backdrop-blur-[2px] transition-colors duration-300 [animation-delay:380ms] hover:bg-[#86432b] md:mt-4 md:min-h-[50px] md:px-9 md:text-lg"
          >
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#e0a77d]" />
            {SITE.drop.name} Drop
          </Link>
        </div>
      </div>
    </section>
  );
}
