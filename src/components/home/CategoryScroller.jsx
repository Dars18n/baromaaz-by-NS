import Link from "next/link";
import Img from "../Img";
import Reveal from "../Reveal";
import Scroller from "./Scroller";
import SectionHeading from "./SectionHeading";
import { getCategories, getProducts } from "@/lib/catalog";

export default async function CategoryScroller() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <section aria-labelledby="cat-heading" className="pt-20 md:pt-28">
      <Reveal className="container-x mb-8 flex items-end justify-between gap-6">
        <SectionHeading id="cat-heading" eyebrow="Find your fit" title="Shop Ethnic Wear by Category" />
        <Link href="/shop" className="hidden shrink-0 py-3 text-xs uppercase tracking-[0.18em] underline underline-offset-4 sm:block">View all</Link>
      </Reveal>
      <Scroller label="Categories">
        {categories.filter((c) => c.showOnHome !== false).map((c) => {
          const count = products.filter((p) => p.category === c.slug).length;
          return (
            <Link key={c.slug} href={`/shop/${c.slug}`} className="group w-[62%] shrink-0 snap-start sm:w-[38%] md:w-[28%] lg:w-[22%]">
              <div className="relative aspect-[4/5] overflow-hidden bg-beige">
                <Img src={c.image || `/images/categories/${c.slug}.webp`} alt={`${c.name} by Baromaaz — shop ${count} styles`} className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.06]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 via-45% to-transparent" />
                <div className="absolute inset-x-0 bottom-0 px-3 pb-7 text-center text-ivory md:pb-9">
                  <h3 className="font-serif text-2xl font-medium uppercase tracking-[0.18em] md:text-[2rem]">{c.name}</h3>
                  <p className="sr-only">{count} styles</p>
                </div>
              </div>
            </Link>
          );
        })}
      </Scroller>
    </section>
  );
}
