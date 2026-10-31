import CheckoutView from "./CheckoutView";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Secure Checkout", description: "Complete your Baromaaz order securely with Razorpay — UPI, cards, netbanking and wallets.", path: "/checkout", noindex: true });

export default function CheckoutPage() {
  return <CheckoutView />;
}
