import Link from "next/link";
import PolicyPage from "@/components/PolicyPage";
import { pageMeta } from "@/lib/seo";
import { SITE, formatAddress } from "@/lib/site";

const path = "/terms-of-service";
export const metadata = pageMeta({ title: "Terms of Service", description: "The terms that apply when you browse and buy from the Baromaaz website.", path });

export default function Page() {
  return (
    <PolicyPage title="Terms of Service" path={path} intro="Please read these terms before placing an order.">
      <h2>About us</h2>
      <p>This website is owned and operated by {SITE.legal.entity}, {formatAddress()}. GSTIN: {SITE.legal.gstin}. By using the website or placing an order, you agree to these terms.</p>
      <h2>Products & pricing</h2>
      <ul>
        <li>All prices are in Indian Rupees (₹) and include GST. The MRP and any discount are shown on each product page.</li>
        <li>Our pieces are handcrafted, so colours, prints and embroidery may vary slightly from the photographs and from piece to piece.</li>
        <li>Monthly Drop collections are made in limited quantities and may sell out. We reserve the right to limit quantities per customer.</li>
        <li>If a product is listed at an incorrect price due to an error, we may cancel the order and refund you in full.</li>
      </ul>
      <h2>Orders & payment</h2>
      <p>An order is confirmed once payment is successfully received through Razorpay. We may cancel an order if a product is unavailable, if payment verification fails, or if we suspect fraud; any amount paid will be refunded to the original payment method.</p>
      <h2>Shipping, returns & exchanges</h2>
      <p>Delivery is governed by our <Link href="/shipping-policy">Shipping Policy</Link> and returns by our <Link href="/returns-exchange-policy">Returns &amp; Exchange Policy</Link>.</p>
      <h2>Your account</h2>
      <p>You&rsquo;re responsible for keeping your details accurate and for activity on your device. Please don&rsquo;t misuse the website, attempt to disrupt it, or use it for any unlawful purpose.</p>
      <h2>Intellectual property</h2>
      <p>All designs, photographs, text, logos and the Baromaaz name are our property or used with permission, and may not be copied or used commercially without our written consent.</p>
      <h2>Reviews</h2>
      <p>Reviews are published only from verified buyers. By submitting a review or photo, you allow us to display it on the website and our social channels with your first name and city.</p>
      <h2>Limitation of liability</h2>
      <p>To the extent permitted by law, our liability for any claim relating to a product is limited to the price you paid for it.</p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India, and courts at {SITE.address.city}, {SITE.address.state} have exclusive jurisdiction. Complaints can be raised with our <Link href="/grievance-officer">Grievance Officer</Link>.</p>
    </PolicyPage>
  );
}
