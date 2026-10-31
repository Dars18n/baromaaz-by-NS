import { formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site";

const items = ["100% handcrafted", "Premium fabric", "New drop every month", `Free shipping above ${formatPrice(SITE.freeShippingAbove)}`, "Easy 7-day exchange"];

export default function TrustStrip() {
  return (
    <section aria-label="Why Baromaaz" className="border-b border-ink/10 bg-beige">
      <ul className="no-scrollbar container-x flex snap-x gap-x-8 overflow-x-auto whitespace-nowrap py-4 text-[12px] uppercase tracking-[0.2em] text-ink-soft md:justify-center">
        {items.map((t, i) => (
          <li key={t} className="flex shrink-0 snap-start items-center gap-8">
            {i > 0 && <span aria-hidden="true" className="text-terracotta">·</span>}
            {t}
          </li>
        ))}
      </ul>
    </section>
  );
}
