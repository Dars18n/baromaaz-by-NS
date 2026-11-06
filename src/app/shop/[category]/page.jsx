import { Suspense } from "react";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ShopView from "@/components/ShopView";
import { getCategories, getCategory, getProducts } from "@/lib/catalog";

export const revalidate = 60;
import { pageMeta } from "@/lib/seo";

const intros = {
  tops: "Easy, hand-printed tops in breathable cottons — for college, cafés and everything in between.",
  kurtis: "Chikankari, bandhani and handloom kurtis with a modern cut. Pair with denim or palazzos.",
  corsets: "Structured corsets in brocade, ajrakh and sequins — wear with a saree, skirt or jeans.",
  dresses: "Tiered maxis, wrap dresses and linen midis in warm, earthy tones.",
  "co-ord-sets": "Matching sets that do the styling for you — from Paithani-edge to breezy kaftans.",
  festive: "Lehengas, anarkalis and mirror-work for haldi, mehendi, Diwali and every celebration.",
};

export const dynamicParams = true;
export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const c = await getCategory(category);
  if (!c) return {};
  const prices = (await getProducts()).filter((p) => p.category === c.slug).map((p) => p.price);
  return pageMeta({
    title: `Buy ${c.name} for Women Online — Handcrafted Ethnic Wear`,
    description: `${intros[c.slug] || `Handcrafted ${c.name.toLowerCase()} by Baromaaz.`}${prices.length ? ` Shop Baromaaz ${c.name.toLowerCase()} from ₹${Math.min(...prices).toLocaleString("en-IN")}.` : ""}`,
    path: `/shop/${c.slug}`,
  });
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const c = await getCategory(category);
  if (!c) notFound();
  const products = (await getProducts()).filter((p) => p.category === c.slug);
  return (
    <>
      <PageHeader crumbs={[{ label: "Shop", href: "/shop" }, { label: c.name }]} eyebrow="Shop by category" title={`${c.name} for Women`} intro={intros[c.slug]} />
      <Suspense fallback={<div className="container-x min-h-[60vh]" />}>
        <ShopView products={products} lockedCategory={c.slug} />
      </Suspense>
    </>
  );
}
