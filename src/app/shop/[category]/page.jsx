import { redirect } from "next/navigation";

// /shop/kurtis → "Shop all", filtered to that category.
export default async function CategoryPage({ params }) {
  const { category } = await params;
  redirect(`/new-in?category=${encodeURIComponent(category)}`);
}
