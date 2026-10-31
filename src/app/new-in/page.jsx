import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import ShopView from "@/components/ShopView";
import { getCategories, newArrivals } from "@/lib/catalog";

export const revalidate = 60;
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "New In — Latest Handcrafted Arrivals",
  description: "The newest arrivals at Baromaaz — fresh kurtis, corsets, dresses and co-ord sets, handcrafted in Maharashtra and added every month.",
  path: "/new-in",
});

export default async function NewInPage() {
  const [products, categories] = await Promise.all([newArrivals(16), getCategories()]);
  return (
    <>
      <PageHeader crumbs={[{ label: "New In" }]} eyebrow="Just landed" title="New In" intro="The latest pieces from our studio, newest first." />
      <Suspense fallback={<div className="container-x min-h-[60vh]" />}>
        <ShopView products={products} categories={categories} defaultSort="newest" />
      </Suspense>
    </>
  );
}
