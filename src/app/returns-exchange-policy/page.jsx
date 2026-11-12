import PolicyPage from "@/components/PolicyPage";
import { pageMeta } from "@/lib/seo";

const path = "/returns-exchange-policy";
export const metadata = pageMeta({ title: "Returns & Refunds", description: "Returns are accepted within 7 days of delivery for unused items in original condition. Refunds exclude shipping costs.", path });

export default function Page() {
  return (
    <PolicyPage title="Returns & Refunds" path={path} intro="">
      <p>We accept returns up to 7 days after delivery, if the item is unused and in its original condition, and we will refund the full order amount minus the shipping costs.</p>
    </PolicyPage>
  );
}
