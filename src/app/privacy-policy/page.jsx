import PolicyPage from "@/components/PolicyPage";
import { pageMeta } from "@/lib/seo";

const path = "/privacy-policy";
export const metadata = pageMeta({ title: "Privacy Policy", description: "Your privacy is important to us. Learn how Baromaaz handles information collected through our website.", path });

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage title="Privacy Policy" path={path} intro="">
      <p>Your privacy is important to us. It is Baromaaz's policy to respect your privacy regarding any information we may collect from you across our website, <a href="http://baromaaz.com/">http://baromaaz.com</a>, and other sites we own and operate.</p>
      <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p>
    </PolicyPage>
  );
}
