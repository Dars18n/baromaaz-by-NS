import ContactForm from "./ContactForm";
import PageHeader from "@/components/PageHeader";
import { WhatsAppIcon } from "@/components/Icons";
import { pageMeta } from "@/lib/seo";
import { SITE, formatAddress } from "@/lib/site";

export const metadata = pageMeta({
  title: "Contact Us — WhatsApp & Studio Address",
  description: `Get in touch with Baromaaz on WhatsApp (${SITE.whatsapp}) or email (${SITE.email}), or visit our studio in ${SITE.address.city}.`,
  path: "/contact",
});

export default function ContactPage() {
  const a = SITE.address;
  return (
    <>
      <PageHeader crumbs={[{ label: "Contact" }]} eyebrow="Client care" title="We'd love to hear from you" intro="Questions about sizing, an order, or styling a piece for an occasion? Message us — a real person replies, usually within a few hours." />
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-8">
          <div>
            <h2 className="label font-sans">WhatsApp</h2>
            <a href={SITE.whatsappLink} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-[44px] items-center gap-2 font-serif text-2xl hover:text-terracotta-dark"><WhatsAppIcon /> {SITE.whatsapp}</a>
          </div>
          <div>
            <h2 className="label font-sans">Email</h2>
            <a href={`mailto:${SITE.email}`} className="mt-1 inline-flex min-h-[44px] items-center break-all font-serif text-2xl hover:text-terracotta-dark">{SITE.email}</a>
          </div>
          <div>
            <h2 className="label font-sans">Hours</h2>
            <p className="mt-1 text-[15px] text-ink-soft">{SITE.hours}</p>
          </div>
          <div>
            <h2 className="label font-sans">Studio address</h2>
            <address className="mt-1 text-[15px] not-italic leading-7 text-ink-soft">{a.line1}<br />{a.line2}<br />{a.city}{a.state && a.state !== a.city ? `, ${a.state}` : ""} {a.pincode}<br />{a.country}</address>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress())}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block py-3 text-xs uppercase tracking-[0.14em] underline underline-offset-4">Get directions</a>
            <p className="mt-2 text-xs text-ink-muted">Studio visits by appointment — WhatsApp us to book.</p>
          </div>
        </div>
        <div className="bg-beige p-6 md:p-10">
          <h2 className="font-serif text-3xl">Send us a message</h2>
          <ContactForm />
        </div>
      </div>
    </>
  );
}
