import Link from "next/link";
import { SITE } from "@/lib/site";
import Logo from "../Logo";
import Fireworks from "./Fireworks";

const PHOTO = "/images/hero/hero-november.webp";
const ALT = "Three women wearing Baromaaz outfits seated against a warm-toned wall";

// Computers/tablets: full-screen photo with a soft dark overlay, text centred on top.
// Phones: the whole photo (all three women, uncropped) over a blurred copy of itself that fills the screen,
// with the text underneath. Every image here is the same file, so it downloads only once.
export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem-env(safe-area-inset-bottom)-var(--cobar))] flex-col items-center justify-center overflow-hidden bg-ink text-ivory md:min-h-[100svh]">
      {/* phones: blurred fill behind everything */}
      <img
        src={PHOTO}
        width="1350"
        height="768"
        alt=""
        aria-hidden="true"
        decoding="async"
        className="absolute inset-0 -z-20 h-full w-full scale-125 object-cover blur-2xl md:hidden"
      />
      {/* tablets & computers: sharp full-bleed photo */}
      <img
        src={PHOTO}
        width="1350"
        height="768"
        alt={ALT}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 -z-10 hidden h-full w-full animate-fadeIn object-cover object-[50%_18%] md:block"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/50 md:bg-black/45" />
      {SITE.festive?.diwali && <Fireworks />}

      {/* phones: the whole photo, top and bottom edges fading into the blurred background */}
      <div className="relative z-10 mt-[92px] w-full md:hidden">
        <img
          src={PHOTO}
          width="1350"
          height="768"
          alt={ALT}
          fetchPriority="high"
          decoding="async"
          className="block h-auto w-full animate-fadeIn [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_86%,transparent)]"
        />
      </div>

      <div className="relative z-20 flex w-full flex-col items-center px-5 pb-10 pt-6 text-center md:pb-12 md:pt-[116px]">
        <h1 className="animate-fadeUp whitespace-nowrap font-serif text-[clamp(1.75rem,8.4vw,2.6rem)] font-normal leading-[1.05] tracking-[0.005em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.35)] sm:text-[3.4rem] md:text-[clamp(3.75rem,4.3vw,5.25rem)]">
          <span className="sr-only">Baromaaz — handcrafted Indian ethnic wear online: kurtis, corsets, co-ord sets &amp; festive wear. </span>
          Har mahina, Naya libaas
        </h1>
        <p className="mt-5 animate-fadeUp text-white [animation-delay:150ms] md:mt-8" aria-hidden="true">
          <Logo className="text-[clamp(2.4rem,11vw,4.5rem)] md:text-[clamp(4.5rem,6.2vw,7.5rem)]" />
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex min-h-[52px] animate-fadeUp items-center justify-center rounded-full border border-white/80 bg-black/35 px-9 text-[17px] font-medium tracking-[0.01em] text-white backdrop-blur-[2px] transition-colors duration-300 [animation-delay:300ms] hover:bg-white hover:text-ink md:mt-12 md:min-h-[60px] md:px-12 md:text-xl"
        >
          Explore our collection
        </Link>
        <Link
          href="/drop"
          className="mt-4 inline-flex min-h-[46px] animate-fadeUp items-center justify-center gap-2.5 rounded-full border border-[#e0a77d]/70 bg-[#6b3a22]/75 px-7 text-[16px] font-medium text-white backdrop-blur-[2px] transition-colors duration-300 [animation-delay:380ms] hover:bg-[#86432b] md:mt-5 md:min-h-[52px] md:px-9 md:text-lg"
        >
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#e0a77d]" />
          {SITE.drop.name} Drop
        </Link>
      </div>
    </section>
  );
}
