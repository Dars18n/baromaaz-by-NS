import Link from "next/link";
import PolicyPage from "@/components/PolicyPage";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

const path = "/returns-exchange-policy";
export const metadata = pageMeta({ title: "Returns & Exchange Policy", description: "Return or exchange unworn Baromaaz pieces within 7 days of delivery. Free size exchanges, refunds to your original payment method.", path });

export default function Page() {
  return (
    <PolicyPage title="Returns & Exchange Policy" path={path} intro="We want you to love what you wear. If something isn't right, here's how we'll make it right.">
      <h2>7-day window</h2>
      <p>You can request a return or exchange within 7 days of delivery. Request one from <Link href="/account?tab=returns">My Account → Returns &amp; exchanges</Link>, on WhatsApp at {SITE.whatsapp}, or by email at <a href={`mailto:${SITE.email}`}>{SITE.email}</a> with your order number.</p>
      <h2>Eligibility</h2>
      <ul>
        <li>Pieces must be unworn, unwashed and unaltered, with all original tags and packaging.</li>
        <li>Customised or altered pieces, and items marked &ldquo;Final sale&rdquo;, can&rsquo;t be returned — but we&rsquo;ll always fix a manufacturing defect.</li>
        <li>For hygiene reasons, accessories worn close to the body cannot be returned.</li>
      </ul>
      <h2>Exchanges</h2>
      <p>Your first size exchange per order is free — we arrange the reverse pickup and ship the new size at no cost, subject to availability. Because Monthly Drop pieces are made in limited numbers, if your size is unavailable we&rsquo;ll offer a refund or store credit instead.</p>
      <h2>Returns & refunds</h2>
      <ul>
        <li>We arrange a reverse pickup from serviceable PIN codes. Where pickup isn&rsquo;t available, you can self-ship and we&rsquo;ll reimburse up to ₹100 as store credit.</li>
        <li>Once the piece passes a quality check at our studio (usually within 2 working days of receipt), we refund to your original payment method within 5–7 working days.</li>
        <li>Original shipping charges are non-refundable unless the item was defective or incorrect.</li>
      </ul>
      <h2>Damaged, defective or wrong item</h2>
      <p>Let us know within 48 hours of delivery with photos and, ideally, an unboxing video. We&rsquo;ll send a replacement or issue a full refund including shipping. Small irregularities in hand block-printing, weaving and embroidery are characteristic of handcrafted textiles and are not considered defects.</p>
      <h2>Cancellations</h2>
      <p>You can cancel an order for a full refund any time before it is dispatched. Once dispatched, the return policy above applies.</p>
    </PolicyPage>
  );
}
