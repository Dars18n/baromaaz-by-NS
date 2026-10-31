import Link from "next/link";
import PageHeader from "./PageHeader";
import { SITE } from "@/lib/site";

const LINKS = [
  ["/shipping-policy", "Shipping Policy"],
  ["/returns-exchange-policy", "Returns & Exchange Policy"],
  ["/privacy-policy", "Privacy Policy"],
  ["/terms-of-service", "Terms of Service"],
  ["/grievance-officer", "Grievance Officer"],
];

export default function PolicyPage({ title, path, intro, children }) {
  return (
    <>
      <PageHeader crumbs={[{ label: title }]} eyebrow="Policies" title={title} intro={intro} />
      <div className="container-x grid gap-12 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Policies" className="order-2 lg:order-1">
          <ul className="space-y-3 border-t border-ink/15 pt-6 text-sm lg:sticky lg:top-[140px] lg:border-t-0 lg:pt-0">
            {LINKS.map(([href, label]) => (
              <li key={href}><Link href={href} aria-current={href === path ? "page" : undefined} className={href === path ? "font-medium text-ink" : "text-ink-muted hover:text-ink"}>{label}</Link></li>
            ))}
          </ul>
        </nav>
        <article className="prose-policy order-1 max-w-3xl lg:order-2">
          <p className="!mt-0 text-xs uppercase tracking-[0.14em] text-ink-muted">Last updated: {SITE.legal.lastUpdated}</p>
          {children}
        </article>
      </div>
    </>
  );
}
