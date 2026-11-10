import { redirect } from "next/navigation";

export const revalidate = 60;

export default function CategoryPage() {
  redirect("/drop");
}
