import PolicyPage from "@/components/PolicyPage";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { formatPrice } from "@/lib/format";

const path = "/shipping-policy";
export const metadata = pageMeta({ title: "Shipping Policy", description: `Baromaaz ships across India. Free shipping above ${formatPrice(SITE.freeShippingAbove)}, dispatch in 2–3 working days, delivery in 4–7 working days.`, path });

export default function Page() {
  return (
    <PolicyPage title="Shipping Policy" path={path} intro="Everything you need to know about how your Baromaaz order reaches you.">
      <h2>Where we ship</h2>
      <p>We currently ship to serviceable PIN codes across India. We do not ship internationally yet — write to <a href={`mailto:${SITE.email}`}>{SITE.email}</a> and we&rsquo;ll let you know when we do.</p>
      <h2>Shipping charges</h2>
      <ul>
        <li>Free standard shipping on orders of {formatPrice(SITE.freeShippingAbove)} and above.</li>
        <li>A flat fee of {formatPrice(SITE.shippingFee)} applies to orders below {formatPrice(SITE.freeShippingAbove)}.</li>
        <li>All prices on the website are inclusive of GST.</li>
      </ul>
      <h2>Processing & delivery time</h2>
      <p>Every piece is handcrafted and quality-checked before it leaves our studio. Orders are dispatched within 2–3 working days and usually arrive within 4–7 working days of dispatch, depending on your location. Monthly Drop pre-orders, if any, will show their own dispatch date on the product page.</p>
      <h2>Order tracking</h2>
      <p>Once your order ships, we&rsquo;ll send the courier name and tracking link by email and WhatsApp to the details you provided at checkout.</p>
      <h2>Delays</h2>
      <p>Delivery timelines may be affected by festivals, weather, strikes or courier disruptions. If your order hasn&rsquo;t arrived within 10 working days of dispatch, please contact us on WhatsApp at {SITE.whatsapp}.</p>
      <h2>Damaged or tampered parcels</h2>
      <p>Please don&rsquo;t accept a parcel that looks tampered with. If you notice damage after opening, record an unboxing video and share it with us within 48 hours of delivery so we can resolve it quickly.</p>
      <h2>Cash on delivery</h2>
      {SITE.cod?.enabled ? (
        <p>Cash on Delivery is available on serviceable PIN codes. A handling charge of {formatPrice(SITE.cod.fee)} is added to COD orders and shown in your bill before you place the order. Prepaid orders (UPI, cards, netbanking and wallets via Razorpay) have no handling charge.</p>
      ) : (
        <p>We currently accept prepaid orders only (UPI, cards, netbanking and wallets via Razorpay).</p>
      )}
    </PolicyPage>
  );
}
