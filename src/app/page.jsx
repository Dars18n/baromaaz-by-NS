import Hero from "@/components/home/Hero";
import TrustStrip from "@/components/home/TrustStrip";
import CategoryScroller from "@/components/home/CategoryScroller";
import MonthlyDrop from "@/components/home/MonthlyDrop";
import ProductTabs from "@/components/home/ProductTabs";
import MostWanted from "@/components/home/MostWanted";
import ShopTheLook from "@/components/home/ShopTheLook";
import MonthDrops from "@/components/home/MonthDrops";
import { dropProducts, getLooks, getMonthlyDrops, getProducts, mostWanted, newArrivals } from "@/lib/catalog";

export const revalidate = 60;

export const metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [all, drop, fresh, wanted, looks, monthly] = await Promise.all([getProducts(), dropProducts(), newArrivals(8), mostWanted(8), getLooks(), getMonthlyDrops()]);
  const bySlug = Object.fromEntries(all.map((p) => [p.slug, p]));
  const tabs = [
    { id: "new", label: "New Drops", heading: "New Arrivals", products: fresh, href: "/new-in", cta: "Shop all new in" },
  ];
  // Slim version for the browser: only what the Most Wanted cards need.
  const wantedCards = wanted.map((w) => ({ slug: w.slug, name: w.name, color: w.color, price: w.price, mrp: w.mrp, image: w.images[0], sizes: w.sizes, stock: w.stock }));
  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoryScroller />
      {monthly.months.length > 0 && <MonthDrops year={monthly.year} months={monthly.months} startKey={monthly.startKey} />}
      {drop.length > 0 && <MonthlyDrop products={drop} />}
      {fresh.length > 0 && <ProductTabs tabs={tabs} />}
      {wantedCards.length > 0 && <MostWanted products={wantedCards} />}
      {looks.length > 0 && <ShopTheLook looks={looks} productsBySlug={bySlug} />}
    </>
  );
}
