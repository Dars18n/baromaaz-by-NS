import Link from "next/link";
import { SITE } from "@/lib/site";
import Logo from "../Logo";
import Fireworks from "./Fireworks";

// Same photo in two sizes; the browser downloads only the one it needs (once).
const SRC = "/images/hero/hero-trio.webp";
const SRCSET = "/images/hero/hero-trio-960.webp 960w, /images/hero/hero-trio.webp 1815w";
const ALT = "Three women in Baromaaz outfits — a striped jumpsuit, a red block-print cami and a black floral dress — seated against a warm wall";
const photo = { src: SRC, srcSet: SRCSET, sizes: "100vw", width: 1815, height: 867, decoding: "async" };

// Layout depends on the screen's shape (see .hero-wide / .hero-tall in globals.css):
//  • wide screens: photo fills the screen, faces kept in view, text centred on top
//  • tall screens (phones): the whole photo, uncropped, over a blurred copy that fills the screen; text below
export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem-env(safe-area-inset-bottom)-var(--cobar))] flex-col items-center justify-center overflow-hidden bg-ink text-ivory md:min-h-[100svh]">
      {/* wide screens: full-bleed photo */}
      <img {...photo} alt={ALT} fetchPriority="high" className="hero-wide absolute inset-0 -z-10 h-full w-full animate-fadeIn object-cover object-[50%_22%]" />
      {/* tall screens: blurred fill behind everything */}
      <img {...photo} alt="" aria-hidden="true" className="hero-tall absolute inset-0 -z-20 h-full w-full scale-125 object-cover blur-2xl" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/45" />
      {SITE.festive?.diwali && <Fireworks />}

      {/* tall screens: the whole photo, top and bottom edges fading into the blurred background */}
      <div className="hero-tall relative z-10 mt-[92px] w-full md:mt-[116px]">
        <img {...photo} alt={ALT} fetchPriority="high" className="block h-auto w-full animate-fadeIn [mask-image:linear-gradient(to_bottom,transparent,black_9%,black_86%,transparent)]" />
      </div>

      <div className="hero-content relative z-20 flex w-full flex-col items-center px-5 pb-10 text-center md:pb-12">
        <h1 className="animate-fadeUp whitespace-nowrap font-serif text-[clamp(1.75rem,8.4vw,2.6rem)] font-normal leading-[1.05] tracking-[0.005em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.4)] sm:text-[3.4rem] md:text-[clamp(1.9rem,min(4.3vw,8.5vh),5.25rem)]">
          <span className="sr-only">Baromaaz — handcrafted Indian ethnic wear online: kurtis, corsets, co-ord sets &amp; festive wear. </span>
          Har mahina, Naya libaas
        </h1>
        <p className="mt-5 animate-fadeUp text-white [animation-delay:150ms] md:mt-[min(2rem,3.5vh)]" aria-hidden="true">
          <Logo className="text-[clamp(2.4rem,11vw,4.5rem)] md:text-[clamp(2.2rem,min(6.2vw,12.5vh),7.5rem)]" />
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex min-h-[52px] animate-fadeUp items-center justify-center rounded-full border border-white/80 bg-black/35 px-9 text-[17px] font-medium tracking-[0.01em] text-white backdrop-blur-[2px] transition-colors duration-300 [animation-delay:300ms] hover:bg-white hover:text-ink md:mt-[min(3rem,5vh)] md:min-h-[58px] md:px-12 md:text-xl"
        >
          Explore our collection
        </Link>
        <Link
          href="/drop"
          className="mt-4 inline-flex min-h-[46px] animate-fadeUp items-center justify-center gap-2.5 rounded-full border border-[#e0a77d]/70 bg-[#6b3a22]/75 px-7 text-[16px] font-medium text-white backdrop-blur-[2px] transition-colors duration-300 [animation-delay:380ms] hover:bg-[#86432b] md:min-h-[50px] md:px-9 md:text-lg"
        >
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#e0a77d]" />
          {SITE.drop.name} Drop
        </Link>
      </div>
    </section>
  );
}
