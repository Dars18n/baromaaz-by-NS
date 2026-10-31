import Link from "next/link";
import Img from "@/components/Img";
import Reveal from "@/components/Reveal";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMeta({
  title: "Our Story — Twelve Months, Twelve Collections",
  description: "Baromaaz means 'twelve months'. Meet the Maharashtra studio making one small, handcrafted ethnic-fusion collection every month in premium Indian fabrics.",
  path: "/about",
});

const values = [
  { t: "Twelve drops a year", d: "Baromaaz comes from baramaasa — the twelve months. Every month we release one small collection, made in limited numbers and never restocked in the same fabric." },
  { t: "Handcrafted, honestly", d: "Every piece is cut, stitched and finished by hand by our karigars in Maharashtra, paid fairly and credited proudly. Slight irregularities are the signature of handwork." },
  { t: "Fabric first", d: "Mul cotton, chanderi, handloom, Banarasi brocade, natural-dye ajrakh — we source directly from weaving clusters across India and design around what the loom gives us." },
  { t: "Made to be worn", d: "Ethnic roots, today's silhouettes. Corsets that go with sarees, kurtis that go with denim, co-ords that go everywhere." },
];

export default function AboutPage() {
  return (
    <>
      <section className="container-x grid items-center gap-10 pt-8 md:grid-cols-2 md:gap-16 md:pt-14">
        <div>
          <p className="eyebrow">Our story</p>
          <h1 className="h-display mt-3 text-5xl md:text-7xl">Twelve months.<br /><em>Twelve stories.</em></h1>
          <p className="mt-6 text-[16px] leading-8 text-ink-soft">Baromaaz began at a dining table in {SITE.address.city} with a pile of old Paithani borders and a simple question: why does Indian craft only come out for weddings? We wanted pieces a 22-year-old would wear to college on Monday and to a sangeet on Saturday.</p>
          <p className="mt-4 text-[16px] leading-8 text-ink-soft">So we built a label around the calendar. <strong className="font-medium text-ink">{SITE.tagline}</strong> — every month, a new collection, inspired by the season, a festival or a weave, made in small numbers by hand in {SITE.address.state}.</p>
        </div>
        <Reveal className="overflow-hidden rounded-t-full bg-beige">
          <Img src="/images/about/studio.webp" alt="A Baromaaz chikankari kurti photographed in the Pune studio" priority className="aspect-[4/5] w-full object-cover" />
        </Reveal>
      </section>

      <section aria-labelledby="values-heading" className="container-x pt-20 md:pt-28">
        <h2 id="values-heading" className="h-display text-4xl md:text-5xl">What we believe</h2>
        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.t} delay={i * 100} className="border-t border-ink/20 pt-6">
              <p className="font-serif text-4xl text-terracotta-dark">0{i + 1}</p>
              <h3 className="mt-3 font-serif text-2xl">{v.t}</h3>
              <p className="mt-2 text-[15px] leading-7 text-ink-soft">{v.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x grid items-center gap-10 pt-20 md:grid-cols-2 md:gap-16 md:pt-28">
        <Reveal className="order-2 md:order-1"><Img src="/images/about/fabrics.webp" alt="Swatches of block-printed, brocade and handloom fabrics used by Baromaaz" className="aspect-[4/5] w-full object-cover" /></Reveal>
        <div className="order-1 md:order-2">
          <p className="eyebrow">The studio</p>
          <h2 className="h-display mt-3 text-4xl md:text-5xl">From loom to you, in small batches</h2>
          <p className="mt-5 text-[16px] leading-8 text-ink-soft">Our studio in {SITE.address.city} is home to a small team of tailors, embroiderers and finishers. We cut only what we can make well — usually a few dozen pieces per style — so nothing ends up in a landfill and every piece gets a second look before it reaches you.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/drop" className="btn-dark">Shop this month&rsquo;s drop</Link><Link href="/contact" className="btn-outline">Visit the studio</Link></div>
        </div>
      </section>
    </>
  );
}
