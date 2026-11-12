import PolicyPage from "@/components/PolicyPage";
import { pageMeta } from "@/lib/seo";

const path = "/shipping-policy";
export const metadata = pageMeta({ title: "Shipping Policy", description: "Orders are processed within 1–2 business days. High order volumes may delay shipments.", path });

export default function Page() {
  return (
    <PolicyPage title="Shipping Policy" path={path} intro="">
      <p>All orders are processed within 1-2 business days. If we are experiencing a high volume of orders, shipments may be delayed. Please allow additional days in transit for delivery.</p>
    </PolicyPage>
  );
}
