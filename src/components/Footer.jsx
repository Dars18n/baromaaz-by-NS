import Link from "next/link";
import Logo from "./Logo";
import { SocialIcon } from "./Icons";
import { SITE, formatAddress } from "@/lib/site";

const clientCare = [
  { href: "/contact", label: "Contact us" },
  { href: "/account", label: "My account" },
  { href: "/account?tab=returns", label: "Request a return / exchange" },
  { href: "/product/meher-chikankari-kurti#size-chart", label: "Size guide" },
  { href: "/about", label: "Our story" },
];
const policies = [
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/returns-exchange-policy", label: "Returns & Exchange Policy" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/grievance-officer", label: "Grievance Officer" },
];

function Col({ title, links }) {
  return (
    <div>
      <h2 className="text-[12px] font-medium uppercase tracking-[0.2em] text-ivory" style={{ fontFamily: "Jost, sans-serif" }}>{title}</h2>
      <ul className="mt-4 space-y-2.5 text-[14px] text-ivory/80">
        {links.map((l) => (
          <li key={l.href}><Link href={l.href} className="link-underline hover:text-ivory">{l.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer({ categories = [] }) {
  return (
    <footer className="mt-24 bg-ink text-ivory">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p><Logo className="text-[30px]" /></p>
          <p className="mt-2 font-serif text-xl italic text-ivory/85">{SITE.tagline}</p>
          <ul className="mt-6 flex gap-2" aria-label="Baromaaz on social media">
            {SITE.social.map((s) => (
              <li key={s.name}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`Baromaaz on ${s.name}`} className="flex h-11 w-11 items-center justify-center border border-ivory/25 transition-colors hover:bg-ivory hover:text-ink">
                  <SocialIcon name={s.name} width={19} height={19} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <Col title="Shop" links={[{ href: "/drop", label: "This Month's Drop" }, { href: "/new-in", label: "New In" }]} />
        <Col title="Client care" links={clientCare} />
        <div>
          <Col title="Policies" links={policies} />
          <address className="mt-8 text-[13px] not-italic leading-6 text-ivory/70">
            {formatAddress()}<br />
            <a href={`mailto:${SITE.email}`} className="underline">{SITE.email}</a><br />
            WhatsApp: <a href={SITE.whatsappLink} className="underline" target="_blank" rel="noopener noreferrer">{SITE.whatsapp}</a>
          </address>
        </div>
      </div>
      <div className="border-t border-ivory/15">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-ivory/65 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Baromaaz. Handcrafted in {SITE.address.state}, India.</p>
          <p>Secure payments by Razorpay · UPI · Cards · Netbanking</p>
        </div>
      </div>
    </footer>
  );
}
