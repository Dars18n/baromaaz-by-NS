import { redirect } from "next/navigation";

// Old /shop links (and filters like ?month=2026-05) → the full collection on "Shop all".
export default async function ShopPage({ searchParams }) {
  const qs = new URLSearchParams(await searchParams).toString();
  redirect(`/new-in${qs ? `?${qs}` : ""}`);
}
