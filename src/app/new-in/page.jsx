import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import ShopView from "@/components/ShopView";
import { byNewest, getCategories, getProducts } from "@/lib/catalog";

export const revalidate = 60;
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Shop All — Latest Kurtis, Corsets & Ethnic Wear",
  description: "Shop the newest handcrafted Indian ethnic wear: fresh kurtis, corsets, dresses and co-ord sets from Baromaaz, with new arrivals every month.",
  path: "/new-in",
});

export default async function NewInPage() {
  // every piece in the collection, newest first (filters and sorting on the page)
  const [all, categories] = await Promise.all([getProducts(), getCategories()]);
  const products = byNewest(all);
  return (
    <>
      <PageHeader crumbs={[{ label: "Shop all" }]} eyebrow="Just landed" title="Shop all" intro="Every piece in our collection, newest first." />
      <Suspense fallback={<div className="container-x min-h-[60vh]" />}>
        <ShopView products={products} categories={categories} defaultSort="newest" />
      </Suspense>
    </>
  );
}
