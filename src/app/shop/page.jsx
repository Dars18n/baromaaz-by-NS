import { redirect } from "next/navigation";

export const revalidate = 60;

export default function ShopPage() {
  redirect("/drop");
}
