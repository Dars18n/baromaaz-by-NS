import Link from "next/link";
import { SITE } from "@/lib/site";
import Logo from "../Logo";
import Fireworks from "./Fireworks";

export default function Hero() {
  return (
    <section className="relative isolate flex flex-col overflow-hidden bg-ink pt-[100px] text-ivory md:min-h-[100svh] md:justify-end md:pt-[116px]">
      <img
        src="/images/hero/hero-november.webp"
        width="1350"
        height="768"
        alt="Three women wearing Baromaaz outfits seated against a warm-toned wall"
        fetchPriority="high"
        decoding="async"
        className="relative z-0 block h-auto w-full shrink-0 animate-fadeIn"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/80 from-5% via-black/25 via-55% to-black/10 md:from-black/80 md:from-5% md:via-black/30 md:via-55% md:to-black/10" />
      {SITE.festive?.diwali && <Fireworks />}
      <div className="container-x relative z-20 mt-auto bg-ink pb-10 pt-8 md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:bg-transparent md:pb-16 md:pt-36">
        <div className="max-w-xl">
          <p className="animate-fadeUp text-[11px] uppercase tracking-[0.3em] text-ivory/90">Handcrafted Indian Ethnic Wear · {SITE.drop.month} · The {SITE.drop.name} Drop</p>
          <p className="mt-6 animate-fadeUp text-ivory [animation-delay:120ms]" aria-hidden="true"><Logo className="text-[45.5px] md:text-[59.5px]" /></p>
          <h1 className="h-display mt-2 animate-fadeUp text-[3.1rem] [animation-delay:200ms] sm:text-6xl md:text-7xl">
            <span className="sr-only">Baromaaz — handcrafted Indian ethnic wear online: kurtis, corsets, co-ord sets &amp; festive wear. </span>Har Mahina,<br /><em className="font-medium">Naya Libaas</em>
          </h1>
          <p className="mt-5 max-w-md animate-fadeUp text-[15px] leading-7 text-ivory/90 [animation-delay:320ms] md:text-base">
            One small, handcrafted ethnic and Indo-western collection every month — kurtis, corsets, co-ord sets and festive wear made in Jaipur, in premium fabrics.
          </p>
          <div className="mt-8 flex animate-fadeUp flex-wrap gap-3 [animation-delay:420ms]">
            <Link href="/drop" className="btn-light">Explore the collection</Link>
            <Link href="/new-in" className="btn border border-ivory/70 text-ivory hover:bg-ivory hover:text-ink">Shop all</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
