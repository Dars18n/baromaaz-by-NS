import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import ShopView from "@/components/ShopView";
import { dropProducts, getCategories } from "@/lib/catalog";

export const revalidate = 60;
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMeta({
  title: `${SITE.drop.name} Edit — ${SITE.drop.month} Festive Ethnic Wear Drop`,
  description: `${SITE.drop.blurb} Shop the Baromaaz ${SITE.drop.month} drop.`,
  path: "/drop",
});

export default async function DropPage() {
  const [products, categories] = await Promise.all([dropProducts(), getCategories()]);
  return (
    <>
      <PageHeader crumbs={[{ label: "This Month's Drop" }]} eyebrow={`Monthly Drop · ${SITE.drop.month}`} title={`The ${SITE.drop.name} Drop`} intro={SITE.drop.blurb} />
      <Suspense fallback={<div className="container-x min-h-[60vh]" />}>
        <ShopView products={products} categories={categories} />
      </Suspense>
    </>
  );
}
