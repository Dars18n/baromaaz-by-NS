import PolicyPage from "@/components/PolicyPage";
import { pageMeta } from "@/lib/seo";

const path = "/terms-of-service";
export const metadata = pageMeta({ title: "Terms of Service", description: "Terms governing access to and use of the Baromaaz website.", path });

export default function Page() {
  return (
    <PolicyPage title="Terms of Service" path={path} intro="">
      <p>By accessing our website, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
    </PolicyPage>
  );
}
