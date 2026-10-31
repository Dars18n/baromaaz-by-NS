import Hero from "@/components/home/Hero";
import TrustStrip from "@/components/home/TrustStrip";
import CategoryScroller from "@/components/home/CategoryScroller";
import MonthlyDrop from "@/components/home/MonthlyDrop";
import ProductTabs from "@/components/home/ProductTabs";
import ShopTheLook from "@/components/home/ShopTheLook";
import NewsletterBand from "@/components/home/NewsletterBand";
import MonthDrops from "@/components/home/MonthDrops";
import { dropProducts, getLooks, getMonthlyDrops, getProducts, mostWanted, newArrivals } from "@/lib/catalog";

export const revalidate = 60;

export const metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [all, drop, fresh, wanted, looks, monthly] = await Promise.all([getProducts(), dropProducts(), newArrivals(8), mostWanted(8), getLooks(), getMonthlyDrops()]);
  const bySlug = Object.fromEntries(all.map((p) => [p.slug, p]));
  const tabs = [
    { id: "new", label: "New Arrivals", products: fresh, href: "/new-in", cta: "Shop all new in" },
    ...(wanted.length ? [{ id: "wanted", label: "Most Wanted", products: wanted, href: "/shop", cta: "Shop all" }] : []),
  ];
  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoryScroller />
      {monthly.months.length > 0 && <MonthDrops year={monthly.year} months={monthly.months} startKey={monthly.startKey} />}
      {drop.length > 0 && <MonthlyDrop products={drop} />}
      {fresh.length > 0 && <ProductTabs tabs={tabs} />}
      {looks.length > 0 && <ShopTheLook looks={looks} productsBySlug={bySlug} />}
      <NewsletterBand />
    </>
  );
}
