import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import ShopView from "@/components/ShopView";
import { getCategories, getProducts } from "@/lib/catalog";

export const revalidate = 60;
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Shop Indian Ethnic Wear — Kurtis, Corsets & Co-ords",
  description: "Shop handcrafted Indian ethnic wear online: kurtis, tops, corsets, dresses, co-ord sets & festive wear from ₹599. Indo-western fashion made in Maharashtra.",
  path: "/shop",
});

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return (
    <>
      <PageHeader crumbs={[{ label: "Shop" }]} eyebrow="The collection" title="Shop All Ethnic Wear" intro="Every piece is cut, stitched and finished by hand in small batches. Filter by category, size and price to find yours." />
      <Suspense fallback={<div className="container-x min-h-[60vh]" />}>
        <ShopView products={products} categories={categories} />
      </Suspense>
    </>
  );
}
