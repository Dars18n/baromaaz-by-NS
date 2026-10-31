import CartView from "./CartView";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Your Bag", description: "Review the pieces in your Baromaaz bag and check out securely with Razorpay.", path: "/cart", noindex: true });

export default function CartPage() {
  return <CartView />;
}
