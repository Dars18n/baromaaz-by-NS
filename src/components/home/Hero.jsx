import Link from "next/link";
import { SITE } from "@/lib/site";
import Logo from "../Logo";
import Fireworks from "./Fireworks";

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem-env(safe-area-inset-bottom)-var(--cobar))] items-end md:min-h-[100svh] overflow-hidden bg-[#5a2c1e] text-ivory">
      {/* Phones (under 768px) get the portrait photo; tablets and computers get the three-women photo. */}
      <picture>
        <source media="(max-width: 767px)" srcSet="/images/hero/hero-phone.webp" width="1000" height="1379" />
        <img
          src="/images/hero/hero-courtyard.webp"
          width="1672"
          height="941"
          alt="Women wearing Baromaaz handcrafted ethnic-fusion outfits — embroidered kurtas, floral prints and an anarkali with dupatta"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-10 h-full w-full animate-fadeIn object-cover object-[60%_center] md:object-[center_30%]"
        />
      </picture>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 from-5% via-black/20 via-55% to-black/10 md:from-black/85 md:from-10% md:via-black/45 md:via-50% md:to-black/35" />
      {SITE.festive?.diwali && <Fireworks />}
      <div aria-hidden="true" className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-black/50 via-black/10 via-50% to-transparent md:block" />
      <div className="container-x pb-14 pt-32 md:pb-16">
        <div className="max-w-xl">
          <p className="animate-fadeUp text-[11px] uppercase tracking-[0.3em] text-ivory/90">{SITE.drop.month} · The {SITE.drop.name} Drop</p>
          <p className="mt-6 animate-fadeUp text-ivory [animation-delay:120ms]" aria-hidden="true"><Logo className="text-[26px] md:text-[34px]" /></p>
          <h1 className="h-display mt-2 animate-fadeUp text-[3.1rem] [animation-delay:200ms] sm:text-6xl md:text-7xl">
            Har Mahina,<br /><em className="font-medium">Naya Libaas</em>
          </h1>
          <p className="mt-5 max-w-md animate-fadeUp text-[15px] leading-7 text-ivory/90 [animation-delay:320ms] md:text-base">
            One small, handcrafted collection every month — made in Maharashtra, in premium fabrics, never mass-produced.
          </p>
          <div className="mt-8 flex animate-fadeUp flex-wrap gap-3 [animation-delay:420ms]">
            <Link href="/shop" className="btn-light">Explore the collection</Link>
            <Link href="/drop" className="btn border border-ivory/70 text-ivory hover:bg-ivory hover:text-ink">This month&rsquo;s drop</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
