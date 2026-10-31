import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import ShopView from "@/components/ShopView";
import { getCategories, getProducts } from "@/lib/catalog";

export const revalidate = 60;
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Shop All — Kurtis, Corsets, Co-ord Sets & Festive Wear",
  description: "Shop the full Baromaaz collection: handcrafted kurtis, tops, corsets, dresses, co-ord sets and festive wear from ₹599. Made in Maharashtra in premium fabrics.",
  path: "/shop",
});

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return (
    <>
      <PageHeader crumbs={[{ label: "Shop" }]} eyebrow="The collection" title="Shop All" intro="Every piece is cut, stitched and finished by hand in small batches. Filter by category, size and price to find yours." />
      <Suspense fallback={<div className="container-x min-h-[60vh]" />}>
        <ShopView products={products} categories={categories} />
      </Suspense>
    </>
  );
}
