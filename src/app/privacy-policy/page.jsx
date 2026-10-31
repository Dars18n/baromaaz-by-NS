import Link from "next/link";
import PolicyPage from "@/components/PolicyPage";
import { pageMeta } from "@/lib/seo";
import { SITE, formatAddress } from "@/lib/site";

const path = "/privacy-policy";
export const metadata = pageMeta({ title: "Privacy Policy", description: "How Baromaaz collects, uses and protects your personal data, in line with India's Digital Personal Data Protection Act, 2023.", path });

export default function Page() {
  const g = SITE.legal.grievanceOfficer;
  return (
    <PolicyPage title="Privacy Policy" path={path} intro="Your trust matters. This policy explains what we collect, why, and the choices you have.">
      <p>This website is operated by {SITE.legal.entity}, {formatAddress()} (&ldquo;Baromaaz&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). This policy is published in accordance with the Information Technology Act, 2000, the rules made under it, and the Digital Personal Data Protection Act, 2023.</p>
      <h2>What we collect</h2>
      <ul>
        <li><strong>Information you give us:</strong> name, email, mobile number, delivery address, and anything you write to us (messages, reviews, return requests).</li>
        <li><strong>Order information:</strong> items purchased, order value and payment status. Card, UPI and bank details are collected and processed directly by our payment partner, Razorpay — we never see or store them.</li>
        <li><strong>On your device:</strong> your bag, wishlist and account preferences are saved in your browser&rsquo;s local storage so they&rsquo;re there when you come back. You can clear them at any time from your browser settings.</li>
        <li><strong>Usage data:</strong> basic, aggregated analytics such as pages visited and device type, to improve the site.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To process, ship and support your orders, returns and exchanges.</li>
        <li>To send order updates by email, SMS or WhatsApp.</li>
        <li>To send marketing emails about new drops — only if you sign up, and you can unsubscribe any time.</li>
        <li>To prevent fraud and meet legal, tax and accounting obligations.</li>
      </ul>
      <h2>Who we share it with</h2>
      <p>Only with service providers who help us run the store — payment processing (Razorpay), courier and logistics partners, email/WhatsApp messaging providers and hosting — and only what they need to do their job. We never sell your personal data.</p>
      <h2>How long we keep it</h2>
      <p>We keep order records for as long as required by Indian tax and accounting laws (typically 8 years). Marketing data is deleted when you unsubscribe or ask us to.</p>
      <h2>Your rights</h2>
      <p>You can ask to access, correct or erase your personal data, withdraw consent, or nominate someone to exercise these rights on your behalf. Write to <a href={`mailto:${g.email}`}>{g.email}</a> and we&rsquo;ll respond within 30 days.</p>
      <h2>Security</h2>
      <p>The site is served over HTTPS, payments are handled by a PCI-DSS compliant gateway, and access to customer data is limited to staff who need it.</p>
      <h2>Contact & grievances</h2>
      <p>For privacy questions or complaints, contact our <Link href="/grievance-officer">Grievance Officer</Link>, {g.name}, at <a href={`mailto:${g.email}`}>{g.email}</a>.</p>
      <h2>Changes</h2>
      <p>We may update this policy from time to time. The &ldquo;last updated&rdquo; date above shows when it last changed.</p>
    </PolicyPage>
  );
}
