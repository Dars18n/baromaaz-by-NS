import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/product/Gallery";
import ProductActions from "@/components/product/ProductActions";
import Accordions from "@/components/product/Accordions";
import Reviews from "@/components/product/Reviews";
import ProductCard from "@/components/ProductCard";
import Price from "@/components/Price";
import { StarIcon } from "@/components/Icons";
import { getCategory, getProduct, getProducts, ratingFor, relatedProducts, reviewsFor } from "@/lib/catalog";

export const revalidate = 60;
import { pageMeta } from "@/lib/seo";
import { SITE, absoluteUrl } from "@/lib/site";
import { formatPrice } from "@/lib/format";

export const dynamicParams = true;
export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  const firstLine = p.description ? ` ${p.description.split(". ")[0].replace(/\.$/, "")}.` : "";
  return pageMeta({
    title: `Buy ${p.name}${p.color ? ` — ${p.color}` : ""} Online`,
    description: `${p.name} by Baromaaz at ${formatPrice(p.price)}.${p.fabric ? ` ${p.fabric},` : ""} handcrafted in Maharashtra.${firstLine}`,
    path: `/product/${p.slug}`,
    image: p.og,
    imageAlt: `${p.name} by Baromaaz`,
  });
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const [cat, reviews, rating, related] = await Promise.all([getCategory(p.category), reviewsFor(p.slug), ratingFor(p.slug), relatedProducts(p)]);
  const url = absoluteUrl(`/product/${p.slug}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description || `${p.name} by Baromaaz, handcrafted in Maharashtra.`,
    sku: p.slug.toUpperCase(),
    image: p.images.map((i) => (i.startsWith("http") ? i : absoluteUrl(i))),
    brand: { "@type": "Brand", name: "Baromaaz" },
    ...(p.color && { color: p.color }),
    ...(p.fabric && { material: p.fabric }),
    category: cat?.name,
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: p.price,
      availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "Baromaaz" },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
        shippingRate: { "@type": "MonetaryAmount", value: p.price >= SITE.freeShippingAbove ? 0 : SITE.shippingFee, currency: "INR" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 3, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 4, maxValue: 7, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
      },
    },
    ...(rating && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: rating.average, reviewCount: rating.count, bestRating: 5, worstRating: 1 },
      review: reviews.map((r) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.name },
        datePublished: r.date,
        reviewBody: r.text,
        reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
      })),
    }),
  };
  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: cat?.name, item: absoluteUrl(`/shop/${p.category}`) },
      { "@type": "ListItem", position: 3, name: p.name, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, crumbsLd]) }} />
      <nav aria-label="Breadcrumb" className="container-x pb-4 pt-5 text-xs text-ink-muted">
        <ol className="flex flex-wrap items-baseline gap-1.5">
          <li><Link href="/" className="-my-2 inline-block py-2 hover:text-ink">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href={`/shop/${p.category}`} className="-my-2 inline-block py-2 hover:text-ink">{cat?.name}</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink-soft">{p.name}</li>
        </ol>
      </nav>

      <div className="mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-[1.15fr_1fr] md:gap-12 md:px-6 lg:px-10">
        <div className="md:sticky md:top-[132px] md:self-start">
          <Gallery images={p.images} name={p.name} color={p.color} />
        </div>
        <div className="px-4 sm:px-6 md:px-0">
          {p.drop && <p className="eyebrow">Monthly Drop · {SITE.drop.month}</p>}
          <h1 className="h-display mt-2 text-4xl md:text-5xl">{p.name}{cat?.name && <span className="sr-only"> — handcrafted {cat.name.toLowerCase()} for women by Baromaaz</span>}</h1>
          {(p.color || p.fabric) && <p className="mt-1 text-sm text-ink-muted">{[p.color, p.fabric].filter(Boolean).join(" · ")}</p>}
          {rating && (
            <a href="#reviews-heading" className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
              <StarIcon width={16} height={16} className="text-terracotta-dark" /> {rating.average} · {rating.count} {rating.count === 1 ? "review" : "reviews"}
            </a>
          )}
          <div className="mt-4"><Price price={p.price} mrp={p.mrp} size="lg" /></div>
          <p className="mt-1 text-xs text-ink-muted">MRP inclusive of all taxes</p>
          <div className="mt-8"><ProductActions product={p} /></div>
          <ul className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] uppercase tracking-[0.12em] text-ink-soft">
            <li className="bg-beige px-2 py-3">Handcrafted</li>
            <li className="bg-beige px-2 py-3">7-day exchange</li>
            <li className="bg-beige px-2 py-3">Ships in 2–3 days</li>
          </ul>
          <Accordions product={p} />
        </div>
      </div>

      <div className="mt-16 md:mt-24"><Reviews product={p} reviews={reviews} rating={rating} /></div>

      <section aria-labelledby="related-heading" className="container-x pt-16 md:pt-24">
        <h2 id="related-heading" className="h-display text-4xl md:text-5xl">You may also like — more handcrafted ethnic wear</h2>
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
          {related.map((r) => <ProductCard key={r.slug} product={r} />)}
        </div>
      </section>
    </>
  );
}
