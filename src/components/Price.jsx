import { discountPercent, formatPrice } from "@/lib/format";

export default function Price({ price, mrp, size = "sm" }) {
  const off = discountPercent(price, mrp);
  const big = size === "lg";
  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${big ? "text-xl" : "text-[15px]"}`}>
      <span className="font-medium text-ink">
        <span className="sr-only">Price </span>
        {formatPrice(price)}
      </span>
      {off > 0 && (
        <>
          <s className={`text-ink-muted ${big ? "text-base" : "text-[13px]"}`}>
            <span className="sr-only">MRP </span>
            {formatPrice(mrp)}
          </s>
          <span className={`font-medium text-terracotta-dark ${big ? "text-base" : "text-[13px]"}`}>{off}% off</span>
        </>
      )}
    </p>
  );
}
