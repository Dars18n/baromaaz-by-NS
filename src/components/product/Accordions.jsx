import Link from "next/link";
import { ChevronIcon } from "../Icons";
import { SITE } from "@/lib/site";
import { formatPrice } from "@/lib/format";

const SIZE_CHART = [
  ["XS", 32, 26, 35],
  ["S", 34, 28, 37],
  ["M", 36, 30, 39],
  ["L", 38, 32, 41],
  ["XL", 40, 34, 43],
];

function Item({ id, title, open = false, children }) {
  return (
    <details id={id} open={open} className="group scroll-mt-32 border-b border-ink/15">
      <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 text-[13px] font-medium uppercase tracking-[0.16em] [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronIcon width={18} height={18} className="rotate-90 transition-transform group-open:-rotate-90" />
      </summary>
      <div className="pb-6 text-[15px] leading-7 text-ink-soft">{children}</div>
    </details>
  );
}

export default function Accordions({ product }) {
  return (
    <div className="mt-8 border-t border-ink/15">
      <Item id="details" title="Product details" open>
        {product.description && <p>{product.description}</p>}
        <ul className={`${product.description ? "mt-3 " : ""}list-disc space-y-1 pl-5`}>
          {product.fabric && <li>Fabric: {product.fabric}</li>}
          {product.color && <li>Colour: {product.color}</li>}
          <li>Handcrafted in small batches in {SITE.address.state}</li>
          <li>Care: gentle hand wash in cold water or dry clean; dry in shade</li>
          <li>Slight irregularities are the signature of handwork, not flaws</li>
        </ul>
      </Item>
      <Item id="size-chart" title="Size chart">
        <p className="mb-3">Body measurements in inches. Between sizes? Size up for a relaxed fit.</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <caption className="sr-only">Baromaaz size chart in inches</caption>
            <thead>
              <tr className="border-b border-ink/15 text-xs uppercase tracking-[0.12em] text-ink"><th scope="col" className="py-2 pr-4 font-medium">Size</th><th scope="col" className="py-2 pr-4 font-medium">Bust</th><th scope="col" className="py-2 pr-4 font-medium">Waist</th><th scope="col" className="py-2 font-medium">Hip</th></tr>
            </thead>
            <tbody>
              {SIZE_CHART.map(([s, b, w, h]) => (
                <tr key={s} className="border-b border-ink/10"><th scope="row" className="py-2 pr-4 font-medium text-ink">{s}</th><td className="py-2 pr-4">{b}</td><td className="py-2 pr-4">{w}</td><td className="py-2">{h}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Item>
      <Item id="shipping" title="Shipping & returns">
        <ul className="list-disc space-y-1 pl-5">
          <li>Free shipping on orders above {formatPrice(SITE.freeShippingAbove)}; {formatPrice(SITE.shippingFee)} otherwise.</li>
          <li>Dispatched in 2–3 working days; delivered across India in 4–7 working days.</li>
          <li>Easy exchange or return within 7 days of delivery on unworn pieces with tags.</li>
        </ul>
        <p className="mt-3">Read our <Link href="/shipping-policy" className="underline">Shipping Policy</Link> and <Link href="/returns-exchange-policy" className="underline">Returns &amp; Refunds Policy</Link>.</p>
      </Item>
    </div>
  );
}
